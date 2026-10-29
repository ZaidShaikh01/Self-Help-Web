import fs from 'fs';
import { randomUUID } from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Resource } from '../models/resource.model.js';
import {
  uploadObject,
  getObjectStream,
  deleteObject,
} from '../services/storage.service.js';
import { validateAttachmentFileSignature } from '../validators/epub.validator.js';

/**
 * Sanitize filename for Content-Disposition header.
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') return 'attachment.bin';
  const clean = filename.replace(/[/\\?%*:|"<>]/g, '_').trim();
  return clean || 'attachment.bin';
}

/**
 * Upload or replace an attachment (PDF or EPUB) for an existing book.
 */
export const uploadAttachment = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(400, 'Attachment file is required (form-data key: "file")');
  }

  const filePath = file.path;

  try {
    // 1. Verify file signature on disk (PDF magic or EPUB OCF container structure)
    const { mimeType, format } = await validateAttachmentFileSignature(
      filePath,
      file.originalname,
    );

    // 2. Fetch resource and verify ownership + type === 'Book'
    const resource = await Resource.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resource) {
      throw new ApiError(404, 'Resource not found or unauthorized');
    }

    if (resource.type !== 'Book') {
      throw new ApiError(400, 'Attachments are only allowed for Books');
    }

    // 3. Server-generated random object key scoped to user and resource
    const ext = format === 'epub' ? '.epub' : '.pdf';
    const newKey = `books/${req.user._id}/${resource._id}/${randomUUID()}${ext}`;
    const oldKey = resource.attachment?.key;

    // 4. Stream upload new file to S3
    const fileStream = fs.createReadStream(filePath);
    await uploadObject({
      key: newKey,
      body: fileStream,
      contentType: mimeType,
      contentLength: file.size,
    });

    // 5. Update resource metadata and reset EPUB reading position
    resource.attachment = {
      key: newKey,
      fileName: file.originalname,
      mimeType,
      size: file.size,
      uploadedAt: new Date(),
      epubProgress: undefined, // Clear any previous reading location
    };

    try {
      await resource.save();
    } catch (saveErr) {
      // Rollback newly uploaded object if metadata persistence fails
      await deleteObject({ key: newKey }).catch(() => {});
      throw saveErr;
    }

    // 6. Delete old object only after successful database save
    if (oldKey && oldKey !== newKey) {
      await deleteObject({ key: oldKey }).catch((delErr) => {
        console.error('Failed to cleanup old attachment from storage:', delErr.message);
      });
    }

    return res.status(200).json(
      new ApiResponse(200, resource, 'Book attachment uploaded successfully'),
    );
  } finally {
    // Always clean up the local temporary file
    await fs.promises.unlink(filePath).catch(() => {});
  }
});

/**
 * Stream an attached file (PDF or EPUB) with HTTP Range support.
 */
export const streamAttachment = asyncHandler(async (req, res) => {
  const resource = await Resource.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!resource) {
    throw new ApiError(404, 'Resource not found or unauthorized');
  }

  if (resource.type !== 'Book') {
    throw new ApiError(400, 'Attachments are only supported for Books');
  }

  if (!resource.attachment || !resource.attachment.key) {
    throw new ApiError(404, 'This book does not have an attached file');
  }

  const range = req.headers.range;
  const s3Response = await getObjectStream({
    key: resource.attachment.key,
    range,
  });

  const safeFilename = sanitizeFilename(resource.attachment.fileName);
  const mimeType = resource.attachment.mimeType || 'application/octet-stream';

  // Set security & streaming headers
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${safeFilename}"`,
  );

  if (range && s3Response.contentRange) {
    res.status(206);
    res.setHeader('Content-Range', s3Response.contentRange);
    if (s3Response.contentLength !== undefined) {
      res.setHeader('Content-Length', s3Response.contentLength);
    }
  } else {
    res.status(200);
    if (s3Response.contentLength !== undefined) {
      res.setHeader('Content-Length', s3Response.contentLength);
    } else if (resource.attachment.size) {
      res.setHeader('Content-Length', resource.attachment.size);
    }
  }

  // Handle client abort
  req.on('close', () => {
    if (s3Response.body?.destroy) {
      s3Response.body.destroy();
    }
  });

  // Pipe S3 body stream to response
  s3Response.body.pipe(res);
});

/**
 * Save or update EPUB reading position (CFI and percentage).
 */
export const updateEpubProgress = asyncHandler(async (req, res) => {
  const { cfi, percentage } = req.body;

  const resource = await Resource.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!resource) {
    throw new ApiError(404, 'Resource not found or unauthorized');
  }

  if (resource.type !== 'Book') {
    throw new ApiError(400, 'EPUB progress tracking is only supported for Books');
  }

  if (!resource.attachment || !resource.attachment.key) {
    throw new ApiError(404, 'This book does not have an attached file');
  }

  const isEpub =
    resource.attachment.mimeType === 'application/epub+zip' ||
    resource.attachment.fileName.toLowerCase().endsWith('.epub');

  if (!isEpub) {
    throw new ApiError(
      400,
      'Reading position tracking is only available for EPUB attachments',
    );
  }

  resource.attachment.epubProgress = {
    cfi,
    percentage,
    updatedAt: new Date(),
  };

  await resource.save();

  return res.status(200).json(
    new ApiResponse(200, resource, 'EPUB reading progress updated successfully'),
  );
});

/**
 * Remove an attachment without deleting the book.
 */
export const deleteAttachment = asyncHandler(async (req, res) => {
  const resource = await Resource.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!resource) {
    throw new ApiError(404, 'Resource not found or unauthorized');
  }

  if (resource.type !== 'Book') {
    throw new ApiError(400, 'Attachments are only supported for Books');
  }

  if (!resource.attachment || !resource.attachment.key) {
    throw new ApiError(404, 'This book does not have an attached file');
  }

  const storageKey = resource.attachment.key;

  // Delete object from storage
  await deleteObject({ key: storageKey });

  // Clear metadata from book (including any saved EPUB position)
  resource.attachment = undefined;
  await resource.save();

  return res.status(200).json(
    new ApiResponse(200, resource, 'Attachment removed successfully'),
  );
});

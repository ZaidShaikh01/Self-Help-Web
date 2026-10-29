import multer from 'multer';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

// Disk storage using bounded temporary file with random UUID
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `growth_os_upload_${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: env.OBJECT_STORAGE_MAX_FILE_BYTES || 50 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const originalName = file.originalname || '';
    const ext = path.extname(originalName).toLowerCase();
    const isPdf = ext === '.pdf';
    const isEpub = ext === '.epub';

    if (!isPdf && !isEpub) {
      return cb(
        new ApiError(
          400,
          'Only PDF and EPUB files are allowed (.pdf or .epub extension required)',
        ),
      );
    }

    // Validate MIME types (treat client MIME type conservatively)
    const validPdfMime = file.mimetype === 'application/pdf';
    const validEpubMime =
      file.mimetype === 'application/epub+zip' ||
      file.mimetype === 'application/octet-stream' ||
      file.mimetype === 'application/x-ibooks+zip';

    if (isPdf && !validPdfMime) {
      return cb(
        new ApiError(400, 'Invalid MIME type for PDF file (expected application/pdf)'),
      );
    }

    if (isEpub && !validEpubMime) {
      return cb(
        new ApiError(
          400,
          'Invalid MIME type for EPUB file (expected application/epub+zip)',
        ),
      );
    }

    cb(null, true);
  },
});

const multerSingle = upload.single('file');

/**
 * Middleware that wraps multer to convert multer errors into application ApiErrors.
 */
export function uploadAttachmentFile(req, res, next) {
  multerSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const maxMB = Math.round(
            (env.OBJECT_STORAGE_MAX_FILE_BYTES || 50 * 1024 * 1024) /
              (1024 * 1024),
          );
          return next(
            new ApiError(
              413,
              `File is too large. Maximum allowed size is ${maxMB} MB.`,
            ),
          );
        }
        return next(new ApiError(400, `Upload error: ${err.message}`));
      }
      return next(err);
    }
    next();
  });
}

import fs from 'fs';
import { ApiError } from '../utils/ApiError.js';

/**
 * Validates that a buffer meets the EPUB Open Container Format (OCF) specification:
 * 1. Must start with the standard ZIP local file header signature: PK\x03\x04 (0x50, 0x4b, 0x03, 0x04).
 * 2. The first ZIP entry must be named "mimetype".
 * 3. The "mimetype" entry must be stored uncompressed (compression method === 0).
 * 4. The "mimetype" entry must have compressed size === 20 and uncompressed size === 20.
 * 5. The file name length must be exactly 8.
 * 6. The content of the "mimetype" entry must be exactly ASCII "application/epub+zip".
 *
 * @param {Buffer} buffer - Buffer containing at least the first 128 bytes of the file.
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateEpubContainer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 58) {
    return {
      valid: false,
      error: 'File is too small to be a valid EPUB container',
    };
  }

  // 1. Check ZIP signature: PK\x03\x04
  if (
    buffer[0] !== 0x50 ||
    buffer[1] !== 0x4b ||
    buffer[2] !== 0x03 ||
    buffer[3] !== 0x04
  ) {
    return {
      valid: false,
      error: 'Invalid EPUB: Missing ZIP local file header signature (PK\\x03\\x04)',
    };
  }

  // 2. Encryption flag (bit 0 of flags at offset 6..7)
  const flags = buffer.readUInt16LE(6);
  if ((flags & 0x01) !== 0) {
    return {
      valid: false,
      error: 'Invalid EPUB: First entry must not be encrypted',
    };
  }

  // 3. Compression method at offset 8..9 must be 0 (Stored/uncompressed)
  const compressionMethod = buffer.readUInt16LE(8);
  if (compressionMethod !== 0) {
    return {
      valid: false,
      error:
        'Invalid EPUB: "mimetype" entry must be stored uncompressed (compression method 0)',
    };
  }

  // 4. Compressed size at offset 18..21 and uncompressed size at 22..25
  const compressedSize = buffer.readUInt32LE(18);
  const uncompressedSize = buffer.readUInt32LE(22);
  if (compressedSize !== 20 || uncompressedSize !== 20) {
    return {
      valid: false,
      error: `Invalid EPUB: "mimetype" entry size must be exactly 20 bytes (got compressed: ${compressedSize}, uncompressed: ${uncompressedSize})`,
    };
  }

  // 5. File name length at offset 26..27 must be 8
  const fileNameLength = buffer.readUInt16LE(26);
  if (fileNameLength !== 8) {
    return {
      valid: false,
      error: 'Invalid EPUB: First ZIP entry name length must be 8',
    };
  }

  // 6. Extra field length at offset 28..29
  const extraFieldLength = buffer.readUInt16LE(28);

  const dataOffset = 30 + fileNameLength + extraFieldLength;
  if (buffer.length < dataOffset + 20) {
    return {
      valid: false,
      error: 'Invalid EPUB: File header is truncated',
    };
  }

  // 7. Verify entry name is "mimetype"
  const entryName = buffer.toString('ascii', 30, 38);
  if (entryName !== 'mimetype') {
    return {
      valid: false,
      error: `Invalid EPUB: First ZIP entry must be named "mimetype" (got "${entryName}")`,
    };
  }

  // 8. Verify entry content is "application/epub+zip"
  const entryContent = buffer.toString('ascii', dataOffset, dataOffset + 20);
  if (entryContent !== 'application/epub+zip') {
    return {
      valid: false,
      error:
        'Invalid EPUB: "mimetype" entry content must be exactly "application/epub+zip"',
    };
  }

  return { valid: true };
}

/**
 * Validates the file signature on disk based on the declared extension and returns the verified MIME type.
 *
 * @param {string} filePath - Local path to the uploaded temporary file.
 * @param {string} originalName - Original display filename.
 * @returns {Promise<{ mimeType: string, format: 'pdf' | 'epub' }>}
 */
export async function validateAttachmentFileSignature(filePath, originalName) {
  const ext = (originalName || '').toLowerCase().trim();
  const isEpub = ext.endsWith('.epub');
  const isPdf = ext.endsWith('.pdf');

  if (!isEpub && !isPdf) {
    throw new ApiError(
      400,
      'Unsupported attachment format. Only PDF and EPUB files are supported.',
    );
  }

  const fd = await fs.promises.open(filePath, 'r');
  try {
    if (isPdf) {
      const headerBuf = Buffer.alloc(5);
      const { bytesRead } = await fd.read(headerBuf, 0, 5, 0);
      if (bytesRead < 5 || headerBuf.toString('ascii') !== '%PDF-') {
        throw new ApiError(400, 'Invalid PDF file: Missing %PDF- signature');
      }
      return { mimeType: 'application/pdf', format: 'pdf' };
    }

    if (isEpub) {
      const headerBuf = Buffer.alloc(256);
      const { bytesRead } = await fd.read(headerBuf, 0, 256, 0);
      const result = validateEpubContainer(headerBuf.subarray(0, bytesRead));
      if (!result.valid) {
        throw new ApiError(400, result.error || 'Invalid EPUB container');
      }
      return { mimeType: 'application/epub+zip', format: 'epub' };
    }
  } finally {
    await fd.close();
  }
}

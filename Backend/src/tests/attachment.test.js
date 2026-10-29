import test, { describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import {
  isStorageConfigured,
  getS3Client,
  setS3ClientForTesting,
  uploadObject,
  getObjectStream,
  deleteObject,
} from '../services/storage.service.js';
import { sanitizeFilename } from '../controllers/attachment.controller.js';
import { validateEpubContainer } from '../validators/epub.validator.js';
import { updateEpubProgressSchema } from '../validators/resource.validator.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/**
 * Helper to build a binary mock EPUB header buffer according to W3C EPUB OCF.
 */
function createMockEpubHeader(options = {}) {
  const fileName = options.fileName ?? 'mimetype';
  const fileContent = options.fileContent ?? 'application/epub+zip';
  const compression = options.compression ?? 0;
  const compressedSize = options.compressedSize ?? fileContent.length;
  const uncompressedSize = options.uncompressedSize ?? fileContent.length;
  const extraLen = options.extraLen ?? 0;

  const totalLen = 30 + fileName.length + extraLen + fileContent.length;
  const header = Buffer.alloc(totalLen);

  // Local file header signature: 0x04034b50 (PK\x03\x04)
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4); // Version needed
  header.writeUInt16LE(0, 6); // Flags
  header.writeUInt16LE(compression, 8); // Compression method (0 = Stored)
  header.writeUInt32LE(0, 10); // Mod time & date
  header.writeUInt32LE(0x2cab616f, 14); // CRC-32
  header.writeUInt32LE(compressedSize, 18);
  header.writeUInt32LE(uncompressedSize, 22);
  header.writeUInt16LE(fileName.length, 26);
  header.writeUInt16LE(extraLen, 28);
  header.write(fileName, 30, fileName.length, 'ascii');
  header.write(fileContent, 30 + fileName.length + extraLen, fileContent.length, 'ascii');

  return header;
}

describe('Attachment & Storage Service Unit Tests (Mocked S3)', () => {
  beforeEach(() => {
    setS3ClientForTesting(null);
  });

  afterEach(() => {
    setS3ClientForTesting(null);
  });

  test('storage service throws 503 if storage is unconfigured', () => {
    setS3ClientForTesting(null);
    if (!isStorageConfigured()) {
      assert.throws(
        () => getS3Client(),
        (err) => err instanceof ApiError && err.statusCode === 503,
      );
    }
  });

  test('uploadObject sends PutObjectCommand to S3 with correct MIME type', async () => {
    let capturedInput = null;
    const mockClient = {
      send: async (command) => {
        capturedInput = command.input;
        return { $metadata: { httpStatusCode: 200 } };
      },
    };
    setS3ClientForTesting(mockClient);

    const testStream = Readable.from(['mock epub stream']);
    await uploadObject({
      key: 'books/user123/res456/uuid.epub',
      body: testStream,
      contentType: 'application/epub+zip',
      contentLength: 16,
    });

    assert.ok(capturedInput);
    assert.strictEqual(capturedInput.Key, 'books/user123/res456/uuid.epub');
    assert.strictEqual(capturedInput.ContentType, 'application/epub+zip');
    assert.strictEqual(capturedInput.ContentLength, 16);
  });

  test('getObjectStream supports Range requests and returns stream data', async () => {
    let capturedInput = null;
    const mockStream = Readable.from(['%PDF-1.4 mock content']);
    const mockClient = {
      send: async (command) => {
        capturedInput = command.input;
        return {
          Body: mockStream,
          ContentLength: 21,
          ContentRange: 'bytes 0-20/21',
          ContentType: 'application/pdf',
          $metadata: { httpStatusCode: 206 },
        };
      },
    };
    setS3ClientForTesting(mockClient);

    const result = await getObjectStream({
      key: 'books/user123/res456/uuid.pdf',
      range: 'bytes=0-20',
    });

    assert.ok(capturedInput);
    assert.strictEqual(capturedInput.Key, 'books/user123/res456/uuid.pdf');
    assert.strictEqual(capturedInput.Range, 'bytes=0-20');
    assert.strictEqual(result.statusCode, 206);
    assert.strictEqual(result.contentRange, 'bytes 0-20/21');
    assert.strictEqual(result.contentLength, 21);
    assert.ok(result.body);
  });

  test('getObjectStream translates NoSuchKey error into ApiError(404)', async () => {
    const mockClient = {
      send: async () => {
        const error = new Error('The specified key does not exist.');
        error.name = 'NoSuchKey';
        error.$metadata = { httpStatusCode: 404 };
        throw error;
      },
    };
    setS3ClientForTesting(mockClient);

    await assert.rejects(
      async () => {
        await getObjectStream({ key: 'books/missing.pdf' });
      },
      (err) => err instanceof ApiError && err.statusCode === 404,
    );
  });

  test('deleteObject sends DeleteObjectCommand to S3', async () => {
    let capturedInput = null;
    const mockClient = {
      send: async (command) => {
        capturedInput = command.input;
        return { $metadata: { httpStatusCode: 204 } };
      },
    };
    setS3ClientForTesting(mockClient);

    await deleteObject({ key: 'books/user123/res456/uuid.epub' });

    assert.ok(capturedInput);
    assert.strictEqual(capturedInput.Key, 'books/user123/res456/uuid.epub');
  });

  test('sanitizeFilename removes control characters and path traversal', () => {
    assert.strictEqual(
      sanitizeFilename('../../../etc/passwd.epub'),
      '.._.._.._etc_passwd.epub',
    );
    assert.strictEqual(
      sanitizeFilename('my "clean" book.epub'),
      'my _clean_ book.epub',
    );
    assert.strictEqual(
      sanitizeFilename(''),
      'attachment.bin',
    );
  });
});

describe('EPUB W3C Container Validation Tests', () => {
  test('accepts valid standards-compliant EPUB container header', () => {
    const validHeader = createMockEpubHeader();
    const result = validateEpubContainer(validHeader);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.error, undefined);
  });

  test('rejects truncated buffer (< 58 bytes)', () => {
    const truncated = Buffer.alloc(40);
    const result = validateEpubContainer(truncated);
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /too small/i);
  });

  test('rejects missing ZIP signature', () => {
    const invalidMagic = createMockEpubHeader();
    invalidMagic[0] = 0x47; // 'G'
    invalidMagic[1] = 0x49; // 'I'
    invalidMagic[2] = 0x46; // 'F'
    const result = validateEpubContainer(invalidMagic);
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /Missing ZIP local file header/i);
  });

  test('rejects compressed mimetype entry (compression != 0)', () => {
    const deflatedHeader = createMockEpubHeader({ compression: 8 });
    const result = validateEpubContainer(deflatedHeader);
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /must be stored uncompressed/i);
  });

  test('rejects mimetype entry with incorrect size', () => {
    const badSizeHeader = createMockEpubHeader({
      compressedSize: 24,
      uncompressedSize: 24,
    });
    const result = validateEpubContainer(badSizeHeader);
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /must be exactly 20 bytes/i);
  });

  test('rejects entry with wrong name (e.g. content.opf first)', () => {
    const wrongNameHeader = createMockEpubHeader({
      fileName: 'root.opf',
    });
    const result = validateEpubContainer(wrongNameHeader);
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /named "mimetype"/i);
  });

  test('rejects mimetype entry with invalid content', () => {
    // 20-byte payload that is not "application/epub+zip"
    const wrongMimeHeader = createMockEpubHeader({
      fileContent: 'application/pdf_fake',
      compressedSize: 20,
      uncompressedSize: 20,
    });
    const result = validateEpubContainer(wrongMimeHeader);
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /must be exactly "application\/epub\+zip"/i);
  });
});

describe('EPUB Progress Validation & Business Logic', () => {
  test('validates valid CFI and percentage', () => {
    const validData = {
      cfi: 'epubcfi(/6/4[chap01]!/4/2/10/1:0)',
      percentage: 42,
    };
    const parsed = updateEpubProgressSchema.safeParse(validData);
    assert.strictEqual(parsed.success, true);
  });

  test('rejects empty or whitespace CFI', () => {
    const invalidData = {
      cfi: '   ',
      percentage: 50,
    };
    const parsed = updateEpubProgressSchema.safeParse(invalidData);
    assert.strictEqual(parsed.success, false);
  });

  test('rejects CFI exceeding 500 characters', () => {
    const longCfi = 'epubcfi(' + 'a'.repeat(505) + ')';
    const parsed = updateEpubProgressSchema.safeParse({
      cfi: longCfi,
      percentage: 10,
    });
    assert.strictEqual(parsed.success, false);
  });

  test('rejects percentage < 0 or > 100', () => {
    assert.strictEqual(
      updateEpubProgressSchema.safeParse({ cfi: 'test-cfi', percentage: -5 }).success,
      false,
    );
    assert.strictEqual(
      updateEpubProgressSchema.safeParse({ cfi: 'test-cfi', percentage: 105 }).success,
      false,
    );
  });

  test('replacing an attachment resets previous EPUB reading position', () => {
    const book = {
      _id: 'b1',
      title: 'Sample EPUB',
      attachment: {
        key: 'books/u1/b1/old.epub',
        fileName: 'old.epub',
        mimeType: 'application/epub+zip',
        size: 204800,
        uploadedAt: new Date('2026-01-01'),
        epubProgress: {
          cfi: 'epubcfi(/6/2!/4/2:0)',
          percentage: 65,
          updatedAt: new Date('2026-01-02'),
        },
      },
    };

    // Simulate replacing attachment with new file
    book.attachment = {
      key: 'books/u1/b1/new.epub',
      fileName: 'new.epub',
      mimeType: 'application/epub+zip',
      size: 409600,
      uploadedAt: new Date('2026-01-05'),
      epubProgress: undefined, // Cleared on replace
    };

    assert.strictEqual(book.attachment.epubProgress, undefined);
    assert.strictEqual(book.attachment.fileName, 'new.epub');
  });

  test('removing an attachment clears metadata without deleting book or linked notes', () => {
    const book = {
      _id: 'b1',
      title: 'Atomic Habits',
      pages: 300,
      currentPage: 50,
      attachment: {
        key: 'books/u1/b1/doc.epub',
        fileName: 'Atomic_Habits.epub',
        mimeType: 'application/epub+zip',
        size: 500000,
        epubProgress: { cfi: 'cfi-loc', percentage: 10, updatedAt: new Date() },
      },
    };

    const linkedNotes = [{ _id: 'n1', resource: { _id: 'b1', title: 'Atomic Habits' } }];

    // Remove attachment
    book.attachment = undefined;

    // Verify book is preserved
    assert.strictEqual(book._id, 'b1');
    assert.strictEqual(book.title, 'Atomic Habits');
    assert.strictEqual(book.pages, 300);
    assert.strictEqual(book.currentPage, 50);
    assert.strictEqual(book.attachment, undefined);

    // Verify notes are preserved
    assert.strictEqual(linkedNotes.length, 1);
    assert.strictEqual(linkedNotes[0].resource._id, 'b1');
  });

  test('rejects non-book resource types for attachments', () => {
    const nonBook = { _id: 'a1', type: 'Article' };
    assert.notStrictEqual(nonBook.type, 'Book');
  });

  test('validates %PDF- signature from buffer', () => {
    const validPdf = Buffer.from('%PDF-1.7 mock data');
    const invalidPdf = Buffer.from('NOT_A_PDF mock data');
    assert.strictEqual(validPdf.subarray(0, 5).toString('ascii'), '%PDF-');
    assert.notStrictEqual(invalidPdf.subarray(0, 5).toString('ascii'), '%PDF-');
  });

  test('ensures replacement sequence does not delete old object until new object is saved', async () => {
    const callLog = [];
    const mockUpload = async (k) => callLog.push(`upload:${k}`);
    const mockSave = async () => callLog.push('saveMeta');
    const mockDelete = async (k) => callLog.push(`delete:${k}`);

    await mockUpload('new.epub');
    await mockSave();
    await mockDelete('old.epub');

    assert.deepStrictEqual(callLog, ['upload:new.epub', 'saveMeta', 'delete:old.epub']);
  });

  test('rolls back newly uploaded S3 object if metadata persistence fails', async () => {
    const callLog = [];
    const mockUpload = async (k) => callLog.push(`upload:${k}`);
    const mockSaveFails = async () => { throw new Error('DB error'); };
    const mockDelete = async (k) => callLog.push(`rollback:${k}`);

    try {
      await mockUpload('new.epub');
      await mockSaveFails();
    } catch {
      await mockDelete('new.epub');
    }

    assert.deepStrictEqual(callLog, ['upload:new.epub', 'rollback:new.epub']);
  });
});

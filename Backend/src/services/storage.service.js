import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

let s3ClientInstance = null;

/**
 * Returns true if the required object storage environment variables are set.
 */
export function isStorageConfigured() {
  return Boolean(
    env.OBJECT_STORAGE_BUCKET &&
    env.OBJECT_STORAGE_ACCESS_KEY_ID &&
    env.OBJECT_STORAGE_SECRET_ACCESS_KEY,
  );
}

/**
 * Get or initialize the S3Client instance.
 * Throws 503 if storage is not configured.
 */
export function getS3Client() {
  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  if (!isStorageConfigured()) {
    throw new ApiError(503, 'Object storage service is not configured');
  }

  s3ClientInstance = new S3Client({
    region: env.OBJECT_STORAGE_REGION || 'us-east-1',
    endpoint: env.OBJECT_STORAGE_ENDPOINT || undefined,
    credentials: {
      accessKeyId: env.OBJECT_STORAGE_ACCESS_KEY_ID,
      secretAccessKey: env.OBJECT_STORAGE_SECRET_ACCESS_KEY,
    },
    forcePathStyle: env.OBJECT_STORAGE_FORCE_PATH_STYLE ?? true,
  });

  return s3ClientInstance;
}

/**
 * For testing purposes: inject a mock or alternate S3 client.
 */
export function setS3ClientForTesting(client) {
  s3ClientInstance = client;
}

/**
 * Upload an object to object storage.
 * @param {Object} params
 * @param {string} params.key - The server-generated object key.
 * @param {Buffer|ReadableStream} params.body - The payload stream or buffer.
 * @param {string} params.contentType - The MIME type (e.g. 'application/pdf').
 * @param {number} [params.contentLength] - Size in bytes.
 */
export async function uploadObject({ key, body, contentType, contentLength }) {
  const client = getS3Client();
  const bucket = env.OBJECT_STORAGE_BUCKET;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  return client.send(command);
}

/**
 * Fetch an object stream from object storage, supporting optional byte Range.
 * @param {Object} params
 * @param {string} params.key - The object key.
 * @param {string} [params.range] - HTTP Range string (e.g. 'bytes=0-1024').
 * @returns {Promise<{ body: ReadableStream, contentLength?: number, contentRange?: string, contentType?: string, statusCode?: number }>}
 */
export async function getObjectStream({ key, range }) {
  const client = getS3Client();
  const bucket = env.OBJECT_STORAGE_BUCKET;

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    Range: range || undefined,
  });

  try {
    const response = await client.send(command);
    return {
      body: response.Body,
      contentLength: response.ContentLength,
      contentRange: response.ContentRange,
      contentType: response.ContentType,
      statusCode: response.$metadata?.httpStatusCode || (range ? 206 : 200),
    };
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      throw new ApiError(404, 'Attachment file not found in storage');
    }
    throw err;
  }
}

/**
 * Delete an object from object storage.
 * @param {Object} params
 * @param {string} params.key - The object key to delete.
 */
export async function deleteObject({ key }) {
  const client = getS3Client();
  const bucket = env.OBJECT_STORAGE_BUCKET;

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return client.send(command);
}

/**
 * Check if an object exists and retrieve its metadata.
 * @param {Object} params
 * @param {string} params.key - The object key.
 */
export async function headObject({ key }) {
  const client = getS3Client();
  const bucket = env.OBJECT_STORAGE_BUCKET;

  const command = new HeadObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return client.send(command);
}

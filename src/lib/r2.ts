import "server-only";
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;

let client: S3Client | null = null;

function getClient() {
  if (!client) {
    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error("R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.");
    }
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return client;
}

export function assertBucket() {
  if (!bucket) throw new Error("R2_BUCKET not configured");
  return bucket;
}

export async function presignUpload(key: string, contentType: string, expiresIn = 60 * 5) {
  return getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: assertBucket(), Key: key, ContentType: contentType }),
    { expiresIn }
  );
}

export async function signedGetUrl(key: string, expiresIn = 60 * 15) {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: assertBucket(), Key: key }),
    { expiresIn }
  );
}

export function publicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return `/r2/${key}`;
  return `${base.replace(/\/$/, "")}/${key}`;
}

export async function putObject(key: string, body: Buffer | Uint8Array, contentType: string) {
  await getClient().send(
    new PutObjectCommand({ Bucket: assertBucket(), Key: key, Body: body, ContentType: contentType })
  );
  return key;
}

export async function deleteObject(key: string) {
  await getClient().send(new DeleteObjectCommand({ Bucket: assertBucket(), Key: key }));
}

export function buildKey(prefix: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
}

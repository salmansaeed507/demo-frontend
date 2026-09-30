import { apiGatewayClient } from "./client";

export type S3ObjectData = {
  key: string;
  bucket: string;
  etag: string;
  location: string;
  url: string;
  expiresAt: number;
};

type PresignUploadResponse = {
  key: string;
  upload_url: string;
  download_url: string;
  expires_in: number;
};

type PresignDownloadResponse = {
  key: string;
  download_url: string;
  expires_in: number;
};

const previewCache = new Map<string, S3ObjectData>();

/** Derive absolute expiry from X-Amz-Date + X-Amz-Expires; fall back to API expires_in. */
function expiresAtFromPresignedUrl(
  url: string,
  fallbackExpiresIn: number,
): number {
  try {
    const parsed = new URL(url);
    const amzDate = parsed.searchParams.get("X-Amz-Date");
    const amzExpires = parsed.searchParams.get("X-Amz-Expires");
    if (amzDate && amzExpires) {
      const match =
        /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(amzDate);
      if (match) {
        const startMs = Date.UTC(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
          Number(match[4]),
          Number(match[5]),
          Number(match[6]),
        );
        const expiresIn = Number(amzExpires);
        if (Number.isFinite(startMs) && Number.isFinite(expiresIn)) {
          return startMs + expiresIn * 1000;
        }
      }
    }
  } catch {
    // fall through to API expires_in
  }
  return Date.now() + fallbackExpiresIn * 1000;
}

function getCached(key: string): S3ObjectData | null {
  const entry = previewCache.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    previewCache.delete(key);
    return null;
  }
  return entry;
}

function putCache(data: S3ObjectData): void {
  previewCache.set(data.key, data);
}

function toObjectData(
  key: string,
  downloadUrl: string,
  expiresIn: number,
  etag = "",
): S3ObjectData {
  const expiresAt = expiresAtFromPresignedUrl(downloadUrl, expiresIn);
  return {
    key,
    bucket: "",
    etag,
    location: downloadUrl,
    url: downloadUrl,
    expiresAt,
  };
}

/**
 * Upload a File into staging via gateway presign, then PUT directly to S3 (RustFS).
 * Caller owns selection and validation. Product save promotes staging keys server-side.
 */
export async function upload(file: File): Promise<S3ObjectData> {
  const contentType = file.type || "application/octet-stream";

  const presign = await apiGatewayClient.fetch<PresignUploadResponse>(
    "/files/presign-upload",
    {
      method: "POST",
      body: JSON.stringify({
        content_type: contentType,
        filename: file.name,
      }),
    },
  );

  const putResponse = await fetch(presign.upload_url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });

  if (!putResponse.ok) {
    const text = await putResponse.text();
    throw new Error(`S3 upload failed ${putResponse.status}: ${text}`);
  }

  const etag = (putResponse.headers.get("ETag") ?? "").replaceAll('"', "");
  const data = toObjectData(
    presign.key,
    presign.download_url,
    presign.expires_in,
    etag,
  );
  putCache(data);
  return data;
}

/**
 * Resolve a preview/download URL for an object key.
 * Returns a cached URL while the prior presigned URL is still valid.
 */
export async function view(key: string): Promise<S3ObjectData> {
  const cached = getCached(key);
  if (cached) return cached;

  const presign = await apiGatewayClient.fetch<PresignDownloadResponse>(
    "/files/presign-download",
    {
      method: "POST",
      body: JSON.stringify({ key }),
    },
  );

  const data = toObjectData(
    presign.key,
    presign.download_url,
    presign.expires_in,
  );
  putCache(data);
  return data;
}

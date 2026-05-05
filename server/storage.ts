import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

function getClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey);
}

const PHOTOS_BUCKET = "photos";
const CVS_BUCKET = "cvs";

export async function initStorageBuckets() {
  const supabase = getClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const existing = new Set(buckets?.map((b) => b.name) ?? []);
  if (!existing.has(PHOTOS_BUCKET)) {
    await supabase.storage.createBucket(PHOTOS_BUCKET, { public: true });
  }
  if (!existing.has(CVS_BUCKET)) {
    await supabase.storage.createBucket(CVS_BUCKET, { public: false });
  }
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const supabase = getClient();
  const bucket = relKey.startsWith("cv") ? CVS_BUCKET : PHOTOS_BUCKET;
  const fileName = relKey.replace(/^(cv-uploads|photos)\//, "");

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, data, { contentType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  if (bucket === PHOTOS_BUCKET) {
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { key: relKey, url: pub.publicUrl };
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(bucket)
    .createSignedUrl(fileName, 3600);

  if (signErr) throw new Error(`Signed URL failed: ${signErr.message}`);
  return { key: relKey, url: signed.signedUrl };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const supabase = getClient();
  const bucket = relKey.startsWith("cv") ? CVS_BUCKET : PHOTOS_BUCKET;
  const fileName = relKey.replace(/^(cv-uploads|photos)\//, "");

  if (bucket === PHOTOS_BUCKET) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { key: relKey, url: data.publicUrl };
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(fileName, 3600);

  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return { key: relKey, url: data.signedUrl };
}

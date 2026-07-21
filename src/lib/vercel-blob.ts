export type VercelBlobCredentials = {
  token?: string;
  oidcToken?: string;
  storeId?: string;
};

export function getVercelBlobCredentials(): VercelBlobCredentials {
  const token =
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
    process.env.Noya_READ_WRITE_TOKEN?.trim();
  const storeId =
    process.env.BLOB_STORE_ID?.trim() ||
    process.env.Noya_STORE_ID?.trim();
  const oidcToken = process.env.VERCEL_OIDC_TOKEN?.trim();

  return {
    token: token || undefined,
    oidcToken: oidcToken || undefined,
    storeId: storeId || undefined,
  };
}

export function hasVercelBlobCredentials(
  credentials: VercelBlobCredentials,
): boolean {
  return Boolean(
    credentials.token || (credentials.oidcToken && credentials.storeId),
  );
}

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!rawBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

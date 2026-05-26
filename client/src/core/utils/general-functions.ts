export const generateCDN_URL = (
  filePath: string,
  mimeType: string,
  download?: boolean
): string => {
  const baseEndPoint = import.meta.env.VITE_BACKEND_URL;

  const url = `${baseEndPoint}/api/cdn/file?path=${encodeURIComponent(
    filePath
  )}&mimeType=${encodeURIComponent(mimeType)}${download ? "&download=true" : ""}`;

  return url;
};

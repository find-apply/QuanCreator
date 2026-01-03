export const getStoredBackendUrl = (): string => 'https://apw.quanapps.com';

export const getStoredApiKey = (): string | null => '360|ZRJ76h5eHHDICDWPZ6UywR8D8nvjHMf691oSIKZV535d04c8';

export const joinBackendPath = (path: string): string => {
  if (!path) {
    return path;
  }
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getStoredBackendUrl()}${normalizedPath}`;
};

export const buildJsonHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
};

export const convertToApiAssetUrl = (path: string): string => {
  return joinBackendPath(path);
};

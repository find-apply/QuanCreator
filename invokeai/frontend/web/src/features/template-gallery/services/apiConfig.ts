export const getStoredBackendUrl = (): string => '';

export const getStoredApiKey = (): string | null => null;

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
  return path;
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

/**
 * Utility functions for handling base path from PUBLIC_URL
 */

/**
 * Extracts the base path from the PUBLIC_URL environment variable.
 *
 * @param options - Configuration options
 * @param options.trailingSlash - Whether to ensure the path ends with a slash (default: true)
 * @returns The base path (e.g., "/manager/" or "/" for root)
 *
 * @example
 * // PUBLIC_URL = "https://example.com/manager"
 * getBasePath() // Returns "/manager/"
 *
 * @example
 * // PUBLIC_URL = "/"
 * getBasePath() // Returns "/"
 *
 * @example
 * // PUBLIC_URL = "/app"
 * getBasePath({ trailingSlash: false }) // Returns "/app"
 */
export function getBasePath(options: { trailingSlash?: boolean } = {}): string {
  const { trailingSlash = true } = options;
  const publicUrl = process.env.PUBLIC_URL || '';

  if (!publicUrl) {
    return '/';
  }

  let basePath = '/';

  try {
    // Try to parse as full URL
    basePath = new URL(publicUrl).pathname;
  } catch (error) {
    // If it's not a full URL, treat it as a path
    basePath = publicUrl.startsWith('/') ? publicUrl : `/${publicUrl}`;
  }

  // Normalize the path
  if (!basePath.startsWith('/')) {
    basePath = `/${basePath}`;
  }

  // Handle trailing slash
  if (trailingSlash) {
    if (!basePath.endsWith('/')) {
      basePath += '/';
    }
  } else {
    // Remove trailing slash unless it's the root
    if (basePath !== '/' && basePath.endsWith('/')) {
      basePath = basePath.slice(0, -1);
    }
  }

  return basePath;
}

/**
 * Gets the full redirect URI by combining origin with base path.
 *
 * @returns The full redirect URI (e.g., "https://example.com/manager/")
 *
 * @example
 * // window.location.origin = "https://example.com"
 * // PUBLIC_URL = "/manager"
 * getRedirectUri() // Returns "https://example.com/manager/"
 */
export function getRedirectUri(): string {
  const basePath = getBasePath({ trailingSlash: true });
  return `${window.location.origin}${basePath}`;
}

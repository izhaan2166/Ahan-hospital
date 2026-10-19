/**
 * Builds the Content-Security-Policy for a single response.
 *
 * Scripts are locked to a per-request nonce ('strict-dynamic' lets the
 * framework's nonce-tagged bootstrap load its own chunks). Styles allow
 * 'unsafe-inline' because Next.js and next/image emit inline style
 * attributes that a nonce cannot cover; see SECURITY.md.
 */
export function buildCsp(nonce: string, { dev = false, upgradeInsecure = false } = {}): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      // React's development build needs eval for call-stack reconstruction.
      ...(dev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    // Hot reload uses a websocket in development only.
    "connect-src": ["'self'", ...(dev ? ["ws:"] : [])],
    "frame-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'"],
  };

  const policy = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");

  // Only upgrade on HTTPS deployments; on plain-HTTP localhost it would break
  // same-origin assets.
  return upgradeInsecure ? `${policy}; upgrade-insecure-requests` : policy;
}

export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

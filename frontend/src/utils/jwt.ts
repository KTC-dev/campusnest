// Client-side "decoding" only — never trust this for authorization
// decisions, the server always re-verifies the signature. This is purely
// so the UI can read the role/email out of the access token without an
// extra round trip.
export function decodeJwtPayload<T>(token: string): T | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

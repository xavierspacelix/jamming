"use client";

const isBrowser = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

export function setCookieNonHttpOnly(
  name: string,
  value: string,
  maxAgeSec: number
) {
  if (!isBrowser()) return; // no-op di server
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Max-Age=${maxAgeSec}; Path=/; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function getCookie(name: string): string | null {
  if (!isBrowser()) return null; // hindari ReferenceError
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function deleteCookie(name: string) {
  if (!isBrowser()) return; // no-op di server
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

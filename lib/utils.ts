import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function setCookieNonHttpOnly(
  name: string,
  value: string,
  maxAgeSec: number
) {
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Max-Age=${maxAgeSec}; Path=/; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

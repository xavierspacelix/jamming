import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/", "/login", "/room/:path*"],
};

export function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const guest = (req.cookies.get("guestName")?.value || "").trim();
  const roomCode = (req.cookies.get("roomCode")?.value || "").trim();

  // Validasi apakah user memiliki kedua cookies yang valid
  const hasValidCookies =
    guest && roomCode && /^[a-zA-Z0-9_-]{4,64}$/.test(roomCode);

  // Jika user mengakses / atau /login tapi sudah memiliki cookies yang valid
  // maka redirect ke /room/{roomCode}
  if (
    hasValidCookies &&
    (nextUrl.pathname === "/" || nextUrl.pathname === "/login")
  ) {
    return NextResponse.redirect(new URL(`/room/${roomCode}`, nextUrl.origin));
  }

  // Jika user mengakses / atau /room/* tapi tidak memiliki cookies yang valid
  // maka redirect ke /login
  if (
    !hasValidCookies &&
    (nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/room"))
  ) {
    return NextResponse.redirect(new URL("/login", nextUrl.origin));
  }

  // Jika mengakses /login dan tidak memiliki cookies, biarkan akses
  if (nextUrl.pathname === "/login" && !hasValidCookies) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

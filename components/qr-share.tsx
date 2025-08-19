"use client";

import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeSVG),
  { ssr: false }
);
export default function QrShare({ roomCode }: { roomCode: string }) {
  const url = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/room/${roomCode}`;
  return (
    <div className="flex flex-col items-center gap-2">
      <QRCodeSVG value={url} size={128} />
      <Button
        onClick={() => navigator.clipboard.writeText(url)}
        variant="outline"
      >
        Copy Link
      </Button>
    </div>
  );
}

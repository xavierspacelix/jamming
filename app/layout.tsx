import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Jam Request",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="mx-auto max-w-7xl p-4">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}

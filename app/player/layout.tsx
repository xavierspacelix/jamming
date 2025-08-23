import "@/app/globals.css";
export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Jam Request",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}

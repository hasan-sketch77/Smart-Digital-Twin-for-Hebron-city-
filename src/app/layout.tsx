import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hebron 2035 - التوأم الرقمي",
  description: "التوأم الرقمي لإدارة السير والشوارع في الخليل",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        {children}
        <Toaster position="top-left" richColors dir="rtl" />
      </body>
    </html>
  );
}

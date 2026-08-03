import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusOS | Student operating system for engineering",
  description:
    "A premium student workspace for first-year engineering students in Karnataka.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

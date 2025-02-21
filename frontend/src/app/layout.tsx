import type { Metadata } from "next";

import "./globals.css";
import RootProvider from "@/Providers/RootProvider";
import Navbar from "@/components/Navbar/Navbar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "FizzBuzzPT",
  description: "A simple FizzBuzz implementation in TypeScript",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <RootProvider>
        <body>
          <Navbar />
          {children}
          <Toaster />
        </body>
      </RootProvider>
    </html>
  );
}

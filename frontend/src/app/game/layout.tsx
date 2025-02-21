"use client";

import GameProvider from "@/Providers/GameProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GameProvider>
      <div className="flex w-full h-full flex-col items-center justify-center pt-[90px] max-w-screen-lg self-center overflow-hidden">
        {children}
      </div>
    </GameProvider>
  );
}

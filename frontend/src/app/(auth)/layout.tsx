import { BlurFade } from "@/components/blur-fade";
import { Card } from "@/components/ui/card";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full h-full flex-col items-center justify-center">
      <BlurFade inView className="flex w-4/5 max-w-[450px] ">
        <Card
          className="shadow-cardDarkShadow border-none hover:shadow-hoverCardDarkShadow w-full bg-cardBgColor  p-5 transition-all
      duration-300 ease-linear text-white text-opacity-85 font-concert"
        >
          {children}
        </Card>
      </BlurFade>
    </div>
  );
}

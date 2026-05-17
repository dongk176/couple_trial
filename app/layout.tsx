import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "커플법정",
  description: "남의 연애 사건, 당신이 판결하세요"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  themeColor: "#FF3D00"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-white">
          <main className="mx-auto min-h-screen w-full max-w-[430px] bg-white px-4 pb-7 sm:px-5">
            <div className={user ? "pb-24" : ""}>{children}</div>
          </main>
          {user ? <BottomNav /> : null}
        </div>
      </body>
    </html>
  );
}

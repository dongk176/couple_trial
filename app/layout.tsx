import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "커플재판",
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
        <div className="app-shell h-[100dvh] overflow-hidden bg-white">
          <main className="app-scroll mx-auto h-[100dvh] w-full max-w-[430px] overflow-x-hidden overflow-y-auto bg-white px-4 pb-7 sm:px-5">
            <div className={user ? "pb-[calc(96px+env(safe-area-inset-bottom))]" : ""}>{children}</div>
          </main>
          {user ? <BottomNav /> : null}
        </div>
      </body>
    </html>
  );
}

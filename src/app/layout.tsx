import type { Metadata, Viewport } from "next";
import "@xyflow/react/dist/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "모두보드 | 생각이 모이는 교실",
  description: "학생과 교사가 게시판, 투표, 토론, 토의로 생각을 나누는 학급 공간",
  applicationName: "모두보드",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "모두보드" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: "cover", themeColor: "#6657d9" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" className="h-full antialiased"><body className="min-h-dvh flex flex-col overscroll-none">{children}</body></html>;
}

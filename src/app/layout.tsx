import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Go 3D — 沉浸式围棋三维场景",
  description: "日式和室中的 3D 围棋对弈与棋谱回放",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-inter">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

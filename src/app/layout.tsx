import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "岁序 · 个人日历",
  description: "农历、法定节假日与跨天日程，多端同步的个人日历。",
  applicationName: "岁序日历",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "岁序",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f4ef",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

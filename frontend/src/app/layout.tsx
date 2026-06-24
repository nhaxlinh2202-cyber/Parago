import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Parago - Kết nối sinh viên, đi chung an toàn",
  description:
    "Nền tảng đi chung xe cho sinh viên đại học. Tiết kiệm chi phí, giảm ùn tắc, kết nối bạn bè cùng trường.",
  keywords: [
    "parago",
    "carpooling",
    "đi chung xe",
    "sinh viên",
    "đại học",
    "chia sẻ chuyến đi",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Parago - Đi chung xe sinh viên",
    description: "Nền tảng đi chung xe dành riêng cho sinh viên đại học Việt Nam",
    type: "website",
    locale: "vi_VN",
    siteName: "Parago",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F1A" },
  ],
};

import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthGuard } from "@/components/providers/auth-guard";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { GlobalApiErrorBoundary } from "@/components/ui";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <AuthGuard>
            <NotificationProvider>
              <ThemeProvider>
                <GlobalApiErrorBoundary>
                  {children}
                </GlobalApiErrorBoundary>
              </ThemeProvider>
            </NotificationProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}

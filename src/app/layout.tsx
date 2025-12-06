import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import MetalbotAssistant from "@/components/chatbot/MetalbotAssistant";
import { QueryProvider } from "@/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Metalink - AI-Powered CAD Generation",
  description: "Transform your ideas into production-ready technical drawings with cutting-edge AI technology.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' }
    ]
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ConvexClientProvider>
            <AuthProvider>
              {children}
              <MetalbotAssistant />
            </AuthProvider>
          </ConvexClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

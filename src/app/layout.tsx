import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import Chatbot from "@/components/Chatbot";
import { QueryProvider } from "@/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Metalink - AI-Powered CAD Generation",
  description: "Transform your ideas into production-ready technical drawings with cutting-edge AI technology.",
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
            {children}
            <Chatbot />
          </ConvexClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

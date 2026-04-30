import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ShopLayoutWrapper from '@/components/layout/ShopLayoutWrapper';

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins" 
});

export const metadata: Metadata = {
  title: "Aurea BD | Premium Japanese Skincare",
  description: "Glow naturally with authentic Japanese Sakura skincare. Shop Laikou Sakura sets, serums, and creams in Bangladesh.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  }
};

import ThemeWrapper from "@/components/ThemeWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.variable}>
        <Providers>
          <ThemeWrapper>
            <ShopLayoutWrapper>
              {children}
            </ShopLayoutWrapper>
          </ThemeWrapper>
        </Providers>
      </body>
    </html>
  );
}


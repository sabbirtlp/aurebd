import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import CartSidebar from '@/features/cart/CartSidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';

import MobileBottomBar from '@/components/layout/MobileBottomBar';

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins" 
});

export const metadata: Metadata = {
  title: "Aurea BD | Premium Japanese Skincare",
  description: "Glow naturally with authentic Japanese Sakura skincare. Shop Laikou Sakura sets, serums, and creams in Bangladesh.",
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
            <PageTransition />
            <CartSidebar />
            <Navbar />
            <main className="main-content">
              {children}
            </main>
            <MobileBottomBar />
            <Footer />
          </ThemeWrapper>
        </Providers>
      </body>
    </html>
  );
}


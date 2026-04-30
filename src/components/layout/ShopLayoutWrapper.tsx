"use client";

import { usePathname } from "next/navigation";
import CartSidebar from '@/features/cart/CartSidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomBar from '@/components/layout/MobileBottomBar';

export default function ShopLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main>{children}</main>;
  }

  return (
    <>
      <CartSidebar />
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <MobileBottomBar />
      <Footer />
    </>
  );
}

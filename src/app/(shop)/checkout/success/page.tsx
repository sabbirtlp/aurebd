"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./success.module.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { Suspense } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedOrder = localStorage.getItem("lastOrder");
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder));
    }
  }, []);

  const downloadInvoice = () => {
    if (!orderData) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(203, 163, 148); // Brand Primary
    doc.text("Aurea BD", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Premium Japanese Skincare", 14, 26);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("INVOICE", 150, 20);
    
    doc.setFontSize(10);
    doc.setFontSize(10);
    doc.text(`Order ID: ${orderData._id || orderData.id || "N/A"}`, 150, 26);
    const orderDate = orderData.createdAt || orderData.date || new Date();
    doc.text(`Date: ${new Date(orderDate).toLocaleDateString()}`, 150, 32);

    // Customer Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 45);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(orderData.customer.fullName || "", 14, 52);
    doc.text(orderData.customer.address || "", 14, 58);
    doc.text(`${orderData.customer.policeStation || ""}, ${orderData.customer.district || ""}`, 14, 64);
    doc.text(`${orderData.customer.division || ""}`, 14, 70);
    doc.text(`Phone: ${orderData.customer.phone || ""}`, 14, 76);

    // Table
    const tableColumn = ["Product", "Qty", "Price", "Total"];
    const tableRows = orderData.items.map((item: any) => [
      item.name,
      item.quantity.toString(),
      `BDT ${item.price}`,
      `BDT ${item.price * item.quantity}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 86,
      theme: 'grid',
      headStyles: { fillColor: [203, 163, 148] },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    
    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal: BDT ${orderData.subtotal}`, 140, finalY + 10);
    doc.text(`Shipping: BDT ${orderData.shipping}`, 140, finalY + 16);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Total: BDT ${orderData.total}`, 140, finalY + 24);

    doc.save(`Invoice_${orderData._id || orderData.id || "order"}.pdf`);
  };

  if (!mounted) return null;

  const orderId = searchParams.get('order_id') || orderData?._id || orderData?.id || "Unknown";

  return (
    <main className={`container animate-fade-in ${styles.successPage}`}>
      <div className={styles.successCard}>
        <div className={styles.iconWrapper}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h1 className={styles.title}>Thank You For Your Order!</h1>
        <p className={styles.subtitle}>Your premium Japanese skincare products are on their way.</p>
        
        <div className={styles.orderBox}>
          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>Order ID</span>
            <span className={styles.orderValue}>{orderId}</span>
          </div>
          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>Date</span>
            <span className={styles.orderValue}>{new Date().toLocaleDateString()}</span>
          </div>
          {orderData && (
            <div className={styles.orderRow}>
              <span className={styles.orderLabel}>Total Amount</span>
              <span className={styles.orderValue}>৳ {orderData.total}</span>
            </div>
          )}
          <div className={styles.orderRow}>
            <span className={styles.orderLabel}>Payment Method</span>
            <span className={styles.orderValue}>
              {orderData?.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnDownload} onClick={downloadInvoice} disabled={!orderData}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Invoice PDF
          </button>
          
          <Link href="/shop" className={styles.btnContinue}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

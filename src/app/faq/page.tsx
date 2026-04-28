"use client";

import React, { useState, useEffect } from 'react';
import styles from '../privacy-policy/legal.module.css';
import { useLanguageStore } from '@/store/languageStore';

export default function FAQPage() {
  const { t, language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tr = (key: string) => mounted ? t(key) : key;

  const faqsBn = [
    {
      question: "আপনাদের পণ্যগুলো কি ১০০% আসল?",
      answer: "হ্যাঁ, আমাদের প্রতিটি পণ্য ১০০% আসল এবং সরাসরি জাপান ও কোরিয়ার অনুমোদিত ডিস্ট্রিবিউটরদের থেকে আমদানিকৃত। আমরা প্রতিটি পণ্যের গুণগত মানের নিশ্চয়তা দেই।"
    },
    {
      question: "ডেলিভারি করতে কত সময় লাগে?",
      answer: "ঢাকার ভেতরে স্ট্যান্ডার্ড ডেলিভারি ১-২ কার্যদিবসের মধ্যে হয়। ঢাকার বাইরে সাধারণত আপনার লোকেশন অনুযায়ী ৩-৫ কার্যদিবস সময় লাগে।"
    },
    {
      question: "আপনারা কি ক্যাশ অন ডেলিভারি (COD) দেন?",
      answer: "হ্যাঁ, আমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা প্রদান করি। আপনি পণ্য হাতে পেয়ে তারপর পেমেন্ট করতে পারবেন।"
    },
    {
      question: "পণ্য ব্যবহারের পর যদি ত্বকে সমস্যা হয় তবে কী করব?",
      answer: "ব্যবহার সাথে সাথে বন্ধ করুন। সবার ত্বক সমান নয়, তাই নতুন পণ্য ব্যবহারের আগে প্যাচ টেস্ট করার পরামর্শ দেওয়া হয়। পণ্য খোলার পর রিফান্ড করা সম্ভব নয়।"
    },
    {
      question: "অর্ডার ট্র্যাক করব কীভাবে?",
      answer: "অর্ডার পাঠানোর পর আপনি একটি ট্র্যাকিং নম্বর সহ SMS পাবেন, যা দিয়ে আপনি আপনার পার্সেলটির অবস্থান দেখতে পারবেন।"
    }
  ];

  const faqsEn = [
    {
      question: "Are your products 100% authentic?",
      answer: "Yes, all our products are 100% authentic and directly imported from authorized distributors in Japan and Korea. We guarantee the quality and genuineness of every item we sell."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard delivery within Dhaka takes 1-2 business days. Outside Dhaka, delivery typically takes 3-5 business days depending on the courier service."
    },
    {
      question: "Do you offer Cash on Delivery (COD)?",
      answer: "Yes, we offer Cash on Delivery (COD) across Bangladesh. You can inspect your package upon arrival and pay the delivery person directly."
    },
    {
      question: "What should I do if my skin reacts negatively to a product?",
      answer: "Discontinue use immediately. We recommend doing a patch test before fully integrating a new product. Please note we cannot accept returns for opened products."
    },
    {
      question: "How can I track my order?",
      answer: "Once dispatched, you will receive a confirmation SMS containing your tracking number and a link to track your parcel."
    }
  ];

  const currentFaqs = language === 'bn' ? faqsBn : faqsEn;

  return (
    <div className={styles.legalPage}>
      <div className={`container ${styles.container}`}>
        <div className={`${styles.card} nm-card`}>
          <div className={styles.header}>
            <h1 className="section-title">{tr('faq.title')}</h1>
            <p className={styles.lastUpdated}>{tr('faq.subtitle')}</p>
          </div>
          
          <div className={styles.content}>
            <div className={styles.faqList}>
              {currentFaqs.map((faq, index) => (
                <details key={index} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>{faq.question}</summary>
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
            
            <section style={{ marginTop: '3rem', textAlign: 'center' }}>
              <h2>{tr('legal.still_questions')}</h2>
              <p>{tr('legal.contact_text')}</p>
              <p>
                <strong>{language === 'bn' ? 'ইমেল:' : 'Email:'}</strong> support@aureabd.com <br />
                <strong>{language === 'bn' ? 'ফোন:' : 'Phone:'}</strong> +880 1234 567890
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

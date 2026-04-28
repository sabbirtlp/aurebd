"use client";

import React, { useState, useEffect } from 'react';
import styles from '../privacy-policy/legal.module.css';
import { useLanguageStore } from '@/store/languageStore';

export default function ShippingPolicyPage() {
  const { t, language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tr = (key: string) => mounted ? t(key) : key;

  return (
    <div className={styles.legalPage}>
      <div className={`container ${styles.container}`}>
        <div className={`${styles.card} nm-card`}>
          <div className={styles.header}>
            <h1 className="section-title">{language === 'bn' ? 'শিপিং পলিসি' : 'Shipping Policy'}</h1>
            <p className={styles.lastUpdated}>{language === 'bn' ? 'আপনার দরজায় উজ্জ্বলতা পৌঁছে দিচ্ছি।' : 'Delivering radiance to your doorstep.'}</p>
          </div>
          
          <div className={styles.content}>
            {language === 'bn' ? (
              <>
                <section>
                  <h2>১. ডেলিভারি কভারেজ</h2>
                  <p>
                    অরিয়া বিডি সারা বাংলাদেশে ডেলিভারি সুবিধা প্রদান করতে পেরে গর্বিত। আপনি ঢাকার প্রাণকেন্দ্রে থাকুন বা দূরবর্তী কোনো জেলায়, 
                    আমরা আপনার অথেন্টিক জাপানিজ স্কিনকেয়ার পণ্যগুলো নিরাপদে পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।
                  </p>
                </section>

                <section>
                  <h2>২. শিপিং রেট এবং ডেলিভারি সময়</h2>
                  <ul>
                    <li><strong>ঢাকার ভেতরে:</strong> ডেলিভারি চার্জ ৬০ টাকা। সাধারণত ১-২ কার্যদিবসের মধ্যে ডেলিভারি করা হয়।</li>
                    <li><strong>ঢাকার আশেপাশে (Suburbs):</strong> ডেলিভারি চার্জ ১০০ টাকা। সাধারণত ২-৪ কার্যদিবস সময় লাগে।</li>
                    <li><strong>ঢাকার বাইরে (সারা দেশ):</strong> ডেলিভারি চার্জ ১২০ টাকা। সাধারণত ৩-৫ কার্যদিবস সময় লাগে।</li>
                  </ul>
                  <p>
                    <em>বিশেষ অফার: ১,০০০ টাকার বেশি অর্ডারে আমরা ফ্রি শিপিং সুবিধা দিচ্ছি!</em>
                  </p>
                </section>

                <section>
                  <h2>৩. অর্ডার ট্র্যাকিং</h2>
                  <p>
                    অর্ডার পাঠানোর পর আপনি একটি SMS পাবেন যেখানে আপনার ট্র্যাকিং নম্বর থাকবে। এটি দিয়ে আপনি আমাদের ডেলিভারি পার্টনারের 
                    ওয়েবসাইটে আপনার পার্সেলটির অবস্থান দেখতে পারবেন।
                  </p>
                </section>

                <section>
                  <h2>৪. পেমেন্ট মেথড</h2>
                  <p>
                    আমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধা দিই। এছাড়াও বিকাশ, নগদ বা কার্ডের মাধ্যমে অগ্রিম পেমেন্ট করার সুযোগ রয়েছে।
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2>1. Delivery Coverage</h2>
                  <p>
                    Aurea BD is proud to offer nationwide delivery across Bangladesh. We ensure your authentic products reach you safely.
                  </p>
                </section>

                <section>
                  <h2>2. Shipping Rates and Time</h2>
                  <ul>
                    <li><strong>Inside Dhaka:</strong> Delivery fee is ৳60. Within 1-2 business days.</li>
                    <li><strong>Outside Dhaka (Suburbs):</strong> Delivery fee is ৳100. Within 2-4 business days.</li>
                    <li><strong>Outside Dhaka (Nationwide):</strong> Delivery fee is ৳120. Within 3-5 business days.</li>
                  </ul>
                  <p>
                    <em>Special Offer: FREE SHIPPING on orders over ৳1,000!</em>
                  </p>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

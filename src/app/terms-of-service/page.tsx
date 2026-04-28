import React from 'react';
import styles from '../privacy-policy/legal.module.css'; // Reusing the same CSS for consistent legal pages
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Aurea BD',
  description: 'Terms of Service for Aurea BD - Premium Japanese Skincare',
};

export default function TermsOfServicePage() {
  return (
    <div className={styles.legalPage}>
      <div className={`container ${styles.container}`}>
        <div className={`${styles.card} nm-card`}>
          <div className={styles.header}>
            <h1 className="section-title">Terms of Service</h1>
            <p className={styles.lastUpdated}>Last Updated: October 2023</p>
          </div>
          
          <div className={styles.content}>
            <section>
              <h2>1. Agreement to Terms</h2>
              <p>
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) 
                and Aurea BD ("Company," "we," "us," or "our"), concerning your access to and use of the website as well as any other media form, 
                media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
              </p>
            </section>

            <section>
              <h2>2. Products and Orders</h2>
              <p>
                We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. 
                However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, 
                current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products.
              </p>
              <p>
                We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, 
                per household, or per order.
              </p>
            </section>

            <section>
              <h2>3. Pricing and Payments</h2>
              <p>
                All prices are shown in BDT (Bangladeshi Taka). We reserve the right to change prices at any time without notice. We accept various payment 
                methods as indicated on our checkout page. By providing a payment method, you represent and warrant that you are authorized to use the 
                designated payment method.
              </p>
            </section>

            <section>
              <h2>4. Shipping and Returns</h2>
              <p>
                Shipping costs and delivery times vary depending on your location. Please refer to our Shipping Policy for detailed information. 
                Due to the nature of skincare products, returns are only accepted for unopened items in their original packaging within 7 days of delivery. 
                In the case of defective products, please contact our support team immediately.
              </p>
            </section>

            <section>
              <h2>5. Intellectual Property</h2>
              <p>
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, 
                audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos 
                contained therein (the "Marks") are owned or controlled by us or licensed to us.
              </p>
            </section>

            <section>
              <h2>6. Contact Information</h2>
              <p>
                For any questions regarding these terms, please contact us at:
                <br />
                <strong>Email:</strong> support@aureabd.com
                <br />
                <strong>Phone:</strong> +880 1234 567890
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

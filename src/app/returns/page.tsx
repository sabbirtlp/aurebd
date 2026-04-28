import React from 'react';
import styles from '../privacy-policy/legal.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Refunds | Aurea BD',
  description: 'Return and refund policy for Aurea BD premium skincare products.',
};

export default function ReturnsRefundsPage() {
  return (
    <div className={styles.legalPage}>
      <div className={`container ${styles.container}`}>
        <div className={`${styles.card} nm-card`}>
          <div className={styles.header}>
            <h1 className="section-title">Returns & Refunds</h1>
            <p className={styles.lastUpdated}>Last Updated: October 2023</p>
          </div>
          
          <div className={styles.content}>
            <section>
              <h2>1. Return Policy Overview</h2>
              <p>
                At Aurea BD, we prioritize your satisfaction. Due to the delicate and hygienic nature of skincare products, 
                our return policy is strictly enforced to ensure the safety and health of all our customers. We accept returns 
                only under specific circumstances detailed below.
              </p>
            </section>

            <section>
              <h2>2. Eligibility for Returns</h2>
              <p>To be eligible for a return, the following conditions must be met:</p>
              <ul>
                <li>The return request must be initiated within <strong>7 days</strong> of receiving your delivery.</li>
                <li>The product must be <strong>unopened, unused, and in its original sealed packaging</strong>.</li>
                <li>You must provide the original receipt or proof of purchase.</li>
              </ul>
              <p>
                <em>Note: Products that have been opened, unsealed, or used cannot be returned or exchanged due to health and safety regulations.</em>
              </p>
            </section>

            <section>
              <h2>3. Defective or Damaged Products</h2>
              <p>
                If you receive a product that is damaged during transit or has a manufacturing defect, please contact our support 
                team within <strong>48 hours</strong> of delivery. You must provide clear photographs of the damaged product and the packaging. 
                We will arrange for a replacement to be sent to you at no additional cost, or issue a full refund if the item is out of stock.
              </p>
            </section>

            <section>
              <h2>4. How to Initiate a Return</h2>
              <p>To initiate a return or report a damaged item, please follow these steps:</p>
              <ul>
                <li>Email us at <strong>support@aureabd.com</strong> with your order number and reason for return.</li>
                <li>Wait for our support team to review your request and provide a Return Merchandise Authorization (RMA) number.</li>
                <li>Securely pack the item and ship it to the address provided by our team. You will be responsible for paying your own shipping costs for returning non-defective items.</li>
              </ul>
            </section>

            <section>
              <h2>5. Refunds</h2>
              <p>
                Once your return is received and inspected, we will notify you of the approval or rejection of your refund. 
                If approved, your refund will be processed and applied to your original method of payment within 7-10 business days. 
                For Cash on Delivery (COD) orders, we will transfer the refund amount via bKash, Nagad, or Bank Transfer.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import styles from './legal.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Aurea BD',
  description: 'Privacy Policy for Aurea BD - Premium Japanese Skincare',
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.legalPage}>
      <div className={`container ${styles.container}`}>
        <div className={`${styles.card} nm-card`}>
          <div className={styles.header}>
            <h1 className="section-title">Privacy Policy</h1>
            <p className={styles.lastUpdated}>Last Updated: October 2023</p>
          </div>
          
          <div className={styles.content}>
            <section>
              <h2>1. Introduction</h2>
              <p>
                Welcome to Aurea BD. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our 
                website and tell you about your privacy rights.
              </p>
            </section>

            <section>
              <h2>2. Data We Collect</h2>
              <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
              <ul>
                <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                <li><strong>Financial Data</strong> includes payment card details processing through secure gateways.</li>
                <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
              </ul>
            </section>

            <section>
              <h2>3. How We Use Your Data</h2>
              <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
              <ul>
                <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., fulfilling your order).</li>
                <li>Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</li>
                <li>Where we need to comply with a legal obligation.</li>
              </ul>
            </section>

            <section>
              <h2>4. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
                used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data 
                to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <section>
              <h2>5. Your Legal Rights</h2>
              <p>
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
              </p>
              <ul>
                <li>Request access to your personal data.</li>
                <li>Request correction of your personal data.</li>
                <li>Request erasure of your personal data.</li>
                <li>Object to processing of your personal data.</li>
              </ul>
            </section>

            <section>
              <h2>6. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
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

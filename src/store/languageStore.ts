import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'bn' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Simple dictionary structure
export const translations: Record<Language, Record<string, string>> = {
  bn: {
    // Navbar
    'nav.home': 'হোম',
    'nav.shop': 'শপ',
    'nav.about': 'আমাদের সম্পর্কে',
    'nav.contact': 'যোগাযোগ',
    'nav.search': 'পণ্য খুঁজুন...',
    'nav.login': 'লগইন',
    'nav.wishlist': 'উইশলিস্ট',
    'nav.cart': 'কার্ট',
    
    // Top Bar
    'topbar.shipping': '১,০০০ টাকার বেশি অর্ডারে ফ্রি শিপিং • অথেন্টিক জাপানিজ স্কিনকেয়ার',
    
    // Hero Section
    'hero.title': 'আপনার রূপের',
    'hero.title_span': 'প্রকৃতি',
    'hero.subtitle': 'জাপানি স্কিনকেয়ারের বিশুদ্ধতম অভিজ্ঞতা নিন। আপনার প্রাকৃতিক সৌন্দর্যকে পুষ্ট করতে, রক্ষা করতে এবং আলোকিত করতে আমাদের পণ্যগুলো বিশেষভাবে তৈরি।',
    'hero.shop_now': 'কালেকশন দেখুন',
    'hero.our_story': 'আমাদের কথা',
    
    // Trust Strip
    'trust.pure_title': 'বিশুদ্ধ উপাদান',
    'trust.pure_desc': 'সরাসরি জাপান থেকে সংগৃহীত',
    'trust.hydration_title': 'গভীর হাইড্রেশন',
    'trust.hydration_desc': 'সারাদিন ত্বকের আর্দ্রতা ধরে রাখে',
    'trust.cruelty_title': 'ক্রুয়েল্টি ফ্রি',
    'trust.cruelty_desc': 'প্রাণীদের ওপর পরীক্ষা করা হয় না',
    'trust.shipping_title': 'ফ্রি শিপিং',
    'trust.shipping_desc': '১,০০০ টাকার বেশি অর্ডারে',
    
    // Categories
    'cat.title': 'নির্বাচিত কালেকশন',
    'cat.subtitle': 'আপনার ত্বকের জন্য সঠিক স্কিনকেয়ার রুটিন বেছে নিন।',
    'cat.serums': 'রেডিয়েন্স সিরাম',
    'cat.creams': 'হাইড্রেশন ক্রিম',
    'cat.uv': 'ইউভি প্রোটেকশন',
    'cat.essentials': 'স্কিন এসেনশিয়ালস',
    
    // Products
    'prod.new_arrivals': 'নতুন কালেকশন',
    'prod.new_subtitle': 'আপনার রূপচর্চাকে আরও উন্নত করতে আমাদের নতুন সংযোজন।',
    'prod.best_sellers': 'সেরা বিক্রিত পণ্য',
    'prod.best_subtitle': 'আমাদের গ্রাহকদের সবচেয়ে পছন্দের পণ্যগুলো।',
    'prod.view_all': 'সব পণ্য দেখুন',
    'prod.add_to_cart': 'কার্টে যোগ করুন',
    'prod.quick_add': 'কুইক অ্যাড',
    
    // Promo
    'promo.tag': 'লিমিটেড এডিশন',
    'promo.title': 'সাকুরা গ্লো কালেকশন',
    'promo.desc': 'চেরি ব্লসমের পুনরুজ্জীবিত করার শক্তি অনুভব করুন। আমাদের বিশেষ সেটটি আপনার ত্বককে উজ্জ্বল এবং নিখুঁত করার জন্য তৈরি।',
    'promo.cta': 'আরও জানুন',

    // Legal & Support Pages
    'legal.last_updated': 'সর্বশেষ আপডেট: অক্টোবর ২০২৩',
    'legal.contact_us': 'আমাদের সাথে যোগাযোগ করুন',
    'legal.still_questions': 'আরও কিছু জানার আছে?',
    'legal.contact_text': 'আপনার যদি আরও কিছু জানার থাকে, তবে সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন।',
    
    // FAQ Specific
    'faq.title': 'সাধারণ জিজ্ঞাসা (FAQ)',
    'faq.subtitle': 'আমাদের সাথে কেনাকাটা সম্পর্কে আপনার যা কিছু জানা দরকার।',
    
    // Footer
    'footer.description': 'বাংলাদেশে অথেন্টিক জাপানিজ স্কিনকেয়ারের নির্ভরযোগ্য গন্তব্য। প্রকৃতির সেরা উপাদানে আপনার ত্বককে উজ্জ্বল করুন।',
    'footer.shop': 'শপ',
    'footer.support': 'সাপোর্ট',
    'footer.stay_connected': 'যুক্ত থাকুন',
    'footer.subscribe': 'সাবস্ক্রাইব করুন',
    'footer.newsletter_text': 'এক্সক্লুসিভ অফার এবং স্কিনকেয়ার টিপস পেতে সাবস্ক্রাইব করুন।',
    'footer.all_products': 'সব পণ্য',
    'footer.shipping_policy': 'শিপিং পলিসি',
    'footer.returns': 'রিটার্ন ও রিফান্ড',
    'footer.faq': 'সাধারণ জিজ্ঞাসা (FAQ)',
    'footer.privacy': 'প্রাইভেসি পলিসি',
    'footer.terms': 'শর্তাবলী',
    'footer.rights': 'সর্বস্বত্ব সংরক্ষিত। উজ্জ্বলতার জন্য তৈরি।',
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.shop': 'Shop',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.search': 'Search products...',
    'nav.login': 'Login',
    'nav.wishlist': 'Wishlist',
    'nav.cart': 'Cart',
    
    // Top Bar
    'topbar.shipping': 'FREE SHIPPING ON ORDERS OVER ৳1,000 • AUTHENTIC JAPANESE SKINCARE',
    
    // Hero Section
    'hero.title': 'Reveal Your',
    'hero.title_span': 'Radiance',
    'hero.subtitle': 'Experience the purest essence of Japanese skincare. Formulated to nourish, protect, and illuminate your natural beauty.',
    'hero.shop_now': 'Shop Collection',
    'hero.our_story': 'Our Story',
    
    // Trust Strip
    'trust.pure_title': 'Pure Ingredients',
    'trust.pure_desc': 'Sourced directly from Japan',
    'trust.hydration_title': 'Deep Hydration',
    'trust.hydration_desc': 'Locks in moisture all day',
    'trust.cruelty_title': 'Cruelty Free',
    'trust.cruelty_desc': 'Never tested on animals',
    'trust.shipping_title': 'Complimentary Shipping',
    'trust.shipping_desc': 'On orders over ৳1,000',
    
    // Categories
    'cat.title': 'Curated Collections',
    'cat.subtitle': 'Discover the perfect regimen for your skin type.',
    'cat.serums': 'Radiance Serums',
    'cat.creams': 'Hydration Creams',
    'cat.uv': 'UV Protection',
    'cat.essentials': 'Skin Essentials',
    
    // Products
    'prod.new_arrivals': 'New Arrivals',
    'prod.new_subtitle': 'The latest additions to elevate your ritual.',
    'prod.best_sellers': 'Cult Favorites',
    'prod.best_subtitle': 'Our most loved essentials by the community.',
    'prod.view_all': 'View All Products',
    'prod.add_to_cart': 'Add to Cart',
    'prod.quick_add': 'Quick Add',
    
    // Promo
    'promo.tag': 'Limited Edition',
    'promo.title': 'The Sakura Glow Collection',
    'promo.desc': 'Experience the revitalizing power of cherry blossoms. Our exclusive set is designed to brighten and perfect your complexion.',
    'promo.cta': 'Discover More',

    // Legal & Support Pages
    'legal.last_updated': 'Last Updated: October 2023',
    'legal.contact_us': 'Contact Us',
    'legal.still_questions': 'Still have questions?',
    'legal.contact_text': 'If you cannot find the answer to your question, you can always contact us directly.',
    
    // FAQ Specific
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Everything you need to know about shopping with us.',
    
    // Footer
    'footer.description': 'Your premium destination for authentic Japanese skincare in Bangladesh. Elevate your beauty routine with nature\'s finest ingredients.',
    'footer.shop': 'Shop',
    'footer.support': 'Support',
    'footer.stay_connected': 'Stay Connected',
    'footer.subscribe': 'Subscribe',
    'footer.newsletter_text': 'Subscribe for exclusive offers and skincare advice.',
    'footer.all_products': 'All Products',
    'footer.shipping_policy': 'Shipping Policy',
    'footer.returns': 'Returns & Refunds',
    'footer.faq': 'FAQ',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.rights': 'All Rights Reserved. Designed for Radiance.',
  }
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en', // Set English as default
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => {
        const lang = get().language;
        // Primary: current language. Secondary: english. Tertiary: key.
        return translations[lang][key] || translations['en'][key] || key;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

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

    // Product Detail Page
    'product.reviews': 'রিভিউ',
    'product.add_to_cart': 'কার্টে যোগ করুন',
    'product.buy_now': 'এখনই কিনুন',
    'product.authentic': 'অরিজিনাল পণ্য',
    'product.fast_delivery': 'দ্রুত ডেলিভারি',
    'product.safe_payment': 'নিরাপদ পেমেন্ট',
    'product.short_desc': 'জাপানি সাকুরার প্রাকৃতিক উজ্জ্বলতার শক্তি অনুভব করুন। এই প্রিমিয়াম ফর্মুলা আপনার ত্বককে গভীরভাবে হাইড্রেট এবং পুনরুজ্জীবিত করে একটি স্বাস্থ্যকর, তরুণ উজ্জ্বলতা দেয়।',
    'product.benefit_hydration': 'গভীর হাইড্রেশন',
    'product.benefit_hydration_desc': '২৪ ঘণ্টা আর্দ্রতা ধরে রাখে।',
    'product.benefit_brightening': 'উজ্জ্বলতা বৃদ্ধি',
    'product.benefit_brightening_desc': 'মলিনতা দূর করে ত্বকের টোন সমান করে।',
    'product.benefit_pure': 'বিশুদ্ধ উপাদান',
    'product.benefit_pure_desc': 'প্রকৃতি থেকে সাকুরা এসেন্স।',
    'product.benefit_absorbing': 'দ্রুত শোষণ',
    'product.benefit_absorbing_desc': 'তৈলাক্ত নয়, হালকা ফর্মুলা।',
    'product.tab_description': 'বিবরণ',
    'product.tab_ingredients': 'উপাদান',
    'product.tab_how_to_use': 'ব্যবহার বিধি',
    'product.desc_extra': 'আমাদের জাপান সাকুরা লাইন জাপানি ব্লসমের কিংবদন্তি সৌন্দর্য আপনার দৈনন্দিন রুটিনে আনতে যত্ন সহকারে তৈরি। প্রতিটি ব্যাচ বিশুদ্ধতা এবং কার্যকারিতার জন্য পরীক্ষিত।',
    'product.how_to_use_steps': '১. সাকুরা ফেসওয়াশ দিয়ে মুখ পরিষ্কার করুন।\n২. আঙুলের ডগায় অল্প পরিমাণ পণ্য নিন।\n৩. আস্তে আস্তে ত্বকে উপরের দিকে বৃত্তাকার গতিতে ম্যাসাজ করুন।\n৪. সেরা ফলাফলের জন্য সকাল ও রাতে ব্যবহার করুন।',
    'product.related': 'সংশ্লিষ্ট পণ্য',
    'product.customer_reviews': 'গ্রাহকদের রিভিউ',
    'product.added_to_cart': 'কার্টে যোগ করা হয়েছে',

    // Search
    'search.title': 'অরিয়া খুঁজুন',
    'search.placeholder': 'আপনি কী খুঁজছেন?',
    'search.popular': 'জনপ্রিয় সার্চ:',
    'search.no_results': 'কোনো পণ্য পাওয়া যায়নি',
    'search.limited': 'সীমিত',

    // Contact Form
    'contact.title': 'যোগাযোগ করুন',
    'contact.subtitle': 'আমাদের পণ্য বা অর্ডার সম্পর্কে প্রশ্ন আছে? আমরা সাহায্য করতে এখানে আছি।',
    'contact.send_message': 'আমাদের মেসেজ পাঠান',
    'contact.your_name': 'আপনার নাম',
    'contact.full_name': 'পুরো নাম',
    'contact.email': 'ইমেল ঠিকানা',
    'contact.message': 'মেসেজ',
    'contact.message_placeholder': 'আমরা কীভাবে আপনাকে সাহায্য করতে পারি?',
    'contact.send_btn': 'মেসেজ পাঠান',
    'contact.sending': 'মেসেজ পাঠানো হচ্ছে...',
    'contact.success_title': 'মেসেজ সফলভাবে পাঠানো হয়েছে!',
    'contact.success_text': 'যোগাযোগ করার জন্য ধন্যবাদ। আমরা ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করব।',
    'contact.send_another': 'আরেকটি মেসেজ পাঠান',
    'contact.phone': 'ফোন',
    'contact.email_label': 'ইমেল',
    'contact.address': 'ঠিকানা',
    'contact.follow': 'আমাদের ফলো করুন',

    // Wishlist
    'wishlist.title': 'আমার উইশলিস্ট',
    'wishlist.subtitle': 'আপনার প্রিয় স্কিনকেয়ার পণ্যগুলো, সুন্দরভাবে এক জায়গায় সংরক্ষিত।',
    'wishlist.curating': 'আপনার প্রিয় স্কিনকেয়ার পণ্যগুলো গুছিয়ে রাখা হচ্ছে...',
    'wishlist.empty': 'আপনার উইশলিস্ট খালি',
    'wishlist.empty_desc': 'জাপানি স্কিনকেয়ারের বিশুদ্ধতম অভিজ্ঞতা আবিষ্কার করুন এবং আপনার প্রিয় পণ্যগুলো এখানে সংরক্ষণ করুন।',
    'wishlist.explore': 'কালেকশন দেখুন',
    'wishlist.out_of_stock': 'স্টক নেই',

    // Mobile Menu
    'mobile.radiance': 'উজ্জ্বলতায় পৌঁছে দেওয়া',
    
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

    // Product Detail Page
    'product.reviews': 'Reviews',
    'product.add_to_cart': 'Add to Cart',
    'product.buy_now': 'Buy Now',
    'product.authentic': 'Authentic Product',
    'product.fast_delivery': 'Fast Delivery',
    'product.safe_payment': 'Safe Payment',
    'product.short_desc': 'Experience the natural brightening power of Japanese Sakura. This premium formula deeply hydrates and rejuvenates your skin for a healthy, youthful glow.',
    'product.benefit_hydration': 'Deep Hydration',
    'product.benefit_hydration_desc': 'Locks in moisture for 24 hours.',
    'product.benefit_brightening': 'Brightening',
    'product.benefit_brightening_desc': 'Reduces dullness and evening skin tone.',
    'product.benefit_pure': 'Pure Ingredients',
    'product.benefit_pure_desc': 'Sakura essence from nature.',
    'product.benefit_absorbing': 'Fast Absorbing',
    'product.benefit_absorbing_desc': 'Non-greasy, lightweight formula.',
    'product.tab_description': 'Description',
    'product.tab_ingredients': 'Ingredients',
    'product.tab_how_to_use': 'How To Use',
    'product.desc_extra': 'Our Japan Sakura line is crafted with care to bring the legendary beauty of Japanese blossoms to your daily routine. Each batch is tested for purity and effectiveness, ensuring a premium experience every time.',
    'product.how_to_use_steps': '1. Cleanse your face with Sakura Facewash.\n2. Apply a small amount of product to your fingertips.\n3. Gently massage onto skin in upward circular motions.\n4. Use morning and night for best results.',
    'product.related': 'Related Products',
    'product.customer_reviews': 'Customer Reviews',
    'product.added_to_cart': 'added to cart',

    // Search
    'search.title': 'Search Aurea',
    'search.placeholder': 'What are you looking for?',
    'search.popular': 'Popular Searches:',
    'search.no_results': 'No products found',
    'search.limited': 'Limited',

    // Contact Form
    'contact.title': 'Get in Touch',
    'contact.subtitle': 'Have questions about our products or your order? We\'re here to help.',
    'contact.send_message': 'Send us a Message',
    'contact.your_name': 'Your Name',
    'contact.full_name': 'Full Name',
    'contact.email': 'Email Address',
    'contact.message': 'Message',
    'contact.message_placeholder': 'How can we help you?',
    'contact.send_btn': 'Send Message',
    'contact.sending': 'Sending Message...',
    'contact.success_title': 'Message Sent Successfully!',
    'contact.success_text': 'Thank you for reaching out. We will get back to you within 24 hours.',
    'contact.send_another': 'Send Another Message',
    'contact.phone': 'Phone',
    'contact.email_label': 'Email',
    'contact.address': 'Address',
    'contact.follow': 'Follow Our Glow',

    // Wishlist
    'wishlist.title': 'My Wishlist',
    'wishlist.subtitle': 'Your favorite skincare essentials, saved beautifully in one place.',
    'wishlist.curating': 'Curating your favorite skincare essentials...',
    'wishlist.empty': 'Your wishlist is empty',
    'wishlist.empty_desc': 'Discover the purest essence of Japanese skincare and save your favorites here.',
    'wishlist.explore': 'Explore Collection',
    'wishlist.out_of_stock': 'Out of Stock',

    // Mobile Menu
    'mobile.radiance': 'Radiance Delivered',
    
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

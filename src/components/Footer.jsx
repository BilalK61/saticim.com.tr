import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Send } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({
    instagram_url: '#',
    twitter_url: '#',
    linkedin_url: '#',
    facebook_url: '#',
    email: 'destek@saticim.com',
    phone: '+90 850 123 45 67',
    address: 'İstanbul, Türkiye'
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching contact info:', error);
        return;
      }

      if (data) {
        setContactInfo(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Unexpected error fetching contact info:', err);
    }
  };

  return (
    <footer className="bg-white text-gray-600 pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="block">
              <img
                // Use supabase storage URL if available, else keep local or hardcoded
                src="https://ecbhhbyfocitafbfsegg.supabase.co/storage/v1/object/public/logos/saticimlogokucuk.png"
                alt="Satıcım"
                className="h-20 w-auto object-contain hover:opacity-90 transition-all"
              />
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Türkiye'nin en güvenilir alışveriş platformu. İster al, ister sat; güvenli ticaretin adresi.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              {[
                { icon: Facebook, href: contactInfo.facebook_url, color: "hover:text-blue-600", bg: "hover:bg-blue-50", show: !!contactInfo.facebook_url },
                { icon: Instagram, href: contactInfo.instagram_url, color: "hover:text-pink-600", bg: "hover:bg-pink-50", show: !!contactInfo.instagram_url },
                { icon: Twitter, href: contactInfo.twitter_url, color: "hover:text-sky-500", bg: "hover:bg-sky-50", show: !!contactInfo.twitter_url },
                { icon: Linkedin, href: contactInfo.linkedin_url, color: "hover:text-blue-700", bg: "hover:bg-blue-50", show: !!contactInfo.linkedin_url },
              ].filter(item => item.show).map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center transition-all text-gray-500 ${item.color} ${item.bg}`}
                >
                  <item.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-6">Hızlı Erişim</h3>
            <ul className="space-y-4">
              {[
                { name: 'Ana Sayfa', to: '/' },
                { name: 'Vasıta İlanları', to: '/vasita' },
                { name: 'Emlak İlanları', to: '/emlak' },
                { name: 'Elektronik', to: '/elektronik' },
                { name: 'İlan Ver', to: '/ilan-ekle' },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.to} className="text-gray-500 hover:text-blue-600 hover:translate-x-1 transition-all inline-block font-medium">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-6">İletişim</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <MapPin className="text-blue-600" size={16} />
                </div>
                <span className="text-sm text-gray-500 mt-1.5">{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Phone className="text-blue-600" size={16} />
                </div>
                <span className="text-sm text-gray-500">{contactInfo.phone}</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Mail className="text-blue-600" size={16} />
                </div>
                <span className="text-sm text-gray-500">{contactInfo.email}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-6">Bültenimize Abone Olun</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              En yeni ilanlardan ve fırsatlardan haberdar olmak için bültenimize kayıt olun.
            </p>
            <form className="relative shadow-sm" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 text-center md:text-left font-medium">
            &copy; {new Date().getFullYear()} Satıcım. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 text-sm text-gray-500 font-medium">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Gizlilik Politikası</Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">Kullanım Koşulları</Link>
            <Link to="/cookies" className="hover:text-blue-600 transition-colors">Çerez Politikası</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

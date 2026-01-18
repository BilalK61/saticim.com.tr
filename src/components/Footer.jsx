import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="text-2xl font-bold text-blue-700 tracking-tighter">
              Saticim
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-600 max-w-xs">
              E-ticaretin geleceği burada başlıyor.
            </p>
          </div>
          <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-gray-900 mb-4">Hızlı Linkler</h3>
              <ul role="list" className="space-y-3">
                <li><motion.a href="#" whileHover={{ x: 5 }} className="text-sm leading-6 text-gray-600 hover:text-blue-600 transition-colors block">Anasayfa</motion.a></li>
                <li><motion.a href="#" whileHover={{ x: 5 }} className="text-sm leading-6 text-gray-600 hover:text-blue-600 transition-colors block">Kategoriler</motion.a></li>
                <li><motion.a href="#" whileHover={{ x: 5 }} className="text-sm leading-6 text-gray-600 hover:text-blue-600 transition-colors block">İletişim</motion.a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-gray-900 mb-4">Hakkımızda</h3>
              <ul role="list" className="space-y-3">
                <li><motion.a href="#" whileHover={{ x: 5 }} className="text-sm leading-6 text-gray-600 hover:text-blue-600 transition-colors block">Hakkımızda</motion.a></li>
                <li><motion.a href="#" whileHover={{ x: 5 }} className="text-sm leading-6 text-gray-600 hover:text-blue-600 transition-colors block">Kariyer</motion.a></li>
                <li><motion.a href="#" whileHover={{ x: 5 }} className="text-sm leading-6 text-gray-600 hover:text-blue-600 transition-colors block">Blog</motion.a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-gray-900 mb-4">Destek</h3>
              <ul role="list" className="space-y-3">
                <li><motion.a href="#" whileHover={{ x: 5 }} className="text-sm leading-6 text-gray-600 hover:text-blue-600 transition-colors block">Yardım Merkezi</motion.a></li>
                <li><motion.a href="#" whileHover={{ x: 5 }} className="text-sm leading-6 text-gray-600 hover:text-blue-600 transition-colors block">Topluluk</motion.a></li>
                <li><motion.a href="#" whileHover={{ x: 5 }} className="text-sm leading-6 text-gray-600 hover:text-blue-600 transition-colors block">İletişim</motion.a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24 flex flex-col md:flex-row justify-between items-center gap-4 text-xs leading-5 text-gray-500">
          <p className="text-center md:text-left">&copy; {new Date().getFullYear()} Saticim. Tüm hakları saklıdır.</p>
          <ul role="list" className="flex gap-6">
            <li>
              <motion.a href="#" whileHover={{ color: "#2563eb" }} className="transition-colors">Gizlilik Politikası</motion.a>
            </li>
            <li>
              <motion.a href="#" whileHover={{ color: "#2563eb" }} className="transition-colors">Kullanıcı Sözleşmesi</motion.a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

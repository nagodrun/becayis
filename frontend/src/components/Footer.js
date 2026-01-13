import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>
              Becayiş
            </h3>
            <p className="text-slate-400 text-sm">
              Kamu çalışanları için güvenli ve kolay yer değişim platformu.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Hızlı Erişim</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">Anasayfa</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Sıkça Sorulan Sorular</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Panel</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Destek</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/help" className="hover:text-white transition-colors">Yardım</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Gizlilik</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Şartlar</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2025 Becayiş. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};
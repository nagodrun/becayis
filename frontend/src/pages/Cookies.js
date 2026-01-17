import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Cookie, Shield, FileText, FileCheck, HelpCircle } from 'lucide-react';

const Cookies = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Link to="/kvkk" className="p-3 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <Shield className="w-6 h-6 mx-auto mb-1.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-foreground">KVKK Aydınlatma</span>
          </Link>
          <Link to="/kvkk-basvuru" className="p-3 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <FileText className="w-6 h-6 mx-auto mb-1.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-foreground">KVKK Başvuru</span>
          </Link>
          <Link to="/uyelik-sozlesmesi" className="p-3 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <FileCheck className="w-6 h-6 mx-auto mb-1.5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-foreground">Üyelik Sözleşmesi</span>
          </Link>
          <Link to="/help" className="p-3 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <HelpCircle className="w-6 h-6 mx-auto mb-1.5 text-red-600 dark:text-red-400" />
            <span className="text-xs font-medium text-foreground">Yardım</span>
          </Link>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Cookie className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
                Çerez Politikası
              </h1>
            </div>

            <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
              
              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Çerez Nedir?</h2>
                <p>
                  Çerezler (cookies), web sitelerinin bilgisayarınıza veya mobil cihazınıza yerleştirdiği 
                  küçük metin dosyalarıdır. Bu dosyalar, web sitesinin düzgün çalışmasını sağlamak, 
                  güvenliği artırmak ve kullanıcı deneyimini iyileştirmek amacıyla kullanılır.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Kullandığımız Çerez Türleri</h2>
                
                <div className="space-y-4 mt-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Zorunlu Çerezler</h3>
                    <p className="text-sm">
                      Web sitesinin temel işlevlerinin çalışması için gereklidir. Bu çerezler olmadan 
                      oturum açma, form doldurma gibi işlemler yapılamaz.
                    </p>
                    <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                      <li><strong>auth_token:</strong> Kullanıcı oturumunu yönetir</li>
                      <li><strong>session_id:</strong> Oturum tanımlayıcısı</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">İşlevsel Çerezler</h3>
                    <p className="text-sm">
                      Tercihlerinizi hatırlamak için kullanılır ve size daha kişiselleştirilmiş 
                      bir deneyim sunar.
                    </p>
                    <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                      <li><strong>theme:</strong> Tercih edilen tema (açık/koyu)</li>
                      <li><strong>language:</strong> Dil tercihi</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Analitik Çerezler</h3>
                    <p className="text-sm">
                      Web sitesinin nasıl kullanıldığını anlamamıza yardımcı olur. Toplanan veriler 
                      anonim olarak işlenir.
                    </p>
                    <ul className="list-disc pl-6 mt-2 text-sm space-y-1">
                      <li><strong>_ga:</strong> Google Analytics - ziyaretçi istatistikleri</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Çerez Saklama Süreleri</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm mt-4">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-foreground">Çerez</th>
                        <th className="text-left py-2 pr-4 text-foreground">Tür</th>
                        <th className="text-left py-2 text-foreground">Süre</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">auth_token</td>
                        <td className="py-2 pr-4">Zorunlu</td>
                        <td className="py-2">7 gün</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">session_id</td>
                        <td className="py-2 pr-4">Zorunlu</td>
                        <td className="py-2">Oturum sonu</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4">theme</td>
                        <td className="py-2 pr-4">İşlevsel</td>
                        <td className="py-2">1 yıl</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4">_ga</td>
                        <td className="py-2 pr-4">Analitik</td>
                        <td className="py-2">2 yıl</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Çerezleri Yönetme</h2>
                <p>
                  Tarayıcı ayarlarınızdan çerezleri yönetebilir, engelleyebilir veya silebilirsiniz. 
                  Ancak zorunlu çerezleri devre dışı bırakmanız durumunda web sitesinin bazı özellikleri 
                  düzgün çalışmayabilir.
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <p><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler</p>
                  <p><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</p>
                  <p><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler</p>
                  <p><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Politika Değişiklikleri</h2>
                <p>
                  Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişiklikler olması durumunda 
                  web sitemizde duyuru yapılacaktır.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. İletişim</h2>
                <p>
                  Çerez politikamız hakkında sorularınız için <strong>destek@becayis.org.tr</strong> 
                  adresinden bizimle iletişime geçebilirsiniz.
                </p>
              </section>
              <p className="text-sm text-slate-500">Son Güncelleme: Ocak 2026</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cookies;

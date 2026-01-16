import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, FileCheck, Shield, FileText, Cookie, HelpCircle } from 'lucide-react';

const MembershipAgreement = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <Link to="/cerezler" className="p-3 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <Cookie className="w-6 h-6 mx-auto mb-1.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-foreground">Çerez Politikası</span>
          </Link>
          <Link to="/help" className="p-3 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <HelpCircle className="w-6 h-6 mx-auto mb-1.5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-foreground">Yardım</span>
          </Link>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
                Üyelik Sözleşmesi
              </h1>
            </div>

            <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
              <p className="text-sm text-slate-500">Son Güncelleme: Ocak 2025</p>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Taraflar</h2>
                <p>
                  İşbu Üyelik Sözleşmesi ("Sözleşme"), becayis.org.tr alan adlı web sitesi ("Platform") 
                  ile Platform'a üye olan gerçek kişi ("Üye") arasında, üyelik işleminin tamamlanması 
                  ile birlikte yürürlüğe girer.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Tanımlar</h2>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Platform:</strong> becayis.org.tr web sitesi ve mobil uygulamaları</li>
                  <li><strong>Üye:</strong> Platform'a kayıt olmuş kamu personeli</li>
                  <li><strong>İlan:</strong> Üyelerin becayiş talebi amacıyla yayınladığı duyurular</li>
                  <li><strong>Becayiş:</strong> Aynı kurumda farklı yerlerde çalışan personellerin karşılıklı yer değiştirmesi</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Üyelik Şartları</h2>
                <p>Platform'a üye olabilmek için:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>18 yaşından büyük olmak</li>
                  <li>Türkiye Cumhuriyeti vatandaşı olmak</li>
                  <li>Kamu kurumunda aktif olarak çalışıyor olmak</li>
                  <li>Kurumsal (.gov.tr uzantılı) e-posta adresine sahip olmak</li>
                  <li>İşbu sözleşmeyi kabul etmek</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Üyenin Hak ve Yükümlülükleri</h2>
                <p>Üye:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Kayıt sırasında doğru ve güncel bilgi vermekle yükümlüdür</li>
                  <li>Hesap bilgilerinin güvenliğinden sorumludur</li>
                  <li>Platform'u yalnızca becayiş amacıyla kullanacaktır</li>
                  <li>Diğer üyelere saygılı davranacak, hakaret ve küfür içeren ifadeler kullanmayacaktır</li>
                  <li>Yanıltıcı veya gerçeğe aykırı ilan yayınlamayacaktır</li>
                  <li>Üçüncü kişilerin kişisel verilerini paylaşmayacaktır</li>
                  <li>Platform'un teknik altyapısına zarar verecek girişimlerde bulunmayacaktır</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Platform'un Hak ve Yükümlülükleri</h2>
                <p>Platform:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Hizmeti 7/24 erişilebilir tutmak için azami çabayı gösterecektir</li>
                  <li>Üye verilerini KVKK kapsamında koruyacaktır</li>
                  <li>Sözleşmeye aykırı davranan üyelerin hesaplarını askıya alabilir veya silebilir</li>
                  <li>Hizmet şartlarında değişiklik yapma hakkını saklı tutar</li>
                  <li>Bakım ve güncelleme nedeniyle hizmeti geçici olarak durdurabilir</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. İlan Kuralları</h2>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>İlanlar Türkçe olarak yayınlanmalıdır</li>
                  <li>İlan içeriği sadece becayiş ile ilgili bilgiler içermelidir</li>
                  <li>Kişisel iletişim bilgileri (telefon, e-posta) ilan metninde yer almamalıdır</li>
                  <li>Aynı içerikli birden fazla ilan yayınlanamaz</li>
                  <li>Platform, kurallara aykırı ilanları yayından kaldırma hakkını saklı tutar</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Sorumluluk Reddi</h2>
                <p>
                  Platform, üyeler arasındaki becayiş görüşmelerinin ve işlemlerinin sonucundan 
                  sorumlu değildir. Becayiş işlemleri, ilgili kamu kurumlarının mevzuatı ve 
                  onayı çerçevesinde gerçekleştirilir. Platform, yalnızca üyeleri bir araya 
                  getiren bir aracı konumundadır.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Üyelik İptali</h2>
                <p>
                  Üye, dilediği zaman hesabını silme talebinde bulunabilir. Hesap silme talebi, 
                  admin onayının ardından işleme alınır. Sözleşmeye aykırı davranan üyelerin 
                  hesapları Platform tarafından tek taraflı olarak sonlandırılabilir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Fikri Mülkiyet</h2>
                <p>
                  Platform'un tasarımı, logosu, içeriği ve yazılımı üzerindeki tüm fikri mülkiyet 
                  hakları Platform'a aittir. Üyeler, Platform içeriğini izinsiz kopyalayamaz, 
                  dağıtamaz veya ticari amaçla kullanamaz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Uyuşmazlık Çözümü</h2>
                <p>
                  İşbu sözleşmeden doğabilecek uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır. 
                  Uyuşmazlıkların çözümünde Ankara Mahkemeleri ve İcra Daireleri yetkilidir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Yürürlük</h2>
                <p>
                  İşbu sözleşme, üyelik işleminin tamamlanmasıyla yürürlüğe girer ve üyelik 
                  devam ettiği sürece geçerliliğini korur.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">12. İletişim</h2>
                <p>
                  Sözleşme ile ilgili sorularınız için <strong>destek@becayis.org.tr</strong> 
                  adresinden bizimle iletişime geçebilirsiniz.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MembershipAgreement;

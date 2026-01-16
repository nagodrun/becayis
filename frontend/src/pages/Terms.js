import React from 'react';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { FileText, HelpCircle, Shield, Users } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <FileText className="w-16 h-16 text-slate-900 dark:text-slate-100 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
            Kullanım Şartları
          </h1>
          <p className="text-muted-foreground mt-2">
            Son güncelleme: Ocak 2026
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link to="/help" className="p-4 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-foreground">Yardım Merkezi</span>
          </Link>
          <Link to="/faq" className="p-4 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <Users className="w-8 h-8 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-foreground">SSS</span>
          </Link>
          <Link to="/privacy" className="p-4 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-foreground">Gizlilik</span>
          </Link>
          <Link to="/register" className="p-4 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <FileText className="w-8 h-8 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-foreground">Kayıt Ol</span>
          </Link>
        </div>

        {/* Terms Content */}
        <Card className="p-6 md:p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-foreground mt-0 mb-4">1. Genel Şartlar</h2>
            <p className="text-muted-foreground mb-6">
              Becayiş platformunu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız. Bu platform, 
              kamu çalışanlarının karşılıklı yer değişimi (becayiş) taleplerini paylaşmaları ve 
              iletişime geçmeleri için tasarlanmıştır.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Üyelik Koşulları</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>Platforma yalnızca kamu kurumlarında çalışan personel üye olabilir.</li>
              <li>Kayıt için geçerli bir kurumsal e-posta adresi (@gov.tr uzantılı) zorunludur.</li>
              <li>Her kullanıcı yalnızca bir hesap açabilir.</li>
              <li>Kayıt sırasında verilen bilgilerin doğru ve güncel olması gerekmektedir.</li>
              <li>Hesap bilgilerinin güvenliğinden kullanıcı sorumludur.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Platform Kullanım Kuralları</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>Platform yalnızca yasal becayiş amaçlı kullanılmalıdır.</li>
              <li>Yanıltıcı, sahte veya gerçeğe aykırı ilan paylaşmak yasaktır.</li>
              <li>Diğer kullanıcılara hakaret, tehdit veya rahatsız edici davranışlar yasaktır.</li>
              <li>Ticari amaçlı kullanım, reklam veya spam yasaktır.</li>
              <li>Platform güvenliğini tehlikeye atacak eylemler yasaktır.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. İlan Kuralları</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>İlanlar yalnızca gerçek becayiş talepleri için oluşturulmalıdır.</li>
              <li>İlan içeriği doğru kurum, pozisyon ve konum bilgisi içermelidir.</li>
              <li>Aynı içerikli birden fazla ilan oluşturmak yasaktır.</li>
              <li>Becayiş tamamlandığında veya vazgeçildiğinde ilan kaldırılmalıdır.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Gizlilik ve İletişim</h2>
            <p className="text-muted-foreground mb-6">
              Kullanıcıların iletişim bilgileri (telefon, e-posta) gizlidir ve yalnızca karşılıklı 
              davet kabul edildikten sonra paylaşılır. Davet kabul edilmeden iletişim bilgileriniz 
              diğer kullanıcılara gösterilmez.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Hesap Silme</h2>
            <p className="text-muted-foreground mb-6">
              Kullanıcılar hesaplarını silmek için talepte bulunabilir. Hesap silme talepleri admin 
              onayına tabidir. Onaylanan talepler sonucunda tüm kullanıcı verileri (ilanlar, mesajlar, 
              davetler) kalıcı olarak silinir.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Yaptırımlar</h2>
            <p className="text-muted-foreground mb-6">
              Kullanım şartlarını ihlal eden hesaplar uyarı almadan askıya alınabilir veya kalıcı 
              olarak silinebilir. Platform yönetimi, herhangi bir hesabı veya ilanı gerekçe 
              göstermeksizin kaldırma hakkını saklı tutar.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Sorumluluk Reddi</h2>
            <p className="text-muted-foreground mb-6">
              Platform, kullanıcılar arasındaki becayiş işlemlerinin başarısını veya yasal uygunluğunu 
              garanti etmez. Becayiş işlemleri tamamen kullanıcıların ve ilgili kurumların 
              sorumluluğundadır. Platform yalnızca kullanıcıları bir araya getiren bir aracı konumundadır.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Değişiklikler</h2>
            <p className="text-muted-foreground mb-6">
              Bu kullanım şartları önceden bildirim yapılmaksızın değiştirilebilir. Değişiklikler 
              yayınlandığı andan itibaren geçerli olur. Platformu kullanmaya devam etmeniz, 
              güncellenmiş şartları kabul ettiğiniz anlamına gelir.
            </p>

            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Önemli:</strong> Bu platformu kullanarak yukarıdaki tüm şartları okuduğunuzu, 
                anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Terms;

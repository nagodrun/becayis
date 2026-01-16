import React from 'react';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Shield, HelpCircle, FileText, Users } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-slate-900 dark:text-slate-100 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
            Gizlilik Politikası
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
          <Link to="/terms" className="p-4 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <FileText className="w-8 h-8 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-foreground">Kullanım Şartları</span>
          </Link>
          <Link to="/register" className="p-4 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-foreground">Kayıt Ol</span>
          </Link>
        </div>

        {/* Privacy Content */}
        <Card className="p-6 md:p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-foreground mt-0 mb-4">1. Toplanan Veriler</h2>
            <p className="text-muted-foreground mb-4">
              Becayiş platformu olarak aşağıdaki kişisel verileri topluyoruz:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li><strong>Hesap Bilgileri:</strong> Ad, soyad, kurumsal e-posta adresi</li>
              <li><strong>Profil Bilgileri:</strong> Kurum, pozisyon, çalışılan il/ilçe</li>
              <li><strong>İlan Bilgileri:</strong> Becayiş tercihleri, hedef konum</li>
              <li><strong>İletişim Verileri:</strong> Platform içi mesajlar</li>
              <li><strong>Kullanım Verileri:</strong> Giriş zamanları, IP adresi</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Verilerin Kullanım Amaçları</h2>
            <p className="text-muted-foreground mb-4">
              Topladığımız veriler şu amaçlarla kullanılmaktadır:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>Hesap oluşturma ve kimlik doğrulama</li>
              <li>Becayiş ilan ve taleplerinin yönetimi</li>
              <li>Kullanıcılar arası eşleştirme ve iletişim</li>
              <li>Platform güvenliğinin sağlanması</li>
              <li>Hizmet kalitesinin iyileştirilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. İletişim Bilgilerinin Paylaşımı</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Önemli:</strong> Telefon numaranız ve e-posta adresiniz varsayılan olarak GİZLİDİR. 
                İletişim bilgileriniz yalnızca siz bir daveti kabul ettiğinizde veya size gönderilen 
                bir davet kabul edildiğinde karşı tarafla paylaşılır.
              </p>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Veri Güvenliği</h2>
            <p className="text-muted-foreground mb-4">
              Verilerinizin güvenliği için aldığımız önlemler:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>SSL/TLS şifreleme ile güvenli veri iletimi</li>
              <li>Şifrelerin güvenli hash algoritmaları ile saklanması</li>
              <li>Düzenli güvenlik güncellemeleri</li>
              <li>Yetkilendirilmiş erişim kontrolü</li>
              <li>Düzenli veri yedekleme</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Veri Saklama Süresi</h2>
            <p className="text-muted-foreground mb-6">
              Kişisel verileriniz hesabınız aktif olduğu sürece saklanır. Hesap silme talebiniz 
              onaylandığında tüm verileriniz kalıcı olarak silinir. Yasal zorunluluklar gereği 
              bazı veriler belirli süreler boyunca saklanabilir.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Haklarınız</h2>
            <p className="text-muted-foreground mb-4">
              KVKK kapsamında sahip olduğunuz haklar:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>Silme veya yok edilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler aracılığıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Çerezler</h2>
            <p className="text-muted-foreground mb-6">
              Platformumuz oturum yönetimi ve kullanıcı tercihlerini saklamak için çerezler kullanır. 
              Bu çerezler platformun düzgün çalışması için gereklidir. Tarayıcı ayarlarınızdan çerezleri 
              devre dışı bırakabilirsiniz, ancak bu durumda bazı özellikler çalışmayabilir.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Üçüncü Taraflarla Paylaşım</h2>
            <p className="text-muted-foreground mb-4">
              Kişisel verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>Açık rızanızın bulunması</li>
              <li>Yasal zorunluluk halinde yetkili makamlarla</li>
              <li>Hizmet sağlayıcılarımızla (sunucu, güvenlik vb.) sınırlı ölçüde</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. İletişim</h2>
            <p className="text-muted-foreground mb-6">
              Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz. 
              KVKK kapsamındaki taleplerinizi platform üzerinden iletebilirsiniz.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Politika Değişiklikleri</h2>
            <p className="text-muted-foreground mb-6">
              Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler olması durumunda 
              kullanıcılar bilgilendirilecektir. Platformu kullanmaya devam etmeniz, güncellenmiş 
              politikayı kabul ettiğiniz anlamına gelir.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;

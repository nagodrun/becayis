import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';

const KVKK = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
                KVKK Aydınlatma Metni
              </h1>
            </div>

            <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
              <p className="text-sm text-slate-500">Son Güncelleme: Ocak 2025</p>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Veri Sorumlusu</h2>
                <p>
                  Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, 
                  becayis.org.tr ("Platform") tarafından kişisel verilerinizin işlenmesine ilişkin 
                  bilgilendirme amacıyla hazırlanmıştır.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. İşlenen Kişisel Veriler</h2>
                <p>Platform tarafından aşağıdaki kişisel veriler işlenmektedir:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
                  <li><strong>İletişim Bilgileri:</strong> Kurumsal e-posta adresi, telefon numarası (isteğe bağlı)</li>
                  <li><strong>Çalışma Bilgileri:</strong> Kurum adı, unvan, görev yeri (il/ilçe)</li>
                  <li><strong>Hesap Bilgileri:</strong> Kullanıcı adı, şifre (şifrelenmiş)</li>
                  <li><strong>İşlem Bilgileri:</strong> İlan geçmişi, mesajlaşma kayıtları, giriş kayıtları</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Kişisel Verilerin İşlenme Amaçları</h2>
                <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Üyelik işlemlerinin gerçekleştirilmesi ve hesap güvenliğinin sağlanması</li>
                  <li>Becayiş ilan ve talep hizmetlerinin sunulması</li>
                  <li>Kullanıcılar arası iletişimin sağlanması</li>
                  <li>Platform kullanım istatistiklerinin oluşturulması</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>Hizmet kalitesinin artırılması ve kullanıcı deneyiminin iyileştirilmesi</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Kişisel Verilerin Aktarılması</h2>
                <p>
                  Kişisel verileriniz, yalnızca hizmetin gerektirdiği durumlarda ve KVKK'nın 8. ve 9. maddelerinde 
                  belirtilen şartlar dahilinde üçüncü kişilere aktarılabilir:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Becayiş talebinde bulunduğunuz diğer kullanıcılara (karşılıklı onay durumunda)</li>
                  <li>Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına</li>
                  <li>Hizmet sağlayıcılarımıza (hosting, e-posta servisleri vb.)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Kişisel Veri Saklama Süresi</h2>
                <p>
                  Kişisel verileriniz, işleme amaçlarının gerektirdiği süre boyunca ve ilgili mevzuatın 
                  öngördüğü sürelere uygun olarak saklanmaktadır. Hesabınızı silmeniz halinde, yasal 
                  zorunluluklar hariç olmak üzere verileriniz 30 gün içinde silinir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. KVKK Kapsamındaki Haklarınız</h2>
                <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>İşlenmiş ise buna ilişkin bilgi talep etme</li>
                  <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Aktarıldığı üçüncü kişileri bilme</li>
                  <li>Eksik veya yanlış işlenmiş ise düzeltilmesini isteme</li>
                  <li>KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini isteme</li>
                  <li>Düzeltme ve silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                  <li>İşlenen verilerin analiz edilmesiyle aleyhinize bir sonuç çıkmasına itiraz etme</li>
                  <li>Kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. İletişim</h2>
                <p>
                  KVKK kapsamındaki haklarınızı kullanmak için{' '}
                  <Link to="/kvkk-basvuru" className="text-emerald-600 hover:underline">
                    KVKK Başvuru Formu
                  </Link>
                  'nu kullanabilir veya <strong>kvkk@becayis.org.tr</strong> adresine e-posta gönderebilirsiniz.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KVKK;

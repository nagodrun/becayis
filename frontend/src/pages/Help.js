import React from 'react';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { HelpCircle, FileText, Users, MessageSquare, Shield, Settings, AlertTriangle } from 'lucide-react';

const Help = () => {
  const helpSections = [
    {
      icon: Users,
      title: "Hesap İşlemleri",
      items: [
        { q: "Nasıl kayıt olabilirim?", a: "Kayıt için kurumsal e-posta adresiniz (@gov.tr uzantılı) gereklidir. Kayıt sayfasından ad, soyad, e-posta ve şifre bilgilerinizi girerek başlayın. E-postanıza gönderilen doğrulama kodunu girin." },
        { q: "Şifremi unuttum, ne yapmalıyım?", a: "Giriş sayfasındaki 'Şifremi Unuttum' bağlantısına tıklayın. E-posta adresinize şifre sıfırlama bağlantısı gönderilecektir." },
        { q: "Hesabımı nasıl silebilirim?", a: "Dashboard > Profil sekmesinden 'Hesap Silme Talebi' butonuna tıklayın. Talebiniz admin onayına gönderilecektir. Onaylandığında tüm verileriniz kalıcı olarak silinir." },
        { q: "Profil bilgilerimi nasıl güncellerim?", a: "Dashboard > Profil sekmesinden 'Profili Düzenle' butonuna tıklayarak tüm bilgilerinizi güncelleyebilirsiniz." }
      ]
    },
    {
      icon: FileText,
      title: "İlan İşlemleri",
      items: [
        { q: "İlan nasıl oluştururum?", a: "Giriş yaptıktan sonra 'Yeni İlan' butonuna tıklayın. İlan başlığı ve hedef konum bilgilerini girin. Kurum ve pozisyon bilgileri profilinizden otomatik alınır." },
        { q: "İlanımı nasıl düzenlerim?", a: "Dashboard > İlanlarım sekmesinden ilgili ilanın yanındaki 'Düzenle' butonuna tıklayın." },
        { q: "İlanımı nasıl silerim?", a: "Dashboard > İlanlarım sekmesinden 'Sil' butonuna tıklayın. Silme sebebi belirtmeniz gerekir ve işlem admin onayına gönderilir." },
        { q: "Neden profilimi tamamlamam gerekiyor?", a: "İlan oluşturmak için kurum, pozisyon ve konum bilgilerinizin dolu olması gerekir. Bu bilgiler ilanınızda otomatik gösterilir." }
      ]
    },
    {
      icon: MessageSquare,
      title: "Talep ve Mesajlaşma",
      items: [
        { q: "Birisiyle nasıl iletişime geçerim?", a: "İlgilendiğiniz ilana 'Talep Gönder' butonuyla talep gönderin. Karşı taraf talebi kabul ederse mesajlaşma başlar." },
        { q: "İletişim bilgilerim ne zaman paylaşılır?", a: "İletişim bilgileriniz (telefon, e-posta) yalnızca karşılıklı talep kabul edildikten sonra görünür hale gelir." },
        { q: "Talebi nasıl kabul ederim?", a: "Dashboard > Talepler sekmesinden gelen talepleri görebilir ve 'Kabul Et' veya 'Reddet' butonlarıyla yanıtlayabilirsiniz." },
        { q: "Mesajlarımı nasıl görebilirim?", a: "Dashboard > Mesajlar sekmesinden tüm aktif konuşmalarınızı görebilir ve mesajlaşabilirsiniz." }
      ]
    },
    {
      icon: Shield,
      title: "Güvenlik ve Gizlilik",
      items: [
        { q: "Bilgilerim güvende mi?", a: "Evet, tüm verileriniz şifreli olarak saklanır ve SSL ile korunur. İletişim bilgileriniz varsayılan olarak gizlidir." },
        { q: "Verilerimi nasıl indiririm?", a: "Dashboard > Profil sekmesinden verilerinizi dışa aktarabilirsiniz. KVKK kapsamında bu hakkınız mevcuttur." },
        { q: "Bir kullanıcıyı nasıl şikayet ederim?", a: "Uygunsuz davranış tespit ettiğinizde platform içi geri bildirim formunu kullanarak durumu bildirebilirsiniz." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-slate-900 dark:text-slate-100 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
            Yardım Merkezi
          </h1>
          <p className="text-muted-foreground mt-2">
            Becayiş platformu hakkında sık sorulan sorular ve cevapları.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link to="/register" className="p-4 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-foreground">Kayıt Ol</span>
          </Link>
          <Link to="/dashboard" className="p-4 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <Settings className="w-8 h-8 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-foreground">Dashboard</span>
          </Link>
          <Link to="/terms" className="p-4 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <FileText className="w-8 h-8 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-foreground">Kullanım Şartları</span>
          </Link>
          <Link to="/privacy" className="p-4 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-foreground">Gizlilik</span>
          </Link>
        </div>

        {/* Help Sections */}
        <div className="space-y-8">
          {helpSections.map((section, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <section.icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
              </div>
              
              <div className="space-y-4">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <h3 className="font-medium text-foreground mb-2">{item.q}</h3>
                    <p className="text-muted-foreground text-sm">{item.a}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="p-6 mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Hala yardıma mı ihtiyacınız var?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Aradığınız cevabı bulamadıysanız, platform içi geri bildirim formunu kullanarak 
                bizimle iletişime geçebilirsiniz. En kısa sürede size dönüş yapacağız.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Destek saatleri:</strong> Hafta içi 09:00 - 18:00
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Help;

import React from 'react';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { HelpCircle, FileText, Shield, MessageSquare } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: "Becayiş nedir?",
      answer: "Becayiş, tanım olarak karşılıklı olarak yer değiştirmektir. Becayişin tanımı, 657 sayılı Kanunun 73'üncü maddesinde yapılmıştır.
      'Becayiş : Aynı kurumun başka başka yerlerde bulunan aynı sınıftaki memurları, karşılıklı olarak yer değiştirme suretiyle atanmalarını isteyebilirler. Bu isteğin yerine getirilmesi atamaya yetkili amirlerince uygun bulunmasına bağlıdır.
      'Bu tanıma göre;
      'Becayiş aynı kurum personeli arasında yapılır. Yani Sağlık Personeli ile Maliye Bakanlığı personeli karşılıklı olarak yer değiştiremez. Sadece Sağlık Bakanlığının örneğin Van ile Erzurum illerinde çalışan personeli karşılıklı olarak yer değiştirebilir.
      'Becayişte, sınıf ve ünvan aynı olmalıdır. Örneğin Bilgisayar mühendisleri kendi aralarında, hemşireler kendi aralarında becayiş yapabilirler.
Becayiş'in atamaya yetkili amirce uygun bulunması gerekmektedir. Örneğin Mersin ile Adana arasında becayiş yapacak Sağlık Bakanlığı personelinin bir dilekçe ile bölge, il veya ilçe müdürlükleri aracılığı ile Bakanlığa başvurması ve Bakanlığın da bunu uygun görmesi gerekmektedir."
    },
    {
      question: "Platforma nasıl kayıt olabilirim?",
      answer: "Kayıt için kurumsal e-posta adresiniz (@gov.tr uzantılı) gereklidir. Kayıt olurken mail adresinize gönderilecek doğrulama kodu ile doğrulama yaptıktan sonra kayıt olabilirsiniz."
    },
    {
      question: "Sadece kurumsal e-posta ile mi kayıt olabilirim?",
      answer: "Evet, güvenlik nedeniyle sadece .gov.tr uzantılı kurumsal e-posta adresleri ile kayıt olunabilir. Bu, platformun sadece gerçek kamu çalışanları tarafından kullanılmasını sağlar."
    },
    {
      question: "Kaç hesap oluşturabilirim?",
      answer: "Her kişi yalnızca tek hesap oluşturabilir. Kurumsal e-posta adresi ile kontrol edilir."
    },
    {
      question: "İlan nasıl oluştururum?",
      answer: "Giriş yaptıktan sonra 'İlan Oluştur' butonuna tıklayın. İlan başlığı, mevcut konumunuz (il/ilçe) ve hedef konumunuzu belirtin. Profil bilgileriniz otomatik olarak doldurulacaktır."
    },
    {
      question: "İletişim bilgilerim ne zaman paylaşılır?",
      answer: "İletişim bilgileriniz (telefon, e-posta) gizlidir ve sadece gönderdiğiniz veya aldığınız bir daveti kabul ettiğinizde karşı tarafla paylaşılır. Davet reddedilirse hiçbir bilgi paylaşılmaz."
    },
    {
      question: "Davet sistemi nasıl çalışır?",
      answer: "Bir ilana davet gönderdiğinizde, ilan sahibi bildirim alır. Kabul ederse, her iki tarafın iletişim bilgileri paylaşılır ve mesajlaşma başlatılabilir. Günlük maksimum 10 davet gönderebilirsiniz."
    },
    {
      question: "İlanımı nasıl silebilirim?",
      answer: "İlanlarınızı dashboard'dan 'Sil' butonuna tıklayarak silebilirsiniz. Ancak silme işlemi için admin onayı gereklidir. Silme sebebinizi açıklayarak istek gönderin, admin onayladıktan sonra ilanınız silinecektir."
    },
    {
      question: "Mesajlaşma nasıl çalışır?",
      answer: "Davet kabul edildikten sonra otomatik olarak bir sohbet başlatılır. Dashboard'daki 'Mesajlar' bölümünden tüm konuşmalarınıza erişebilirsiniz. Mesajlar gerçek zamanlıya yakın şekilde güncellenir."
    },
    {
      question: "Bir kullanıcıyı nasıl engellerim?",
      answer: "Uygunsuz davranış gösteren kullanıcıları engelleyebilirsiniz. Engellediğiniz kişiler size mesaj gönderemez ve ilanlarınızı göremez."
    },
    {
      question: "Profilimi nasıl düzenlerim?",
      answer: "Dashboard'daki profil bölümünden görünen adınızı, kurumunuzu, pozisyonunuzu, mevcut konumunuzu ve biyografinizi istediğiniz zaman güncelleyebilirsiniz."
    },
    {
      question: "Güvenlik önlemleriniz neler?",
      answer: "Sicil numaranız hash'lenerek güvenli şekilde saklanır, şifreleriniz bcrypt ile şifrelenir, JWT ile güvenli oturum yönetimi sağlanır ve tüm verileriniz güvenli sunucularda tutulur."
    },
    {
      question: "Teknik sorun yaşarsam ne yapmalıyım?",
      answer: "Teknik sorunlar için destek ekibimizle iletişime geçebilirsiniz. Sorunlarınızı detaylı olarak bildirmeniz çözüm sürecini hızlandıracaktır."
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-slate-900 dark:text-slate-100 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-muted-foreground mt-2">
            Becayiş platformu hakkında merak ettiğiniz her şey.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link to="/help" className="p-4 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-foreground">Yardım Merkezi</span>
          </Link>
          <Link to="/register" className="p-4 bg-card border border-border rounded-lg text-center hover:shadow-md transition-shadow">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-foreground">Kayıt Ol</span>
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

        {/* FAQ Accordion */}
        <Card className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index}`}>
                <AccordionTrigger className="text-left font-semibold hover:no-underline text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Contact Section */}
        <Card className="p-6 mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-2">Başka sorularınız mı var?</h3>
            <p className="text-muted-foreground text-sm">
              Destek ekibimizle iletişime geçmek için{' '}
              <a href="mailto:info@becayis.gov.tr" className="text-blue-600 dark:text-blue-400 hover:underline">
                info@becayis.gov.tr
              </a>{' '}
              adresine e-posta gönderebilirsiniz.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;

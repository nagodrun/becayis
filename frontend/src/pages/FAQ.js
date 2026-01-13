import React from 'react';
import { Card } from '../components/ui/card';
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
      answer: "Becayiş, kamu çalışanlarının aynı pozisyondaki diğer çalışanlarla yer değiştirmesini kolaylaştıran bir platformdur. Güvenli ve kolay bir şekilde yer değişimi yapmanızı sağlar."
    },
    {
      question: "Platforma nasıl kayıt olabilirim?",
      answer: "Kayıt için kurumsal e-posta adresiniz (@gov.tr uzantılı), sicil numaranız ve telefon numaranız gereklidir. Kayıt üç adımda tamamlanır: Email ve sicil doğrulama, telefon doğrulama (OTP), profil oluşturma."
    },
    {
      question: "Sadece kurumsal e-posta ile mi kayıt olabilirim?",
      answer: "Evet, güvenlik nedeniyle sadece .gov.tr uzantılı kurumsal e-posta adresleri ile kayıt olunabilir. Bu, platformun sadece gerçek kamu çalışanları tarafından kullanılmasını sağlar."
    },
    {
      question: "Kaç hesap oluşturabilirim?",
      answer: "Her kişi yalnızca BİR hesap oluşturabilir. Sicil numarası, telefon numarası ve e-posta adresi ile kontrol edilir. Birden fazla hesap oluşturma durumunda hesaplarınız engellenebilir."
    },
    {
      question: "İlan nasıl oluştururum?",
      answer: "Giriş yaptıktan sonra 'İlan Oluştur' butonuna tıklayın. İlan başlığı, mevcut konumunuz (il/ilçe) ve hedef konumunuzu belirtin. Profil bilgileriniz otomatik olarak doldurulacaktır."
    },
    {
      question: "İletişim bilgilerim ne zaman paylaşılır?",
      answer: "İletişim bilgileriniz (telefon, e-posta) gizlidir ve sadece gönderdiğiniz veya aldığınız bir daveti KABUL ETTİĞİNİZDE karşı tarafla paylaşılır. Davet reddedilirse hiçbir bilgi paylaşılmaz."
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-lg text-slate-600">
            Becayiş platformu hakkında merak ettiğiniz her şey
          </p>
        </div>

        <Card className="p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4">
            Başka sorularınız mı var?
          </p>
          <p className="text-sm text-slate-500">
            Destek ekibimizle iletişime geçmek için info@becayis.gov.tr adresine e-posta gönderebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
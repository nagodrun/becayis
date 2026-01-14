# Becayiş - Kamu Çalışanları Yer Değişim Platformu PRD

## Orijinal Problem Tanımı
Türkiye'deki kamu çalışanlarının aynı pozisyondaki diğer çalışanlarla karşılıklı yer değişimi yapmasına olanak sağlayan bir web platformu.

## Kullanıcı Profili
- Türkiye'deki kamu kurumlarında çalışan personel
- Farklı illere tayin olmak isteyen memurlar
- Kurumlar arası veya kurum içi yer değişimi arayan çalışanlar

## Temel Gereksinimler

### 1. Kimlik Doğrulama (Tamamlandı)
- [x] Kurumsal e-posta ile kayıt (@gov.tr uzantısı)
- [x] OTP ile telefon doğrulaması (MOCKED - gerçek SMS gönderilmiyor)
- [x] JWT tabanlı oturum yönetimi
- [x] Çıkış yapıldığında ana sayfaya yönlendirme

### 2. Kullanıcı Paneli (Tamamlandı)
- [x] Profil tamamlanma durumu
- [x] Aktif ilan sayısı
- [x] Bekleyen davet sayısı
- [x] Aktif konuşma sayısı
- [x] Bildirim sayısı
- [x] Profil sekmesi (Dashboard içinde, detaylı düzenleme)
- [x] Kapatılabilir platform politikası uyarısı
- [x] Konuşma silme (X butonu)

### 3. Ana Sayfa & İlanlar (Tamamlandı)
- [x] Son ilanların listesi
- [x] Anlık arama (debounce ile live search)
- [x] Filtreleme (kurum, pozisyon, il, hedef il)
- [x] Aktif filtre etiketleri gösterimi
- [x] "İlan Oluştur" CTA butonu
- [x] Giriş yapmamış kullanıcılar için "Talep Gönder" butonu (kayıt sayfasına yönlendirme)

### 4. Navbar (Tamamlandı - Güncellendi)
- [x] Logo ve tema toggle
- [x] Tek profil dropdown butonu (Profilim, Çıkış Yap)
- [x] Mesaj butonu kaldırıldı
- [x] Panel butonu kaldırıldı (profil dropdown'a taşındı)

### 5. Davet & Gizlilik Sistemi (Tamamlandı)
- [x] Kullanıcılar ilan sahiplerine davet gönderebilir
- [x] Davet kabul edildikten sonra iletişim bilgileri görünür
- [x] Kabul sonrası mesajlaşma açılır

### 6. Mesajlaşma (Tamamlandı)
- [x] Davet kabul edildikten sonra 1-1 sohbet
- [x] Konuşma listesi
- [x] Konuşma silme özelliği

### 7. Profil Yönetimi (Tamamlandı - Güncellendi)
- [x] Profil düzenleme (Dashboard içinde, detaylı form)
- [x] Düzenlenebilir alanlar: Ad, Kurum, Pozisyon, İl, İlçe, Bio
- [x] Telefon numarası değiştirilemez (güvenlik)
- [x] Ayrı profil sayfası kaldırıldı (Dashboard'a yönlendirme)
- [ ] Profil fotoğrafı yükleme (Planlanıyor)

### 8. Admin Paneli (Tamamlandı)
- [x] Admin girişi (becayis/1234)
- [x] Kullanıcı listesi ve silme
- [x] İlan yönetimi ve silme
- [x] İlan silme onayları
- [x] Kullanıcı engelleme/kaldırma

### 9. UI/UX (Tamamlandı)
- [x] FAQ bölümü (ana sayfa)
- [x] Kapatılabilir politika uyarısı
- [x] Dark/Light tema (site genelinde)
- [x] Geri bildirim butonu (işlevsellik bekliyor)
- [x] Anlık arama (arama butonu yok)

## Tech Stack
- **Frontend**: React, TailwindCSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT

## Son Güncelleme: Ocak 2026

### Bu Oturumda Tamamlanan İşler:
1. ✅ Navbar'dan mesaj butonu kaldırıldı
2. ✅ Profil ve Panel butonları tek dropdown'da birleştirildi
3. ✅ Arama butonu kaldırıldı, anlık arama (debounce) eklendi
4. ✅ Giriş yapmamış kullanıcılar için "Talep Gönder" butonu
5. ✅ Profil düzenleme formu genişletildi (Kurum, Pozisyon, İl, İlçe)
6. ✅ Konuşma silme özelliği tamamlandı
7. ✅ Ayrı /profile sayfası kaldırıldı (Dashboard'a yönlendirme)
8. ✅ Admin panel silme işlemleri düzeltildi
9. ✅ Dark/Light tema tüm sayfalarda çalışıyor
10. ✅ Ana sayfa sloganından TC Kimlik/sicil no kaldırıldı

## Mocklanmış Özellikler
- **OTP SMS Gönderimi**: Gerçek SMS gönderilmiyor, OTP response'da dönüyor
- **E-posta Bildirimleri**: Henüz entegre edilmedi

## Sonraki Öncelikli Görevler
1. Geri bildirim butonu işlevselliği
2. E-posta bildirimleri (SendGrid entegrasyonu)
3. Profil fotoğrafı yükleme

## Backlog
- WebSocket ile gerçek zamanlı mesajlaşma
- Gerçek OTP entegrasyonu
- İlan detay sayfası

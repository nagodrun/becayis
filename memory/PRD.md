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
- [x] Profil sekmesi (Dashboard içinde)
- [x] Kapatılabilir platform politikası uyarısı

### 3. Ana Sayfa & İlanlar (Tamamlandı)
- [x] Son ilanların listesi
- [x] Arama ve filtreleme (kurum, pozisyon, il)
- [x] "İlan Oluştur" CTA butonu

### 4. Davet & Gizlilik Sistemi (Tamamlandı)
- [x] Kullanıcılar ilan sahiplerine davet gönderebilir
- [x] Davet kabul edildikten sonra iletişim bilgileri görünür
- [x] Kabul sonrası mesajlaşma açılır

### 5. Mesajlaşma (Tamamlandı)
- [x] Davet kabul edildikten sonra 1-1 sohbet
- [x] Konuşma listesi
- [x] Konuşma silme özelliği

### 6. Profil & Avatar (Kısmen Tamamlandı)
- [x] Profil düzenleme (Dashboard içinde)
- [ ] Profil fotoğrafı yükleme (Planlanıyor)
- [ ] Stok avatar seçimi (Planlanıyor)

### 7. Responsive & API-First (Tamamlandı)
- [x] REST API mimarisi
- [x] Mobil uyumlu tasarım
- [x] CORS yapılandırması

### 8. Bildirimler (Kısmen Tamamlandı)
- [x] Uygulama içi bildirimler
- [ ] E-posta bildirimleri (Planlanıyor - SendGrid)
- [ ] SMS bildirimleri (Planlanıyor)

### 9. Admin Paneli (Tamamlandı)
- [x] Admin girişi (becayis/1234)
- [x] Kullanıcı listesi
- [x] İlan yönetimi
- [x] İlan silme onayları
- [x] Kullanıcı silme
- [x] Kullanıcı engelleme/engel kaldırma

### 10. İlan Silme Akışı (Tamamlandı)
- [x] Kullanıcı silme talebi gönderir
- [x] Sebep belirtme zorunluluğu
- [x] Admin onayı gerekli

### 11. UI/UX (Tamamlandı)
- [x] FAQ bölümü (ana sayfa)
- [x] Kapatılabilir politika uyarısı
- [x] Dark/Light tema (site genelinde)
- [x] Geri bildirim butonu (işlevsellik bekliyor)

## Tech Stack
- **Frontend**: React, TailwindCSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT

## Son Güncelleme: Ocak 2026

### Bu Oturumda Tamamlanan İşler:
1. ✅ Dashboard useNavigate hatası düzeltildi
2. ✅ Profil güncelleme çalışır hale getirildi
3. ✅ Konuşma silme endpoint'i eklendi (`DELETE /api/conversations/:id`)
4. ✅ MongoDB ObjectId hataları düzeltildi
5. ✅ Admin panel silme işlemleri düzeltildi (kullanıcı ve ilan silme)
6. ✅ Dark/Light tema tüm sayfalarda çalışır hale getirildi
7. ✅ Ana sayfa sloganı güncellendi (TC Kimlik, sicil no ibareleri kaldırıldı)
8. ✅ Admin token yönetimi düzeltildi (api.js)

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
- ESLint uyarılarının düzeltilmesi

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

### 10. İlan Silme Akışı (Tamamlandı)
- [x] Kullanıcı silme talebi gönderir
- [x] Sebep belirtme zorunluluğu
- [x] Admin onayı gerekli

### 11. UI/UX (Tamamlandı)
- [x] FAQ bölümü (ana sayfa)
- [x] Kapatılabilir politika uyarısı
- [x] Dark/Light tema
- [x] Geri bildirim butonu (işlevsellik bekliyor)

## Tech Stack
- **Frontend**: React, TailwindCSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT

## API Endpoint'leri

### Auth
- POST `/api/auth/register/step1` - E-posta ve şifre
- POST `/api/auth/register/step2` - Telefon numarası
- POST `/api/auth/verify-otp` - OTP doğrulama
- POST `/api/auth/login` - Giriş
- GET `/api/auth/me` - Mevcut kullanıcı

### Profile
- POST `/api/profile` - Profil oluştur
- GET `/api/profile` - Profil getir
- PUT `/api/profile` - Profil güncelle

### Listings
- POST `/api/listings` - İlan oluştur
- GET `/api/listings` - İlanları listele
- GET `/api/listings/my` - Kullanıcının ilanları
- GET `/api/listings/{id}` - İlan detayı
- PUT `/api/listings/{id}` - İlan güncelle
- POST `/api/listings/{id}/request-deletion` - Silme talebi

### Invitations
- POST `/api/invitations` - Davet gönder
- GET `/api/invitations` - Davetleri listele
- POST `/api/invitations/respond` - Davete yanıt

### Conversations
- GET `/api/conversations` - Konuşmaları listele
- GET `/api/conversations/{id}/messages` - Mesajları getir
- DELETE `/api/conversations/{id}` - Konuşma sil

### Messages
- POST `/api/messages` - Mesaj gönder

### Notifications
- GET `/api/notifications` - Bildirimleri listele
- POST `/api/notifications/{id}/read` - Okundu işaretle
- DELETE `/api/notifications/{id}` - Bildirim sil

### Admin
- POST `/api/admin/login` - Admin girişi
- GET `/api/admin/users` - Kullanıcıları listele
- GET `/api/admin/listings` - İlanları listele
- GET `/api/admin/deletion-requests` - Silme taleplerini listele
- POST `/api/admin/deletion-requests/{id}/approve` - Silme onayla
- POST `/api/admin/deletion-requests/{id}/reject` - Silme reddet
- DELETE `/api/admin/users/{id}` - Kullanıcı sil

## Mocklanmış Özellikler
- **OTP SMS Gönderimi**: Gerçek SMS gönderilmiyor, OTP response'da dönüyor
- **E-posta Bildirimleri**: Henüz entegre edilmedi

## Tamamlanan İşler (Aralık 2025)
1. Dashboard useNavigate hatası düzeltildi
2. Profil sekmesi Dashboard'a entegre edildi
3. Profil güncelleme çalışır hale getirildi
4. Konuşma silme endpoint'i eklendi
5. MongoDB _id hataları düzeltildi
6. Tüm sekmeler test edildi ve çalışıyor

## Sonraki Öncelikli Görevler
1. Geri bildirim butonu işlevselliği
2. E-posta bildirimleri (SendGrid entegrasyonu)
3. Profil fotoğrafı yükleme
4. Gerçek OTP entegrasyonu

## Backlog
- WebSocket ile gerçek zamanlı mesajlaşma
- Gelişmiş arama filtreleri
- Bildirim tercihleri
- Rapor sistemi geliştirmeleri

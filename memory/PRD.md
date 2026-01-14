# Becayiş - Kamu Çalışanları Yer Değişim Platformu

## Proje Özeti
Türkiye'deki kamu çalışanlarının aynı pozisyondaki diğer çalışanlarla karşılıklı yer değişimi yapmasını kolaylaştıran platform.

## Temel Özellikler

### Kimlik Doğrulama
- Kurumsal e-posta ile kayıt (@gov.tr)
- JWT tabanlı oturum yönetimi
- Sicil numarası ve telefon doğrulama

### Kullanıcı Paneli
- Profil yönetimi (fotoğraf, kurum, pozisyon, konum)
- İlan oluşturma/düzenleme
- Davet gönderme/alma
- Gerçek zamanlı mesajlaşma (WebSocket)
- Bildirim sistemi

### Admin Paneli
- Kullanıcı moderasyonu
- İlan onaylama/reddetme
- Hesap silme taleplerini yönetme

## Teknik Altyapı
- **Frontend:** React, TailwindCSS, Shadcn/UI
- **Backend:** FastAPI, Python
- **Database:** MongoDB
- **Real-time:** WebSocket

## Son Güncellemeler (Ocak 2026)

### v1.4 - UI/UX İyileştirmeleri
- İlan kartları küçültüldü ve kompaktlaştırıldı
- Kullanıcı isimleri maskelendi (A*** Y*** formatı)
- Kurum/pozisyon yan yana gösterildi
- İlan başlığı max 45, açıklama max 140 karakter
- Rakam girişi engellendi (telefon numarası önleme)
- İlçe dropdown'ları il seçimine göre otomatik dolduruluyor
- Profil fotoğrafı panelde görünüyor
- Sekme sırası: Profil ilk sırada

### v1.3 - Veri ve Tema
- becayis.memurlar.net'ten 105 kurum, 220 pozisyon çekildi
- 81 il için ilçe verileri eklendi
- Dark tema tüm sayfalarda düzeltildi
- Statik sayfalar (SSS, Gizlilik, Şartlar) yeniden tasarlandı

### v1.2 - Yeni Özellikler
- Profil fotoğrafı yükleme
- Kullanıcı engelleme
- Tekrarlı davet engelleme
- Konuşma silme bildirimi
- WebSocket ile gerçek zamanlı chat

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Listings
- GET/POST /api/listings
- PUT/DELETE /api/listings/{id}

### Profile
- GET/PUT /api/profile
- POST /api/profile/avatar
- DELETE /api/profile/avatar

### Utility
- GET /api/provinces
- GET /api/districts/{province}
- GET /api/institutions
- GET /api/utility/positions
- GET /api/faq

### Communication
- GET/POST /api/invitations
- GET/POST /api/conversations
- WS /ws/{token}

## Bekleyen Görevler

### P1 - Orta Öncelik
- E-posta bildirimleri (SendGrid entegrasyonu)
- Gerçek OTP doğrulama

### P2 - Düşük Öncelik
- Admin panel iyileştirmeleri
- Performans optimizasyonları
- Arama/filtreleme geliştirmeleri

## Test Bilgileri
- Admin: becayis / 1234
- Test kullanıcı: @gov.tr uzantılı e-posta ile kayıt

## Mock/Eksik Özellikler
- E-posta bildirimleri (henüz entegre değil)
- OTP doğrulama (mock)

# Becayiş - Kamu Çalışanları Yer Değişim Platformu PRD

## Orijinal Problem Tanımı
Türkiye'deki kamu çalışanlarının aynı pozisyondaki diğer çalışanlarla karşılıklı yer değişimi yapmasına olanak sağlayan bir web platformu.

## Kullanıcı Profili
- Türkiye'deki kamu kurumlarında çalışan personel
- Farklı illere tayin olmak isteyen memurlar
- Kurumlar arası veya kurum içi yer değişimi arayan çalışanlar

## Tech Stack
- **Frontend**: React, TailwindCSS, Shadcn/UI, WebSocket
- **Backend**: FastAPI (Python), WebSocket
- **Database**: MongoDB
- **Authentication**: JWT

---

## Tamamlanan Özellikler

### 1. Kimlik Doğrulama ✅
- [x] Kurumsal e-posta ile kayıt (@gov.tr uzantısı)
- [x] E-posta doğrulama kodu (MOCKED)
- [x] Ad ve Soyad alanları zorunlu
- [x] JWT tabanlı oturum yönetimi
- [x] Admin onaylı hesap silme

### 2. Kullanıcı Paneli ✅
- [x] Profil sekmesi (Dashboard içinde)
- [x] **Profil fotoğrafı yükleme/silme** ✨ NEW
- [x] Bildirim rozeti (navbar'da)
- [x] Bildirimler okunduğunda rozet sıfırlanır
- [x] Konuşma silme (X butonu)
- [x] **Konuşma silindiğinde diğer kullanıcıya bildirim** ✨ NEW
- [x] Hesap silme talebi (admin onaylı)

### 3. Ana Sayfa & İlanlar ✅
- [x] Hero bölümüne entegre arama kutusu
- [x] 3 dropdown: Pozisyon, Bulunduğu İl, Hedef İl
- [x] **220+ pozisyon listesi** (becayis.memurlar.net'ten) ✨ NEW
- [x] **105+ kurum listesi** (becayis.memurlar.net'ten) ✨ NEW
- [x] **İlan kartlarında kullanıcı baş harfleri** (örn: "AY") ✨ NEW
- [x] Anlık arama (debounce ile live search)
- [x] Koyu/açık tema uyumlu

### 4. Davet Sistemi ✅
- [x] Davet gönderme
- [x] **Aynı ilana birden fazla davet engellemesi** ✨ NEW
- [x] Davet kabul/reddetme
- [x] Günlük davet limiti (10)

### 5. Kullanıcı Engelleme ✅ NEW
- [x] **Kullanıcı engelleme** (POST /api/block)
- [x] **Engel kaldırma** (DELETE /api/blocks/{id})
- [x] Engellenen kullanıcıya davet gönderememe
- [x] Engellenen kullanıcıyla mesajlaşamama

### 6. Mesajlaşma ✅
- [x] **WebSocket ile gerçek zamanlı mesajlaşma** ✨ NEW
- [x] Yazıyor göstergesi
- [x] Mesaj okundu işareti
- [x] Konuşma silme + bildirim

### 7. Navbar ✅
- [x] Animasyonlu Becayiş ikonu (hover'da dönen)
- [x] Bildirim rozeti (okunmamış sayısı)
- [x] Tek profil dropdown butonu
- [x] Dark/Light tema toggle

### 8. Admin Paneli ✅
- [x] 5 sekme: Kullanıcılar, İlanlar, İlan Silme, Hesap Silme, Raporlar
- [x] Kullanıcı silme
- [x] İlan silme isteklerini onaylama/reddetme
- [x] Hesap silme taleplerini onaylama/reddetme

### 9. FAQ ✅ NEW
- [x] **8 soru/cevap becayis.memurlar.net'ten** ✨
- [x] Accordion formatında

### 10. Statik Sayfalar ✅
- [x] /terms - Kullanım Şartları
- [x] /privacy - Gizlilik Politikası
- [x] /help - Yardım Merkezi

---

## API Endpoints

### Auth
- POST /api/auth/register/step1
- POST /api/auth/verify-email
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/request-account-deletion
- GET /api/auth/account-deletion-status

### Profile
- GET/POST/PUT /api/profile
- POST /api/profile/avatar ✨ NEW
- DELETE /api/profile/avatar ✨ NEW

### Listings
- GET /api/listings (includes user_initials) ✨ UPDATED
- POST /api/listings
- PUT /api/listings/{id}
- DELETE /api/listings/{id}

### Invitations
- GET /api/invitations
- POST /api/invitations (duplicate prevention) ✨ UPDATED
- POST /api/invitations/{id}/respond

### Messages
- GET /api/conversations
- GET /api/conversations/{id}/messages
- POST /api/messages
- DELETE /api/conversations/{id} (sends notification) ✨ UPDATED

### Blocking ✨ NEW
- POST /api/block
- GET /api/blocks
- DELETE /api/blocks/{blocked_user_id}

### Utility ✨ UPDATED
- GET /api/faq (8 questions)
- GET /api/provinces (81 il)
- GET /api/positions (220+ pozisyon)
- GET /api/institutions (105+ kurum)
- GET /api/utility/positions
- GET /api/utility/institutions

### WebSocket ✨ NEW
- WS /ws/{token}

### Admin
- POST /api/admin/login
- GET /api/admin/users
- DELETE /api/admin/users/{id}
- GET/DELETE /api/admin/deletion-requests
- GET/POST /api/admin/account-deletion-requests

---

## Mocklanmış Özellikler
- **E-posta Doğrulama**: Gerçek e-posta gönderilmiyor, kod response'da dönüyor

## Test Durumu
- Backend: %100 geçti
- Frontend: Manuel test geçti
- Son test raporu: /app/test_reports/iteration_7.json

## Son Güncelleme: Ocak 2026

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
- [x] E-posta doğrulama kodu (MOCKED - gerçek e-posta gönderilmiyor)
- [x] Ad ve Soyad alanları zorunlu
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
- [x] **Admin onaylı hesap silme talebi**

### 3. Ana Sayfa & İlanlar (Tamamlandı)
- [x] Son ilanların listesi
- [x] Anlık arama (debounce ile live search)
- [x] Filtreleme (kurum, pozisyon, il, hedef il)
- [x] Aktif filtre etiketleri gösterimi
- [x] "İlan Oluştur" CTA butonu
- [x] Giriş yapmamış kullanıcılar için "Talep Gönder" butonu

### 4. Navbar (Tamamlandı)
- [x] Logo ve tema toggle
- [x] Tek profil dropdown butonu (Profilim, Çıkış Yap)
- [x] Mesaj butonu kaldırıldı
- [x] Panel butonu kaldırıldı

### 5. Profil Yönetimi (Tamamlandı)
- [x] Profil düzenleme (Dashboard içinde, detaylı form)
- [x] Düzenlenebilir alanlar: Ad, Kurum, Pozisyon, İl, İlçe, Bio
- [x] Ayrı profil sayfası kaldırıldı
- [x] Profil bilgileri kayıttan otomatik doldurulur
- [ ] Profil fotoğrafı yükleme (Planlanıyor)

### 6. Admin Paneli (Tamamlandı - Güncellendi)
- [x] Admin girişi (becayis/1234)
- [x] **5 sekme**: Kullanıcılar, İlanlar, İlan Silme, Hesap Silme, Raporlar
- [x] **Kullanıcı silme çalışıyor**
- [x] **İlan silme çalışıyor**
- [x] **İlan silme isteklerini onaylama/reddetme**
- [x] **İlan silme isteklerini temizleme (X butonu)**
- [x] **Hesap silme taleplerini onaylama/reddetme**
- [x] **Hesap silme taleplerini temizleme (X butonu)**
- [x] Kullanıcı engelleme/kaldırma

### 7. Statik Sayfalar (Tamamlandı)
- [x] /terms - Kullanım Şartları
- [x] /privacy - Gizlilik Politikası
- [x] /help - Yardım Merkezi (SSS dahil)

### 8. UI/UX (Tamamlandı)
- [x] FAQ bölümü (ana sayfa)
- [x] Kapatılabilir politika uyarısı
- [x] Dark/Light tema (site genelinde)
- [x] Anlık arama (arama butonu yok)

## Tech Stack
- **Frontend**: React, TailwindCSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT

## Son Güncelleme: Ocak 2026

### Bu Oturumda Tamamlanan İşler:
1. ✅ **Admin Onaylı Hesap Silme** - Kullanıcılar artık doğrudan hesap silemez, admin'e talep gönderiyor
2. ✅ **Admin Hesap Silme Sekmesi** - Admin paneline "Hesap Silme" sekmesi eklendi
3. ✅ **Admin Kullanıcı Silme** - Admin panel → Kullanıcılar → "Sil" butonu çalışıyor
4. ✅ **Admin İlan Silme Temizleme** - Admin panel → İlan Silme → X butonu ile işlenmiş istekler temizlenebiliyor
5. ✅ **Statik Sayfalar** - /terms, /privacy, /help sayfaları oluşturuldu
6. ✅ **Kullanılmayan Dosya Temizliği** - Profile.js silindi

## Mocklanmış Özellikler
- **E-posta Doğrulama**: Gerçek e-posta gönderilmiyor, kod response'da dönüyor

## Sonraki Öncelikli Görevler (P1)
1. Ana sayfa arama tasarımı (saffetcelik.com.tr benzeri dropdown'lar)
2. Gerçek e-posta gönderimi (SendGrid entegrasyonu)

## Backlog (P2+)
- Profil fotoğrafı yükleme
- WebSocket ile gerçek zamanlı mesajlaşma
- İlan detay sayfası
- Bildirim tercihleri
- saffetcelik.com.tr'den pozisyon listesi scraping

## Test Durumu
- Backend: %100 geçti
- Frontend: %100 geçti
- Son test raporu: /app/test_reports/iteration_6.json

## API Endpoints
### Auth
- POST /api/auth/register/step1
- POST /api/auth/verify-email
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/request-account-deletion ✅ NEW
- GET /api/auth/account-deletion-status ✅ NEW

### Admin
- POST /api/admin/login
- GET /api/admin/users
- DELETE /api/admin/users/{id}
- GET /api/admin/deletion-requests
- DELETE /api/admin/deletion-requests/{id}
- GET /api/admin/account-deletion-requests ✅ NEW
- POST /api/admin/account-deletion-requests/{id}/approve ✅ NEW
- POST /api/admin/account-deletion-requests/{id}/reject ✅ NEW
- DELETE /api/admin/account-deletion-requests/{id} ✅ NEW

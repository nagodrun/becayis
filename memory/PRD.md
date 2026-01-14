# Becayiş - Kamu Çalışanları Yer Değişim Platformu PRD

## Orijinal Problem Tanımı
Türkiye'deki kamu çalışanlarının aynı pozisyondaki diğer çalışanlarla karşılıklı yer değişimi yapmasına olanak sağlayan bir web platformu.

## Kullanıcı Profili
- Türkiye'deki kamu kurumlarında çalışan personel
- Farklı illere tayin olmak isteyen memurlar
- Kurumlar arası veya kurum içi yer değişimi arayan çalışanlar

## Temel Gereksinimler

### 1. Kimlik Doğrulama (Tamamlandı - Güncellendi)
- [x] Kurumsal e-posta ile kayıt (@gov.tr uzantısı)
- [x] E-posta doğrulama kodu (MOCKED - gerçek e-posta gönderilmiyor)
- [x] Ad ve Soyad alanları zorunlu
- [x] JWT tabanlı oturum yönetimi
- [x] Çıkış yapıldığında ana sayfaya yönlendirme
- [x] Kullanıcı kendi hesabını silebilir

### 2. Kullanıcı Paneli (Tamamlandı)
- [x] Profil tamamlanma durumu
- [x] Aktif ilan sayısı
- [x] Bekleyen davet sayısı
- [x] Aktif konuşma sayısı
- [x] Bildirim sayısı
- [x] Profil sekmesi (Dashboard içinde, detaylı düzenleme)
- [x] Kapatılabilir platform politikası uyarısı
- [x] Konuşma silme (X butonu)
- [x] **Hesap Silme butonu**

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
- [ ] Profil fotoğrafı yükleme (Planlanıyor)

### 6. Admin Paneli (Tamamlandı)
- [x] Admin girişi (becayis/1234)
- [x] **Kullanıcı silme çalışıyor**
- [x] **İlan silme çalışıyor**
- [x] İlan silme onayları
- [x] Kullanıcı engelleme/kaldırma

### 7. UI/UX (Tamamlandı)
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
1. ✅ **Profil Otomatik Doldurma** - Kayıt sırasındaki Ad+Soyad otomatik olarak profil "Görünen Ad" alanına geliyor
2. ✅ **Kullanıcı Hesap Silme** - Dashboard → Profil → "Hesabı Sil" butonu çalışıyor
3. ✅ **Admin Kullanıcı Silme** - Admin panel → Kullanıcılar → "Sil" butonu çalışıyor
4. ✅ **Silme İsteği Temizleme** - Admin panel → Silme İstekleri → **X butonu** ile işlenmiş istekler temizlenebiliyor
5. ✅ **Profil Güncelleme** - Profil yoksa oluşturur, varsa günceller
6. ✅ **İlan Oluştur Otomatik Doldurma** - Kurum, Pozisyon, İl, İlçe profilden alınıyor

## Mocklanmış Özellikler
- **E-posta Doğrulama**: Gerçek e-posta gönderilmiyor, kod response'da dönüyor

## Sonraki Öncelikli Görevler
1. Geri bildirim butonu işlevselliği
2. Gerçek e-posta gönderimi (SendGrid entegrasyonu)
3. Profil fotoğrafı yükleme

## Backlog
- WebSocket ile gerçek zamanlı mesajlaşma
- İlan detay sayfası
- Bildirim tercihleri

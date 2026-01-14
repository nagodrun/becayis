import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ListingCard } from '../components/ListingCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { MapPin, Users, ShieldCheck, MessageSquare, X } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

// Debounce hook for live search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    institution: '',
    role: '',
    current_province: '',
    desired_province: ''
  });

  // Debounce text filters for live search
  const debouncedTitle = useDebounce(filters.title, 300);
  const debouncedInstitution = useDebounce(filters.institution, 300);
  const debouncedRole = useDebounce(filters.role, 300);

  useEffect(() => {
    fetchProvinces();
  }, []);

  // Live search effect - triggers when any debounced value or select changes
  useEffect(() => {
    fetchListings();
  }, [debouncedTitle, debouncedInstitution, debouncedRole, filters.current_province, filters.desired_province]);

  const fetchProvinces = async () => {
    try {
      const response = await api.get('/provinces');
      setProvinces(response.data);
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedTitle) params.append('title', debouncedTitle);
      if (debouncedInstitution) params.append('institution', debouncedInstitution);
      if (debouncedRole) params.append('role', debouncedRole);
      if (filters.current_province) params.append('current_province', filters.current_province);
      if (filters.desired_province) params.append('desired_province', filters.desired_province);
      
      const response = await api.get(`/listings?${params.toString()}`);
      setListings(response.data);
    } catch (error) {
      toast.error('İlanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (listing) => {
    if (!user) {
      navigate('/register');
      return;
    }

    try {
      await api.post('/invitations', { listing_id: listing.id });
      toast.success('Davet başarıyla gönderildi');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Davet gönderilemedi');
    }
  };

  const clearFilter = (filterName) => {
    setFilters({ ...filters, [filterName]: '' });
  };

  const hasActiveFilters = filters.title || filters.institution || filters.role || filters.current_province || filters.desired_province;

  const clearAllFilters = () => {
    setFilters({
      title: '',
      institution: '',
      role: '',
      current_province: '',
      desired_province: ''
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div
        className="relative h-[300px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.5)), url('https://images.unsplash.com/photo-1591911677374-5a6143b8ca3c?crop=entropy&cs=srgb&fm=jpg&q=85')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight" style={{ fontFamily: 'Manrope' }}>
              Kamu Çalışanları için<br />Yer Değişim Platformu
            </h1>
            <p className="text-base md:text-lg mb-6 text-slate-200">
              Güvenli ve kolay bir şekilde aynı pozisyondaki diğer kamu çalışanlarıyla yer değiştirin
            </p>
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/listings/create">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8" data-testid="hero-create-listing-button">
                    İlan Oluştur
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/dashboard">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8">
                  Panele Git
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground" style={{ fontFamily: 'Manrope' }}>Güvenli</h3>
              <p className="text-muted-foreground">Kurumsal e-posta ve telefon doğrulaması ile güvenli hesap sistemi</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground" style={{ fontFamily: 'Manrope' }}>Gizlilik</h3>
              <p className="text-muted-foreground">Davet kabul edilene kadar iletişim bilgileriniz gizli kalır</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground" style={{ fontFamily: 'Manrope' }}>Kolay İletişim</h3>
              <p className="text-muted-foreground">Kabul edilen davetler sonrası direkt mesajlaşma imkanı</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
            Son İlanlar {listings.length > 0 && <span className="text-lg font-normal text-muted-foreground">({listings.length})</span>}
          </h2>
          {user && (
            <Link to="/listings/create">
              <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200" data-testid="create-listing-button">
                İlan Oluştur
              </Button>
            </Link>
          )}
        </div>

        {/* Search Filters - saffetcelik.com.tr style */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Aradığınız becayiş ilanlarını bulun</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Input
                placeholder="İlan ara..."
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                className="pr-8"
                data-testid="filter-title"
              />
              {filters.title && (
                <button 
                  onClick={() => clearFilter('title')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                placeholder="Kurum ara..."
                value={filters.institution}
                onChange={(e) => setFilters({ ...filters, institution: e.target.value })}
                className="pr-8"
                data-testid="filter-institution"
              />
              {filters.institution && (
                <button 
                  onClick={() => clearFilter('institution')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                placeholder="Pozisyon ara..."
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="pr-8"
                data-testid="filter-role"
              />
              {filters.role && (
                <button 
                  onClick={() => clearFilter('role')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Select 
              value={filters.current_province || "all"} 
              onValueChange={(val) => setFilters({ ...filters, current_province: val === "all" ? "" : val })}
            >
              <SelectTrigger data-testid="filter-current-province">
                <SelectValue placeholder="Tüm Şehirler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Şehirler</SelectItem>
                {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select 
              value={filters.desired_province || "all"} 
              onValueChange={(val) => setFilters({ ...filters, desired_province: val === "all" ? "" : val })}
            >
              <SelectTrigger data-testid="filter-desired-province">
                <SelectValue placeholder="Hedef Şehir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Hedefler</SelectItem>
                {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-muted-foreground">Aktif filtreler:</span>
              {filters.title && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                  "{filters.title}"
                  <button onClick={() => clearFilter('title')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.institution && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                  {filters.institution}
                  <button onClick={() => clearFilter('institution')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.role && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                  {filters.role}
                  <button onClick={() => clearFilter('role')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.current_province && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                  Konum: {filters.current_province}
                  <button onClick={() => clearFilter('current_province')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.desired_province && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs rounded-full">
                  Hedef: {filters.desired_province}
                  <button onClick={() => clearFilter('desired_province')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button 
                onClick={clearAllFilters}
                className="text-xs text-red-600 dark:text-red-400 hover:underline ml-2"
              >
                Tümünü Temizle
              </button>
            </div>
          )}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Yükleniyor...
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">İlan Bulunamadı</h3>
            <p>Henüz hiç ilan yayınlanmamış veya filtrelere uygun ilan yok.</p>
            {!user && (
              <Link to="/register">
                <Button className="mt-4 bg-amber-500 hover:bg-amber-600">İlk ilanı siz oluşturun!</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onInvite={handleInvite}
                showInviteButton={user && listing.user_id !== user.id}
                showInviteForGuest={!user}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground" style={{ fontFamily: 'Manrope' }}>
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-muted-foreground">Merak ettiğiniz soruların cevapları</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border border-border rounded-lg px-6 bg-background">
              <AccordionTrigger className="text-left font-semibold hover:no-underline text-foreground">
                Becayiş nedir?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Becayiş, kamu çalışanlarının aynı pozisyondaki diğer çalışanlarla yer değiştirmesini kolaylaştıran bir platformdur. Güvenli ve kolay bir şekilde yer değişimi yapmanızı sağlar.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border rounded-lg px-6 bg-background">
              <AccordionTrigger className="text-left font-semibold hover:no-underline text-foreground">
                Platforma nasıl kayıt olabilirim?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Kayıt için kurumsal e-posta adresiniz (@gov.tr uzantılı) ve telefon numaranız gereklidir. Kayıt üç adımda tamamlanır: E-posta doğrulama, telefon doğrulama (OTP), profil oluşturma.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border rounded-lg px-6 bg-background">
              <AccordionTrigger className="text-left font-semibold hover:no-underline text-foreground">
                İletişim bilgilerim ne zaman paylaşılır?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                İletişim bilgileriniz (telefon, e-posta) gizlidir ve sadece gönderdiğiniz veya aldığınız bir daveti KABUL ETTİĞİNİZDE karşı tarafla paylaşılır.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border rounded-lg px-6 bg-background">
              <AccordionTrigger className="text-left font-semibold hover:no-underline text-foreground">
                Kaç hesap oluşturabilirim?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Her kişi yalnızca BİR hesap oluşturabilir. Birden fazla hesap oluşturma durumunda hesaplarınız engellenebilir.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-border rounded-lg px-6 bg-background">
              <AccordionTrigger className="text-left font-semibold hover:no-underline text-foreground">
                İlanımı nasıl silebilirim?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                İlanlarınızı dashboard'dan 'Sil' butonuna tıklayarak silebilirsiniz. Silme işlemi için admin onayı gereklidir.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default Home;

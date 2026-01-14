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
import { MapPin, Users, ShieldCheck, MessageSquare, Search, X, ChevronDown } from 'lucide-react';
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

// Positions list
const POSITIONS = [
  "Zabıt Katibi",
  "Mübaşir", 
  "Memur",
  "Şoför",
  "Hizmetli",
  "Teknisyen",
  "Mühendis",
  "Doktor",
  "Hemşire",
  "Öğretmen",
  "Uzman",
  "Şef",
  "Müdür",
  "Diğer"
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    position: '',
    current_province: '',
    desired_province: ''
  });

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchProvinces();
  }, []);

  // Live search effect
  useEffect(() => {
    fetchListings();
  }, [debouncedSearch, filters.position, filters.current_province, filters.desired_province]);

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
      if (debouncedSearch) params.append('title', debouncedSearch);
      if (filters.position) params.append('role', filters.position);
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

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      position: '',
      current_province: '',
      desired_province: ''
    });
  };

  const hasActiveFilters = searchQuery || filters.position || filters.current_province || filters.desired_province;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Integrated Search */}
      <div
        className="relative min-h-[420px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7)), url('https://images.unsplash.com/photo-1591911677374-5a6143b8ca3c?crop=entropy&cs=srgb&fm=jpg&q=85')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-5xl w-full">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight" style={{ fontFamily: 'Manrope' }}>
              Kamu Çalışanları için<br />Yer Değişim Platformu
            </h1>
            <p className="text-base md:text-lg mb-8 text-slate-200">
              Güvenli ve kolay bir şekilde aynı pozisyondaki diğer kamu çalışanlarıyla yer değiştirin
            </p>
            
            {/* Search Box - saffetcelik.com.tr style */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Main Search Input */}
                <div className="md:col-span-4 lg:col-span-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="İlan veya kurum ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-foreground"
                    data-testid="search-input"
                  />
                </div>
                
                {/* Position Dropdown */}
                <Select 
                  value={filters.position || "all"} 
                  onValueChange={(val) => setFilters({ ...filters, position: val === "all" ? "" : val })}
                >
                  <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600" data-testid="filter-position">
                    <SelectValue placeholder="Pozisyon Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Pozisyonlar</SelectItem>
                    {POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                {/* City Dropdown */}
                <Select 
                  value={filters.current_province || "all"} 
                  onValueChange={(val) => setFilters({ ...filters, current_province: val === "all" ? "" : val })}
                >
                  <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600" data-testid="filter-city">
                    <SelectValue placeholder="Bulunduğu İl" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm İller</SelectItem>
                    {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                {/* Target City Dropdown */}
                <Select 
                  value={filters.desired_province || "all"} 
                  onValueChange={(val) => setFilters({ ...filters, desired_province: val === "all" ? "" : val })}
                >
                  <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600" data-testid="filter-target-city">
                    <SelectValue placeholder="Hedef İl" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm İller</SelectItem>
                    {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Active Filters & Quick Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 flex-wrap">
                  {hasActiveFilters ? (
                    <>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Filtreler:</span>
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                          "{searchQuery}"
                          <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {filters.position && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                          {filters.position}
                          <button onClick={() => setFilters({...filters, position: ''})}><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {filters.current_province && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                          {filters.current_province}
                          <button onClick={() => setFilters({...filters, current_province: ''})}><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {filters.desired_province && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs rounded-full">
                          → {filters.desired_province}
                          <button onClick={() => setFilters({...filters, desired_province: ''})}><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      <button 
                        onClick={clearAllFilters}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline ml-2"
                      >
                        Temizle
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-500">
                      {listings.length} ilan bulundu
                    </span>
                  )}
                </div>
                
                {!user && (
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" data-testid="hero-register-button">
                      Hemen Başla
                    </Button>
                  </Link>
                )}
              </div>
            </div>
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
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" data-testid="create-listing-button">
                İlan Oluştur
              </Button>
            </Link>
          )}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
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

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ListingCard } from '../components/ListingCard';
import { MapPin, Users, ShieldCheck, MessageSquare, Search, X, Building2, Briefcase } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
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
  const [positions, setPositions] = useState([]);
  const [topPositions, setTopPositions] = useState([]);
  const [topInstitutions, setTopInstitutions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    position: '',
    province: ''  // Changed: now searches both current and desired province
  });

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Live search effect
  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.position, filters.province]);

  const fetchInitialData = async () => {
    try {
      const [provincesRes, positionsRes, topPositionsRes, topInstitutionsRes] = await Promise.all([
        api.get('/provinces'),
        api.get('/utility/positions'),
        api.get('/stats/top-positions'),
        api.get('/stats/top-institutions')
      ]);
      setProvinces(provincesRes.data);
      setPositions(positionsRes.data);
      setTopPositions(topPositionsRes.data);
      setTopInstitutions(topInstitutionsRes.data);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.append('title', debouncedSearch);
        params.append('role', debouncedSearch);  // Also search by position
      }
      if (filters.position) params.append('role', filters.position);
      if (filters.province) params.append('province', filters.province);  // Changed: searches both current and desired
      
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

    // Check if user has completed their profile
    if (!user.profile_completed || !user.profile?.institution || !user.profile?.role || !user.profile?.current_province) {
      toast.error('Davet göndermek için önce profilinizi tamamlamanız gerekiyor.');
      navigate('/dashboard');
      return;
    }
    try {
      await api.post('/invitations', { listing_id: listing.id });
      toast.success('Davet başarıyla gönderildi.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Davet gönderilemedi.');
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      position: '',
      province: ''
    });
  };

  const hasActiveFilters = searchQuery || filters.position || filters.province;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Integrated Search */}
      <div
        className="relative min-h-[380px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7)), url('https://images.unsplash.com/photo-1591911677374-5a6143b8ca3c?crop=entropy&cs=srgb&fm=jpg&q=85')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-7xl w-full">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-3 tracking-tight" style={{ fontFamily: 'Manrope' }}>
              Kamu Çalışanları İçin Yer Değişim Platformu.
            </h1>
            <p className="text-sm md:text-base mb-6 text-slate-300">
              Güvenli ve kolay bir şekilde aynı pozisyondaki diğer kamu çalışanlarıyla yer değiştirin.
            </p>
            
            {/* Search Box */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Main Search Input */}
                <div className="sm:col-span-2 lg:col-span-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="İlan, kurum veya pozisyon ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 sm:h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 text-sm sm:text-base"
                    data-testid="search-input"
                  />
                </div>
                
                {/* Position Dropdown */}
                <Select 
                  value={filters.position || "all"} 
                  onValueChange={(val) => setFilters({ ...filters, position: val === "all" ? "" : val })}
                >
                  <SelectTrigger className="h-12 sm:h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm sm:text-base" data-testid="filter-position">
                    <SelectValue placeholder="Pozisyon Seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">Tüm Pozisyonlar</SelectItem>
                    {positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                {/* City Dropdown - searches both current and desired province */}
                <Select 
                  value={filters.province || "all"} 
                  onValueChange={(val) => setFilters({ ...filters, province: val === "all" ? "" : val })}
                >
                  <SelectTrigger className="h-11 sm:h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm sm:text-base" data-testid="filter-city">
                    <SelectValue placeholder="İl Seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
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
                          {searchQuery}
                          <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {filters.position && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                          {filters.position}
                          <button onClick={() => setFilters({...filters, position: ''})}><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {filters.province && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                          {filters.province}
                          <button onClick={() => setFilters({...filters, province: ''})}><X className="w-3 h-3" /></button>
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
                      {listings.length} İlan bulundu
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


      {/* Listings Section */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
            Son İlanlar {listings.length > 0 && <span className="text-lg font-normal text-muted-foreground">({listings.length})</span>}
          </h2>
          {user && (
            <Link to="/listings/create">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" data-testid="create-listing-button">
                Becayiş İlanı Oluştur
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
            <h3 className="text-lg font-semibold mb-2 text-foreground">İlan Bulunamadı.</h3>
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

      {/* Top Positions & Institutions Section */}
      <div className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* En Çok İlan Verilen Pozisyonlar */}
            <div className="bg-background rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
                  En Çok İlan Verilen Pozisyonlar
                </h3>
              </div>
              
              {topPositions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Henüz veri yok</p>
              ) : (
                <div className="space-y-2">
                  {topPositions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setFilters({ ...filters, position: item.position })}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                      data-testid={`top-position-${index}`}
                    >
                      <span className="text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.position}
                      </span>
                      <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold px-2.5 py-1 rounded-full">
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* En Çok İlan Verilen Kurumlar */}
            <div className="bg-background rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
                  En Çok İlan Verilen Kurumlar
                </h3>
              </div>
              
              {topInstitutions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Henüz veri yok</p>
              ) : (
                <div className="space-y-2">
                  {topInstitutions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(item.institution)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                      data-testid={`top-institution-${index}`}
                    >
                      <span className="text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate pr-2">
                        {item.institution}
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold px-2.5 py-1 rounded-full flex-shrink-0">
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground" style={{ fontFamily: 'Manrope' }}>Güvenli</h3>
              <p className="text-muted-foreground">Kurumsal e-posta doğrulaması ile güvenli hesap sistemi.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground" style={{ fontFamily: 'Manrope' }}>Gizlilik</h3>
              <p className="text-muted-foreground">Davet kabul edilene kadar iletişim bilgileriniz gizli kalır.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground" style={{ fontFamily: 'Manrope' }}>Kolay İletişim</h3>
              <p className="text-muted-foreground">Kabul edilen davetler sonrası direkt mesajlaşma imkanı.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Thin border before footer */}
      <div className="border-t border-slate-200 dark:border-slate-700"></div>
    </div>
  );
};

export default Home;

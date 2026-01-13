import React, { useEffect, useState } from 'react';
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
import { Card } from '../components/ui/card';
import { Search, Filter, MapPin, Users, ShieldCheck, MessageSquare } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

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

  useEffect(() => {
    fetchProvinces();
    fetchListings();
  }, []);

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
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
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
      navigate('/login');
      return;
    }

    try {
      await api.post('/invitations', { listing_id: listing.id });
      toast.success('Davet başarıyla gönderildi');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Davet gönderilemedi');
    }
  };

  const handleSearch = () => {
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.4)), url('https://images.unsplash.com/photo-1591911677374-5a6143b8ca3c?crop=entropy&cs=srgb&fm=jpg&q=85')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight" style={{ fontFamily: 'Manrope' }}>
              Kamu Çalışanları için<br />Yer Değişim Platformu
            </h1>
            <p className="text-lg md:text-xl mb-8 text-slate-200">
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
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>Güvenli</h3>
              <p className="text-slate-600">TC Kimlik, sicil no ve telefon doğrulaması ile tek hesap garantisi</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>Gizlilik</h3>
              <p className="text-slate-600">Davet kabul edilene kadar iletişim bilgileriniz gizli kalır</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>Kolay İletişim</h3>
              <p className="text-slate-600">Kabul edilen davetler sonrası direkt mesajlaşma imkanı</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Manrope' }}>Son İlanlar</h2>
          {user && (
            <Link to="/listings/create">
              <Button className="bg-slate-900 hover:bg-slate-800" data-testid="create-listing-button">
                İlan Oluştur
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="İlan başlığı ara..."
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              data-testid="filter-title"
            />
            <Input
              placeholder="Kurum adı ara..."
              value={filters.institution}
              onChange={(e) => setFilters({ ...filters, institution: e.target.value })}
              data-testid="filter-institution"
            />
            <Input
              placeholder="Pozisyon ara..."
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              data-testid="filter-role"
            />
            <Select value={filters.current_province || undefined} onValueChange={(val) => setFilters({ ...filters, current_province: val })}>
              <SelectTrigger data-testid="filter-current-province">
                <SelectValue placeholder="Şu anki il" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.desired_province || undefined} onValueChange={(val) => setFilters({ ...filters, desired_province: val })}>
              <SelectTrigger data-testid="filter-desired-province">
                <SelectValue placeholder="Hedef il" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch} className="mt-4 w-full md:w-auto bg-blue-600 hover:bg-blue-700" data-testid="search-button">
            <Search className="w-4 h-4 mr-2" />
            Ara
          </Button>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Yüklüyor...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>İlan bulunamadı. Filtreleri değiştirmeyi deneyin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onInvite={handleInvite}
                showInviteButton={user && listing.user_id !== user.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
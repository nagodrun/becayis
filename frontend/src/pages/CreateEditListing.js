import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { FileText } from 'lucide-react';

const CreateEditListing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    desired_province: '',
    desired_district: ''
  });

  // Profile data (read-only)
  const [profileData, setProfileData] = useState({
    institution: '',
    role: '',
    current_province: '',
    current_district: ''
  });

  // Block digits in title and notes with character limits
  const handleTextChange = (field, value) => {
    // Remove any digits from the input
    const sanitizedValue = value.replace(/[0-9]/g, '');
    
    // Apply character limits
    if (field === 'title') {
      setFormData({ ...formData, [field]: sanitizedValue.slice(0, 45) });
    } else if (field === 'notes') {
      setFormData({ ...formData, [field]: sanitizedValue.slice(0, 140) });
    } else {
      setFormData({ ...formData, [field]: sanitizedValue });
    }
  };

  useEffect(() => {
    fetchProvinces();
    
    if (user?.profile) {
      setProfileData({
        institution: user.profile.institution || '',
        role: user.profile.role || '',
        current_province: user.profile.current_province || '',
        current_district: user.profile.current_district || ''
      });
    }
    
    if (isEdit) {
      fetchListing();
    }
  }, [id, user]);

  // Fetch districts when province changes
  useEffect(() => {
    if (formData.desired_province) {
      fetchDistricts(formData.desired_province);
      // Auto-generate title prefix when desired province is selected (only for new listings)
      if (!isEdit && profileData.current_province) {
        const prefix = `${profileData.current_province} - ${formData.desired_province}`;
        // Only set if title is empty or starts with a province prefix pattern
        if (!formData.title || formData.title.match(/^[A-ZÇĞİÖŞÜa-zçğıöşü]+\s*-\s*[A-ZÇĞİÖŞÜa-zçğıöşü]+/)) {
          setFormData(prev => ({ ...prev, title: prefix }));
        }
      }
    } else {
      setDistricts([]);
    }
  }, [formData.desired_province, profileData.current_province, isEdit]);

  const fetchProvinces = async () => {
    try {
      const response = await api.get('/provinces');
      setProvinces(response.data);
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
    }
  };

  const fetchDistricts = async (province) => {
    try {
      const response = await api.get(`/districts/${encodeURIComponent(province)}`);
      setDistricts(response.data);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
      setDistricts([]);
    }
  };

  const fetchListing = async () => {
    try {
      const response = await api.get(`/listings/${id}`);
      setFormData({
        title: response.data.title || '',
        notes: response.data.notes || '',
        desired_province: response.data.desired_province,
        desired_district: response.data.desired_district
      });
      setProfileData({
        institution: response.data.institution,
        role: response.data.role,
        current_province: response.data.current_province,
        current_district: response.data.current_district
      });
    } catch (error) {
      toast.error('İlan yüklenemedi');
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Ensure title starts with the province prefix
    let finalTitle = formData.title;
    const expectedPrefix = `${profileData.current_province} - ${formData.desired_province}`;
    if (!finalTitle.startsWith(expectedPrefix)) {
      finalTitle = expectedPrefix + (finalTitle ? ` ${finalTitle}` : '');
    }

    try {
      const listingData = {
        title: finalTitle,
        institution: profileData.institution,
        role: profileData.role,
        current_province: profileData.current_province,
        current_district: profileData.current_district,
        desired_province: formData.desired_province,
        desired_district: formData.desired_district,
        notes: formData.notes
      };

      if (isEdit) {
        await api.put(`/listings/${id}`, listingData);
        toast.success('İlan güncellendi');
      } else {
        await api.post('/listings', listingData);
        toast.success('İlan oluşturuldu ve admin onayı bekliyor');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'İlan kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8">
          <div className="text-center mb-8">
            <FileText className="w-12 h-12 text-slate-900 dark:text-slate-100 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Manrope' }}>
              {isEdit ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'}
            </h1>
            <p className="text-muted-foreground mt-2">Yer değişimi için ilan bilgilerinizi girin.</p>
          </div>

          {/* Profile Warning */}
          {!user?.profile?.institution && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Uyarı:</strong> İlan oluşturmak için önce profilinizi tamamlamanız gerekiyor. 
                <Link to="/dashboard" className="underline ml-1">Profil sekmesine git</Link>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Temel Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Temel Bilgiler</h3>
              <p className="text-sm text-muted-foreground">İlanınızın başlığı ve açıklaması</p>
              
              <div>
                <Label htmlFor="title">İlan Başlığı * <span className="text-muted-foreground font-normal">({formData.title.length}/45)</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTextChange('title', e.target.value)}
                  placeholder="Örn: Ankara - İstanbul Becayiş"
                  required
                  maxLength={45}
                  data-testid="listing-title-input"
                />
              </div>

              <div>
                <Label htmlFor="notes">Açıklama <span className="text-muted-foreground font-normal">({formData.notes.length}/140)</span></Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleTextChange('notes', e.target.value)}
                  rows={3}
                  placeholder="İlan hakkında detaylı bilgi..."
                  maxLength={140}
                  data-testid="listing-notes-input"
                />
              </div>
            </div>

            {/* Sunulan Pozisyon */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Sunulan Pozisyon</h3>
                  <p className="text-sm text-muted-foreground">Profilinizden alınan bilgiler.</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    <Link to="/dashboard" className="underline">Panel → Profil sekmesinden düzenleyebilirsiniz.</Link>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kurum</Label>
                  <Input
                    value={profileData.institution || 'Belirtilmemiş'}
                    disabled
                    className="bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <Label>Pozisyon</Label>
                  <Input
                    value={profileData.role || 'Belirtilmemiş'}
                    disabled
                    className="bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <Label>Şehir</Label>
                  <Input
                    value={profileData.current_province || 'Belirtilmemiş'}
                    disabled
                    className="bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <Label>İlçe</Label>
                  <Input
                    value={profileData.current_district || 'Belirtilmemiş'}
                    disabled
                    className="bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* İstenen Pozisyon */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">İstenen Pozisyon</h3>
              <p className="text-sm text-muted-foreground">Becayiş yapmak istediğiniz konum</p>

              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      <strong>Kurum:</strong> {profileData.institution || 'Belirtilmemiş'}
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">Becayiş sadece aynı kurum içinde yapılabilir!</p>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mt-2">
                      <strong>Pozisyon:</strong> {profileData.role || 'Belirtilmemiş'}
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">Becayiş sadece aynı pozisyon için yapılabilir!</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="desired_province">Şehir *</Label>
                  <Select 
                    value={formData.desired_province || undefined} 
                    onValueChange={(val) => setFormData({ ...formData, desired_province: val, desired_district: '' })}
                  >
                    <SelectTrigger data-testid="listing-desired-province">
                      <SelectValue placeholder="Şehir seçin" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="desired_district">İlçe</Label>
                  <Select 
                    value={formData.desired_district || undefined} 
                    onValueChange={(val) => setFormData({ ...formData, desired_district: val })}
                    disabled={!formData.desired_province || districts.length === 0}
                  >
                    <SelectTrigger data-testid="listing-desired-district">
                      <SelectValue placeholder={formData.desired_province ? "İlçe seçin" : "Önce il seçin"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
                data-testid="listing-cancel-button"
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                disabled={loading || !profileData.institution}
                data-testid="listing-submit-button"
              >
                {loading ? 'Kaydediliyor...' : isEdit ? 'İlanı Güncelle' : 'İlan Oluştur'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateEditListing;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Users, FileText, MessageSquare, Shield, AlertTriangle, LogOut, X, UserPlus, KeyRound, Trash2, Camera, User, Crown, ArrowRightLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import api from '../lib/api';
import { toast } from 'sonner';
import { formatDate } from '../lib/utils';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const adminAvatarInputRef = useRef(null);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [accountDeletionRequests, setAccountDeletionRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Current admin profile state
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ display_name: '', avatar_url: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Admin management state
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false);
  const [showTransferMainAdminDialog, setShowTransferMainAdminDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newAdminData, setNewAdminData] = useState({ username: '', password: '', display_name: '' });
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('');
  const [transferPassword, setTransferPassword] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Password validation helpers
  const passwordHasMinLength = (pwd) => pwd.length >= 8;
  const passwordHasUppercase = (pwd) => /[A-Z]/.test(pwd);
  const passwordHasSpecialChar = (pwd) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(pwd);
  const passwordIsValid = (pwd) => passwordHasMinLength(pwd) && passwordHasUppercase(pwd) && passwordHasSpecialChar(pwd);

  const handlePasswordKeyEvent = (e) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem('is_admin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    
    // Set admin token for api calls
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      localStorage.setItem('token', adminToken);
    }
    
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, listingsRes, reportsRes, deletionReqRes, accountDeletionReqRes, adminsRes, currentAdminRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/listings'),
        api.get('/admin/reports'),
        api.get('/admin/deletion-requests'),
        api.get('/admin/account-deletion-requests'),
        api.get('/admin/admins'),
        api.get('/admin/me')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setListings(listingsRes.data);
      setReports(reportsRes.data);
      setDeletionRequests(deletionReqRes.data);
      setAccountDeletionRequests(accountDeletionReqRes.data);
      setAdmins(adminsRes.data || []);
      setCurrentAdmin(currentAdminRes.data);
      setProfileData({
        display_name: currentAdminRes.data?.display_name || '',
        avatar_url: currentAdminRes.data?.avatar_url || ''
      });
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu');
      if (error.response?.status === 403) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Admin management functions
  const handleAddAdmin = async () => {
    if (!newAdminData.username || !newAdminData.password) {
      toast.error('Kullanıcı adı ve şifre zorunludur');
      return;
    }
    
    if (!passwordIsValid(newAdminData.password)) {
      toast.error('Şifre gereksinimlerini karşılamıyor');
      return;
    }

    try {
      await api.post('/admin/admins', newAdminData);
      toast.success('Admin başarıyla oluşturuldu');
      setShowAddAdminDialog(false);
      setNewAdminData({ username: '', password: '', display_name: '' });
      // Refresh admins list
      const adminsRes = await api.get('/admin/admins');
      setAdmins(adminsRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Admin oluşturulamadı');
    }
  };

  const handleChangeAdminPassword = async () => {
    if (!newPassword) {
      toast.error('Yeni şifre zorunludur');
      return;
    }
    
    if (!passwordIsValid(newPassword)) {
      toast.error('Şifre gereksinimlerini karşılamıyor');
      return;
    }

    try {
      await api.put(`/admin/admins/${selectedAdmin.id}/password`, {
        admin_id: selectedAdmin.id,
        new_password: newPassword
      });
      toast.success('Şifre başarıyla güncellendi');
      setShowChangePasswordDialog(false);
      setSelectedAdmin(null);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Şifre güncellenemedi');
    }
  };

  const handleDeleteAdmin = async (adminId, username) => {
    if (!window.confirm(`"${username}" admin hesabını silmek istediğinizden emin misiniz?`)) return;

    try {
      await api.delete(`/admin/admins/${adminId}`);
      setAdmins(prev => prev.filter(a => a.id !== adminId));
      toast.success('Admin silindi');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Admin silinemedi');
    }
  };

  const handleChangeRole = async () => {
    if (!selectedAdmin || !newRole) return;

    try {
      await api.put(`/admin/admins/${selectedAdmin.id}/role`, {
        admin_id: selectedAdmin.id,
        new_role: newRole
      });
      toast.success('Admin yetkisi güncellendi');
      setShowChangeRoleDialog(false);
      setSelectedAdmin(null);
      setNewRole('');
      // Refresh admins list
      const adminsRes = await api.get('/admin/admins');
      setAdmins(adminsRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Yetki güncellenemedi');
    }
  };

  const handleTransferMainAdmin = async () => {
    if (!selectedAdmin || !transferPassword) {
      toast.error('Şifre zorunludur');
      return;
    }

    try {
      await api.post('/admin/transfer-main-admin', {
        new_main_admin_id: selectedAdmin.id,
        password: transferPassword
      });
      toast.success('Ana admin yetkisi devredildi');
      setShowTransferMainAdminDialog(false);
      setSelectedAdmin(null);
      setTransferPassword('');
      // Refresh data - user may need to re-login
      const adminsRes = await api.get('/admin/admins');
      setAdmins(adminsRes.data || []);
      const currentAdminRes = await api.get('/admin/me');
      setCurrentAdmin(currentAdminRes.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Devir işlemi başarısız');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      
      // Upload avatar if selected
      if (selectedAvatarFile) {
        const formData = new FormData();
        formData.append('file', selectedAvatarFile);
        await api.post('/admin/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      // Update profile
      await api.put('/admin/profile', {
        display_name: profileData.display_name
      });
      
      toast.success('Profil güncellendi');
      setEditingProfile(false);
      setSelectedAvatarFile(null);
      setAvatarPreview(null);
      
      // Refresh current admin data
      const currentAdminRes = await api.get('/admin/me');
      setCurrentAdmin(currentAdminRes.data);
      setProfileData({
        display_name: currentAdminRes.data?.display_name || '',
        avatar_url: currentAdminRes.data?.avatar_url || ''
      });
      
      // Refresh admins list
      const adminsRes = await api.get('/admin/admins');
      setAdmins(adminsRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Profil güncellenemedi');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAdminAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }
      setSelectedAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAdminAvatar = async () => {
    try {
      await api.delete('/admin/avatar');
      toast.success('Profil fotoğrafı silindi');
      setAvatarPreview(null);
      setSelectedAvatarFile(null);
      // Refresh current admin data
      const currentAdminRes = await api.get('/admin/me');
      setCurrentAdmin(currentAdminRes.data);
      setProfileData({
        display_name: currentAdminRes.data?.display_name || '',
        avatar_url: currentAdminRes.data?.avatar_url || ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Fotoğraf silinemedi');
    }
  };

  // Check if current user is main admin
  const isMainAdmin = currentAdmin?.role === 'main_admin';

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      if (isBlocked) {
        await api.put(`/admin/users/${userId}/unblock`);
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, is_blocked: false } : u
        ));
        toast.success('Kullanıcı engeli kaldırıldı');
      } else {
        await api.put(`/admin/users/${userId}/block`);
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, is_blocked: true } : u
        ));
        toast.success('Kullanıcı engellendi');
      }
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Kullanıcı silindi');
    } catch (error) {
      toast.error('Kullanıcı silinemedi');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('İlanı silmek istediğinizden emin misiniz?')) return;

    try {
      await api.delete(`/admin/listings/${listingId}`);
      setListings(prev => prev.filter(l => l.id !== listingId));
      toast.success('İlan silindi.');
    } catch (error) {
      toast.error('İlan silinemedi.');
    }
  };

  const handleApproveDeletion = async (requestId) => {
    try {
      await api.post(`/admin/deletion-requests/${requestId}/approve`);
      setDeletionRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'approved' } : r
      ));
      toast.success('Silme isteği onaylandı');
    } catch (error) {
      toast.error('İşlem başarısız.');
    }
  };

  const handleRejectDeletion = async (requestId) => {
    try {
      await api.post(`/admin/deletion-requests/${requestId}/reject`);
      setDeletionRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'rejected' } : r
      ));
      toast.success('Silme isteği reddedildi.');
    } catch (error) {
      toast.error('İşlem başarısız.');
    }
  };

  const handleClearDeletionRequest = async (requestId) => {
    if (!window.confirm('Bu silme isteğini temizlemek istediğinizden emin misiniz?')) return;
    
    try {
      await api.delete(`/admin/deletion-requests/${requestId}`);
      setDeletionRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Silme isteği temizlendi.');
    } catch (error) {
      toast.error('İşlem başarısız.');
    }
  };

  // Account Deletion Request Handlers
  const handleApproveAccountDeletion = async (requestId) => {
    if (!window.confirm('Bu hesap silme talebini onaylamak istediğinizden emin misiniz? Kullanıcının tüm verileri kalıcı olarak silinecektir.')) return;
    
    try {
      await api.post(`/admin/account-deletion-requests/${requestId}/approve`);
      setAccountDeletionRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'approved' } : r
      ));
      // Also remove from users list
      const request = accountDeletionRequests.find(r => r.id === requestId);
      if (request) {
        setUsers(prev => prev.filter(u => u.id !== request.user_id));
      }
      toast.success('Hesap silme talebi onaylandı ve kullanıcı silindi.');
    } catch (error) {
      toast.error('İşlem başarısız.');
    }
  };

  const handleRejectAccountDeletion = async (requestId) => {
    try {
      await api.post(`/admin/account-deletion-requests/${requestId}/reject`);
      setAccountDeletionRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'rejected' } : r
      ));
      toast.success('Hesap silme talebi reddedildi.');
    } catch (error) {
      toast.error('İşlem başarısız.');
    }
  };

  const handleClearAccountDeletionRequest = async (requestId) => {
    if (!window.confirm('Bu hesap silme talebini temizlemek istediğinizden emin misiniz?')) return;
    
    try {
      await api.delete(`/admin/account-deletion-requests/${requestId}`);
      setAccountDeletionRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Hesap silme talebi temizlendi.');
    } catch (error) {
      toast.error('İşlem başarısız.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'Manrope' }}>Admin Paneli</h1>
                <p className="text-red-100 text-sm">Becayiş Yönetim Paneli</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="bg-white text-red-600 hover:bg-red-50" data-testid="admin-logout-button">
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Kullanıcı</p>
                <p className="text-3xl font-bold mt-1">{stats.total_users}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Aktif İlanlar</p>
                <p className="text-3xl font-bold mt-1">{stats.active_listings}/{stats.total_listings}</p>
              </div>
              <FileText className="w-10 h-10 text-amber-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Bekleyen Silme İstekleri</p>
                <p className="text-3xl font-bold mt-1">{stats.pending_deletions}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Kabul Edilen Davetler</p>
                <p className="text-3xl font-bold mt-1">{stats.accepted_invitations}/{stats.total_invitations}</p>
              </div>
              <Shield className="w-10 h-10 text-emerald-600" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="users" data-testid="admin-tab-users">Kullanıcılar</TabsTrigger>
            <TabsTrigger value="listings" data-testid="admin-tab-listings">İlanlar</TabsTrigger>
            <TabsTrigger value="deletions" data-testid="admin-tab-deletions">
              İlan Silme {deletionRequests.filter(r => r.status === 'pending').length > 0 && (
                <Badge className="ml-2 bg-red-500">{deletionRequests.filter(r => r.status === 'pending').length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="account-deletions" data-testid="admin-tab-account-deletions">
              Hesap Silme {accountDeletionRequests.filter(r => r.status === 'pending').length > 0 && (
                <Badge className="ml-2 bg-red-500">{accountDeletionRequests.filter(r => r.status === 'pending').length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="admin-tab-reports">Raporlar</TabsTrigger>
            <TabsTrigger value="admins" data-testid="admin-tab-admins">
              <Shield className="w-4 h-4 mr-1" />
              Adminler
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="admin-tab-profile">
              <User className="w-4 h-4 mr-1" />
              Profilim
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>Kullanıcılar ({users.length})</h2>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 flex items-center justify-between" data-testid="admin-user-row">
                    <div className="flex-1">
                      <div className="font-semibold">{user.profile?.display_name || user.email}</div>
                      <div className="text-sm text-slate-500">{user.email} • {user.phone}</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {user.profile?.institution} - {user.profile?.role}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={user.verified ? 'default' : 'outline'}>
                          {user.verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                        </Badge>
                        {user.blocked && <Badge variant="destructive">Engellenmiş</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={user.blocked ? 'outline' : 'destructive'}
                        size="sm"
                        onClick={() => handleBlockUser(user.id, user.blocked)}
                        data-testid={`admin-block-user-${user.id}`}
                      >
                        {user.blocked ? 'Engeli Kaldır' : 'Engelle'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        data-testid={`admin-delete-user-${user.id}`}
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>İlanlar ({listings.length})</h2>
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4" data-testid="admin-listing-row">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{listing.profile?.display_name}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          {listing.institution} - {listing.role}
                        </div>
                        <div className="text-sm text-slate-500 mt-2">
                          {listing.current_province}/{listing.current_district} → {listing.desired_province}/{listing.desired_district}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={listing.status === 'active' ? 'default' : 'outline'}>
                            {listing.status === 'active' ? 'Aktif' : 'Kapalı'}
                          </Badge>
                          <span className="text-xs text-slate-400">{formatDate(listing.created_at)}</span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteListing(listing.id)}
                        data-testid={`admin-delete-listing-${listing.id}`}
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="deletions">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>
                Silme İstekleri ({deletionRequests.length})
              </h2>
              {deletionRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Henüz silme isteği yok</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deletionRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4" data-testid="admin-deletion-request">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-semibold">{request.user_profile?.display_name}</div>
                            <Badge variant={
                              request.status === 'pending' ? 'default' : 
                              request.status === 'approved' ? 'outline' : 
                              'destructive'
                            }>
                              {request.status === 'pending' ? 'Bekliyor' : 
                               request.status === 'approved' ? 'Onaylandı' : 
                               'Reddedildi'}
                            </Badge>
                          </div>
                          
                          {request.listing && (
                            <div className="text-sm text-slate-600 mb-2">
                              <strong>İlan:</strong> {request.listing.institution} - {request.listing.role}
                              <br />
                              {request.listing.current_province}/{request.listing.current_district} → {request.listing.desired_province}/{request.listing.desired_district}
                            </div>
                          )}
                          
                          <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded mt-2">
                            <strong>Silme Sebebi:</strong> {request.reason}
                          </div>
                          
                          <div className="text-xs text-slate-400 mt-2">{formatDate(request.created_at)}</div>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600"
                              onClick={() => handleApproveDeletion(request.id)}
                              data-testid={`approve-deletion-${request.id}`}
                            >
                              Onayla
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectDeletion(request.id)}
                              data-testid={`reject-deletion-${request.id}`}
                            >
                              Reddet
                            </Button>
                          </div>
                        )}
                        
                        {/* X button to clear processed requests */}
                        {request.status !== 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-4 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => handleClearDeletionRequest(request.id)}
                            data-testid={`clear-deletion-${request.id}`}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>Raporlar ({reports.length})</h2>
              {reports.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Henüz rapor yok</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4" data-testid="admin-report-row">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-red-600">Engelleme Raporu</div>
                          <div className="text-sm text-slate-600 mt-2">
                            <strong>{report.blocker_profile?.display_name}</strong> kullanıcısı{' '}
                            <strong>{report.blocked_profile?.display_name}</strong> kullanıcısını engelledi
                          </div>
                          {report.reason && (
                            <div className="text-sm text-slate-500 mt-2">
                              <strong>Sebep:</strong> {report.reason}
                            </div>
                          )}
                          <div className="text-xs text-slate-400 mt-2">{formatDate(report.created_at)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Account Deletion Requests Tab */}
          <TabsContent value="account-deletions">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>
                Hesap Silme Talepleri ({accountDeletionRequests.length})
              </h2>
              {accountDeletionRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Henüz hesap silme talebi yok</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accountDeletionRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4" data-testid="admin-account-deletion-request">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-semibold">{request.profile?.display_name || request.user?.email}</div>
                            <Badge variant={
                              request.status === 'pending' ? 'default' : 
                              request.status === 'approved' ? 'outline' : 
                              'destructive'
                            }>
                              {request.status === 'pending' ? 'Bekliyor' : 
                               request.status === 'approved' ? 'Onaylandı' : 
                               'Reddedildi'}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-slate-600 mb-2">
                            <strong>E-posta:</strong> {request.user?.email}
                          </div>
                          
                          {request.profile && (
                            <div className="text-sm text-slate-600 mb-2">
                              <strong>Kurum:</strong> {request.profile.institution} - {request.profile.role}
                              <br />
                              <strong>Konum:</strong> {request.profile.current_province}/{request.profile.current_district}
                            </div>
                          )}
                          
                          <div className="text-sm text-slate-700 bg-slate-50 dark:bg-slate-800 p-3 rounded mt-2">
                            <strong>Silme Sebebi:</strong> {request.reason}
                          </div>
                          
                          <div className="text-xs text-slate-400 mt-2">{formatDate(request.created_at)}</div>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600"
                              onClick={() => handleApproveAccountDeletion(request.id)}
                              data-testid={`approve-account-deletion-${request.id}`}
                            >
                              Onayla
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectAccountDeletion(request.id)}
                              data-testid={`reject-account-deletion-${request.id}`}
                            >
                              Reddet
                            </Button>
                          </div>
                        )}
                        
                        {/* X button to clear processed requests */}
                        {request.status !== 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-4 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => handleClearAccountDeletionRequest(request.id)}
                            data-testid={`clear-account-deletion-${request.id}`}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Admin Management Tab */}
          <TabsContent value="admins">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Manrope' }}>
                  Admin Yönetimi ({admins.length})
                </h2>
                {isMainAdmin && (
                  <Button 
                    onClick={() => setShowAddAdminDialog(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="add-admin-btn"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Yeni Admin Ekle
                  </Button>
                )}
              </div>

              {admins.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Henüz admin yok</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="border rounded-lg p-4 flex items-center justify-between" data-testid={`admin-row-${admin.id}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {admin.avatar_url ? (
                              <img 
                                src={`${process.env.REACT_APP_BACKEND_URL}${admin.avatar_url}`} 
                                alt={admin.display_name} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                              </div>
                            )}
                            {admin.role === 'main_admin' && (
                              <Crown className="w-4 h-4 text-amber-500 absolute -top-1 -right-1" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{admin.display_name || admin.username}</span>
                              {admin.role === 'main_admin' && (
                                <Badge className="bg-amber-500 text-white text-xs">Ana Admin</Badge>
                              )}
                            </div>
                            <div className="text-sm text-slate-500">@{admin.username}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          Oluşturulma: {formatDate(admin.created_at)}
                          {admin.created_by && ` • Oluşturan: ${admin.created_by}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {/* Role change button - only for main admin and not for self */}
                        {isMainAdmin && admin.username !== currentAdmin?.username && admin.role !== 'main_admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setShowTransferMainAdminDialog(true);
                            }}
                            className="text-amber-600 border-amber-600 hover:bg-amber-50"
                            data-testid={`transfer-admin-${admin.id}`}
                          >
                            <ArrowRightLeft className="w-4 h-4 mr-1" />
                            Ana Admin Yap
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowChangePasswordDialog(true);
                          }}
                          data-testid={`change-password-${admin.id}`}
                        >
                          <KeyRound className="w-4 h-4 mr-1" />
                          Şifre Değiştir
                        </Button>
                        {isMainAdmin && admin.role !== 'main_admin' && admin.username !== currentAdmin?.username && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteAdmin(admin.id, admin.username)}
                            data-testid={`delete-admin-${admin.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Manrope' }}>
                Profilim
              </h2>

              <div className="max-w-md mx-auto">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    {avatarPreview || currentAdmin?.avatar_url ? (
                      <img
                        src={avatarPreview || `${process.env.REACT_APP_BACKEND_URL}${currentAdmin?.avatar_url}`}
                        alt="Admin Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-slate-200"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center border-4 border-slate-300">
                        <Shield className="w-16 h-16 text-slate-400" />
                      </div>
                    )}
                    {currentAdmin?.role === 'main_admin' && (
                      <Crown className="w-8 h-8 text-amber-500 absolute -top-2 -right-2" />
                    )}
                    <button
                      type="button"
                      onClick={() => adminAvatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg"
                      data-testid="admin-change-avatar-btn"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <input
                      type="file"
                      ref={adminAvatarInputRef}
                      onChange={handleAdminAvatarSelect}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                    />
                  </div>
                  {(avatarPreview || currentAdmin?.avatar_url) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-500 hover:text-red-600"
                      onClick={handleDeleteAdminAvatar}
                      data-testid="admin-delete-avatar-btn"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Fotoğrafı Sil
                    </Button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-slate-600">Kullanıcı Adı</Label>
                    <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                      @{currentAdmin?.username}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-slate-600">Yetki</Label>
                    <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      {currentAdmin?.role === 'main_admin' ? (
                        <Badge className="bg-amber-500 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Ana Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">Admin</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="admin-display-name" className="text-sm text-slate-600">Görünen İsim</Label>
                    <Input
                      id="admin-display-name"
                      value={profileData.display_name}
                      onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                      placeholder="İsminiz"
                      className="mt-1"
                      data-testid="admin-profile-display-name"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={savingProfile}
                      data-testid="admin-save-profile-btn"
                    >
                      {savingProfile ? 'Kaydediliyor...' : 'Profili Kaydet'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Admin Dialog */}
        <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Admin Ekle</DialogTitle>
              <DialogDescription>
                Yeni bir admin hesabı oluşturun
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="admin-username">Kullanıcı Adı</Label>
                <Input
                  id="admin-username"
                  value={newAdminData.username}
                  onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                  placeholder="admin_kullanici"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-display-name">Görünen İsim (Opsiyonel)</Label>
                <Input
                  id="admin-display-name"
                  value={newAdminData.display_name}
                  onChange={(e) => setNewAdminData({ ...newAdminData, display_name: e.target.value })}
                  placeholder="Admin Adı"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password">Şifre</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                  onKeyDown={handlePasswordKeyEvent}
                  onKeyUp={handlePasswordKeyEvent}
                  placeholder="Güçlü bir şifre"
                />
                
                {capsLockOn && (
                  <div className="flex items-center gap-2 text-amber-600 text-xs mt-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Caps Lock açık</span>
                  </div>
                )}
                
                {/* Password Requirements */}
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs font-medium mb-2">Şifre Gereksinimleri:</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center gap-2 text-xs ${passwordHasMinLength(newAdminData.password) ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordHasMinLength(newAdminData.password) ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {passwordHasMinLength(newAdminData.password) ? '✓' : '✗'}
                      </span>
                      En az 8 karakter
                    </li>
                    <li className={`flex items-center gap-2 text-xs ${passwordHasUppercase(newAdminData.password) ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordHasUppercase(newAdminData.password) ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {passwordHasUppercase(newAdminData.password) ? '✓' : '✗'}
                      </span>
                      En az 1 büyük harf (A-Z)
                    </li>
                    <li className={`flex items-center gap-2 text-xs ${passwordHasSpecialChar(newAdminData.password) ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordHasSpecialChar(newAdminData.password) ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {passwordHasSpecialChar(newAdminData.password) ? '✓' : '✗'}
                      </span>
                      En az 1 özel karakter
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddAdminDialog(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleAddAdmin}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!passwordIsValid(newAdminData.password)}
              >
                Admin Ekle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Şifre Değiştir</DialogTitle>
              <DialogDescription>
                {selectedAdmin?.display_name || selectedAdmin?.username} için yeni şifre belirleyin
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-admin-password">Yeni Şifre</Label>
                <Input
                  id="new-admin-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={handlePasswordKeyEvent}
                  onKeyUp={handlePasswordKeyEvent}
                  placeholder="Yeni şifre"
                />
                
                {capsLockOn && (
                  <div className="flex items-center gap-2 text-amber-600 text-xs mt-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Caps Lock açık</span>
                  </div>
                )}
                
                {/* Password Requirements */}
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs font-medium mb-2">Şifre Gereksinimleri:</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center gap-2 text-xs ${passwordHasMinLength(newPassword) ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordHasMinLength(newPassword) ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {passwordHasMinLength(newPassword) ? '✓' : '✗'}
                      </span>
                      En az 8 karakter
                    </li>
                    <li className={`flex items-center gap-2 text-xs ${passwordHasUppercase(newPassword) ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordHasUppercase(newPassword) ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {passwordHasUppercase(newPassword) ? '✓' : '✗'}
                      </span>
                      En az 1 büyük harf (A-Z)
                    </li>
                    <li className={`flex items-center gap-2 text-xs ${passwordHasSpecialChar(newPassword) ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordHasSpecialChar(newPassword) ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {passwordHasSpecialChar(newPassword) ? '✓' : '✗'}
                      </span>
                      En az 1 özel karakter
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowChangePasswordDialog(false);
                setSelectedAdmin(null);
                setNewPassword('');
              }}>
                İptal
              </Button>
              <Button 
                onClick={handleChangeAdminPassword}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!passwordIsValid(newPassword)}
              >
                Şifreyi Güncelle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transfer Main Admin Dialog */}
        <Dialog open={showTransferMainAdminDialog} onOpenChange={setShowTransferMainAdminDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Ana Admin Yetkisini Devret
              </DialogTitle>
              <DialogDescription>
                <strong className="text-red-500">Dikkat!</strong> Bu işlem geri alınamaz. Ana admin yetkisini <strong>{selectedAdmin?.display_name || selectedAdmin?.username}</strong> kullanıcısına devretmek üzeresiniz.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    Bu işlem sonucunda:
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>Ana admin yetkisi {selectedAdmin?.display_name || selectedAdmin?.username} kullanıcısına geçecek</li>
                      <li>Sizin yetkiniz normal admin seviyesine düşecek</li>
                      <li>Bu işlemi geri almak için yeni ana adminin onayı gerekecek</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer-password">Şifrenizi Girin (Onay için)</Label>
                <Input
                  id="transfer-password"
                  type="password"
                  value={transferPassword}
                  onChange={(e) => setTransferPassword(e.target.value)}
                  onKeyDown={handlePasswordKeyEvent}
                  onKeyUp={handlePasswordKeyEvent}
                  placeholder="Mevcut şifreniz"
                  data-testid="transfer-admin-password-input"
                />
                
                {capsLockOn && (
                  <div className="flex items-center gap-2 text-amber-600 text-xs mt-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Caps Lock açık</span>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowTransferMainAdminDialog(false);
                setSelectedAdmin(null);
                setTransferPassword('');
              }}>
                İptal
              </Button>
              <Button 
                onClick={handleTransferMainAdmin}
                className="bg-amber-600 hover:bg-amber-700"
                disabled={!transferPassword}
                data-testid="confirm-transfer-btn"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Yetkiyi Devret
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Users, FileText, MessageSquare, Shield, AlertTriangle, LogOut, X } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { formatDate } from '../lib/utils';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [accountDeletionRequests, setAccountDeletionRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const [statsRes, usersRes, listingsRes, reportsRes, deletionReqRes, accountDeletionReqRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/listings'),
        api.get('/admin/reports'),
        api.get('/admin/deletion-requests'),
        api.get('/admin/account-deletion-requests')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setListings(listingsRes.data);
      setReports(reportsRes.data);
      setDeletionRequests(deletionReqRes.data);
      setAccountDeletionRequests(accountDeletionReqRes.data);
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu');
      if (error.response?.status === 403) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      if (isBlocked) {
        await api.put(`/admin/users/${userId}/unblock`);
        toast.success('Kullanıcı engeli kaldırıldı');
      } else {
        await api.put(`/admin/users/${userId}/block`);
        toast.success('Kullanıcı engellendi');
      }
      fetchData();
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
          <TabsList className="grid w-full grid-cols-5">
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
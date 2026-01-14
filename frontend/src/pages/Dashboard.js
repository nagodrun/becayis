import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ListingCard } from '../components/ListingCard';
import { FileText, Send, Inbox, MessageSquare, Bell, Plus, Trash2, Camera, X } from 'lucide-react';
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
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';

const Dashboard = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [myListings, setMyListings] = useState([]);
  const [invitations, setInvitations] = useState({ sent: [], received: [] });
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [showWarning, setShowWarning] = useState(() => {
    return localStorage.getItem('hideWarning') !== 'true';
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    display_name: '',
    bio: '',
    institution: '',
    role: '',
    current_province: '',
    current_district: ''
  });
  
  // Dropdown data
  const [institutions, setInstitutions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    if (user?.profile) {
      setProfileData({
        display_name: user.profile.display_name || '',
        bio: user.profile.bio || '',
        institution: user.profile.institution || '',
        role: user.profile.role || '',
        current_province: user.profile.current_province || '',
        current_district: user.profile.current_district || ''
      });
    } else if (user) {
      // If no profile yet, pre-fill display_name from registration info
      setProfileData(prev => ({
        ...prev,
        display_name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
      }));
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [listingsRes, invitationsRes, conversationsRes, notificationsRes, deletionReqRes] = await Promise.all([
        api.get('/listings/my'),
        api.get('/invitations'),
        api.get('/conversations'),
        api.get('/notifications'),
        api.get('/listings/deletion-requests/my')
      ]);

      setMyListings(listingsRes.data);
      setInvitations(invitationsRes.data);
      setConversations(conversationsRes.data);
      setNotifications(notificationsRes.data);
      setDeletionRequests(deletionReqRes.data);
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    const listing = myListings.find(l => l.id === listingId);
    setSelectedListing(listing);
    setDeletionDialogOpen(true);
  };

  const handleSubmitDeletionRequest = async () => {
    if (!deletionReason.trim()) {
      toast.error('Lütfen silme sebebini belirtin');
      return;
    }

    try {
      await api.post(`/listings/${selectedListing.id}/request-deletion`, {
        listing_id: selectedListing.id,
        reason: deletionReason
      });
      toast.success('Silme isteği gönderildi. Admin onayı bekleniyor.');
      setDeletionDialogOpen(false);
      setDeletionReason('');
      setSelectedListing(null);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'İstek gönderilemedi');
    }
  };

  const handleRespondInvitation = async (invitationId, action) => {
    try {
      await api.post('/invitations/respond', { invitation_id: invitationId, action });
      toast.success(action === 'accept' ? 'Davet kabul edildi' : 'Davet reddedildi');
      fetchDashboardData();
    } catch (error) {
      toast.error('Davet yanıtlanamadı');
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      // Silently fail
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifications.map(n => 
        api.post(`/notifications/${n.id}/read`)
      ));
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      // Silently fail
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success('Bildirim silindi');
    } catch (error) {
      toast.error('Bildirim silinemedi');
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('Bu konuşmayı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await api.delete(`/conversations/${conversationId}`);
      setConversations(conversations.filter(c => c.id !== conversationId));
      toast.success('Konuşma silindi');
    } catch (error) {
      toast.error('Konuşma silinemedi');
    }
  };

  const handleCloseWarning = () => {
    setShowWarning(false);
    localStorage.setItem('hideWarning', 'true');
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Sadece JPEG, PNG, WebP veya GIF dosyaları kabul edilir');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Profil fotoğrafı yüklendi');
      setProfileData(prev => ({ ...prev, avatar_url: response.data.avatar_url }));
      
      // Refresh user data
      if (fetchUser) fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Profil fotoğrafı yüklenemedi');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Profil fotoğrafınızı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await api.delete('/profile/avatar');
      toast.success('Profil fotoğrafı silindi');
      setProfileData(prev => ({ ...prev, avatar_url: null }));
      
      // Refresh user data
      if (fetchUser) fetchUser();
    } catch (error) {
      toast.error('Profil fotoğrafı silinemedi');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Check if profile exists, if not create, otherwise update
      if (!user?.profile) {
        // Create profile
        await api.post('/profile', {
          user_id: user?.id,
          display_name: profileData.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
          institution: profileData.institution,
          role: profileData.role,
          current_province: profileData.current_province,
          current_district: profileData.current_district,
          bio: profileData.bio
        });
      } else {
        // Update profile
        await api.put('/profile', profileData);
      }
      toast.success('Profil güncellendi');
      setEditingProfile(false);
      // Refresh page to get updated data
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Profil güncellenemedi');
    }
  };

  const [accountDeletionPending, setAccountDeletionPending] = useState(false);
  const [deletionReasonAccount, setDeletionReasonAccount] = useState('');
  const [accountDeletionDialogOpen, setAccountDeletionDialogOpen] = useState(false);

  // Check for pending account deletion request
  useEffect(() => {
    const checkAccountDeletionStatus = async () => {
      try {
        const res = await api.get('/auth/account-deletion-status');
        setAccountDeletionPending(res.data.has_pending_request);
      } catch (error) {
        // Ignore error
      }
    };
    checkAccountDeletionStatus();
  }, []);

  const handleDeleteAccount = () => {
    if (accountDeletionPending) {
      toast.info('Hesap silme talebiniz zaten beklemede. Admin onayı bekleniyor.');
      return;
    }
    setAccountDeletionDialogOpen(true);
  };

  const handleSubmitAccountDeletion = async () => {
    if (!deletionReasonAccount.trim()) {
      toast.error('Lütfen hesap silme sebebinizi belirtin');
      return;
    }

    try {
      await api.post('/auth/request-account-deletion', { reason: deletionReasonAccount });
      toast.success('Hesap silme talebiniz alındı. Admin onayından sonra hesabınız silinecektir.');
      setAccountDeletionDialogOpen(false);
      setDeletionReasonAccount('');
      setAccountDeletionPending(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Talep gönderilemedi');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yüklüyor...</div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground" style={{ fontFamily: 'Manrope' }}>Panel</h1>
          <p className="text-muted-foreground">Hoş geldiniz, {user?.profile?.display_name || user?.email}</p>
        </div>

        {/* Single Account Warning */}
        {showWarning && (
          <Card className="p-6 mb-8 bg-amber-50 border-amber-200 relative">
            <button
              onClick={handleCloseWarning}
              className="absolute top-4 right-4 text-amber-600 hover:text-amber-800 transition-colors"
              data-testid="close-warning"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-start space-x-4 pr-8">
              <div className="flex-shrink-0">
                <Bell className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Platform Kullanım Politikası</h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Platformumuzun tüm kullanıcılarına kesintisiz ve adil hizmet sunabilmek için her kullanıcının yalnızca tek bir hesap ile kayıt olması gerekmektedir. Çoklu hesap kullanımı, platform kurallarına aykırı faaliyetler veya hizmet şartlarının ihlali durumunda hesabınız geçici olarak kısıtlanabilir veya kalıcı olarak kapatılabilir. Platformumuzu güvenli ve verimli tutmak için anlayışınıza teşekkür ederiz.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Aktif İlanlarım</p>
                <p className="text-3xl font-bold mt-1">{myListings.filter(l => l.status === 'active').length}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Bekleyen Davetler</p>
                <p className="text-3xl font-bold mt-1">{invitations.received.filter(i => i.status === 'pending').length}</p>
              </div>
              <Inbox className="w-10 h-10 text-amber-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Aktif Konuşmalar</p>
                <p className="text-3xl font-bold mt-1">{conversations.length}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-emerald-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Okunmamış Bildirim</p>
                <p className="text-3xl font-bold mt-1">{unreadNotifications}</p>
              </div>
              <Bell className="w-10 h-10 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="listings" className="space-y-6" onValueChange={(value) => {
          // Mark notifications as read when switching to notifications tab
          if (value === 'notifications' && unreadNotifications > 0) {
            handleMarkAllNotificationsRead();
          }
        }}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="listings" data-testid="tab-listings">İlanlarım</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profil</TabsTrigger>
            <TabsTrigger value="invitations" data-testid="tab-invitations">
              Davetler {invitations.received.filter(i => i.status === 'pending').length > 0 && (
                <Badge className="ml-2 bg-amber-500">{invitations.received.filter(i => i.status === 'pending').length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="conversations" data-testid="tab-conversations">Mesajlar</TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              Bildirimler {unreadNotifications > 0 && (
                <Badge className="ml-2 bg-red-500">{unreadNotifications}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Manrope' }}>İlanlarım</h2>
              <Link to="/listings/create">
                <Button className="bg-slate-900 hover:bg-slate-800" data-testid="create-listing-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni İlan
                </Button>
              </Link>
            </div>

            {myListings.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 mb-4">Henüz bir ilanınız yok</p>
                <Link to="/listings/create">
                  <Button className="bg-amber-500 hover:bg-amber-600">İlk İlanınızı Oluşturun</Button>
                </Link>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListings.map((listing) => {
                    const hasPendingDeletion = deletionRequests.some(
                      req => req.listing_id === listing.id && req.status === 'pending'
                    );
                    
                    return (
                      <div key={listing.id}>
                        <ListingCard listing={listing} showInviteButton={false} />
                        <div className="mt-2 flex gap-2">
                          <Link to={`/listings/${listing.id}/edit`} className="flex-1">
                            <Button variant="outline" className="w-full" size="sm" data-testid={`edit-listing-${listing.id}`}>Düzenle</Button>
                          </Link>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            size="sm"
                            onClick={() => handleDeleteListing(listing.id)}
                            disabled={hasPendingDeletion}
                            data-testid={`delete-listing-${listing.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {hasPendingDeletion ? 'İstek Bekliyor' : 'Sil'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Deletion Requests Status */}
                {deletionRequests.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Silme İsteklerim</h3>
                    <div className="space-y-3">
                      {deletionRequests.map((req) => (
                        <Card key={req.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{req.listing?.institution} - {req.listing?.role}</div>
                              <div className="text-sm text-slate-500 mt-1">Sebep: {req.reason}</div>
                              <div className="text-xs text-slate-400 mt-1">{formatDate(req.created_at)}</div>
                            </div>
                            <Badge variant={
                              req.status === 'pending' ? 'default' : 
                              req.status === 'approved' ? 'outline' : 
                              'destructive'
                            }>
                              {req.status === 'pending' ? 'Bekliyor' : 
                               req.status === 'approved' ? 'Onaylandı' : 
                               'Reddedildi'}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="invitations" className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>Gelen Davetler</h3>
              {invitations.received.length === 0 ? (
                <Card className="p-8 text-center text-slate-500">
                  Henüz davet almadınız
                </Card>
              ) : (
                <div className="space-y-4">
                  {invitations.received.map((invitation) => (
                    <Card key={invitation.id} className="p-6" data-testid="received-invitation">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold">{invitation.sender_profile?.display_name}</div>
                          <div className="text-sm text-slate-500">{invitation.sender_profile?.institution}</div>
                          <div className="text-sm text-slate-500 mt-1">{formatDate(invitation.created_at)}</div>
                          <Badge className="mt-2" variant={invitation.status === 'pending' ? 'default' : 'outline'}>
                            {invitation.status === 'pending' ? 'Bekliyor' : invitation.status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}
                          </Badge>
                        </div>
                        {invitation.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600"
                              onClick={() => handleRespondInvitation(invitation.id, 'accept')}
                              data-testid="accept-invitation"
                            >
                              Kabul Et
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRespondInvitation(invitation.id, 'reject')}
                              data-testid="reject-invitation"
                            >
                              Reddet
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>Gönderilen Davetler</h3>
              {invitations.sent.length === 0 ? (
                <Card className="p-8 text-center text-slate-500">
                  Henüz davet göndermediniz
                </Card>
              ) : (
                <div className="space-y-4">
                  {invitations.sent.map((invitation) => (
                    <Card key={invitation.id} className="p-6" data-testid="sent-invitation">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{invitation.receiver_profile?.display_name}</div>
                          <div className="text-sm text-slate-500">{invitation.receiver_profile?.institution}</div>
                          <div className="text-sm text-slate-500 mt-1">{formatDate(invitation.created_at)}</div>
                          <Badge className="mt-2" variant={invitation.status === 'pending' ? 'default' : 'outline'}>
                            {invitation.status === 'pending' ? 'Bekliyor' : invitation.status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="conversations">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope' }}>Mesajlarım</h2>
            {conversations.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">Henüz mesajlaşmanız yok</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {conversations.map((conv) => (
                  <Card key={conv.id} className="p-6 hover:shadow-lg transition-all relative" data-testid="conversation-card">
                    <button
                      onClick={() => handleDeleteConversation(conv.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                      data-testid={`delete-conversation-${conv.id}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <Link to={`/messages/${conv.id}`} className="block pr-8">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {conv.other_user?.display_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-lg text-foreground truncate">
                              {conv.other_user?.display_name || 'Bilinmeyen Kullanıcı'}
                            </h3>
                            {conv.last_message && (
                              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                {formatDate(conv.last_message.created_at)}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {conv.other_user?.institution} • {conv.other_user?.role}
                          </div>
                          {conv.last_message && (
                            <div className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              <span className="font-medium">Son mesaj:</span> {conv.last_message.content?.substring(0, 80)}
                              {conv.last_message.content?.length > 80 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope' }}>Bildirimler</h2>
            {notifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">Henüz bildiriminiz yok</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => {
                  const isInvitationAccepted = notif.type === 'invitation_accepted';
                  const conversation = conversations.find(c => 
                    c.invitation_id && invitations.sent.some(inv => 
                      inv.id === c.invitation_id && inv.status === 'accepted'
                    )
                  );
                  
                  return (
                    <Card key={notif.id} className={`p-6 ${!notif.read ? 'bg-blue-50' : ''} relative`} data-testid="notification-card">
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        data-testid={`delete-notification-${notif.id}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="flex justify-between items-start pr-8">
                        <div className="flex-1">
                          <div className="font-semibold">{notif.title}</div>
                          <div className="text-sm text-slate-600 mt-1">{notif.message}</div>
                          <div className="text-xs text-slate-400 mt-2">{formatDate(notif.created_at)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notif.read && <Badge className="bg-blue-600">Yeni</Badge>}
                          {isInvitationAccepted && conversation && (
                            <Link to={`/messages/${conversation.id}`}>
                              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" data-testid="go-to-chat-button">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Mesajlaş
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <h2 className="text-2xl font-bold mb-6 text-foreground" style={{ fontFamily: 'Manrope' }}>Profil Ayarları</h2>
            <Card className="p-6">
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 pb-6 border-b border-border">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden shadow-lg">
                      {profileData.avatar_url ? (
                        <img 
                          src={profileData.avatar_url} 
                          alt="Profil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-2xl">
                          {(user?.first_name?.[0] || '?').toUpperCase()}
                          {(user?.last_name?.[0] || '?').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Profil Fotoğrafı</h3>
                    <p className="text-sm text-muted-foreground mb-3">JPEG, PNG, WebP veya GIF. Max 5MB.</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="bg-amber-500 hover:bg-amber-600"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {uploadingAvatar ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                      </Button>
                      {profileData.avatar_url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleDeleteAvatar}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Kaldır
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {editingProfile ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="display_name">Görünen Ad</Label>
                        <Input
                          id="display_name"
                          value={profileData.display_name}
                          onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                          placeholder="Adınız Soyadınız"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          value={profileData.phone || user?.phone || ''}
                          disabled
                          className="bg-slate-100 dark:bg-slate-800"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Telefon numarası değiştirilemez</p>
                      </div>
                      <div>
                        <Label htmlFor="institution">Kurum</Label>
                        <Input
                          id="institution"
                          value={profileData.institution}
                          onChange={(e) => setProfileData({ ...profileData, institution: e.target.value })}
                          placeholder="Çalıştığınız kurum"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Pozisyon</Label>
                        <Input
                          id="role"
                          value={profileData.role}
                          onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                          placeholder="Göreviniz"
                        />
                      </div>
                      <div>
                        <Label htmlFor="current_province">Şu Anki İl</Label>
                        <Input
                          id="current_province"
                          value={profileData.current_province}
                          onChange={(e) => setProfileData({ ...profileData, current_province: e.target.value })}
                          placeholder="Bulunduğunuz il"
                        />
                      </div>
                      <div>
                        <Label htmlFor="current_district">Şu Anki İlçe</Label>
                        <Input
                          id="current_district"
                          value={profileData.current_district}
                          onChange={(e) => setProfileData({ ...profileData, current_district: e.target.value })}
                          placeholder="Bulunduğunuz ilçe"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Hakkında</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={4}
                        placeholder="Kendinizi kısaca tanıtın..."
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleUpdateProfile} className="bg-emerald-600 hover:bg-emerald-700">
                        Değişiklikleri Kaydet
                      </Button>
                      <Button variant="outline" onClick={() => setEditingProfile(false)}>İptal</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-foreground">Kişisel Bilgiler</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Görünen Ad</label>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-foreground">
                            {user?.profile?.display_name || 'Belirtilmemiş'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">E-posta</label>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-foreground">{user?.email}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Telefon</label>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-foreground">
                            {user?.phone || 'Belirtilmemiş'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Kurum</label>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-foreground">
                            {user?.profile?.institution || 'Belirtilmemiş'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Pozisyon</label>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-foreground">
                            {user?.profile?.role || 'Belirtilmemiş'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Konum</label>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-foreground">
                            {user?.profile?.current_province && user?.profile?.current_district 
                              ? `${user.profile.current_province} / ${user.profile.current_district}`
                              : 'Belirtilmemiş'}
                          </div>
                        </div>
                      </div>
                      {user?.profile?.bio && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Hakkında</label>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-foreground">{user.profile.bio}</div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-foreground">Hesap Bilgileri</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Üyelik Tarihi</label>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-foreground">
                            {user?.created_at ? formatDate(user.created_at) : 'Bilinmiyor'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Hesap Durumu</label>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                            <Badge className="bg-emerald-500">Aktif</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t flex justify-between items-center">
                      <Button onClick={() => setEditingProfile(true)} className="bg-blue-600 hover:bg-blue-700">
                        Profili Düzenle
                      </Button>
                      <div className="flex items-center gap-2">
                        {accountDeletionPending && (
                          <Badge variant="outline" className="border-amber-500 text-amber-600">
                            Silme Talebi Beklemede
                          </Badge>
                        )}
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          disabled={accountDeletionPending}
                          data-testid="delete-account-button"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {accountDeletionPending ? 'Talep Bekliyor' : 'Hesabı Sil'}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Deletion Request Dialog */}
      <Dialog open={deletionDialogOpen} onOpenChange={setDeletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İlan Silme İsteği</DialogTitle>
            <DialogDescription>
              İlanınızı silmek için admin onayı gereklidir. Lütfen silme sebebinizi açıklayın.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">Silme Sebebi</Label>
              <Textarea
                id="reason"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Örn: Hatalı bilgi girdim, artık aktarma planım yok, vs."
                rows={4}
                data-testid="deletion-reason-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletionDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmitDeletionRequest} data-testid="submit-deletion-request">
              İstek Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Deletion Request Dialog */}
      <Dialog open={accountDeletionDialogOpen} onOpenChange={setAccountDeletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hesap Silme Talebi</DialogTitle>
            <DialogDescription>
              Hesabınızı silmek için admin onayı gereklidir. Lütfen silme sebebinizi açıklayın.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Dikkat:</strong> Hesabınız silindiğinde tüm ilanlarınız, mesajlarınız ve profil bilgileriniz kalıcı olarak kaldırılacaktır.
              </p>
            </div>
            <div>
              <Label htmlFor="account-reason">Silme Sebebi</Label>
              <Textarea
                id="account-reason"
                value={deletionReasonAccount}
                onChange={(e) => setDeletionReasonAccount(e.target.value)}
                placeholder="Örn: Artık platformu kullanmıyorum, başka bir hesap açacağım, vs."
                rows={4}
                data-testid="account-deletion-reason-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountDeletionDialogOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleSubmitAccountDeletion} data-testid="submit-account-deletion-request">
              Silme Talebi Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
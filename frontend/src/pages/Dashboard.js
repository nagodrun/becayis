import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ListingCard } from '../components/ListingCard';
import { FileText, Send, Inbox, MessageSquare, Bell, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';

const Dashboard = () => {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [invitations, setInvitations] = useState({ sent: [], received: [] });
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Yüklüyor...</div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>Panel</h1>
          <p className="text-slate-600">Hoş geldiniz, {user?.profile?.display_name || user?.email}</p>
        </div>

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
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listings" data-testid="tab-listings">İlanlarım</TabsTrigger>
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
                  <Link key={conv.id} to={`/messages/${conv.id}`}>
                    <Card className="p-6 hover:shadow-lg transition-all cursor-pointer" data-testid="conversation-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-semibold">{conv.other_user?.display_name}</div>
                            <div className="text-sm text-slate-500">{conv.other_user?.institution}</div>
                            {conv.last_message && (
                              <div className="text-sm text-slate-400 mt-1">{conv.last_message.content?.substring(0, 50)}...</div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-slate-400">{conv.last_message && formatDate(conv.last_message.created_at)}</div>
                      </div>
                    </Card>
                  </Link>
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
                {notifications.map((notif) => (
                  <Card key={notif.id} className={`p-6 ${!notif.read ? 'bg-blue-50' : ''}`} data-testid="notification-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{notif.title}</div>
                        <div className="text-sm text-slate-600 mt-1">{notif.message}</div>
                        <div className="text-xs text-slate-400 mt-2">{formatDate(notif.created_at)}</div>
                      </div>
                      {!notif.read && <Badge className="bg-blue-600">Yeni</Badge>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
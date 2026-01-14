import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Briefcase, Building2, ArrowRight, Send } from 'lucide-react';
import { formatDate } from '../lib/utils';

// Mask name: "Ahmet Yılmaz" -> "A*** Y***"
const maskName = (name) => {
  if (!name) return 'Anonim';
  return name.split(' ').map(word => {
    if (word.length <= 1) return word;
    return word[0] + '*'.repeat(Math.min(word.length - 1, 3));
  }).join(' ');
};

export const ListingCard = ({ listing, onInvite, showInviteButton = true, showInviteForGuest = false }) => {
  const { profile, user_initials } = listing;
  const navigate = useNavigate();

  const handleGuestInvite = () => {
    navigate('/register');
  };

  // Get avatar URL or use initials
  const avatarUrl = profile?.avatar_url;
  const initials = user_initials || '??';
  const maskedName = maskName(profile?.display_name);

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all group relative overflow-hidden"
      data-testid="listing-card"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-blue-900/20" />
      
      <div className="relative">
        {listing.title && (
          <h3 className="text-lg font-bold text-foreground mb-3">{listing.title}</h3>
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Avatar with initials fallback */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden shadow-md">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={maskedName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">{initials}</span>
              )}
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {maskedName}
              </div>
              <div className="text-sm text-muted-foreground">{formatDate(listing.created_at)}</div>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
            {listing.status === 'active' ? 'Aktif' : 'Kapalı'}
          </Badge>
        </div>

        {/* Institution and Role side by side */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Building2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{listing.institution}</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{listing.role}</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">Şu Anki Konum</div>
              <div className="flex items-center text-sm font-medium text-foreground">
                <MapPin className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                {listing.current_province} / {listing.current_district}
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-amber-500 mx-4 flex-shrink-0" />
            
            <div className="flex-1 text-right">
              <div className="text-xs text-muted-foreground mb-1">Hedef Konum</div>
              <div className="flex items-center justify-end text-sm font-medium text-foreground">
                {listing.desired_province} / {listing.desired_district}
                <MapPin className="w-4 h-4 ml-1 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {listing.notes && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{listing.notes}</p>
        )}

        {showInviteButton && onInvite && (
          <Button
            onClick={() => onInvite(listing)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            data-testid="invite-button"
          >
            <Send className="w-4 h-4 mr-2" />
            Talep Gönder
          </Button>
        )}

        {showInviteForGuest && (
          <Button
            onClick={handleGuestInvite}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            data-testid="guest-invite-button"
          >
            <Send className="w-4 h-4 mr-2" />
            Talep Gönder
          </Button>
        )}
      </div>
    </Card>
  );
};

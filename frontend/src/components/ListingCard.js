import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Briefcase, Building2, ArrowRight } from 'lucide-react';
import { formatDate } from '../lib/utils';

export const ListingCard = ({ listing, onInvite, showInviteButton = true }) => {
  const { profile } = listing;

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all group relative overflow-hidden"
      data-testid="listing-card"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">
                {profile?.display_name || 'Anonim'}
              </div>
              <div className="text-sm text-slate-500">{formatDate(listing.created_at)}</div>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            {listing.status === 'active' ? 'Aktif' : 'Kapalı'}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-slate-600">
            <Building2 className="w-4 h-4 mr-2" />
            {listing.institution}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Briefcase className="w-4 h-4 mr-2" />
            {listing.role}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-slate-500 mb-1">Şu Anki Konum</div>
              <div className="flex items-center text-sm font-medium text-slate-900">
                <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                {listing.current_province} / {listing.current_district}
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-amber-500 mx-4 flex-shrink-0" />
            
            <div className="flex-1 text-right">
              <div className="text-xs text-slate-500 mb-1">Hedef Konum</div>
              <div className="flex items-center justify-end text-sm font-medium text-slate-900">
                {listing.desired_province} / {listing.desired_district}
                <MapPin className="w-4 h-4 ml-1 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {listing.notes && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{listing.notes}</p>
        )}

        {showInviteButton && onInvite && (
          <Button
            onClick={() => onInvite(listing)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            data-testid="invite-button"
          >
            Davet Gönder
          </Button>
        )}
      </div>
    </Card>
  );
};
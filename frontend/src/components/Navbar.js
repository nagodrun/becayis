import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Bell, User, LogOut, LayoutDashboard, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = React.useState(0);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Manrope' }}>
              Becayiş
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" data-testid="nav-dashboard-link">
                  <Button
                    variant={isActive('/dashboard') ? 'default' : 'ghost'}
                    className="hidden md:flex"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Panel
                  </Button>
                </Link>

                <Link to="/messages" data-testid="nav-messages-link">
                  <Button variant={isActive('/messages') ? 'default' : 'ghost'} className="relative">
                    <MessageSquare className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-500">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="user-menu-button">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="menu-profile">
                      <User className="w-4 h-4 mr-2" />
                      Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="menu-dashboard">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Panel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} data-testid="menu-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Çıkış Yap
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="nav-login-link">
                  <Button variant="ghost">Giriş Yap</Button>
                </Link>
                <Link to="/register" data-testid="nav-register-link">
                  <Button className="bg-slate-900 hover:bg-slate-800">Kayıt Ol</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
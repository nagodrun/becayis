# Becayiş - Kamu Çalışanları Yer Değişim Platformu

## Problem Statement
Build a production-ready web app MVP for a "Public Employee Location Swap" platform in Turkey. The platform allows public employees in the same role to find each other and mutually swap locations.

## Core Features

### Authentication
- Unique account per person, verified by government email domain (*.gov.tr)
- Registration: First Name, Last Name, Email, Password
- JWT-based authentication
- Email verification with OTP (currently mocked)
- Password strength validation (8+ chars, 1 uppercase, 1 special char)
- Caps Lock detection on password fields
- Forgot Password flow (mocked email)
- **Password visibility toggle (eye icon) on all password fields**

### User Dashboard
- Profile management with avatar upload
- Listings management (create, edit, request deletion)
- **Maximum 3 active listings per user**
- **District field is optional when creating listings**
- Invitations (sent/received) with delete functionality
- Conversations/Messages
- Notifications
- Security tab for password change
- **Scrollable tabs on mobile**
- **Admin notification banners** - Admin broadcast and private messages shown as blue banners at top of dashboard, dismissible to notifications tab

### Home Page & Listings
- Recent listings display
- Search bar with filters:
  - Text search (title/institution/position)
  - Position filter
  - Province filter (searches both current AND desired province)
- Dynamic "Most Listed Positions" and "Most Listed Institutions" sections
- Unregistered users redirected to registration when clicking "Talep Gönder"

### Listing Creation
- **Auto-generated title**: Current Province - Desired Province prefix added automatically on submit
- **Province/district names blocked** in title input field
- Helper text explains auto-generation
- Title max 45 chars, Notes max 140 chars
- No digits allowed in title/notes

### Swap Invitation System
- Profile completion required to send invitations
- **Position matching required** - Users can only send invitations to listings with same position
- Location mismatch warning when user's current province doesn't match listing's desired province
- Duplicate invitation prevention
- Rate limiting (10 invitations/day)
- Contact details revealed only after mutual acceptance

### Chat System
- WebSocket-based real-time messaging
- Conversation deletion with notification to other user
- User blocking functionality

### Admin Panel
- **Main Admin**: nuno@adalet.gov.tr (role: main_admin)
- **Regular Admin**: becayis (role: admin)
- User management (view, block/unblock, delete)
- **Send individual messages to users**
- Listing management
- **Listing Approval System** - New listings require admin approval
- Deletion request approval (listings and accounts)
- Platform statistics with reset functionality
- **Admin Management (Main Admin Only)**:
  - Create new admins (must use gov.tr email)
  - Delete other admins
  - Transfer main admin role (with password confirmation)
  - Change admin passwords (normal admin cannot change main admin password)
- **Profile Tab**: Edit display name, upload avatar
- **Bulk Notifications**: Send notifications to all users
- **Delete Notifications/Messages** (Main Admin Only): Can delete sent bulk notifications and private messages
- **Accepted Invitations Reset**: Clear counter in stats
- Caps Lock detection on admin login
- **Admin login error stays on admin page (no redirect to user login)**
- **Scrollable tabs on mobile**
- **Responsive admin action buttons**

### Scroll Behavior
- **Always scroll to top** on page navigation and refresh

## Tech Stack
- Frontend: React, TailwindCSS, Shadcn/UI
- Backend: FastAPI, Pydantic
- Database: MongoDB
- Real-time: WebSockets

## What's Implemented (January 2025)

### Latest Updates (Jan 17, 2025)
- [x] Admin notification banners on user dashboard
- [x] Scroll to top on all navigation (removed refresh retention)
- [x] Main admin can delete bulk notifications and private messages
- [x] Province names blocked in listing title field
- [x] Helper text for auto-generated title
- [x] Space key enabled in title input

### Previous Updates
- [x] Admin role management (main_admin vs admin)
- [x] Normal admin cannot change main admin password
- [x] Admin gov.tr email validation
- [x] Position matching for invitations
- [x] Listing approval workflow
- [x] User blocking by admin
- [x] Bulk notification system
- [x] Private messaging to users
- [x] Password visibility toggle
- [x] Mobile responsive tabs
- [x] 3 listing limit per user
- [x] District optional

## Mocked Features
- Email notifications (SendGrid planned)
- Real OTP verification (Twilio planned)
- SMS notifications

## API Endpoints

### Auth
- POST /api/auth/register/step1
- POST /api/auth/verify-email
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/request-account-deletion

### Profile
- GET/POST/PUT /api/profile
- POST/DELETE /api/profile/avatar

### Listings
- GET/POST /api/listings
- GET/PUT/DELETE /api/listings/{id}
- POST /api/listings/{id}/request-deletion

### Invitations
- GET/POST /api/invitations
- POST /api/invitations/respond
- DELETE /api/invitations/{id}

### Chat
- GET /api/conversations
- GET /api/conversations/{id}/messages
- POST /api/messages
- DELETE /api/conversations/{id}
- WebSocket: /ws/{token}

### Admin
- POST /api/admin/login
- GET /api/admin/users
- GET /api/admin/listings
- GET /api/admin/stats
- GET /api/admin/notifications (bulk notifications)
- DELETE /api/admin/notifications/{id}
- **GET /api/admin/user-messages** (private messages sent to users)
- **DELETE /api/admin/user-messages/{id}**
- POST /api/admin/users/{user_id}/message
- POST /api/admin/notifications/bulk

### Utility
- GET /api/provinces
- GET /api/districts/{province}
- GET /api/institutions
- GET /api/utility/positions
- GET /api/faq

## Backlog

### P1 - High Priority
- [ ] Email notifications (SendGrid integration)
- [ ] Real OTP verification (Twilio integration)

### P2 - Medium Priority
- [ ] Backend refactor (split server.py into modules)
- [ ] Mobile app conversion (React Native / PWA)

### P3 - Low Priority
- [ ] Analytics dashboard
- [ ] Export functionality
- [ ] Multi-language support

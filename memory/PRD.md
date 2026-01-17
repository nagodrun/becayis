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

### Home Page & Listings
- Recent listings display
- Search bar with filters:
  - Text search (title/institution/position)
  - Position filter
  - Province filter (searches both current AND desired province)
- Dynamic "Most Listed Positions" and "Most Listed Institutions" sections
- Unregistered users redirected to registration when clicking "Talep Gönder"

### Swap Invitation System
- Profile completion required to send invitations
- Location mismatch warning when user's current province doesn't match listing's desired province
- Duplicate invitation prevention
- Rate limiting (10 invitations/day)
- Contact details revealed only after mutual acceptance

### Chat System
- WebSocket-based real-time messaging
- Conversation deletion with notification to other user
- User blocking functionality

### Admin Panel
- **Main Admin**: nuno / Nuno1234! (role: main_admin)
- **Regular Admin**: becayis / 1234 (role: admin)
- User management (view, block/unblock, delete)
- **Send individual messages to users**
- Listing management
- **Listing Approval System** - New listings require admin approval
- Deletion request approval (listings and accounts)
- Platform statistics with reset functionality
- **Admin Management (Main Admin Only)**:
  - Create new admins
  - Delete other admins
  - Transfer main admin role (with password confirmation)
  - Change admin passwords
- **Profile Tab**: Edit display name, upload avatar
- **Bulk Notifications**: Send notifications to all users
- **Accepted Invitations Reset**: Clear counter in stats
- Caps Lock detection on admin login
- **Admin login error stays on admin page (no redirect to user login)**
- **Scrollable tabs on mobile**
- **Responsive admin action buttons**

### Listing Approval System
- New listings created with status `pending_approval`
- Admin can approve or reject listings
- User receives notification when listing is approved/rejected
- Rejection can include a reason message

### Blocked User Restrictions
- Admin-blocked users cannot send swap invitations
- Admin-blocked users cannot send messages
- Block status stored in user document (`blocked: true`)

### Searchable Dropdowns
- **Institution selection**: Searchable dropdown for public institutions
- **Position selection**: Searchable dropdown for job positions
- Search endpoints: `/api/institutions/search`, `/api/positions/search`

## Tech Stack
- Frontend: React, TailwindCSS, Shadcn/UI
- Backend: FastAPI, Pydantic
- Database: MongoDB
- Real-time: WebSockets

## What's Implemented (December 2025)

### UI/UX
- [x] Dark/light theme toggle
- [x] Responsive design (mobile-first)
- [x] FAQ section (single column, responsive)
- [x] Search section (responsive grid)
- [x] Listing cards with masked names
- [x] Profile avatar upload with preview
- [x] Province/District dynamic dropdowns
- [x] **Password visibility toggle on all password fields**
- [x] **Scrollable tabs on mobile (user & admin dashboards)**
- [x] **Responsive admin action buttons**

### Core Functionality
- [x] User registration with email verification (mocked)
- [x] User login/logout
- [x] **3 listing limit per user**
- [x] Profile CRUD
- [x] Listing CRUD with deletion requests
- [x] Invitation system with location matching warning
- [x] Real-time chat via WebSocket
- [x] User blocking
- [x] Admin panel with full moderation capabilities

### Recent Updates (Jan 2025)
- [x] FAQ dropdowns: Single column responsive layout
- [x] Search section: Full responsive grid (1/2/3 columns)
- [x] Province filter: Searches both current AND desired province
- [x] Invitation deletion: Local state update (no page refresh)
- [x] Location mismatch warning: Formal toast message when sending invitation

## Mocked Features
- Email notifications (SendGrid planned)
- Real OTP verification (Twilio planned)
- SMS notifications

## Backlog

### P1 - High Priority
- [ ] Email notifications (SendGrid integration)
- [ ] Real OTP verification (Twilio integration)

### P2 - Medium Priority
- [ ] Mobile app conversion (React Native / PWA)
- [ ] Push notifications
- [ ] Advanced search filters

### P3 - Low Priority
- [ ] Analytics dashboard
- [ ] Export functionality
- [ ] Multi-language support

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

### Utility
- GET /api/provinces
- GET /api/districts/{province}
- GET /api/institutions
- GET /api/utility/positions
- GET /api/faq

### Admin
- POST /api/admin/login
- GET /api/admin/users
- GET /api/admin/listings
- GET /api/admin/stats
- Various moderation endpoints

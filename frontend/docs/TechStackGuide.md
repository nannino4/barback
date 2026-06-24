# Barback Frontend - Technology Stack Guide

This document defines the technology choices, architectural patterns, and high-level implementation strategies for the Barback frontend. For detailed coding standards and code examples, see [CodingGuidelines.md](./CodingGuidelines.md).

## Project Overview

**Barback** is a mobile-first inventory management system for cocktail bars, targeting owners, managers, and staff in Rome/Italy. The application helps reduce waste, gain consumption insights, optimize ordering, and streamline inventory management.

**Frontend Type**: Single Page Application (SPA)  
**Design Philosophy**: Mobile-first responsive design  
**Target Users**: Bar owners, managers, bartenders  
**Key Features**: Auth, role-based access, inventory CRUD, real-time updates, notifications, analytics

## Core Technology Stack

### Build Tool & Framework
- **Vite**: Build tool using native ES modules for development, Rollup for production
- **React**: UI library with functional components and hooks
- **TypeScript**: Full type safety across the application
- **Target**: Modern browsers with ES2020+ support

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Copy-paste component system (NOT an npm dependency)
- **Radix UI Primitives**: Accessible, unstyled component primitives
- **Lucide React**: Icon library

### State Management
- **Client State**: Zustand for app-wide state (user, UI preferences, selected organization)
- **Server State**: TanStack Query (React Query) for API data, caching, background updates
- **Form State**: React Hook Form for performant form handling

### Validation & Forms
- **Zod**: TypeScript-first schema validation
- **React Hook Form**: Form library with minimal re-renders
- **@hookform/resolvers/zod**: Integration between RHF and Zod

### HTTP & API
- **Fetch API**: Native browser HTTP client
- **TanStack Query**: Wraps fetch with advanced caching and synchronization
- **Custom API Client**: Centralized request handling with auth token injection

### Routing & Navigation
- **React Router**: Client-side routing
- **Protected Routes**: Role-based route protection

### Notifications & UX
- **React Hot Toast**: Lightweight toast notifications
- **Loading States**: Built into TanStack Query
- **Error Boundaries**: React error handling

### Internationalization (i18n)
- **react-i18next**: React integration for internationalization
- **i18next**: Core internationalization framework
- **i18next-browser-languagedetector**: Automatic language detection
- **Languages**: Italian (default) and English
- **Preference Source**: `user.language` from backend user profile (persisted per account)
- **Features**: Language switching, persisted account preference, validation message localization

## Project Structure

```
src/
├── api/                 # API client and hooks
├── components/
│   ├── ui/              # shadcn/ui components (Button, Dialog, Card, etc.)
│   ├── features/        # Feature-specific components
│   └── layout/          # Header, Sidebar, AppShell
├── hooks/               # Custom React hooks
├── lib/
│   └── utils.ts         # General utilities (cn, formatters)
├── pages/               # Route components
├── stores/              # Zustand stores
├── validation/          # Zod schemas for forms and data
└── types/               # TypeScript type definitions
```

## Key Architectural Patterns

### Data Flow Architecture
1. **Server Data**: Components → TanStack Query hooks → API client → Backend
2. **Client Data**: Components → Zustand stores → Other components
3. **Forms**: React Hook Form → Zod validation → TanStack Query mutations

### Component Architecture Patterns
- **Compound Components**: For complex UI (Dialog, DropdownMenu)
- **Custom Hooks**: For business logic reuse and API operations
- **Render Props**: For flexible component composition
- **Error Boundaries**: For graceful error handling

## shadcn Implementation Strategy

### Installation and Setup
shadcn components are copied directly into the codebase rather than installed as npm dependencies. This provides full customization control.

**Key Commands:**
```bash
npx shadcn@latest init
npx shadcn@latest add button dialog card data-table form input select
```

### Usage Philosophy
Components are copied to `src/components/ui/` and become part of your codebase. They're styled with Tailwind CSS and fully customizable since they're not external dependencies.

## Implementation Guidelines

### Component Development
1. **Start with shadcn components** when possible for consistency
2. **Create feature-specific components** in appropriate feature folders
3. **Use TypeScript interfaces** for all props and data structures
4. **Implement error boundaries** for robust error handling
5. **Add loading states** for all async operations

### API Integration Strategy
1. **Use TanStack Query** for all server state management
2. **Implement optimistic updates** for better user experience
3. **Handle loading and error states** consistently across the app
4. **Use proper cache invalidation** after mutations

### Styling Approach
1. **Use Tailwind utility classes** as the primary styling method
2. **Leverage shadcn/ui components** for consistent design system
3. **Create custom variants** by modifying shadcn/ui components
4. **Use CSS custom properties** for theming and dynamic styles

## Deployment & Infrastructure

This section defines the MVP deployment approach for the Barback frontend and its supporting infrastructure.

### Hosting Strategy (Single EC2)
- **Single EC2 instance** runs:
  - **Nginx** (TLS termination + reverse proxy)
  - **Backend** (Docker container)
  - **Frontend** (static build served by Nginx)
- **Backend URL**: https://[domain]/api
- **Frontend URL**: https://[domain]

### Assets (Images)
- **Storage**: AWS S3
- **CDN**: AWS CloudFront (single distribution for images)
- **Access**: Public read via CloudFront distribution (S3 bucket private with Origin Access Control)

### DNS (Route 53)
Create or update the following records:
- **A/AAAA Alias** for apex domain → EC2 Elastic IP
- **CNAME** for www → apex domain (optional)
- **A/AAAA Alias** for assets subdomain → CloudFront distribution (images)

### SSL Certificates
- **Nginx on EC2** should terminate TLS for https://[domain]
- Recommended: **Let’s Encrypt (certbot)** for free certificates and automated renewal
- **CloudFront** (assets) requires ACM certificates in **us-east-1**

### CI/CD (Dev Environment)
- **Runner**: local development/AI-agent machine (no GitHub Actions)
- **Container registry**: Docker Hub
- **Deployment target**: single EC2 host (Nginx + frontend + backend)
- **Deploy flow**: run local shell-script validation → build/push Docker images with plain `docker build` → trigger EC2 deploy script over SSH or run it manually on EC2

For full implementation details, see:
- [./CICD.md](./CICD.md)
- [./CodingGuidelines.md](./CodingGuidelines.md)

### Secrets Management
- **Never** store secrets in the frontend build output
- Backend secrets (JWT, OAuth, SMTP, etc.) should be stored in **EC2 environment variables** (via docker-compose)

### Free Tier Guidance (MVP)
- **EC2**: Use a free-tier eligible instance (t3.micro or t2.micro)
- **MongoDB Atlas**: Free tier cluster
- **S3 + CloudFront**: Minimal costs for low traffic
- **Let’s Encrypt**: Free certificates

## Environment-specific Setup

### Local
- **Frontend**: Vite dev server (https://barback.it:5173)
- **Backend**: Local NestJS dev server (http://localhost:3000)
- **DB**: MongoDB Atlas (free tier)
- **TLS**: Local certificates
- **Networking**: /etc/hosts entry for barback.it → 127.0.0.1

### Dev (Single EC2)
- **Nginx**: EC2 (reverse proxy + static hosting)
- **Frontend**: Static build files copied from a frontend Docker image and served by Nginx
- **Backend**: Docker image on the same EC2 instance
- **DB**: MongoDB Atlas (same as local)
- **TLS termination**: Nginx
- **Certificates**: Let’s Encrypt + certbot in Docker (automatic renewal via a `certbot` service)
- **Initial issuance**: Run a one-off `certbot-init` service to create the first certificates

### Prod (TBD)
- Skip for now. Define when scaling or compliance requirements change.

# Barback - Product Definition

This document outlines the product vision, target users, and feature roadmap for Barback, a comprehensive inventory management solution tailored for cocktail bars.

## MVP Stage

### Target Users
- **User Profile**: Cocktail bar owners, managers, bartenders in Rome/Italy using manual inventory systems
- **Value Proposition**: 
  - **Owners**: Reduce waste, gain consumption insights, optimize ordering, identify sitting stock
  - **Managers**: Real-time stock visibility, improve staff communication, automated low stock reminders, faster inventory accounting
  - **Staff**: Faster inventory accounting

### Features

#### Auth
- Registration and login via
  - Google
  - email/password
    - Password reset via email
    - Email verification
- Role-based access (Owner, Manager, Staff)

#### Subscriptions
- Each user can activate subscriptions backed by Stripe.
- For each active or trialing subscription, a user can create one organization of which they are owner.
- The first subscription for a user starts with a 90-day frictionless free trial, without requiring a payment method up front.
- Users can add multiple payment methods to their account and choose which one is used for each organization subscription.
- Users can set a customer-level default payment method for future billing and new subscriptions.
- If a trial ends without a valid payment method, the subscription is paused and access is gated until the owner assigns a payment method and reactivates it.
- Before reactivating a paused subscription, the app shows the amount due now and the recurring billing period.
- Subscriptions renew automatically when a valid payment method is available.
- Personal payment settings should allow users to manage saved payment methods without using Stripe Customer Portal.

#### Organizations
- Single inventory management per organization
- Each owner has one organization per subscription
- Organization owners and managers can invite users via email
- Invited users receive email invitations with accept/decline options
- Invitations can be revoked by the inviter before acceptance
- Users can accept or refuse invitations after completing registration
- Users can view organizations they're invited to and part of

#### Inventory
- Create/edit/remove products with name, category, unit, par level, current quantity
- Manual stock adjustments with reason codes via inventory logs
- Real-time stock level display
- Generate inventory reports by date range or by specific date

#### Alerts
- Low stock alerts with user-defined thresholds

#### Notifications
- Email/Push notifications
- Time based reminders

#### Analytics
- Consumption by time period, category, product

## Growth Stage

### Target Users
- **User Profile**: Scaling bar operations seeking operational efficiency and cost optimization
- **Value Proposition**: Automate ordering, optimize profit through recipe management, simplify staff management

### Features

#### POS Integration
- Connect Square, Toast, Resy POS systems
- Auto-deduct inventory based on sales data
- Forecast demand using historical sales patterns

#### Suppliers
- Supplier database with contact info and product catalogs
- Create order templates with preferred suppliers
- Auto-generate orders when stock hits reorder point
- Order history tracking with delivery confirmations

#### Recipes
- Create cocktail recipes with ingredient quantities
- Auto-calculate recipe costs based on current inventory prices
- Profit margin analysis per cocktail
- Auto-deduct ingredients when drinks are recorded

#### Staff Management
- Shift scheduling with role assignments
- Opening/closing checklists with task verification
- Staff performance tracking for inventory accuracy
- Task assignment with completion deadlines

## Advanced Stage

### Target Users
- **User Profile**: Large bar operations and restaurant groups requiring enterprise-level features
- **Value Proposition**: AI-driven optimization, complete business management, marketplace access

### Features

#### AI Analytics
- Predictive ordering based on weather, events, seasonality
- Anomaly detection for theft or waste patterns
- Customer preference correlation with inventory needs
- Automated seasonal menu recommendations

#### Scanning
- Barcode/QR scanning for instant inventory updates
- Mobile app for off-site inventory checks
- Auto-recognize products via image scanning
- Generate/print shelf labels with QR codes

#### Customer Management
- Customer database with order history
- Event booking and inventory planning
- Reservation system integration
- Customer preference tracking for targeted promotions

#### Finance
- Monthly budget planning with variance reports
- Tax reporting with category breakdowns
- QuickBooks/Xero accounting integration
- Credit card processing for supplier payments

#### Marketplace
- Browse vetted suppliers with negotiated platform rates
- Discover trending products by region
- Bulk purchasing coordination with other platform users
- Marketing campaign management for product launches

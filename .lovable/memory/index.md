# Project Memory

## Core
- Theme: Premium fitness, Black (#0A0A0A) & Gold. Minimalist.
- Typography: Oswald (headings), Inter (body). Never serif.
- Tone: Premium. Use 'clientes' (not alunos) and 'Experiência' (not Autoridade).
- Stack: React, Tailwind, Supabase (Auth/RLS/Storage), Stripe (Live).
- Admin: guisantannna@gmail.com. Entry via footer link.
- Auth: Immediate login post-registration (email confirmation disabled).
- Forms: Generate UUID on client-side before inserting for RLS linking.

## Memories
- [Visual Identity](mem://style/visual-identity) — Logos, background opacity, mobile framing, premium styling
- [Landing Page](mem://features/landing-page) — 8-section structure, Hero layout and copywriting
- [Typography](mem://style/typography) — Font families for titles (Oswald) and body (Inter)
- [Communication Tone](mem://style/communication-tone) — Premium terminology, WhatsApp for feedback
- [Tech Stack](mem://tech/stack) — Core libraries, jsPDF, canvas, and RBAC implementation
- [Checkout Workflow](mem://tech/checkout-workflow) — Stripe Live, separate Price IDs for Diet/Training
- [Pricing Strategy](mem://business/pricing-strategy) — Dynamic pricing selectors, period options, multiple selections
- [Application Form](mem://features/application-form) — Anamnesis form, UUID generation, session verification
- [Admin Dashboard](mem://features/admin-dashboard) — Client view replication, visual alerts for renewals
- [Navigation Flow](mem://features/navigation-flow) — Smooth scroll to form before checkout
- [Equipment Preferences](mem://style/equipment-preferences) — Hammer Strength machines preferred for visuals
- [Plan Attribution](mem://features/plan-attribution) — Stripe Price IDs logic for resolving active plans
- [Admin Access](mem://auth/admin-access) — Admin login routing and role check
- [Client Area](mem://features/client-area) — Section order, photo limits, protocol history
- [Evolution Tracking](mem://features/evolution-tracking) — Canvas API for high-quality PNG exports
- [Authentication Flow](mem://auth/authentication-flow) — Immediate login configuration in Supabase
- [Protocol Structure](mem://features/protocol-structure) — Bulking/Hypertrophy templates and sections
- [Auto Recovery](mem://tech/reliability/auto-recovery) — Error boundaries and cache-busting for Vite chunks
- [Storage Policies](mem://tech/storage-policies) — Supabase buckets for photos, protocols, and evolution
- [Client Area Auth](mem://tech/reliability/client-area-auth) — State cleanup on logout or unauthenticated access
- [Plan Renewal](mem://features/plan-renewal) — Dynamic pricing modal for renewals via Edge Function
- [Plan Activation Logic](mem://tech/plan-activation-logic) — Edge function for date accumulation on renewals
- [Check-in System](mem://features/check-in-system) — Satisfaction scale and feedback integration
- [Protocol Header Layout](mem://features/protocol/header-layout) — PDF and UI header metadata extraction
- [Data Isolation](mem://tech/security/data-isolation) — LocalStorage cleanup for shared devices
- [Dashboard Data Typing](mem://tech/dashboard-data-typing) — ClientFormData strict typing for JSONB
- [Error Handling](mem://ux/error-handling-feedback) — Toast notifications for critical flows
- [Security Posture](mem://tech/security/posture) — RLS policies for anonymous form submissions
- [Performance Optimization](mem://tech/performance-optimization) — OffscreenCanvas compression and webp assets
- [Analytics Tracking](mem://marketing/analytics-tracking) — Meta Pixel, Google Tag, and E-commerce events
- [PDF Export Flow](mem://tech/features/protocol/pdf-export-flow) — jsPDF/html2canvas scaling and smart row breaking
- [Checkout USD](mem://features/checkout-usd) — International routing and USD pricing structure
- [Coach Credentials](mem://business/coach-credentials) — Metrics for social proof (15x Champion, 500+ athletes)
- [PWA Implementation](mem://features/pwa-implementation) — PWA config, Stale-While-Revalidate, Splash Screens
- [PWA Onboarding](mem://features/pwa-onboarding) — iOS install instructions and banner logic
- [Training Log](mem://features/training-log) — Interactive training table for clients to log weights, reps, difficulty

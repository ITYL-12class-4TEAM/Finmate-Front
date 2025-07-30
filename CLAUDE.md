# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Vite dev server with hot reload
- **Build**: `npm run build` - Creates production build using Vite
- **Preview**: `npm run preview` - Preview production build locally

## Project Architecture

This is a Vue 3 + Vite project for a financial application called "Finmate" focused on financial product recommendations and investment personality assessment (WMTI).

### Core Technology Stack
- **Frontend**: Vue 3 with Composition API (`<script setup>`)
- **Build Tool**: Vite with `@vitejs/plugin-vue` 
- **State Management**: Pinia stores
- **Routing**: Vue Router 4 with lazy loading
- **Styling**: Bootstrap 5 + custom CSS
- **HTTP Client**: Axios with interceptors
- **Charts**: Chart.js + vue-chartjs

### Key Architecture Patterns

**Layout System**:
- `LayoutDefault.vue` - Main app layout with Navbar and FloatingMenu
- `WMTILayout.vue` - Specialized layout for WMTI survey flows
- Route-specific layouts for login, products, community sections

**State Management Structure**:
- Pinia stores follow `use[Domain]Store.js` naming pattern
- Key stores: `useWMTIStore`, `useAuthStore`, `useProductStore`, `useCommunityStore`
- Stores manage domain-specific state and business logic

**API Architecture**:
- Centralized API configuration in `src/api/index.js`
- Domain-specific API modules (e.g., `wmti.js`)
- Axios interceptor automatically adds Bearer token from localStorage
- Proxy setup for backend at `localhost:8080` via `/api` prefix

**Component Organization**:
```
components/
├── common/     # Reusable UI components (Modal, Button, ChatWindow)
├── layouts/    # Navigation components (Navbar, MobileMenu)
└── wmti/       # Domain-specific components
```

**Routing Structure**:
- Nested routes with lazy loading for code splitting
- Parent layouts with child route rendering
- Extensive use of route guards and meta fields (commented out routes suggest future features)

### Key Features & Domains

**WMTI (Investment Personality Assessment)**:
- Multi-step survey flow with routing through `/wmti/*`
- Dedicated store and API endpoints for questionnaire and results
- Custom layout and question components

**Financial Products**:
- Product browsing for deposits, pensions (funds, loans, insurance planned)
- Structured under `/products/*` with shared layout

**User Management**:
- Authentication flow with dedicated login layout
- MyPage with favorites and portfolio management (many features planned)

## Development Notes

**Proxy Configuration**: Backend API calls are proxied through Vite dev server to `localhost:8080`

**Path Aliases**: `@` alias configured for `./src` directory

**Environment Variables**: API base URL configurable via `VITE_API_BASE_URL`

**Component Patterns**: Extensive use of Vue 3 Composition API with `<script setup>` syntax throughout
# TAARUNYAM 2025

A modern, high-performance React application for managing the TAARUNYAM 2025 technology championship. Converted from a vanilla HTML/JS monolith into a production-ready React 18 + TypeScript + Vite project.

## Features

- **Pixel-Perfect UI**: Exactly matches the original design with Tailwind CSS and custom animations.
- **Django-Ready**: A strictly typed API service layer ready to connect to a Django REST Framework backend.
- **Admin Dashboard**: Comprehensive admin panel for managing participants, events, certificates, and site content.
- **Certificate Generation**: Client-side PDF generation using `html2canvas` and `jsPDF`.
- **Advanced Export**: Professional PDF report generation with `jsPDF-autotable`.
- **QR Code Verification**: Built-in QR scanner and manual verification system for certificates.

## Tech Stack

- **Framework**: React 18, Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand
- **Routing**: React Router v6
- **Data Fetching**: Axios, React Query
- **Forms**: React Hook Form, Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

The output will be in the `dist/` directory.

## Environment Variables

Copy `.env.example` to `.env` and configure as needed:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_SITE_DOMAIN=https://taarunyam.com
VITE_USE_MOCK=true
```

# Tuniwave App

A full-stack web application built with React, Vite, Express, and Firebase.

## Features
- Real-time News and Sports updates
- Radio and Live TV Portal
- Multi-language support (English, French, Arabic)
- User Authentication and Profile management
- SEO optimized with Sitemap generation

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn

## Getting Started

1. **Clone or Download** the repository.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your `GEMINI_API_KEY`.
   ```env
   GEMINI_API_KEY=your_key_here
   ```
4. **Firebase Configuration**:
   The app uses `firebase-applet-config.json` for Firebase settings. Ensure this file is present or configure your own Firebase project.
5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
6. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## Project Structure
- `/src`: Frontend React application
- `server.ts`: Express backend server
- `firestore.rules`: Security rules for the database
- `firebase-blueprint.json`: Data model documentation

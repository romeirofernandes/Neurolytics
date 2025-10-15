<div align="center">

# Team Cotton — Web-Based Experiment Platform

[![Experiment Platform](https://img.shields.io/badge/Experiment%20Platform-Online-6c5ce7?style=for-the-badge&logo=github&logoColor=white)](https://github.com/BnB-25-Final-Round/Team-Cotton_Final-Round_31)
[![BitNBuild-2025](https://img.shields.io/badge/BitNBuild-2025-4ecdc4?style=for-the-badge&logo=trophy)](https://github.com/BnB-25-Final-Round/Team-Cotton_Final-Round_31)
[![Team Cotton](https://img.shields.io/badge/Team-Cotton-95e1d3?style=for-the-badge&logo=team)](https://github.com/BnB-25-Final-Round/Team-Cotton_Final-Round_31)

</div>

---

## Technology Stack

<div align="center">

![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-4.x-646cff?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Radix UI](https://img.shields.io/badge/Radix-UI-111827?style=for-the-badge&logo=radix-ui&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

## Overview

This repository contains a web-based experiment platform built by Team Cotton for BitNBuild 2025. The platform is a no-code/low-code research tool that enables researchers to design, deploy, and collect behavioral experiments online with high-precision timing, visual experiment builder, and secure data handling.

Repository structure (high level):

```
Team-Cotton_Final-Round_31/
├── backend/        # Node.js + Express API, experiment models, and controllers
├── frontend/       # React + Vite admin dashboard / experiment UI
└── README.md       # <-- you are here
```

### Key Features

- High-precision timing engine for stimulus and response measurement
- Visual experiment builder (no-code/low-code) in the frontend
- Secure & anonymous data handling and storage
- Support for audio/voice responses, experiments templates, and analytics

## Quick Start

These instructions will get a local copy running for development and testing.

### Prerequisites

- Node.js v18+ and npm
- MongoDB (local or Atlas)
- Firebase project (for authentication/service account)
- Optional: Cloudinary (uploads), Twilio (voice & SMS)

### Backend (API)

1. Open a terminal and install dependencies:

```powershell
cd backend
npm install
```

2. Create a `.env` file in `backend/` with the following variables (examples):

```
PORT=8000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

3. Start the backend server in development mode:

```powershell
npm run dev
```

The server entry point is `backend/server.js`.

### Frontend (Admin / Experiment UI)

1. Install dependencies and run the dev server:

```powershell
cd frontend
npm install
npm run dev
```

2. The frontend uses Vite and the React sources are in `frontend/src/`.

## Project details & notable files

- backend/server.js — Express app, middleware, and route mounting
- backend/controllers/ — request handlers for experiments, users, participants, and analysis
- backend/models/ — Mongoose models for Experiment, Participant, User, ConsentForm, etc.
- backend/routes/ — route definitions grouping APIs
- frontend/src/ — React app; main pages and components for building and running experiments
- frontend/public/models/ — pre-trained face and landmark detection models used by the participant-facing UI
- frontend/utils/jsPsychConverter.js — utilities for converting experiment definitions to jsPsych format

## API Endpoints (selected)

Below are common endpoints found in the `backend/routes` folder. Use these as examples; consult the route files for the complete list and exact payloads.

Authentication & Users:

```
POST /api/user/register
POST /api/user/login
GET  /api/user/profile
```

Experiment management:

```
GET  /api/experiments/public
POST /api/experiments          # create
GET  /api/experiments/:id     # read
PUT  /api/experiments/:id     # update
DELETE /api/experiments/:id   # delete
```

Participants & data:

```
POST /api/participants        # create participant record
GET  /api/participants/:id    # fetch participant data
POST /api/voice-responses     # upload voice response
```

Analysis & RAG:

```
POST /api/analysis/run        # run analysis pipeline / RAG helpers
```

Note: the actual route paths may vary slightly — inspect files under `backend/routes/` for the definitive routes.

## Environment Config & Secrets

We recommend creating a `.env.example` file with all required variables (without secrets) and committing that to the repo. Keep real secrets out of source control and use a secrets manager in production (Railway, Render, Vercel secrets, or GitHub Actions secrets).

## Running Tests

If present, run tests with the scripts in each package. Example:

```powershell
cd backend
npm test

cd ../frontend
npm test
```

## Deployment

Backend: any Node.js host such as Railway, Render, Heroku, or AWS Elastic Beanstalk. Configure environment variables and set the start script to `node server.js` or build output as needed.

Frontend: Vercel or Netlify recommended. Build with `npm run build` and deploy the `dist` or `build` folder.

## Next steps (suggested)

- Add `.env.example` to both `backend/` and `frontend/` with placeholders
- Add API documentation (Swagger / OpenAPI) under `backend/docs`
- Add CI (GitHub Actions) to run lint and tests on PRs

## Support

For support or questions, open an issue in this repository or reach out to the team email (teamcotton@bnb2025.com).

---

## 👥 Team Cotton
**Built with ❤️ by Team Cotton for BitNBuild 2025**
**Team Members:**
- **Romeiro Fernandes** - [GitHub](https://github.com/romeirofernandes)
- **Russel Daniel Paul** - [GitHub](https://github.com/wrestle-R)
- **Aditya Dabreo** - [GitHub](https://github.com/Adityadab10)
- **Gavin Soares** - [GitHub](https://github.com/gavin100305)


<div align="center">

---

[![GitHub Stars](https://img.shields.io/github/stars/BnB-25-Final-Round/Team-Cotton_Final-Round_31?style=social&cacheSeconds=60)](https://github.com/BnB-25-Final-Round/Team-Cotton_Final-Round_31/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/BnB-25-Final-Round/Team-Cotton_Final-Round_31?style=social)](https://github.com/BnB-25-Final-Round/Team-Cotton_Final-Round_31/network/members)

</div>
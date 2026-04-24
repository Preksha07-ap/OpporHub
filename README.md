# 🌟 OpporHub: The Ultimate Opportunity Discovery Platform

**OpporHub** is a high-performance, premium web platform designed to bridge the gap between ambitious students and world-class opportunities. From hackathons and workshops to internships and open-source contributions, OpporHub aggregates and organizes the tech ecosystem into a single, intuitive discovery engine.

![OpporHub Banner](https://img.shields.io/badge/OpporHub-Premium_Discovery-8A9A5B?style=for-the-badge&logo=rocket)

---

## 🚀 Key Features

### 🎓 For Students
- **Smart Discovery**: Filters for Conferences, Workshops, Internships, and Hackathons.
- **Personalized Dashboard**: Track applications, save opportunities for later, and view progress.
- **AI-Powered Search**: Quickly find the most relevant events using advanced search capabilities.
- **Interactive UI**: Fluid animations and glassmorphic designs for a premium experience.

### 🏢 For Organizers
- **Opportunity Management**: Post new events with rich metadata (tags, perks, duration, etc.).
- **Real-time Analytics**: Track event performance, views, and application counts.
- **Verified Profiles**: Build trust with a dedicated organizer profile and verification badges.
- **Draft & Expiry System**: Manage the lifecycle of your posted opportunities effortlessly.

### 🛡️ For Admins
- **Approval Queue**: Review and approve/reject scraped or user-submitted events before they go live.
- **System Health**: Monitor platform-wide metrics and user activity.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, TailwindCSS (for layout) & Vanilla CSS (for premium aesthetics).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Atlas) with Mongoose ODM.
- **Authentication**: JWT-based Secure Authentication with Role-Based Access Control (RBAC).
- **Animations**: Framer Motion for smooth transitions.
- **Icons**: Lucide React for consistent, high-quality iconography.
- **Media**: Cloudinary integration for seamless image and asset management.

---

## 📂 Project Structure

```text
OpporHub/
├── frontend/           # React + Vite Frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth and Theme contexts
│   │   ├── pages/      # Student, Organizer, and Admin views
│   │   └── api/        # Axios service layers
├── backend/            # Express.js Server
│   ├── src/
│   │   ├── controllers/# Business logic
│   │   ├── models/     # Mongoose Schemas
│   │   ├── routes/     # API Endpoints
│   │   └── middleware/ # Auth & Error handling
└── README.md           # You are here!
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Cloudinary account (for image uploads)

### 1. Clone the repository
```bash
git clone https://github.com/Preksha07-ap/OpporHub.git
cd OpporHub
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

---

## 🗺️ Roadmap
- [ ] **AI Recommendation Engine**: Personalized opportunity feeds based on student skill sets.
- [ ] **Mobile App**: Dedicated iOS and Android versions using React Native.
- [ ] **Community Chat**: Real-time networking between students and mentors.
- [ ] **Certificate Verification**: Blockchain-based verification for workshop completions.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Developed with ❤️ by the **OpporHub Team**.

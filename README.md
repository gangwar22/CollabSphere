# 🌐 CollabSphere – AI Powered Developer Collaboration Platform

CollabSphere is a comprehensive full-stack platform designed for modern development teams to collaborate efficiently, manage documentation, and leverage the power of **Google Gemini AI**. Whether you're building a side project or a large-scale application, CollabSphere provides the tools to streamline your workflow.

---

## ✨ Features

### 🚀 Project Management
- **Centralized Dashboard**: Manage multiple projects from a single interface.
- **Role-Based Access**: Securely add team members and manage collaborators.
- **Privacy Controls**: Switch between private team projects and public read-only shares.

### 🤖 AI-Powered Intelligence (Powered by Gemini)
- **Smart Explanations**: Instantly understand complex code snippets or technical notes.
- **Automated Documentation**: Generate JSDoc/Markdown documentation from your code.
- **README Generator**: Effortlessly create professional README files based on project descriptions.
- **Content Assistance**: AI-driven suggestions for your documentation.

### 📝 Documentation & Knowledge Base
- **Rich Markdown Editor**: Integrated `SimpleMDE` for seamless note-taking.
- **Live Previews**: See your documentation formatted in real-time.
- **Structured Notes**: Organize project-specific knowledge bases.

### 📊 Team Analytics & Collaboration
- **Activity Tracking**: Monitor contributions and team engagement.
- **Visual Leaderboard**: Gamification of development tasks via activity analytics.
- **Real-time Updates**: Stay synced with your team's latest changes.

### 📁 Advanced File Management
- **Secure Uploads**: Support for Images, PDFs, and Text files.
- **Cloud Integration**: Cloudinary-powered media storage.
- **Project Context**: Attach relevant assets directly to your projects.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React.js](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Editor**: [SimpleMDE](https://simplemde.com/) / `react-simplemde-editor`
- **Routing**: [React Router DOM](https://reactrouter.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Mongoose ODM)
- **Authentication**: JWT & Bcryptjs
- **AI Integration**: [Google Gemini Pro API](https://ai.google.dev/)
- **File Handling**: Multer & Cloudinary

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm / yarn
- MongoDB Atlas Account
- Google AI Studio (Gemini) API Key

### 1. Clone & Install
```bash
git clone <repository-url>
cd collabsphere

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run the Application
**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run dev
```

---

## 🛣️ API Endpoints Summary

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | `POST` | User authentication |
| **Projects** | `/api/projects` | `POST` | Create a new project |
| **Notes** | `/api/notes/:id` | `GET` | Fetch project documentation |
| **Gemini AI** | `/api/gemini/explain`| `POST` | AI Code/Note explanation |
| **Files** | `/api/files/upload` | `POST` | Upload project assets |
| **Analytics** | `/api/analytics/:id` | `GET` | Team contribution stats |

---

## 📸 Screenshots & Demo (Optional)
*Add your project screenshots here to make it more appealing!*

---

## 🛡️ License
This project is licensed under the **ISC License**.

## 👨‍💻 Author
**Rahul Gangwar**
- [GitHub](https://github.com/rahulgangwar)
- [LinkedIn](https://linkedin.com/in/rahulgangwar)

Built with ❤️ for the Developer Community.


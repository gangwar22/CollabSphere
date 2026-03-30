import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import PublicProject from './pages/PublicProject';
import AdminDashboard from './pages/AdminDashboard';
import OAuthSuccess from './pages/OAuthSuccess';
import Navbar from './components/Navbar';
import { ToastProvider } from './context/ToastContext';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const ProtectedRoute = ({ children }) => {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!localStorage.getItem('token')) {
            return <Navigate to="/login" />;
        }
        // Redirect admins away from user dashboard to admin panel
        if (userInfo && (userInfo.isAdmin || userInfo.role === 'admin')) {
            return <Navigate to="/admin" />;
        }
        return children;
    };

    const AdminRoute = ({ children }) => {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || (!userInfo.isAdmin && userInfo.role !== 'admin')) {
            return <Navigate to="/dashboard" />;
        }
        return children;
    };

    return (
        <ToastProvider>
            <Router>
                <div className="min-h-screen bg-dark-bg text-dark-text">
                    <Navbar user={user} setUser={setUser} />
                    <main className="container mx-auto px-4 py-8">
                        <Routes>
                            <Route path="/login" element={<Login setUser={setUser} />} />
                            <Route path="/register" element={<Register setUser={setUser} />} />
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard user={user} /></ProtectedRoute>} />
                            <Route path="/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
                            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                            <Route path="/public/:id" element={<PublicProject />} />
                            <Route path="/oauth-success" element={<OAuthSuccess />} />
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </ToastProvider>
    );
}

export default App;

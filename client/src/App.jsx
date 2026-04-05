import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { API_URL } from './config';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import PublicProject from './pages/PublicProject';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import OAuthSuccess from './pages/OAuthSuccess';
import Navbar from './components/Navbar';
import { ToastProvider } from './context/ToastContext';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        // Always check profile if we have a token, to ensure it's still valid
        if (token) {
            const fetchProfile = async () => {
                try {
                    const response = await fetch(`${API_URL}/users/profile`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const data = await response.json();
                    
                    if (response.ok) {
                        localStorage.setItem('user', JSON.stringify(data));
                        setUser(data);
                    } else {
                        // If token is invalid, clear everything
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                } catch (err) {
                    console.error('Failed to verify session', err);
                    // If network fails but we have a saved user, we can keep it as a fallback
                    // but usually, it's better to stay safe
                    if (savedUser) {
                        try {
                            setUser(JSON.parse(savedUser));
                        } catch (e) {
                            setUser(null);
                        }
                    }
                }
            };
            fetchProfile();
        } else {
            // No token, no user
            setUser(null);
            localStorage.removeItem('user');
        }
    }, []);

    const ProtectedRoute = ({ children }) => {
        let userInfo = null;
        try {
            userInfo = JSON.parse(localStorage.getItem('user'));
        } catch (e) {
            console.error('Failed to parse user data', e);
        }
        
        if (!localStorage.getItem('token')) {
            return <Navigate to="/login" />;
        }
        return children;
    };

    const AdminRoute = ({ children }) => {
        let userInfo = null;
        try {
            userInfo = JSON.parse(localStorage.getItem('user'));
        } catch (e) {
            console.error('Failed to parse user data', e);
        }

        if (!localStorage.getItem('token')) {
            return <Navigate to="/login" />;
        }
        
        if (userInfo?.role !== 'admin' && !userInfo?.isAdmin) {
            return <Navigate to="/dashboard" />;
        }
        
        return children;
    };

    return (
        <ToastProvider>
            <Router>
                <div className="min-h-screen bg-dark-bg text-dark-text">
                    <Navbar user={user} setUser={setUser} />
                    <main className="min-h-[calc(100vh-3.5rem)] py-8">
                        <Routes>
                            <Route path="/login" element={<Login setUser={setUser} />} />
                            <Route path="/register" element={<Register setUser={setUser} />} />
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard user={user} /></ProtectedRoute>} />
                            <Route path="/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
                            <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
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

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse saved user', e);
                localStorage.removeItem('user');
            }
        } else if (token) {
            // Fetch profile if token exists but no user info
            const fetchProfile = async () => {
                try {
                    const response = await fetch('http://localhost:5000/api/users/profile', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const data = await response.json();
                    if (response.ok) {
                        localStorage.setItem('user', JSON.stringify(data));
                        setUser(data);
                    } else {
                        localStorage.removeItem('token');
                    }
                } catch (err) {
                    console.error('Failed to fetch profile', err);
                }
            };
            fetchProfile();
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

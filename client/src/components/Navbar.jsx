import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, LogOut, Code, User as UserIcon } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        addToast('Logged out successfully', 'info');
        navigate('/login');
    };

    return (
        <nav className="border-b border-dark-border bg-dark-card sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2 text-primary-500 font-bold text-xl">
                    <Code size={32} />
                    <span>CollabSphere</span>
                </Link>

                <div className="flex items-center space-x-6">
                    {user ? (
                        <>
                            {(user.isAdmin || user.role === 'admin') ? (
                                <Link to="/admin" className="text-primary-500 font-bold hover:text-primary-400 transition-colors mr-4 border-b-2 border-primary-500 pb-1">
                                    Admin Panel
                                </Link>
                            ) : (
                                <Link to="/dashboard" className="text-dark-muted hover:text-dark-text transition-colors">Dashboard</Link>
                            )}
                            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-dark-border">
                                <div className="flex items-center space-x-2">
                                    <UserIcon size={20} className="text-dark-muted" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium leading-tight">{user.name}</span>
                                        {(user.isAdmin || user.role === 'admin') && <span className="text-[10px] text-red-500 font-black uppercase tracking-tighter">Admin</span>}
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-dark-muted hover:text-red-400 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="text-dark-muted hover:text-dark-text transition-colors">Login</Link>
                            <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-primary-500/20">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Code, User as UserIcon, Search, Bell, Plus, ChevronDown, ShieldCheck } from 'lucide-react';
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
        <nav className="border-b border-dark-border bg-dark-card sticky top-0 z-50 h-14 flex items-center">
            <div className="container mx-auto px-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <Link to="/" className="flex items-center space-x-2 shrink-0">
                        <div className="bg-dark-bg p-1.5 rounded-lg border border-dark-border">
                            <Code size={20} className="text-primary-500" />
                        </div>
                        <span className="font-display font-bold text-lg hidden md:block brand-gradient">CollabSphere</span>
                    </Link>

                    {user && (
                        <div className="relative group max-w-sm w-full hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Type / to search"
                                className="w-full bg-dark-bg border border-dark-border rounded-md py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-dark-muted/50"
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    {user ? (
                        <>
                            <div className="flex items-center space-x-1 sm:space-x-4">
                                <Link to="/dashboard" className="text-sm font-medium text-dark-text hover:text-primary-500 transition-colors px-2 py-1">
                                    Dashboard
                                </Link>


                                <button className="p-1.5 text-dark-muted hover:text-dark-text transition-colors relative">
                                    <Bell size={18} />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-dark-card"></span>
                                </button>

                                <button className="p-1.5 text-dark-muted hover:text-dark-text transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>

                            <div className="flex items-center space-x-3 ml-2 pl-4 border-l border-dark-border">
                                <div className="flex items-center space-x-2 cursor-pointer group">
                                    <div className="w-7 h-7 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                                        <UserIcon size={14} className="text-primary-500" />
                                    </div>
                                    <div className="hidden lg:flex items-center gap-1">
                                        <span className="text-xs font-semibold text-dark-text group-hover:text-primary-500 transition-colors">{user.name}</span>
                                        <ChevronDown size={12} className="text-dark-muted" />
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-1.5 text-dark-muted hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-sm font-medium text-dark-muted hover:text-dark-text transition-colors">Sign in</Link>
                            <Link to="/register" className="github-btn-primary">
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

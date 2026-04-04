import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Code, User as UserIcon, Search, Bell, Plus, ChevronDown, ShieldCheck, Check, X as XIcon, UserPlus, Settings, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import EditProfileModal from './EditProfileModal';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [invitations, setInvitations] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isIdLoading, setIsIdLoading] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const notificationRef = useRef(null);
    const searchRef = useRef(null);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchInvitations();
            const interval = setInterval(fetchInvitations, 30000); // Check every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 2) {
                handleSearch();
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const { data } = await API.get(`/users/search?query=${searchQuery}`);
            setSearchResults(data);
            setShowSearchResults(true);
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setIsSearching(false);
        }
    };

    const fetchInvitations = async () => {
        try {
            const { data } = await API.get('/projects/invitations');
            setInvitations(data);
        } catch (err) {
            console.error('Failed to fetch invitations', err);
        }
    };

    const handleInvitationResponse = async (id, accept) => {
        setIsIdLoading(id);
        try {
            await API.post(`/projects/invitations/${id}/respond`, { accept });
            addToast(`Invitation ${accept ? 'accepted' : 'rejected'}`, 'success');
            fetchInvitations();
            if (accept) {
                // Refresh dashboard if user is on it
                if (window.location.pathname === '/dashboard') {
                    window.location.reload();
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            addToast('Action failed', 'error');
        } finally {
            setIsIdLoading(null);
        }
    };

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
                        <div className="relative max-w-sm w-full hidden sm:block" ref={searchRef}>
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isSearching ? 'text-primary-500 animate-pulse' : 'text-dark-muted'}`} size={16} />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                className="w-full bg-dark-bg border border-dark-border rounded-md py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-dark-muted/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                            />

                            {/* Search Results Dropdown */}
                            {showSearchResults && (
                                <div className="absolute left-0 right-0 mt-2 bg-dark-card border border-dark-border rounded-lg shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        {searchResults.length > 0 ? (
                                            searchResults.map((result) => (
                                                    <div 
                                                        key={result._id} 
                                                        onClick={() => {
                                                            navigate(`/profile/${result._id}`);
                                                            setShowSearchResults(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className="p-3 border-b border-dark-border/50 hover:bg-dark-bg/50 transition-colors cursor-pointer flex items-center gap-3"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-xs uppercase overflow-hidden border border-primary-500/20">
                                                            {result.profilePicture ? (
                                                                <img src={result.profilePicture} alt={result.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                result.name.charAt(0)
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-bold text-white truncate">
                                                                    {result.name}
                                                                    {result.username && <span className="ml-1.5 text-primary-500 font-medium">@{result.username}</span>}
                                                                </p>
                                                                {result.publicProjectCount > 0 && (
                                                                    <span className="text-[8px] bg-primary-500/10 text-primary-500 px-1 py-0.5 rounded border border-primary-500/20 font-black">
                                                                        {result.publicProjectCount} PUBLIC
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-dark-muted truncate">{result.email}</p>
                                                        </div>
                                                        <span className="text-[9px] bg-dark-bg px-1.5 py-0.5 rounded text-dark-muted uppercase border border-dark-border shrink-0">
                                                            {result.role || 'User'}
                                                        </span>
                                                    </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-xs text-dark-muted italic">
                                                No users found matching "{searchQuery}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
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


                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-1.5 text-dark-muted hover:text-dark-text transition-colors relative"
                                >
                                    <Bell size={18} />
                                    {invitations.length > 0 && (
                                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-dark-card animate-pulse-subtle"></span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <div 
                                        ref={notificationRef}
                                        className="absolute right-0 mt-8 w-80 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2"
                                        style={{ top: '100%' }}
                                    >
                                        <div className="p-4 border-b border-dark-border bg-dark-bg/30 flex justify-between items-center">
                                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                <Bell size={14} className="text-primary-500" /> Notifications
                                            </h3>
                                            <span className="text-[10px] bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-full font-bold">
                                                {invitations.length} New
                                            </span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                            {invitations.length > 0 ? (
                                                invitations.map((invite) => (
                                                    <div key={invite._id} className="p-4 border-b border-dark-border/50 hover:bg-dark-bg/50 transition-colors">
                                                        <div className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center shrink-0 border border-primary-500/20">
                                                                <UserPlus size={14} className="text-primary-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-dark-text leading-tight mb-1">
                                                                    <span className="font-bold text-white">{invite.inviter.name}</span> invited you to collaborate on <span className="text-primary-400 font-semibold">{invite.project.projectName}</span>
                                                                </p>
                                                                <p className="text-[10px] text-dark-muted mb-3 flex items-center gap-1">
                                                                    Invitation pending
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        disabled={isIdLoading === invite._id}
                                                                        onClick={() => handleInvitationResponse(invite._id, true)}
                                                                        className="flex-1 bg-primary-500 hover:bg-primary-400 text-dark-bg text-[10px] font-black py-1.5 rounded transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                                                                    >
                                                                        <Check size={12} /> ACCEPT
                                                                    </button>
                                                                    <button 
                                                                        disabled={isIdLoading === invite._id}
                                                                        onClick={() => handleInvitationResponse(invite._id, false)}
                                                                        className="flex-1 bg-dark-bg hover:bg-red-500/10 text-red-500 border border-red-500/30 text-[10px] font-black py-1.5 rounded transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                                                                    >
                                                                        <XIcon size={12} /> REJECT
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <Bell size={32} className="mx-auto text-dark-muted/20 mb-3" />
                                                    <p className="text-xs text-dark-muted italic">No new notifications</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button className="p-1.5 text-dark-muted hover:text-dark-text transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>

                            <div className="flex items-center space-x-3 ml-2 pl-4 border-l border-dark-border relative" ref={profileMenuRef}>
                                <div 
                                    className="flex items-center space-x-2 cursor-pointer group"
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                >
                                    <div className="w-7 h-7 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center overflow-hidden">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon size={14} className="text-primary-500" />
                                        )}
                                    </div>
                                    <div className="hidden lg:flex items-center gap-1">
                                        <span className="text-xs font-semibold text-dark-text group-hover:text-primary-500 transition-colors uppercase tracking-tight">{user.name}</span>
                                        <ChevronDown size={12} className={`text-dark-muted transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {showProfileMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-2xl py-1 z-[70] animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-2 border-b border-dark-border bg-dark-bg/20">
                                            <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">Signed in as</p>
                                            <p className="text-xs font-bold text-white truncate">{user.email}</p>
                                        </div>
                                        
                                        <button 
                                            onClick={() => {
                                                navigate(`/profile/${user._id}`);
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-xs text-dark-text hover:bg-dark-bg hover:text-primary-500 transition-all text-left"
                                        >
                                            <User size={14} /> My Profile
                                        </button>

                                        <button 
                                            onClick={() => {
                                                setShowEditModal(true);
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-xs text-dark-text hover:bg-dark-bg hover:text-primary-500 transition-all text-left"
                                        >
                                            <Settings size={14} /> Edit Profile
                                        </button>

                                        <div className="border-t border-dark-border my-1"></div>
                                        
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-all text-left"
                                        >
                                            <LogOut size={14} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>

                            <EditProfileModal 
                                isOpen={showEditModal} 
                                onClose={() => setShowEditModal(false)}
                                user={user}
                                onUpdate={(updatedUser) => {
                                    setUser(updatedUser);
                                    localStorage.setItem('user', JSON.stringify(updatedUser));
                                }}
                            />
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

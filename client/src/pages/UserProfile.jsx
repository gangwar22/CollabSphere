import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { 
    User, Mail, Shield, Book, Globe, Calendar, FolderOpen, 
    ArrowLeft, Settings, Award, MapPin, Link as LinkIcon, 
    Twitter, Github, ExternalLink, Plus, Star, GitFork, 
    Clock, Search, MoreHorizontal, Layout, Zap
} from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import EditProfileModal from '../components/EditProfileModal';

const UserProfile = () => {
    const { id } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const { addToast } = useToast();

    // Get loggend in user from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    const isOwnProfile = loggedInUser && loggedInUser._id === id;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get(`/users/profile/${id}`);
                setProfileData(data);
            } catch (err) {
                addToast('Failed to load user profile', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleProfileUpdate = (updatedUser) => {
        setProfileData(prev => ({
            ...prev,
            user: updatedUser
        }));
        // Update localStorage as well
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // We might need to refresh the page or parent if shared state is elsewhere, 
        // but for this page we updated profileData.
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-4xl tracking-tighter sm:tracking-normal">
                <Skeleton count={5} />
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="text-dark-muted font-bold text-xl uppercase tracking-widest">User not found</p>
            </div>
        );
    }

    const { user, publicProjects } = profileData;

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] selection:bg-blue-500/30 font-sans">
            {/* Minimal Header Border */}
            {/* No divider here to avoid gap */}

            <div className="container mx-auto px-4 sm:px-8 max-w-[1280px] pb-32">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Sidebar: Profile Identity */}
                    <div className="w-full md:w-[260px] shrink-0 pt-8">
                        <div className="relative mb-4">
                            <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full bg-[#161b22] border border-white/10 overflow-hidden group shadow-2xl mx-auto md:mx-0">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#161b22] to-[#0d1117]">
                                        <span className="text-6xl font-black text-blue-500/10 italic">{user.name?.charAt(0)}</span>
                                    </div>
                                )}
                                {isOwnProfile && (
                                    <button 
                                        onClick={() => setShowEditModal(true)}
                                        className="absolute bottom-2 right-6 sm:bottom-4 sm:right-4 bg-[#21262d] border border-white/10 p-2 rounded-xl shadow-lg hover:bg-[#30363d] transition-colors group/btn"
                                    >
                                        <Settings size={16} className="text-[#8b949e] group-hover/btn:rotate-90 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div>
                                <h1 className="text-[26px] font-bold text-white leading-tight">
                                    {user.name}
                                </h1>
                                <p className="text-xl text-[#8b949e] font-light leading-snug">
                                    @{user.username || user.name.toLowerCase().replace(' ', '')}
                                </p>
                                <p className="text-sm text-[#8b949e] mt-1">{user.email}</p>
                            </div>

                            {isOwnProfile ? (
                                <button 
                                    onClick={() => setShowEditModal(true)}
                                    className="w-full py-1.5 bg-[#21262d] border border-[#363b42] rounded-lg text-sm font-semibold text-[#c9d1d9] hover:bg-[#30363d] hover:border-[#8b949e] transition-all"
                                >
                                    Edit profile
                                </button>
                            ) : (
                                <button className="w-full py-1.5 bg-[#238636] border border-[#2ea043] rounded-lg text-sm font-semibold text-white hover:bg-[#2ea043] transition-all">
                                    Follow
                                </button>
                            )}

                            {user.bio && (
                                <p className="text-sm text-[#c9d1d9] leading-[1.6] py-2 border-b border-white/5">
                                    {user.bio}
                                </p>
                            )}

                            <div className="space-y-1.5 pt-2 text-sm text-[#c9d1d9]">
                                <div className="flex items-center gap-2 group cursor-pointer">
                                    <Layout size={16} className="text-[#8b949e]" />
                                    <span className="font-bold">Top Repositories</span>
                                    <div className="ml-auto w-10 h-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                        <Plus size={12} className="text-green-500" />
                                    </div>
                                </div>

                                <div className="relative pt-2">
                                    <Search size={14} className="absolute left-3 top-[1.1rem] text-[#8b949e]" />
                                    <input 
                                        type="text" 
                                        placeholder="Find a repository..." 
                                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1 padding-left pl-9 text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-[#484f58]"
                                    />
                                </div>

                                <div className="space-y-2 mt-4">
                                    {publicProjects.slice(0, 3).map((p) => (
                                        <div key={p._id} className="flex items-center gap-2 group">
                                            <GitFork size={14} className="text-blue-400 opacity-60" />
                                            <span className="text-xs font-bold text-blue-400 hover:underline cursor-pointer truncate">
                                                {user.name} / {p.projectName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-white/5">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                                    <Clock size={16} className="text-[#8b949e]" />
                                    Recent Activity
                                </h3>
                                <div className="space-y-4">
                                    {publicProjects.slice(0, 3).map((p) => (
                                        <div key={p._id} className="text-[11px]">
                                            <p className="font-bold text-[#c9d1d9]">Created {p.projectName}</p>
                                            <p className="text-[#8b949e] mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area: Repository Overview */}
                    <div className="flex-1 pt-8 md:pt-14">
                        {/* Tab Navigation */}
                        <div className="flex items-center gap-6 border-b border-white/5 mb-6 text-sm">
                            <button className="flex items-center gap-2 pb-3 border-b-2 border-[#f78166] text-white font-bold group">
                                <Book size={16} className="text-[#8b949e] group-hover:text-white transition-colors" /> Overview
                            </button>
                            <button className="flex items-center gap-2 pb-3 text-[#c9d1d9] hover:border-b-2 hover:border-[#30363d] transition-all">
                                <GitFork size={16} className="text-[#8b949e]" /> 
                                Repositories 
                                <span className="bg-[#1d2127] border border-white/5 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#8b949e]">
                                    {publicProjects.length}
                                </span>
                            </button>
                            <button className="flex items-center gap-2 pb-3 text-[#c9d1d9] hover:border-b-2 hover:border-[#30363d] transition-all">
                                <Star size={16} className="text-[#8b949e]" /> 
                                Stars 
                                <span className="bg-[#1d2127] border border-white/5 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#8b949e]">0</span>
                            </button>
                        </div>

                        {/* Bento Grid Repositories */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {publicProjects.length > 0 ? (
                                publicProjects.map((project) => (
                                    <Link 
                                        to={`/projects/public/${project._id}`} 
                                        key={project._id} 
                                        className="p-4 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#8b949e]/40 transition-all flex flex-col min-h-[140px] group shadow-sm bg-gradient-to-tr from-transparent to-white/[0.01]"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <GitFork size={16} className="text-blue-400 shrink-0" />
                                                <span className="text-sm font-bold text-blue-400 hover:underline truncate">
                                                    {project.projectName}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full bg-[#121d2f]/50 border border-blue-500/20 text-[9px] font-black uppercase text-blue-300">Public</span>
                                            </div>
                                            <div className="text-[#8b949e] hover:text-white">
                                                <Star size={14} />
                                            </div>
                                        </div>
                                        
                                        <p className="text-[11px] text-[#8b949e] line-clamp-2 mt-1 max-w-[90%]">
                                            {project.description || 'Project repository active on CollabSphere system.'}
                                        </p>

                                        <div className="mt-auto pt-4 flex items-center gap-4 text-[11px] text-[#8b949e]">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#f1e05a]"></div>
                                                <span>JavaScript</span>
                                            </div>
                                            <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                                                <Star size={12} />
                                                <span>0</span>
                                            </div>
                                            <div className="flex -space-x-2">
                                                <div className="w-5 h-5 rounded-full border border-[#0d1117] bg-[#161b22] text-[8px] flex items-center justify-center font-bold">1</div>
                                                <div className="w-5 h-5 rounded-full border border-[#0d1117] bg-primary-500 text-[8px] flex items-center justify-center font-bold text-dark-bg">2</div>
                                            </div>
                                            <span className="ml-auto opacity-60">Updated recently</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-2 py-16 border-2 border-dashed border-white/5 rounded-xl text-center">
                                    <Zap size={32} className="mx-auto text-white/5 mb-3" />
                                    <p className="text-xs font-bold text-[#8b949e] uppercase tracking-widest">Repository manifest empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal 
                isOpen={showEditModal} 
                onClose={() => setShowEditModal(false)}
                user={user}
                onUpdate={handleProfileUpdate}
            />
        </div>
    );
};

export default UserProfile;
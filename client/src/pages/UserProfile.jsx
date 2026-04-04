import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { User, Mail, Shield, Book, Globe, Calendar, FolderOpen, ArrowLeft, Settings } from 'lucide-react';
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
        <div className="animate-fade-in container mx-auto px-4 py-12 max-w-5xl">
            <Link to="/dashboard" className="flex items-center gap-2 text-dark-muted hover:text-primary-500 mb-8 transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-semibold">Back to Dashboard</span>
            </Link>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* User Info Sidebar */}
                <div className="w-full lg:w-72 shrink-0 space-y-6">
                    <div className="flex flex-col items-center lg:items-start">
                        <div className="w-32 h-32 rounded-full bg-primary-500/10 border-4 border-dark-card shadow-2xl flex items-center justify-center mb-6 overflow-hidden ring-2 ring-primary-500/20">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-black text-primary-500 uppercase tracking-tighter">
                                    {user.name?.charAt(0)}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-black text-white mb-2 text-center lg:text-left">
                            {user.name}
                            {user.username && <span className="block text-primary-500 font-bold text-sm tracking-tight">@{user.username}</span>}
                        </h1>
                        <p className="text-dark-muted text-sm font-medium mb-6 text-center lg:text-left flex items-center gap-2">
                            <span className="bg-dark-card border border-dark-border px-2 py-0.5 rounded text-[10px] text-primary-400 font-bold uppercase tracking-widest">
                                {user.role || 'User'}
                            </span>
                        </p>

                        {isOwnProfile && (
                            <button 
                                onClick={() => setShowEditModal(true)}
                                className="w-full py-2.5 bg-dark-card border border-dark-border rounded-xl text-white font-bold text-xs uppercase tracking-widest hover:bg-dark-bg hover:border-primary-500/50 transition-all mb-6 flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Settings size={14} className="text-primary-500" />
                                Edit Profile
                            </button>
                        )}

                        {user.bio && (
                            <p className="text-dark-muted text-sm mt-4 text-center lg:text-left leading-relaxed italic bg-dark-bg/30 p-4 rounded-xl border border-dark-border/50">
                                "{user.bio}"
                            </p>
                        )}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-dark-border">
                        <div className="flex items-center gap-3 text-dark-muted group">
                            <Mail size={16} className="group-hover:text-primary-500 transition-colors" />
                            <span className="text-sm truncate font-medium">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-dark-muted group">
                            <Calendar size={16} className="group-hover:text-primary-500 transition-colors" />
                            <span className="text-sm font-medium italic">Joined on {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                         <div className="flex items-center gap-3 text-dark-muted group">
                            <Globe size={16} className="group-hover:text-primary-500 transition-colors" />
                            <span className="text-sm font-medium">{publicProjects.length} Public Projects</span>
                        </div>
                    </div>
                </div>

                {/* Main Content: Public Projects */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-8 border-b border-dark-border pb-4">
                        <FolderOpen size={20} className="text-primary-500" />
                        <h2 className="text-lg font-bold text-white uppercase tracking-widest">Public Projects</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {publicProjects.length > 0 ? (
                            publicProjects.map((project) => (
                                <Link 
                                    to={`/projects/public/${project._id}`} 
                                    key={project._id}
                                    className="p-5 github-card bg-dark-card/50 hover:bg-dark-bg hover:border-primary-500/30 transition-all flex flex-col group h-full shadow-lg"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="bg-primary-500/10 p-2 rounded-lg text-primary-500 border border-primary-500/20 group-hover:bg-primary-500 group-hover:text-dark-bg transition-colors duration-300">
                                            <Book size={18} />
                                        </div>
                                    </div>
                                    <h3 className="text-md font-bold text-white mb-2 group-hover:text-primary-500 transition-colors uppercase tracking-tight">{project.projectName}</h3>
                                    <p className="text-xs text-dark-muted line-clamp-2 leading-relaxed mb-6 font-medium">
                                        {project.description}
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-dark-border/50 flex items-center justify-between text-[9px] font-black text-dark-muted tracking-widest uppercase">
                                        <span>{project.members?.length || 0} Collaborators</span>
                                        <span className="text-primary-500 group-hover:underline">View Repository</span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-20 github-card bg-dark-bg/20 border-dashed">
                                <p className="text-dark-muted italic font-medium">No public repositories shared on this profile.</p>
                            </div>
                        )}
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
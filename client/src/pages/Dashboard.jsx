import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { 
    Layout, Plus, Search, Filter, BookOpen, Clock, 
    Star, GitBranch, Shield, Bell, ChevronRight, 
    ExternalLink, Activity, Folder, Hash, Settings
} from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
    const [projects, setProjects] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isIdLoading, setIsIdLoading] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const { addToast } = useToast();

    useEffect(() => {
        fetchProjects();
        fetchInvitations();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await API.get('/projects/my-projects');
            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch projects', err);
            setProjects([]);
        } finally {
            setLoading(false);
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
            if (accept) fetchProjects();
        } catch (err) {
            addToast('Action failed', 'error');
        } finally {
            setIsIdLoading(null);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await API.delete(`/projects/${projectId}`);
            addToast('Project deleted successfully', 'success');
            fetchProjects();
        } catch (err) {
            addToast('Failed to delete project', 'error');
        }
    };

    const handleCreateProject = async (projectData) => {
        try {
            await API.post('/projects', projectData);
            fetchProjects();
            setIsModalOpen(false);
            addToast('Project created successfully!', 'success');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create project');
        }
    };

    const filteredProjects = projects.filter(p =>
        p.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sidebarProjects = searchTerm 
        ? projects.filter(p => p.projectName.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 7)
        : projects.slice(0, 5);

    const recentActivity = projects
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
        .map(p => ({
            id: p._id,
            text: `Created ${p.projectName}`,
            time: new Date(p.createdAt).toLocaleDateString()
        }));

    const renderEmptyState = (title, description, btnText) => (
        <div className="text-center py-20 github-card bg-dark-bg/50 border-dashed">
            <div className="inline-flex p-4 bg-dark-card rounded-full text-dark-muted mb-4 border border-dark-border">
                <Layout size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-dark-muted mb-6 max-w-sm mx-auto text-sm">{description}</p>
            {btnText && (
                <button onClick={() => setIsModalOpen(true)} className="github-btn-primary">
                    {btnText}
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] selection:bg-blue-500/30">
            {/* Main content starts immediately after Navbar */}

            <div className="container mx-auto px-4 sm:px-8 max-w-[1400px] pt-8 pb-32">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Sidebar: Advanced Navigation */}
                    <div className="w-full lg:w-[296px] shrink-0 pt-0 space-y-10">
                        {/* User Identity Section */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <div className="relative group mb-6">
                                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-[#161b22] border-2 border-white/5 overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02] duration-500">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#161b22] to-[#0d1117]">
                                            <span className="text-4xl font-black text-blue-500/10 italic">{(user?.name || '?').charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => addToast('Profile settings available in profile page.', 'info')}
                                    className="absolute bottom-1 right-1 bg-[#21262d] border border-white/10 p-1.5 rounded-full shadow-lg hover:bg-[#30363d] transition-colors"
                                >
                                    <Plus size={14} className="text-[#8b949e]" />
                                </button>
                            </div>

                            <div className="space-y-1 mb-6">
                                <h1 className="text-2xl font-bold text-white leading-tight flex items-center gap-2">
                                    {user?.name || 'Explorer'}
                                    <Shield size={14} className="text-blue-500/40" />
                                </h1>
                                <p className="text-lg text-[#8b949e] font-light leading-snug">
                                    @{user?.username || (user?.name || 'user').toLowerCase().replace(/\s+/g, '')}
                                </p>
                            </div>

                            <button 
                                onClick={() => addToast('Edit profile feature coming soon!', 'info')}
                                className="w-full py-1.5 bg-[#21262d] border border-[#363b42] rounded-lg text-sm font-semibold text-[#c9d1d9] hover:bg-[#30363d] hover:border-[#8b949e] transition-all"
                            >
                                Edit profile
                            </button>
                        </div>

                        {/* Invitations: Premium UI */}
                        {invitations.length > 0 && (
                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <h2 className="text-xs font-black text-[#8b949e] flex items-center justify-between uppercase tracking-[0.2em]">
                                    Direct Invitations
                                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-[9px]">{invitations.length}</span>
                                </h2>
                                <div className="space-y-3">
                                    {invitations.map(invite => (
                                        <div key={invite._id} className="p-4 bg-[#161b22] border border-blue-500/20 rounded-xl shadow-lg relative overflow-hidden group/invite">
                                            <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                                                <Bell size={40} className="text-blue-500" />
                                            </div>
                                            <p className="text-[10px] font-bold text-[#8b949e] mb-2 uppercase tracking-tight">Collaboration Offer</p>
                                            <h3 className="text-xs font-black text-white mb-4 truncate italic">{invite.project.projectName}</h3>
                                            <div className="flex gap-2 relative z-10">
                                                <button 
                                                    disabled={isIdLoading === invite._id}
                                                    onClick={() => handleInvitationResponse(invite._id, true)} 
                                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black py-2 rounded-lg transition-all"
                                                >
                                                    {isIdLoading === invite._id ? 'SYNCING...' : 'ACCEPT'}
                                                </button>
                                                <button 
                                                    disabled={isIdLoading === invite._id}
                                                    onClick={() => handleInvitationResponse(invite._id, false)} 
                                                    className="flex-1 bg-[#21262d] hover:bg-red-500/20 text-[#8b949e] hover:text-red-400 border border-white/5 text-[9px] font-black py-2 rounded-lg transition-all"
                                                >
                                                    REJECT
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top Repositories: Enterprise Style */}
                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black text-[#8b949e] flex items-center gap-2 uppercase tracking-[0.2em]">
                                    <BookOpen size={14} /> My Repositories
                                </h2>
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-[#238636] hover:bg-[#2ea043] p-1.5 rounded-lg text-white transition-all shadow-lg shadow-green-950/20"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div className="relative group/search">
                                <Search size={14} className="absolute left-3 top-2.5 text-[#484f58] group-focus-within/search:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Find a repository..."
                                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-[#484f58]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                {loading ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-8 bg-[#161b22]/50 rounded-lg animate-pulse mb-2"></div>)
                                ) : sidebarProjects.length > 0 ? (
                                    sidebarProjects.map(p => (
                                        <Link key={p._id} to={`/projects/public/${p._id}`} className="flex items-center justify-between group px-2 py-2 rounded-lg hover:bg-[#161b22] transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <GitBranch size={14} className="text-blue-400 opacity-40 shrink-0" />
                                                <span className="text-[12px] font-bold text-[#c9d1d9] group-hover:text-blue-400 transition-colors truncate">
                                                    {p.projectName}
                                                </span>
                                            </div>
                                            <ChevronRight size={12} className="text-[#30363d] group-hover:text-[#8b949e] transition-colors" />
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-[11px] text-[#484f58] italic py-2 pl-2 border-l border-white/5">Manifest empty...</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Performance/Activity */}
                        <div className="pt-8 border-t border-white/5">
                            <h2 className="text-xs font-black text-[#8b949e] flex items-center gap-2 mb-6 uppercase tracking-[0.2em]">
                                <Activity size={14} className="text-green-500" /> Pulse Flow
                            </h2>
                            <div className="space-y-6">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map(act => (
                                        <div key={act.id} className="relative pl-6 border-l border-white/5 pb-2">
                                            <div className="absolute top-0 -left-[4.5px] w-2 h-2 rounded-full bg-[#30363d] border border-[#0d1117]"></div>
                                            <p className="text-xs font-bold text-[#c9d1d9] mb-1">{act.text}</p>
                                            <span className="text-[10px] text-[#8b949e] uppercase font-black tracking-widest">{act.time}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center opacity-30 italic text-xs">Awaiting signals...</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 pt-0 lg:pt-0">
                        {/* Tab System: GitHub 2026 Edition */}
                        <div className="flex items-center gap-8 border-b border-white/5 mb-8 text-sm overflow-x-auto scroller-hidden">
                            <button 
                                onClick={() => setActiveTab('overview')}
                                className={`flex items-center gap-2 pb-4 transition-all whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-[#f78166] text-white font-black' : 'text-[#8b949e] hover:text-white'}`}
                            >
                                <Layout size={16} /> Overview
                            </button>
                            <button 
                                onClick={() => setActiveTab('repositories')}
                                className={`flex items-center gap-2 pb-4 transition-all whitespace-nowrap ${activeTab === 'repositories' ? 'border-b-2 border-[#f78166] text-white font-black' : 'text-[#8b949e] hover:text-white'}`}
                            >
                                <GitBranch size={16} /> Repositories 
                                <span className="bg-[#1d2127] border border-white/10 px-2 py-0.5 rounded-full text-[10px] font-black">{projects.length}</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('stars')}
                                className={`flex items-center gap-2 pb-4 transition-all whitespace-nowrap ${activeTab === 'stars' ? 'border-b-2 border-[#f78166] text-white font-black' : 'text-[#8b949e] hover:text-white'}`}
                            >
                                <Star size={16} /> Workflow
                                <span className="bg-[#1d2127] border border-white/10 px-2 py-0.5 rounded-full text-[10px] font-black">0</span>
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="p-6 bg-[#0d1117] border border-[#30363d] rounded-xl h-44 animate-animation-pulse">
                                        <div className="w-1/3 h-5 bg-[#161b22] rounded-md mb-4"></div>
                                        <div className="w-full h-8 bg-[#161b22] rounded-md mb-6"></div>
                                        <div className="w-1/4 h-3 bg-[#161b22] rounded-md"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {activeTab === 'overview' && (
                                    filteredProjects.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {filteredProjects.map(project => (
                                                <ProjectCard 
                                                    key={project._id} 
                                                    project={project} 
                                                    onDelete={() => handleDeleteProject(project._id)}
                                                    currentUser={user}
                                                />
                                            ))}
                                        </div>
                                    ) : renderEmptyState("Initialize Architecture", "Repositories contain all your project files, encrypted and synced in real-time.", "New Project")
                                )}
                                
                                {activeTab === 'repositories' && (
                                    <div className="space-y-2">
                                        {filteredProjects.map(project => (
                                            <div key={project._id} className="p-5 bg-gradient-to-tr from-transparent to-white/[0.01] border border-[#30363d] rounded-xl flex items-center justify-between group hover:border-blue-500/20 transition-all shadow-sm">
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <Folder size={16} className="text-[#8b949e] shrink-0" />
                                                        <Link to={`/projects/public/${project._id}`} className="text-base font-black text-blue-400 hover:underline truncate italic">
                                                            {project.projectName}
                                                        </Link>
                                                        <span className="px-2 py-0.5 rounded-full bg-[#121d2f]/50 border border-blue-500/20 text-[9px] font-black uppercase text-blue-300">Active</span>
                                                    </div>
                                                    <p className="text-[11px] text-[#8b949e] truncate leading-relaxed">
                                                        {project.description || 'Project metadata currently being synchronized...'}
                                                    </p>
                                                    <div className="mt-3 flex items-center gap-4 text-[11px] font-black text-[#8b949e] uppercase tracking-tighter">
                                                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#f1e05a]"></div> JS</span>
                                                        <span className="flex items-center gap-1"><Star size={12} /> 0</span>
                                                        <span className="opacity-40 italic">Updated {new Date(project.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                     <button 
                                                        onClick={() => handleDeleteProject(project._id)}
                                                        className="p-2.5 rounded-lg bg-[#21262d] border border-white/5 text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Hash size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreateProjectModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onCreate={handleCreateProject} 
            />
        </div>
    );
};

export default Dashboard;

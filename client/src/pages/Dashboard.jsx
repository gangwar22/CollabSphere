import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { Layout, Plus, Search, Filter, BookOpen, Clock, Star, GitBranch } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

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
        <div className="animate-fade-in max-w-[1400px] mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-72 shrink-0 space-y-8">
                    {/* User Profile Section */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left pb-8 border-b border-dark-border">
                        <div className="w-20 h-20 rounded-full bg-primary-500/10 border-2 border-primary-500/20 flex items-center justify-center mb-4 overflow-hidden shadow-lg border-accent/20">
                            <span className="text-2xl font-bold text-primary-500">{user?.name?.charAt(0) || 'U'}</span>
                        </div>
                        <h1 className="text-xl font-bold text-white mb-1">{user?.name || 'User'}</h1>
                        <p className="text-dark-muted text-xs font-medium mb-3">{user?.email || 'Email'}</p>
                        <button 
                            onClick={() => addToast('Edit profile feature coming soon!', 'info')}
                            className="w-full github-btn-secondary !text-xs !py-1 flex items-center justify-center gap-1.5 hover:border-accent/40 hover:text-accent transition-all"
                        >
                            Edit profile
                        </button>
                    </div>

                    {/* Invitations Section */}
                    {invitations.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest pl-2">
                                <Star size={14} className="text-yellow-500 fill-yellow-500/20" /> 
                                Invitations ({invitations.length})
                            </h2>
                            <div className="space-y-3">
                                {invitations.map(invite => (
                                    <div key={invite._id} className="github-card p-4 bg-dark-card border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                                        <p className="text-[10px] text-dark-muted mb-2">
                                            <span className="text-white font-bold">{invite.inviter.name}</span> invited you to:
                                        </p>
                                        <h3 className="text-xs font-bold text-primary-500 mb-3 truncate">{invite.project.projectName}</h3>
                                        <div className="flex gap-2">
                                            <button 
                                                disabled={isIdLoading === invite._id}
                                                onClick={() => handleInvitationResponse(invite._id, true)} 
                                                className="flex-1 bg-primary-500 hover:bg-primary-400 text-dark-bg text-[9px] font-black py-1.5 rounded transition-all disabled:opacity-50"
                                            >
                                                {isIdLoading === invite._id ? '...' : 'ACCEPT'}
                                            </button>
                                            <button 
                                                disabled={isIdLoading === invite._id}
                                                onClick={() => handleInvitationResponse(invite._id, false)} 
                                                className="flex-1 bg-dark-bg hover:bg-red-500/10 text-red-500 border border-red-500/30 text-[9px] font-black py-1.5 rounded transition-all disabled:opacity-50"
                                            >
                                                REJECT
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-dark-text flex items-center gap-2">
                                <BookOpen size={16} className="text-dark-muted" />
                                Top Repositories
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="github-btn-primary !py-1 !px-2 flex items-center gap-1"
                            >
                                <Plus size={14} />
                                New
                            </button>
                        </div>
                        <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder="Find a repository..."
                                className="w-full bg-dark-bg border border-dark-border rounded-md py-1 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <ul className="space-y-1">
                            {loading ? (
                                [1, 2, 3].map(i => <li key={i} className="h-6 bg-dark-card/50 rounded animate-pulse mb-2"></li>)
                            ) : sidebarProjects.length > 0 ? (
                                sidebarProjects.map(p => (
                                    <li key={p._id}>
                                        <a href={`/project/${p._id}`} className="flex items-center gap-2 text-xs text-dark-text hover:text-primary-500 hover:underline py-1 transition-all">
                                            <div className="w-4 h-4 rounded bg-primary-500/10 flex items-center justify-center">
                                                <GitBranch size={10} className="text-primary-500" />
                                            </div>
                                            <span className="truncate font-medium">{user.name} / {p.projectName}</span>
                                        </a>
                                    </li>
                                ))
                            ) : (
                                <li className="text-xs text-dark-muted italic py-1 px-2">No repositories match</li>
                            )}
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-dark-border">
                        <h2 className="text-sm font-semibold text-dark-text flex items-center gap-2 mb-4">
                            <Clock size={16} className="text-dark-muted" />
                            Recent Activity
                        </h2>
                        <div className="space-y-3">
                            {recentActivity.length > 0 ? (
                                recentActivity.map(act => (
                                    <div key={act.id} className="group cursor-default">
                                        <p className="text-[11px] text-dark-text group-hover:text-primary-400 transition-colors">{act.text}</p>
                                        <span className="text-[10px] text-dark-muted">{act.time}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-dark-muted">No recent activity to show.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-border overflow-x-auto scroller-hidden">
                        <nav className="flex space-x-6 min-w-max">
                            <button 
                                onClick={() => setActiveTab('overview')}
                                className={`text-sm font-semibold pb-4 flex items-center gap-2 transition-all ${activeTab === 'overview' ? 'text-dark-text border-b-2 border-accent' : 'text-dark-muted hover:text-dark-text'}`}
                            >
                                <Layout size={16} />
                                Overview
                            </button>
                            <button 
                                onClick={() => setActiveTab('repositories')}
                                className={`text-sm font-medium pb-4 flex items-center gap-2 transition-all ${activeTab === 'repositories' ? 'text-dark-text border-b-2 border-accent' : 'text-dark-muted hover:text-dark-text'}`}
                            >
                                <GitBranch size={16} />
                                Repositories
                                <span className="bg-dark-border text-dark-text px-1.5 py-0.5 rounded-full text-[10px]">{projects.length}</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('stars')}
                                className={`text-sm font-medium pb-4 flex items-center gap-2 transition-all ${activeTab === 'stars' ? 'text-dark-text border-b-2 border-accent' : 'text-dark-muted hover:text-dark-text'}`}
                            >
                                <Star size={16} />
                                Stars
                                <span className="bg-dark-border text-dark-text px-1.5 py-0.5 rounded-full text-[10px]">0</span>
                            </button>
                        </nav>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="github-card p-4 h-32 flex flex-col justify-between">
                                    <div>
                                        <Skeleton className="h-5 w-3/4 mb-2" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="scroller-container">
                            {activeTab === 'overview' && (
                                filteredProjects.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                                        {filteredProjects.map(project => (
                                            <ProjectCard 
                                                key={project._id} 
                                                project={project} 
                                                onDelete={() => handleDeleteProject(project._id)}
                                                currentUser={user}
                                            />
                                        ))}
                                    </div>
                                ) : renderEmptyState("Build your first project", "Repositories contain all your project files, including the revision history.", "Create repository")
                            )}
                            
                            {activeTab === 'repositories' && (
                                filteredProjects.length > 0 ? (
                                    <div className="space-y-4 animate-slide-up">
                                        {filteredProjects.map(project => (
                                            <div key={project._id} className="github-card p-4 flex items-center justify-between group hover:bg-dark-card transition-all">
                                                <div>
                                                    <a href={`/project/${project._id}`} className="text-primary-500 font-bold hover:underline mb-1 inline-block">{project.projectName}</a>
                                                    <p className="text-xs text-dark-muted truncate max-w-md">{project.description || 'No description provided'}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-[10px] text-dark-muted">
                                                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div> JavaScript</span>
                                                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteProject(project._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-dark-muted hover:text-red-500 transition-all">
                                                    <Clock size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : renderEmptyState("No repositories found", "Try adjusting your search filters.")
                            )}
                            
                            {activeTab === 'stars' && renderEmptyState("You don't have any stars yet", "Stars help you keep track of repositories you find interesting.")}
                        </div>
                    )}
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

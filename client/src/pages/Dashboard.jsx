import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { Layout, Plus, Search, Filter } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

const Dashboard = ({ user }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await API.get('/projects/my-projects');
            setProjects(data);
        } catch (err) {
            console.error('Failed to fetch projects', err);
        } finally {
            setLoading(false);
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

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                    <p className="text-dark-muted">Collaborate and manage your development work</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-primary-500/20"
                >
                    <Plus size={20} />
                    <span className="font-bold">New Project</span>
                </button>
            </div>

            <div className="flex items-center space-x-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full bg-dark-card border border-dark-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="p-3 bg-dark-card border border-dark-border rounded-xl text-dark-muted hover:text-white transition-colors">
                    <Filter size={20} />
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass p-6 rounded-2xl h-48 flex flex-col justify-between">
                            <div>
                                <Skeleton className="h-6 w-3/4 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <Skeleton className="h-4 w-20" />
                                <div className="flex -space-x-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <ProjectCard 
                            key={project._id} 
                            project={project} 
                            onDelete={() => handleDeleteProject(project._id)}
                            currentUser={user}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 glass rounded-2xl">
                    <div className="inline-flex p-4 bg-dark-bg rounded-full text-dark-muted mb-4">
                        <Layout size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                    <p className="text-dark-muted mb-6">Create your first project to start collaborating</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-primary-500 hover:text-primary-400 font-bold transition-colors"
                    >
                        Create your first project →
                    </button>
                </div>
            )}

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateProject}
            />
        </div>
    );
};

export default Dashboard;

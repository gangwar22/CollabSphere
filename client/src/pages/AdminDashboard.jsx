import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Users, ShieldCheck, Search, Filter, Loader2, RefreshCw, Folder, FileText, Database } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import UserTable from '../components/UserTable';
import UserDetails from '../components/UserDetails';
import DeleteUserModal from '../components/DeleteUserModal';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, projects: 0, notes: 0, files: 0 });
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null); // stores user object
    const { addToast } = useToast();

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [usersRes, statsRes, projectsRes] = await Promise.all([
                API.get('/admin/users'),
                API.get('/admin/stats'),
                API.get('/admin/projects')
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
            setProjects(projectsRes.data);
        } catch (err) {
            console.error(err);
            addToast('Failed to load global data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = async (userId) => {
        try {
            const { data } = await API.get(`/admin/users/${userId}`);
            setSelectedUserData(data);
        } catch (err) {
            addToast('Failed to load user details', 'error');
        }
    };

    const handleDeleteClick = (userId) => {
        const user = users.find(u => u._id === userId);
        if (user) setShowDeleteModal(user);
    };

    const confirmDelete = async () => {
        if (!showDeleteModal) return;
        const userId = showDeleteModal._id;
        try {
            const token = localStorage.getItem('token');
            const res = await API.delete(`/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Delete Response:', res.data);
            
            // Update UI state proactively
            setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
            // Update stats
            setStats(prev => ({ ...prev, users: prev.users - 1 }));
            
            addToast(res.data.message || 'User deleted successfully', 'success');
            setShowDeleteModal(null);
            setSelectedUserData(null);
            
            // fetchAllData(); // Optionally re-fetch to sync everything perfectly
        } catch (err) {
            console.error('Delete User Error:', err.response?.data || err.message);
            addToast(err.response?.data?.message || 'Failed to delete user', 'error');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && users.length === 0) return (
        <div className="p-10 space-y-10">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-6">
                <Skeleton className="h-32 rounded-3xl" />
                <Skeleton className="h-32 rounded-3xl" />
                <Skeleton className="h-32 rounded-3xl" />
                <Skeleton className="h-32 rounded-3xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
                <div className="flex items-center space-x-6">
                    <div className="p-4 bg-primary-500/10 rounded-3xl text-primary-500 border border-primary-500/20 shadow-xl shadow-primary-500/5">
                        <ShieldCheck size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Admin Control Center</h1>
                        <p className="text-dark-muted text-lg font-medium flex items-center mt-1">
                            Overall platform perspective and data control
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={fetchAllData}
                    className="flex items-center justify-center space-x-2 bg-dark-card border border-dark-border px-5 py-3 rounded-2xl text-dark-text hover:bg-dark-border transition-all font-bold"
                >
                    <RefreshCw size={18} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Overall Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-500' },
                    { label: 'Active Projects', value: stats.projects, icon: Folder, color: 'text-green-500' },
                    { label: 'Notes Created', value: stats.notes, icon: FileText, color: 'text-purple-500' },
                    { label: 'Files Uploaded', value: stats.files, icon: Database, color: 'text-orange-500' },
                ].map((item, i) => (
                    <div key={i} className="glass p-6 rounded-3xl border border-dark-border/50 bg-gradient-to-br from-dark-card to-dark-bg/50 group hover:border-primary-500/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-dark-muted text-xs font-bold uppercase tracking-widest">{item.label}</p>
                                <p className="text-3xl font-black text-white mt-1">{item.value}</p>
                            </div>
                            <div className={`${item.color} p-3 rounded-2xl bg-current/10 group-hover:scale-110 transition-transform`}>
                                <item.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedUserData ? (
                <UserDetails 
                    data={selectedUserData} 
                    onBack={() => setSelectedUserData(null)} 
                    onDelete={handleDeleteClick}
                />
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {/* Search & Filter Bar */}
                    <div className="flex flex-col md:flex-row items-center gap-4 bg-dark-card/50 p-4 rounded-3xl border border-dark-border">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full bg-dark-bg border border-dark-border rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-2 w-full md:w-auto">
                            <div className="flex items-center bg-primary-500/10 border border-primary-500/20 px-4 py-2 rounded-2xl text-primary-500 font-bold whitespace-nowrap">
                                <Users size={18} className="mr-2" />
                                {users.length} Total Users
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="glass rounded-3xl overflow-hidden shadow-2xl transition-all hover:shadow-primary-500/5 border border-dark-border">
                        <UserTable 
                            users={filteredUsers} 
                            onView={handleViewUser}
                            onDelete={handleDeleteClick}
                            onRefresh={fetchAllData}
                        />
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-20 bg-dark-card/30">
                                <Users size={40} className="mx-auto text-dark-muted mb-4 opacity-20" />
                                <p className="text-dark-muted font-bold text-lg">No matching users found.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <DeleteUserModal 
                    username={showDeleteModal.name}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteModal(null)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
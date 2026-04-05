import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Users, ShieldCheck, Search, Filter, Loader2, RefreshCw, Folder, FileText, Database, Lock } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import UserTable from '../components/UserTable';
import UserDetails from '../components/UserDetails';
import DeleteUserModal from '../components/DeleteUserModal';

const Spinner = ({ size = 'md' }) => {
    const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-8 h-8';
    return <Loader2 className={`${sizeClasses} animate-spin text-primary-500`} />;
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, projects: 0, notes: 0, files: 0 });
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null); // stores user object
    const { addToast } = useToast();

    const [isAuthorized, setIsAuthorized] = useState(false);


    const [adminPassword, setAdminPassword] = useState('');
    const [verifying, setVerifying] = useState(false);

    const handleVerifyPassword = async (e) => {
        if (e) e.preventDefault();
        setVerifying(true);
        try {
            const { data } = await API.post('/admin/verify', { password: adminPassword });
            if (data.success) {
                if (data.token && data.user) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                setIsAuthorized(true);
                addToast('Access Granted. Welcome, Admin.', 'success');
            }
        } catch (err) {
            addToast('Invalid Administrative Password', 'error');
            setAdminPassword('');
        } finally {
            setVerifying(false);
        }
    };

    useEffect(() => {
        if (isAuthorized) {
            fetchAllData();
        }
    }, [isAuthorized]);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
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
            setError('Failed to sync platform data. Please check your connection.');
            addToast('Synchronisation failed', 'error');
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

    const filteredUsers = (users || []).filter(u => {
        const name = (u?.name || u?.username || '').toLowerCase();
        const email = (u?.email || '').toLowerCase();
        const search = (searchTerm || '').toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
                <div className="max-w-md w-full animate-fade-in text-center">
                    <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-500/10 border border-primary-500/20 shadow-2xl relative">
                        <ShieldCheck size={40} className="text-primary-400" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-dark-bg animate-pulse"></div>
                    </div>
                    
                    <h1 className="text-3xl font-display font-black text-white mb-2">Restricted Access</h1>
                    <p className="text-dark-muted text-sm mb-8 px-6">You are attempting to enter the core platform control zone. Please verify your administrative identity.</p>

                    <div className="bg-dark-card border border-dark-border p-8 rounded-3xl shadow-2xl">
                        <form onSubmit={handleVerifyPassword} className="space-y-4">
                            <div className="text-left">
                                <label className="block text-xs font-bold uppercase tracking-widest text-dark-muted mb-2 ml-1">Admin Secret</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-center tracking-[0.5em] font-black"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={verifying || !adminPassword}
                                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center space-x-2"
                            >
                                {verifying ? <Spinner size="sm" /> : (
                                    <>
                                        <Lock size={18} />
                                        <span>Unlock Dashboard</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (error) return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-dark-card border border-red-500/30 p-10 rounded-[3rem] text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <Database size={40} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Sync Connection Failed</h1>
                <p className="text-dark-muted mb-8 text-sm px-4">There was a problem communicating with the administrative data bridge.</p>
                <button 
                    onClick={fetchAllData}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center space-x-2 animate-pulse"
                >
                    <RefreshCw size={18} />
                    <span>Attempt To Reconnect</span>
                </button>
            </div>
        </div>
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
        <div className="pt-16 p-8 max-w-7xl mx-auto animate-fade-in pb-20">
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
                    { label: 'Total Users', value: stats?.users ?? 0, icon: Users, color: 'text-blue-500' },
                    { label: 'Active Projects', value: stats?.projects ?? 0, icon: Folder, color: 'text-green-500' },
                    { label: 'Notes Created', value: stats?.notes ?? 0, icon: FileText, color: 'text-purple-500' },
                    { label: 'Files Uploaded', value: stats?.files ?? 0, icon: Database, color: 'text-orange-500' },
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
                            currentUserId={(() => {
                                try {
                                    return JSON.parse(localStorage.getItem('user'))?._id;
                                } catch (e) {
                                    return null;
                                }
                            })()}
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
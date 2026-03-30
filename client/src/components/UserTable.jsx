import React from 'react';
import { Eye, Trash2, ShieldCheck, ShieldAlert, UserPlus, UserMinus } from 'lucide-react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';

const UserTable = ({ users, onView, onDelete, onRefresh }) => {
    const { addToast } = useToast();

    const toggleAdminStatus = async (userId, currentRole) => {
        const isCurrentlyAdmin = currentRole === 'admin';
        const newRole = isCurrentlyAdmin ? 'user' : 'admin';
        const newIsAdmin = !isCurrentlyAdmin;

        if (!window.confirm(`Are you sure you want to make this user a ${newRole}?`)) return;

        try {
            await API.put(`/admin/users/${userId}/role`, { role: newRole, isAdmin: newIsAdmin });
            addToast(`User updated to ${newRole} successfully`, 'success');
            if (onRefresh) onRefresh();
        } catch (err) {
            addToast('Failed to update user role', 'error');
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-dark-bg/50 text-dark-muted uppercase text-xs font-bold tracking-widest border-b border-dark-border">
                    <tr>
                        <th className="px-6 py-5">User Profile</th>
                        <th className="px-6 py-5">Email Address</th>
                        <th className="px-6 py-5 text-center">Activity Metrics</th>
                        <th className="px-6 py-5">Role/Status</th>
                        <th className="px-6 py-5 text-right">Administrative Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                    {users.map(user => (
                        <tr key={user._id} className="hover:bg-primary-500/5 transition-all group">
                            <td className="px-6 py-5">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 font-black border border-primary-500/20 shadow-inner">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-lg group-hover:text-primary-400 transition-colors uppercase tracking-tight">{user.name}</span>
                                        <span className="text-dark-muted text-[10px] font-mono italic">ID: {user._id.slice(-6)}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <span className="text-dark-text font-medium opacity-80">{user.email}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                                <div className="flex items-center justify-center space-x-4">
                                    <div className="text-center group-hover:scale-110 transition-transform cursor-default">
                                        <p className="text-white font-black text-sm">{user.projectCount || 0}</p>
                                        <p className="text-[8px] text-dark-muted uppercase font-bold tracking-widest">Projects</p>
                                    </div>
                                    <div className="w-px h-6 bg-dark-border opacity-50"></div>
                                    <div className="text-center group-hover:scale-110 transition-transform cursor-default">
                                        <p className="text-white font-black text-sm">{user.noteCount || 0}</p>
                                        <p className="text-[8px] text-dark-muted uppercase font-bold tracking-widest">Notes</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center space-x-3">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                                        user.role === 'admin' 
                                            ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                                            : 'bg-primary-500/10 text-primary-500 border border-primary-500/30'
                                    }`}>
                                        {user.role}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end space-x-3">
                                    <button 
                                        onClick={() => toggleAdminStatus(user._id, user.role)}
                                        className={`p-2.5 rounded-xl border transition-all hover:scale-110 shadow-lg ${
                                            user.role === 'admin'
                                                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20'
                                                : 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20'
                                        }`}
                                        title={user.role === 'admin' ? "Make User" : "Make Admin"}
                                    >
                                        {user.role === 'admin' ? <UserMinus size={20} /> : <UserPlus size={20} />}
                                    </button>
                                    <button 
                                        onClick={() => onView(user._id)}
                                        className="p-2.5 bg-primary-500/10 border border-primary-500/20 text-primary-500 rounded-xl hover:bg-primary-500/20 transition-all hover:scale-110 shadow-lg"
                                        title="Detailed Analysis"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    {user.role !== 'admin' && (
                                        <button 
                                            onClick={() => onDelete(user._id)}
                                            className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/20 transition-all hover:scale-110 shadow-lg"
                                            title="Delete User Payload"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
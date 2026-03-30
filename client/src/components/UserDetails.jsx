import React from 'react';
import { Mail, Calendar, Folder, FileText, Database, Trash2, ArrowLeft } from 'lucide-react';

const UserDetails = ({ data, onBack, onDelete }) => {
    if (!data) return null;
    const { user, projects, notes, files } = data;

    return (
        <div className="animate-fade-in bg-dark-bg/50 rounded-3xl border border-dark-border overflow-hidden">
            <div className="p-8 border-b border-dark-border flex items-center justify-between">
                <button onClick={onBack} className="flex items-center space-x-2 text-dark-muted hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-bold">Back to Users</span>
                </button>
                {user.role !== 'admin' && (
                    <button 
                        onClick={() => onDelete(user._id)}
                        className="bg-red-500/10 border border-red-500/30 text-red-500 px-5 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold flex items-center space-x-2"
                    >
                        <Trash2 size={18} />
                        <span>Delete User</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 p-10">
                {/* Left side: Profile Info */}
                <div className="md:col-span-1 space-y-8">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-primary-500/10 flex items-center justify-center text-4xl text-primary-500 font-black mb-6 border-2 border-primary-500/30">
                            {user.name.charAt(0)}
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">{user.name}</h3>
                        <p className="inline-block px-3 py-1 bg-dark-card border border-dark-border rounded-full text-dark-muted text-xs font-bold uppercase tracking-widest">{user.role}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-dark-bg rounded-2xl border border-dark-border">
                            <Mail size={18} className="text-primary-500" />
                            <div>
                                <p className="text-[10px] text-dark-muted uppercase font-bold tracking-widest">Email Address</p>
                                <p className="text-white font-medium">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-dark-bg rounded-2xl border border-dark-border">
                            <Calendar size={18} className="text-primary-500" />
                            <div>
                                <p className="text-[10px] text-dark-muted uppercase font-bold tracking-widest">Join Date</p>
                                <p className="text-white font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Detailed Lists */}
                <div className="md:col-span-2 space-y-10">
                    {/* Projects Section */}
                    <div>
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Folder size={20} className="mr-3 text-primary-500" /> 
                            User Projects ({projects.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {projects.map(p => (
                                <div key={p._id} className="p-4 bg-dark-bg/30 border border-dark-border rounded-2xl">
                                    <p className="text-white font-bold mb-1 truncate">{p.projectName}</p>
                                    <p className="text-dark-muted text-[10px] line-clamp-1">{p.description}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${p.isPublic ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                            {p.isPublic ? 'Public' : 'Private'}
                                        </span>
                                        <p className="text-[10px] text-dark-muted font-mono">{new Date(p.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resources Section - Notes and Files Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                                <FileText size={18} className="mr-3 text-primary-500" /> Notes ({notes.length})
                            </h4>
                            <div className="space-y-3">
                                {notes.slice(0, 5).map(n => (
                                    <div key={n._id} className="p-3 bg-dark-bg/30 border border-dark-border rounded-xl">
                                        <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                                        <p className="text-[10px] text-dark-muted font-mono mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                                <Database size={18} className="mr-3 text-primary-500" /> Uploaded Files ({files.length})
                            </h4>
                            <div className="space-y-3">
                                {files.slice(0, 5).map(f => (
                                    <div key={f._id} className="p-3 bg-dark-bg/30 border border-dark-border rounded-xl">
                                        <p className="text-sm font-semibold text-white truncate">{f.fileName}</p>
                                        <p className="text-[10px] text-dark-muted font-mono mt-1">{new Date(f.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
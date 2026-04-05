import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { BASE_URL } from '../config';
import NoteEditor from '../components/NoteEditor';
import FileUploader from '../components/FileUploader';
import AIExplainPanel from '../components/AIExplainPanel';
import AnalyticsPanel from '../components/AnalyticsPanel';
import {
    FileText, Files, Users, BarChart, Sparkles, Plus,
    Trash2, UserPlus, Globe, Lock, ChevronLeft, GitBranch, Star, Eye, Settings, Code as CodeIcon, Tag, Image, Loader, X
} from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const FileContentLoader = ({ fileUrl, fileName }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    const isCodeFile = (name) => {
        return /\.(js|jsx|ts|tsx|py|java|cpp|c|h|html|css|scss|json|md|sql|sh|rs|go|php|rb|txt)$/i.test(name);
    };

    useEffect(() => {
        if (isCodeFile(fileName)) {
            const fetchContent = async () => {
                setLoading(true);
                try {
                    const response = await fetch(fileUrl);
                    const text = await response.text();
                    setContent(text);
                } catch (err) {
                    console.error('Failed to fetch file content:', err);
                    setContent('Failed to load file content.');
                } finally {
                    setLoading(false);
                }
            };
            fetchContent();
        }
    }, [fileUrl, fileName]);

    if (!isCodeFile(fileName)) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                <FileText size={64} className="text-dark-muted mb-4 opacity-20" />
                <p className="text-white font-bold text-lg mb-2">Preview not available</p>
                <p className="text-dark-muted text-sm max-w-xs">This file type cannot be previewed directly. Please download it to view.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loader className="animate-spin text-primary-500 mb-2" size={32} />
                <p className="text-dark-muted text-xs">Loading file content...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-6 font-mono text-sm bg-dark-bg/30">
            <pre className="whitespace-pre-wrap break-words text-dark-text leading-relaxed">
                {content}
            </pre>
        </div>
    );
};

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [notes, setNotes] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('docs'); // docs, files, settings, activity, code
    const [editingNote, setEditingNote] = useState(null);
    const [showAI, setShowAI] = useState(false);
    const [aiInitialContent, setAiInitialContent] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [expandedNotes, setExpandedNotes] = useState({});
    const [codeContent, setCodeContent] = useState('');
    const [loadingContent, setLoadingContent] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const { addToast } = useToast();
    
    // Get current user from local storage
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    // Robust isOwner check
    const isOwner = project && userInfo && (
        (project.owner?._id ? project.owner._id === userInfo._id : project.owner === userInfo._id)
    );

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const fetchProjectData = async () => {
        try {
            const pRes = await API.get(`/projects/${id}`);
            const nRes = await API.get(`/notes/${id}`);
            const fRes = await API.get(`/files/${id}`);
            setProject(pRes.data);
            setNotes(nRes.data);
            setFiles(fRes.data);
        } catch (err) {
            console.error(err);
            addToast('Failed to load project details', 'error');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNote = async (noteData) => {
        try {
            setActionLoading(true);
            if (editingNote?._id) {
                const res = await API.put(`/notes/${editingNote._id}`, noteData);
                setNotes(notes.map(n => n._id === editingNote._id ? res.data : n));
                addToast('Note updated!', 'success');
            } else {
                const res = await API.post('/notes', { ...noteData, projectId: id });
                setNotes([res.data, ...notes]);
                addToast('Note created!', 'success');
            }
            setEditingNote(null);
        } catch (err) {
            addToast(err.response?.data?.message || 'Save failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Delete this note?')) return;
        try {
            setActionLoading(true);
            await API.delete(`/notes/${noteId}`);
            setNotes(notes.filter(n => n._id !== noteId));
            addToast('Note deleted', 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Delete failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            await API.post('/projects/add-member', {
                projectId: id,
                email: inviteEmail
            });
            setInviteEmail('');
            addToast(`Invitation sent successfully!`, 'success');
            // Re-fetch project to show updated member list or pending status if handled
            fetchProjectData();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to add member', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            setActionLoading(true);
            await API.post('/projects/remove-member', {
                projectId: id,
                userId: userId
            });
            await fetchProjectData();
            addToast('Member removed successfully', 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to remove member', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteProject = async () => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await API.delete(`/projects/${id}`);
                addToast('Project deleted', 'success');
                navigate('/dashboard');
            } catch (err) {
                addToast('Failed to delete project', 'error');
            }
        }
    };

    const openAI = (content) => {
        setAiInitialContent(content);
        setShowAI(true);
    };

    if (loading) return (
        <div className="max-w-[1280px] mx-auto px-4 space-y-8 pt-10 h-screen">
            <div className="space-y-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-96" />
            </div>
            <div className="flex gap-4 border-b border-dark-border pb-2">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-24" />)}
            </div>
            <div className="h-96 bg-dark-card/50 rounded-xl animate-pulse"></div>
        </div>
    );

    return (
        <div className="animate-fade-in relative max-w-[1280px] mx-auto px-4 pb-20">
            {/* GitHub-style Breadcrumb Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 text-xl">
                    <GitBranch size={20} className="text-dark-muted" />
                    <nav className="flex items-center gap-1">
                        <Link to="/dashboard" className="text-primary-500 hover:underline">{project.owner?.name || userInfo?.name}</Link>
                        <span className="text-dark-muted">/</span>
                        <span className="font-bold whitespace-nowrap">{project.projectName}</span>
                        <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full border border-dark-border text-dark-muted h-fit">
                            {project.isPublic ? 'Public' : 'Private'}
                        </span>
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-dark-card border border-dark-border rounded-md overflow-hidden">
                        <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold hover:bg-dark-hover transition-colors border-r border-dark-border">
                            <Eye size={14} /> Watch
                            <span className="bg-dark-border px-1.5 rounded-full text-[10px]">1</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold hover:bg-dark-hover transition-colors border-r border-dark-border">
                            <Star size={14} /> Star
                            <span className="bg-dark-border px-1.5 rounded-full text-[10px]">0</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold hover:bg-dark-hover transition-colors">
                            <GitBranch size={14} /> Fork
                            <span className="bg-dark-border px-1.5 rounded-full text-[10px]">0</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs Header */}
            <div className="border-b border-dark-border mb-8 scrollbar-hide overflow-x-auto">
                <nav className="flex space-x-1 sm:space-x-4">
                    {[
                            { id: 'code', label: 'Code', icon: CodeIcon },
                            { id: 'docs', label: 'Documentation', icon: FileText },
                            { id: 'activity', label: 'Insights', icon: BarChart },
                            { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(({ id: tabId, label, icon: Icon }) => (
                        <button
                            key={tabId}
                            onClick={() => setActiveTab(tabId)}
                            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-all h-12 ${
                                activeTab === tabId 
                                ? 'border-accent text-dark-text' 
                                : 'border-transparent text-dark-muted hover:border-dark-muted/40 hover:text-dark-text'
                            }`}
                        >
                            <Icon size={16} />
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content Area */}
                <div className={`flex-1 transition-all duration-300 ${showAI ? 'lg:mr-[400px]' : ''}`}>
                    
                    <div className="tab-content min-h-[500px]">
                        {activeTab === 'code' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-dark-card border border-dark-border rounded-md px-3 py-1.5 text-xs text-dark-text">
                                            <GitBranch size={14} className="mr-2 text-dark-muted" />
                                            <span className="font-semibold">main</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setShowUpload(!showUpload)}
                                            className="github-btn-secondary !py-1.5 !px-3 flex items-center gap-2"
                                        >
                                            <Plus size={14} />
                                            Add file
                                        </button>
                                        <button className="github-btn-primary !py-1.5 !px-3">
                                            Code
                                        </button>
                                    </div>
                                </div>

                                {showUpload && (
                                    <div className="mb-6 animate-slide-up">
                                        <FileUploader 
                                            projectId={id} 
                                            files={files} 
                                            onUploadSuccess={fetchProjectData} 
                                            showUploadOnly={true} 
                                        />
                                    </div>
                                )}

                                <div className="github-card overflow-hidden border-dark-border">
                                    <div className="bg-dark-card border-b border-dark-border p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 text-[10px] font-bold">
                                                {project.owner?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="text-xs font-semibold text-dark-text">{project.owner?.name}</span>
                                            <span className="text-xs text-dark-muted">Initial repository setup</span>
                                        </div>
                                        <span className="text-[10px] text-dark-muted">
                                            {files.length > 0 ? `Updated ${new Date(Math.max(...files.map(f => new Date(f.createdAt)))).toLocaleDateString()}` : 'No files yet'}
                                        </span>
                                    </div>
                                    <div className="divide-y divide-dark-border">
                                        {files.length > 0 ? files.map(file => (
                                            <div key={file._id} className="flex items-center justify-between p-3 hover:bg-dark-card/50 px-4 group transition-colors">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    {file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                        <Image size={16} className="text-dark-muted shrink-0" />
                                                    ) : (
                                                        <FileText size={16} className="text-dark-muted shrink-0" />
                                                    )}
                                                    <button 
                                                        onClick={() => setPreviewFile(file)}
                                                        className="text-sm font-medium text-dark-text hover:text-primary-500 hover:underline truncate"
                                                    >
                                                        {file.fileName}
                                                    </button>
                                                </div>
                                                <div className="hidden md:block flex-1 text-xs text-dark-muted px-4 truncate italic">
                                                    Added via upload
                                                </div>
                                                <div className="text-[10px] text-dark-muted w-24 text-right">
                                                    {new Date(file.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-10 text-center text-dark-muted text-sm italic">
                                                No files in this repository yet. Use the "Add file" button to get started.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {project.description && (
                                    <div className="github-card mt-6 p-4">
                                        <h4 className="text-xs font-bold text-dark-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <FileText size={14} /> README.md
                                        </h4>
                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-sm text-dark-text leading-relaxed">
                                                {project.description}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'docs' && (
                            <div className="space-y-6">
                                {!editingNote && (
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Project Wiki</h3>
                                        <button
                                            onClick={() => setEditingNote({ title: '', content: '' })}
                                            className="github-btn-primary text-xs"
                                        >
                                            <Plus size={14} className="inline mr-1" /> New Page
                                        </button>
                                    </div>
                                )}
                                
                                {editingNote ? (
                                    <NoteEditor
                                        key={editingNote._id || 'new'}
                                        note={editingNote}
                                        onSave={handleSaveNote}
                                        onCancel={() => setEditingNote(null)}
                                        onAIAction={openAI}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {notes.length > 0 ? notes.map(note => (
                                            <div key={note._id} className="github-card p-5 group hover:border-primary-500/30 transition-all bg-dark-card">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-primary-500 hover:underline cursor-pointer" onClick={() => setEditingNote(note)}>{note.title}</h3>
                                                        <p className="text-dark-muted text-sm mt-2 leading-relaxed whitespace-pre-wrap">
                                                            {note.content}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-4">
                                                            <div className="w-5 h-5 rounded-full bg-primary-500/10 flex items-center justify-center text-[10px] font-bold text-primary-500">
                                                                {note.createdBy?.name?.charAt(0) || 'U'}
                                                            </div>
                                                            <span className="text-[10px] text-dark-muted">Edited by {note.createdBy?.name} • {new Date(note.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openAI(note.content)} className="p-1.5 text-dark-muted hover:text-primary-500 transition-colors" title="AI Explain"><Sparkles size={16} /></button>
                                                        <button onClick={() => setEditingNote(note)} className="p-1.5 text-dark-muted hover:text-primary-500 transition-colors" title="Edit"><FileText size={16} /></button>
                                                        <button onClick={() => handleDeleteNote(note._id)} className="p-1.5 text-dark-muted hover:text-red-500 transition-colors" title="Delete"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-20 github-card bg-dark-bg/50 border-dashed">
                                                <p className="text-dark-muted italic">No documentation pages created yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Preview Modal Logic moved from FileUploader to ProjectDetails */}
                        {previewFile && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
                                <div className="relative w-full max-w-5xl h-[90vh] bg-dark-card rounded-3xl overflow-hidden flex flex-col border border-dark-border shadow-2xl">
                                    <div className="flex justify-between items-center p-6 border-b border-dark-border bg-dark-card/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-dark-bg rounded-lg text-primary-500">
                                                {previewFile.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? <Image size={20} /> : <FileText size={20} />}
                                            </div>
                                            <h3 className="text-xl font-bold text-white truncate">{previewFile.fileName}</h3>
                                        </div>
                                        <button 
                                            onClick={() => setPreviewFile(null)}
                                            className="p-2 hover:bg-white/10 rounded-full text-dark-muted hover:text-white transition-colors"
                                        >
                                            <X size={24} /> 
                                        </button>
                                    </div>
                                    <div className="flex-1 bg-black/20 overflow-auto">
                                        {previewFile.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                                            <div className="flex items-center justify-center h-full p-4">
                                                <img 
                                                    src={previewFile.fileUrl.startsWith('http') ? previewFile.fileUrl : `${BASE_URL}${previewFile.fileUrl}`} 
                                                    alt={previewFile.fileName} 
                                                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" 
                                                />
                                            </div>
                                        ) : previewFile.fileName.toLowerCase().endsWith('.pdf') ? (
                                            <iframe 
                                                src={`${previewFile.fileUrl.startsWith('http') ? previewFile.fileUrl : `${BASE_URL}${previewFile.fileUrl}`}#toolbar=0`} 
                                                className="w-full h-full border-none bg-white font-display" 
                                                title="File Preview"
                                            />
                                        ) : (
                                            <FileContentLoader fileUrl={previewFile.fileUrl} fileName={previewFile.fileName} />
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-dark-card/50 border-t border-dark-border">
                                         <p className="text-[10px] text-dark-muted uppercase font-bold tracking-widest hidden md:block">CollabSphere Code Preview</p>
                                         <div className="flex items-center space-x-6">
                                            <a 
                                                href={previewFile.fileUrl.startsWith('http') ? previewFile.fileUrl : `${BASE_URL}${previewFile.fileUrl}`} 
                                                download 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="text-primary-500 hover:text-primary-400 font-bold text-sm flex items-center gap-2"
                                            >
                                                Download Raw
                                            </a>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Delete this file?')) {
                                                        try {
                                                            await API.delete(`/files/${previewFile._id}`);
                                                            setPreviewFile(null);
                                                            fetchProjectData();
                                                            addToast('File deleted', 'success');
                                                        } catch (err) {
                                                            addToast('Delete failed', 'error');
                                                        }
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-400 font-bold flex items-center gap-2 transition-all"
                                            >
                                                <Trash2 size={16} />
                                                <span>Delete</span>
                                            </button>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <AnalyticsPanel projectId={id} />
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-10 max-w-3xl mx-auto py-6">
                                <section>
                                    <h3 className="text-lg font-bold border-b border-dark-border pb-2 mb-6">Manage Access</h3>
                                    {isOwner && (
                                        <form onSubmit={handleAddMember} className="flex gap-3 mb-8">
                                            <input
                                                type="email"
                                                required
                                                placeholder="Collaborator's email"
                                                className="flex-1 bg-dark-bg border border-dark-border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                            />
                                            <button 
                                                type="submit" 
                                                disabled={actionLoading}
                                                className="github-btn-primary flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {actionLoading ? <Spinner size="16" /> : <UserPlus size={16} />}
                                                <span>Invite</span>
                                            </button>
                                        </form>
                                    )}

                                    <div className="github-card overflow-hidden">
                                        {project.members.map((member, index) => (
                                            <div key={member._id} className={`flex items-center justify-between p-3 ${index !== 0 ? 'border-t border-dark-border' : ''} bg-dark-card`}>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-xs">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{member.name}</p>
                                                        <p className="text-[10px] text-dark-muted">{member.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {(project.owner?._id === member._id || project.owner === member._id) ? (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-dark-border font-medium bg-primary-500/10 text-primary-500">
                                                            Owner
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-dark-border font-medium text-dark-muted">
                                                                Member
                                                            </span>
                                                            {isOwner && (
                                                                <button
                                                                    onClick={() => handleRemoveMember(member._id)}
                                                                    disabled={actionLoading}
                                                                    className="px-2 py-1 flex items-center gap-1 text-[10px] font-bold text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded transition-all disabled:opacity-50"
                                                                    title="Remove Member"
                                                                >
                                                                    <X size={12} />
                                                                    <span>REMOVE</span>
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {isOwner && (
                                    <section>
                                        <h3 className="text-lg font-bold border-b border-dark-border pb-2 mb-6 text-red-500">Danger Zone</h3>
                                        <div className="github-card border-red-500/30 p-4 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-sm">Delete this repository</h4>
                                                <p className="text-[10px] text-dark-muted mt-1">Once you delete a repository, there is no going back. Please be certain.</p>
                                            </div>
                                            <button
                                                onClick={handleDeleteProject}
                                                className="px-3 py-1.5 rounded-md border border-red-500/30 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                Delete Repository
                                            </button>
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Sidebar Toggle & Info */}
                <div className="w-full lg:w-72 shrink-0 space-y-6">
                    <div className="github-card p-4 bg-dark-card/50 border-accent/20">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Sparkles size={16} className="text-accent" />
                            AI Insights
                        </h3>
                        <p className="text-xs text-dark-muted mb-4 leading-relaxed">
                            Need help understanding your documentation or code? Use Gemini AI to get instant explanations.
                        </p>
                        <button
                            onClick={() => setShowAI(!showAI)}
                            className="w-full py-2 rounded-md bg-accent/10 border border-accent/20 text-accent text-xs font-bold hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles size={14} />
                            Launch Gemini
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-dark-text uppercase tracking-wider">About</h4>
                        <p className="text-sm text-dark-muted leading-relaxed">
                            {project.description || "No description provided."}
                        </p>
                        <div className="pt-2 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-xs text-dark-muted">
                                <GitBranch size={14} />
                                <span>1 Branch</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-dark-muted">
                                <Tag size={14} />
                                <span>0 Releases</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Overlay Sidebar */}
                {showAI && (
                    <div className="fixed top-[56px] right-0 bottom-0 w-full lg:w-[400px] border-l border-dark-border bg-dark-bg/95 backdrop-blur-xl animate-fade-in z-40 p-6 shadow-2xl">
                        <AIExplainPanel initialContent={aiInitialContent} onClose={() => setShowAI(false)} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;

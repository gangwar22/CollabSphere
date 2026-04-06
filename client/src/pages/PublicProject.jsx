import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { BASE_URL } from '../config';
import { Globe, Code, ArrowRight, Loader, Star, GitFork, Eye, Hash, Clock, User, FileText, ChevronRight, Share2, CornerUpRight, Terminal } from 'lucide-react';

const PublicProject = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [notes, setNotes] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [shareCopied, setShareCopied] = useState(false);
    const [isReadmeExpanded, setIsReadmeExpanded] = useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
    };

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const { data } = await API.get(`/projects/public/${id}`);
                setProject(data);
                // Also fetch notes and files (allowed for public projects)
                const nRes = await API.get(`/notes/${id}`);
                const fRes = await API.get(`/files/${id}`);
                setNotes(nRes.data);
                setFiles(fRes.data);
            } catch (err) {
                setError('Project not found or private');
            } finally {
                setLoading(false);
            }
        };
        fetchPublicData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#06090f] flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            <p className="text-primary-500 font-black uppercase tracking-[0.3em] animate-pulse">Initializing Assets</p>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-[#06090f] flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
                <Hash className="text-red-500" size={32} />
            </div>
            <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Access Restricted</h1>
            <p className="text-dark-muted max-w-sm font-medium">{error}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#06090f] text-[#c9d1d9] pb-32">
            {/* Minimal Sub-Navbar */}
            <div className="sticky top-14 z-40 bg-[#0d1117]/80 backdrop-blur-md border-b border-white/5 py-3">
                <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <GitFork size={14} className="text-primary-500" />
                        </div>
                        <nav className="flex items-center text-sm font-bold truncate">
                            <Link to="/dashboard" className="text-dark-muted hover:text-white transition-colors">Explorer</Link>
                            <ChevronRight size={14} className="mx-1.5 text-white/20" />
                            <span className="text-white truncate uppercase tracking-widest text-[11px]">{project.projectName}</span>
                        </nav>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <button 
                            onClick={handleShare}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border transition-all text-[10px] font-black uppercase tracking-widest min-w-[160px] justify-center ${
                                shareCopied 
                                ? 'bg-green-500/10 border-green-500/50 text-green-500' 
                                : 'bg-primary-500/10 border-primary-500/20 text-primary-400 hover:bg-primary-500 hover:text-dark-bg hover:border-primary-500 shadow-lg shadow-primary-500/5'
                            }`}
                        >
                            {shareCopied ? <Check size={14} className="animate-in zoom-in duration-300" /> : <Share2 size={14} />}
                            {shareCopied ? 'Link Copied!' : 'Share Public Repo'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Repository Details */}
                    <div className="lg:col-span-8">
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="px-2.5 py-1 rounded-md bg-primary-500/10 border border-primary-500/20 text-[10px] font-black text-primary-500 uppercase tracking-widest">
                                    Public Showcase
                                </div>
                                <div className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-dark-muted uppercase tracking-widest">
                                    v1.0.4-dev
                                </div>
                            </div>
                            
                            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
                                {project.projectName}
                            </h1>
                            
                            <p className="text-lg sm:text-xl text-[#8b949e] leading-relaxed max-w-3xl mb-10 font-medium italic opacity-90">
                                "{project.description || 'Welcome to this collaborative masterpiece, where architectural precision meets experimental innovation.'}"
                            </p>

                            <div className="mt-12 space-y-4">
                                <h3 className="text-xs font-black text-dark-muted uppercase tracking-[0.3em] mb-4">Repository Files</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {files.map(file => (
                                        <div key={file._id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{file.fileName}</p>
                                                <p className="text-[10px] text-dark-muted font-black uppercase tracking-widest">{new Date(file.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {files.length === 0 && <p className="text-sm text-dark-muted italic px-2">No files uploaded yet.</p>}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-8 py-8 border-y border-white/5 mt-12">
                                <div className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 p-[1.5px] group-hover:scale-105 transition-transform">
                                        <div className="w-full h-full rounded-[9.5px] bg-[#0d1117] flex items-center justify-center font-black text-white text-sm">
                                            {project.owner?.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-dark-muted font-black uppercase tracking-widest mb-0.5">Maintainer</p>
                                        <p className="text-sm font-bold text-white group-hover:text-primary-500 transition-colors uppercase italic">{project.owner?.name}</p>
                                    </div>
                                </div>
                                
                                <div className="hidden sm:block h-8 w-px bg-white/5" />
                                
                                <div className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-dark-muted font-black uppercase tracking-widest mb-0.5">Deployed</p>
                                        <p className="text-sm font-bold text-white uppercase italic">{new Date(project.createdAt).toLocaleDateString(undefined, {month: 'long', year: 'numeric'})}</p>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-[200px] flex justify-end gap-3">
                                    <Link to="/register" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                        <span className="text-xs font-black uppercase tracking-widest">Collab Preview</span>
                                        <CornerUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="mb-16">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-[11px] font-black text-dark-muted uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Terminal size={14} className="text-primary-500" /> Source Objects
                                </h2>
                                <span className="text-[10px] font-black text-primary-500/60 uppercase">{files.length} ASSETS</span>
                            </div>
                            
                            <div className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mb-16">
                                {files.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {files.map(file => (
                                            <div key={file._id} className="group flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{file.fileName}</p>
                                                        <p className="text-[10px] text-dark-muted font-black uppercase tracking-widest">Shared by {file.uploadedBy?.name}</p>
                                                    </div>
                                                </div>
                                                <a 
                                                    href={`${BASE_URL}${file.fileUrl}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="px-3 py-1.5 rounded-lg border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-dark-bg transition-all"
                                                >
                                                    Inspect
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <Code size={40} className="mx-auto text-dark-muted opacity-20 mb-4" />
                                        <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em]">No static assets linked yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Documentation Preview (Notes) */}
                            <div className="mb-16">
                                <h2 className="text-[11px] font-black text-dark-muted uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                                    <FileText size={14} className="text-primary-500" /> Documentation Preview
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {notes.length > 0 ? (
                                        notes.map(note => (
                                            <div key={note._id} className="p-6 rounded-[2rem] bg-[#0d1117] border border-white/5 hover:border-primary-500/20 transition-all group">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
                                                    <h3 className="text-sm font-black text-white uppercase tracking-tight">{note.title}</h3>
                                                </div>
                                                <p className="text-xs text-[#8b949e] leading-relaxed line-clamp-3 italic mb-6">
                                                    "{note.content}"
                                                </p>
                                                <div className="flex items-center justify-between text-[8px] font-black text-dark-muted uppercase tracking-widest border-t border-white/5 pt-4">
                                                    <span>{note.createdBy?.name}</span>
                                                    <span className="text-primary-500/60">{new Date(note.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 p-10 rounded-[2rem] bg-white/[0.01] border border-dashed border-white/5 text-center">
                                            <p className="text-[10px] font-black text-dark-muted uppercase tracking-widest">Documentation manifest empty</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* README Section - High Fidelity UI */}
                            <div className="mt-20 group/readme">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-6 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"></div>
                                        <h2 className="text-[14px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                                            SPECIFICATION / README.md
                                        </h2>
                                    </div>
                                    <div className="h-px flex-1 bg-white/5 mx-8"></div>
                                    <span className="text-[10px] font-black text-dark-muted uppercase tracking-widest">{project.readme?.length || 0} BYTES</span>
                                </div>
                                
                                <div className="bg-[#090c10] border border-white/[0.08] rounded-[2.5rem] overflow-hidden shadow-2xl relative transition-all duration-500 hover:border-primary-500/20">
                                    <div className={`p-10 md:p-16 prose prose-invert max-w-none transition-all duration-1000 ease-in-out ${!isReadmeExpanded ? 'max-h-[600px] overflow-hidden' : 'pb-32'}`}>
                                        {project.readme ? (
                                            <div className="font-sans leading-relaxed text-[#8b949e]">
                                                {project.readme.split('\n').map((line, i) => {
                                                    if (line.startsWith('# ')) return <h1 key={i} className="text-4xl md:text-5xl font-black text-white mb-10 pb-6 border-b border-white/10 tracking-tighter leading-tight mt-4">{line.replace('# ', '')}</h1>;
                                                    if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mb-6 mt-16 tracking-tight flex items-center gap-4"><span className="text-primary-500">/</span>{line.replace('## ', '')}</h2>;
                                                    if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-white/90 mb-4 mt-10 italic">{line.replace('### ', '')}</h3>;
                                                    if (line.startsWith('- ') || line.startsWith('* ')) return <div key={i} className="flex gap-4 ml-4 mb-3 items-start"><div className="mt-2 w-1.5 h-1.5 bg-primary-500/40 rounded-full shrink-0"></div><span className="text-[#aab3bc]">{line.substring(2)}</span></div>;
                                                    if (line.trim() === '') return <div key={i} className="h-6" />;
                                                    return <p key={i} className="mb-4 text-lg text-[#9da5b1] leading-[1.8] font-medium opacity-90">{line}</p>;
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-24 text-center opacity-30">
                                                <FileText size={48} className="mx-auto mb-6 text-dark-muted" />
                                                <p className="text-sm font-black uppercase tracking-[0.3em]">Documentation manifest unavailable</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {project.readme && project.readme.length > 800 && (
                                        <div className={`${!isReadmeExpanded ? 'absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#090c10] via-[#090c10]/95 to-transparent flex items-end justify-center pb-12' : 'flex justify-center -mt-16 pb-16 relative z-10'}`}>
                                            <button 
                                                onClick={() => setIsReadmeExpanded(!isReadmeExpanded)}
                                                className="group/btn flex items-center gap-4 px-10 py-4 rounded-full bg-[#161b22] border border-white/10 text-[11px] font-black uppercase tracking-[0.3em] text-white hover:bg-primary-500 hover:text-dark-bg hover:border-primary-500 hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-95"
                                            >
                                                {isReadmeExpanded ? 'MINIMIZE SPEC' : 'READ FULL SPECIFICATION'}
                                                <ArrowRight size={16} className={`transition-transform duration-500 ${isReadmeExpanded ? '-rotate-90' : 'group-hover:translate-x-2'}`} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Platform Utility & Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-primary-700 text-dark-bg relative overflow-hidden group">
                           <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-white/20 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-1000"></div>
                           <h3 className="text-xl font-black uppercase tracking-tighter mb-4 leading-none">Architectural Collaboration</h3>
                           <p className="text-xs font-bold leading-relaxed mb-10 opacity-80 leading-loose italic">
                               Unlock the full potential of this repository by joining the CollabSphere collective.
                           </p>
                           <Link to="/register" className="flex items-center justify-between w-full p-4 bg-[#06090f] rounded-2xl group/btn hover:translate-x-1 transition-all">
                               <span className="text-xs font-black text-white uppercase tracking-widest">Join Project</span>
                               <ArrowRight size={18} className="text-primary-500 group-hover/btn:translate-x-1 transition-transform" />
                           </Link>
                        </div>

                        <div className="p-6 rounded-3xl bg-[#0d1117] border border-white/5 space-y-6">
                            <h4 className="text-[10px] font-black text-dark-muted uppercase tracking-[0.3em]">Runtime Specifications</h4>
                            
                            {[
                                {label: 'Sync Protocol', val: 'Real-time', icon: Globe, color: 'text-blue-400'},
                                {label: 'AI Processor', val: 'Gemini v1.5', icon: Share2, color: 'text-purple-400'},
                                {label: 'Storage Tier', val: 'Encrypted', icon: CornerUpRight, color: 'text-emerald-400'},
                            ].map((spec, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${spec.color}`}>
                                            <spec.icon size={14} />
                                        </div>
                                        <span className="text-[11px] font-bold text-dark-muted uppercase tracking-wider">{spec.label}</span>
                                    </div>
                                    <span className="text-xs font-black text-white italic">{spec.val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl bg-[#0d1117] border border-white/5 text-center group hover:border-primary-500/20 transition-all">
                                <p className="text-[9px] font-black text-dark-muted uppercase tracking-widest mb-1">Stars</p>
                                <p className="text-2xl font-black text-white group-hover:text-primary-500 transition-colors">124</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-[#0d1117] border border-white/5 text-center group hover:border-primary-500/20 transition-all">
                                <p className="text-[9px] font-black text-dark-muted uppercase tracking-widest mb-1">Forks</p>
                                <p className="text-2xl font-black text-white group-hover:text-primary-500 transition-colors">42</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProject;

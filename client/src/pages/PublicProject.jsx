import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { BASE_URL } from '../config';
import { Globe, Code, ArrowRight, Loader } from 'lucide-react';

const PublicProject = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [notes, setNotes] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (loading) return <div className="flex items-center justify-center py-40"><Loader className="animate-spin" /></div>;
    if (error) return <div className="text-center py-40 text-red-500">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto py-20 animate-fade-in">
            <div className="glass p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Globe size={160} />
                </div>

                <div className="relative z-10">
                    <div className="inline-flex items-center space-x-2 text-primary-500 mb-6 bg-primary-500/10 px-4 py-2 rounded-full text-sm font-bold tracking-widest uppercase">
                        <Globe size={16} />
                        <span>Public Repository</span>
                    </div>

                    <h1 className="text-6xl font-black text-white mb-6 uppercase tracking-tighter">
                        {project.projectName}
                    </h1>

                    <p className="text-2xl text-dark-muted mb-12 leading-relaxed max-w-2xl">
                        {project.description}
                    </p>

                    <div className="flex items-center space-x-6 mb-12">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center font-bold text-primary-500">
                                {project.owner?.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-white font-bold">{project.owner?.name}</p>
                                <p className="text-xs text-dark-muted uppercase tracking-widest">Architect</p>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-dark-border" />
                        <div>
                            <p className="text-white font-bold">{new Date(project.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs text-dark-muted uppercase tracking-widest">Launched</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/register"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center space-x-2"
                        >
                            <span>Join to Collaborate</span>
                            <ArrowRight size={24} />
                        </Link>
                        <Link
                            to="/login"
                            className="glass px-10 py-5 rounded-2xl text-lg font-bold hover:bg-white/5 transition-all flex items-center justify-center"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-20 space-y-20">
                {/* Public Notes */}
                {notes.length > 0 && (
                    <section>
                        <h2 className="text-3xl font-black text-white mb-8 border-l-4 border-primary-500 pl-4 uppercase tracking-tighter">Documentation Preview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {notes.map(note => (
                                <div key={note._id} className="glass p-8 rounded-3xl hover:bg-white/5 transition-all">
                                    <h3 className="text-xl font-bold text-white mb-4">{note.title}</h3>
                                    <p className="text-dark-muted text-sm line-clamp-3 leading-relaxed mb-6">{note.content}</p>
                                    <div className="flex items-center space-x-2 text-[10px] text-dark-muted font-bold uppercase tracking-widest">
                                        <span>By {note.createdBy?.name}</span>
                                        <span>•</span>
                                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Public Files */}
                {files.length > 0 && (
                    <section>
                        <h2 className="text-3xl font-black text-white mb-8 border-l-4 border-primary-500 pl-4 uppercase tracking-tighter">Project Resources</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {files.map(file => (
                                <div key={file._id} className="glass p-4 rounded-2xl flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-dark-bg flex items-center justify-center text-primary-500 mb-4">
                                        <Code size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-white truncate w-full mb-1">{file.fileName}</p>
                                    <p className="text-[10px] text-dark-muted uppercase tracking-widest mb-4">{file.uploadedBy?.name}</p>
                                    <a
                                        href={`${BASE_URL}${file.fileUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] font-black text-primary-500 hover:text-white transition-colors"
                                    >
                                        VIEW FILE
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: 'Cloud Documentation', emoji: '📄' },
                        { label: 'Real-time Sync', emoji: '🔄' },
                        { label: 'Gemini AI Insights', emoji: '🤖' },
                    ].map((feat, i) => (
                        <div key={i} className="glass p-8 rounded-3xl text-center">
                            <span className="text-4xl mb-4 block">{feat.emoji}</span>
                            <p className="text-white font-bold">{feat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PublicProject;

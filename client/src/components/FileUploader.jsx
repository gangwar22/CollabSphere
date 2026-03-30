import React, { useState } from 'react';
import API from '../api/axios';
import { Upload, File, Image, Trash2, Loader, X } from 'lucide-react';

const FileUploader = ({ projectId, files, onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);

        setUploading(true);
        console.log(`Uploading file: ${file.name}`);
        try {
            await API.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUploadSuccess(); // This will refresh the file list automatically
        } catch (err) {
            console.error('Upload Error:', err.response?.data || err.message);
            alert('Upload failed: ' + (err.response?.data?.message || 'Unknown error'));
        } finally {
            setUploading(false);
            e.target.value = null; // Clear input to allow re-upload of same file
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await API.delete(`/files/${fileId}`);
            onUploadSuccess(); // Re-fetch file list
        } catch (err) {
            console.error('Delete error:', err.response?.data || err.message);
            alert('Failed to delete file');
        }
    };

    const isPreviewable = (fileName) => {
        return /\.(jpg|jpeg|png|gif|pdf|txt)$/i.test(fileName);
    };

    return (
        <div className="space-y-6">
            <div className="relative group">
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
                <div className="border-2 border-dashed border-dark-border rounded-2xl p-10 flex flex-col items-center justify-center transition-all group-hover:border-primary-500/50 bg-dark-bg/30">
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <Loader className="animate-spin text-primary-500 mb-2" size={32} />
                            <p className="text-white font-medium">Uploading & Replacing...</p>
                        </div>
                    ) : (
                        <>
                            <Upload className="text-dark-muted group-hover:text-primary-500 transition-colors mb-2" size={32} />
                            <p className="text-white font-medium">Click or drag to upload</p>
                            <p className="text-dark-muted text-xs mt-1 italic">Uploading a file with the same name will replace the old one.</p>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {files.map((file) => (
                    <div key={file._id} className="glass p-4 rounded-xl flex items-center justify-between group hover:border-primary-500/30 transition-all">
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="p-2 bg-dark-bg rounded-lg text-primary-500 shrink-0">
                                {file.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? <Image size={20} /> : <File size={20} />}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{file.fileName}</p>
                                <p className="text-[10px] text-dark-muted">By {file.uploadedBy?.name || 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isPreviewable(file.fileName) ? (
                                <button
                                    onClick={() => setPreviewFile(file)}
                                    className="bg-primary-500/10 text-primary-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-500 hover:text-white transition-all"
                                >
                                    View
                                </button>
                            ) : (
                                <a
                                    href={file.fileUrl.startsWith('http') ? file.fileUrl : `http://localhost:5000${file.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-dark-border text-dark-muted px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-dark-muted hover:text-white transition-all"
                                >
                                    Open
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* FEATURE 1: PREVIEW MODAL */}
            {previewFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-5xl h-[90vh] bg-dark-card rounded-3xl overflow-hidden flex flex-col border border-dark-border">
                        <div className="flex justify-between items-center p-6 border-b border-dark-border bg-dark-card/50">
                            <h3 className="text-xl font-bold text-white truncate">{previewFile.fileName}</h3>
                            <button 
                                onClick={() => setPreviewFile(null)}
                                className="p-2 hover:bg-white/10 rounded-full text-dark-muted hover:text-white transition-colors"
                            >
                                <X size={24} /> 
                            </button>
                        </div>
                        <div className="flex-1 bg-black/20 overflow-auto flex items-center justify-center">
                            {previewFile.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? (
                                <img 
                                    src={previewFile.fileUrl.startsWith('http') ? previewFile.fileUrl : `http://localhost:5000${previewFile.fileUrl}`} 
                                    alt={previewFile.fileName} 
                                    className="max-w-full max-h-full object-contain" 
                                />
                            ) : previewFile.fileName.toLowerCase().endsWith('.pdf') ? (
                                <iframe 
                                    src={`${previewFile.fileUrl.startsWith('http') ? previewFile.fileUrl : `http://localhost:5000${previewFile.fileUrl}`}#toolbar=0`} 
                                    className="w-full h-full border-none bg-white" 
                                    title="File Preview"
                                />
                            ) : (
                                <div className="text-center p-10 bg-dark-bg/50 rounded-3xl border border-dark-border">
                                    <File size={64} className="text-primary-400 mx-auto mb-4" />
                                    <p className="text-white font-bold text-xl mb-4">Preview not available for this format</p>
                                    <a 
                                        href={previewFile.fileUrl.startsWith('http') ? previewFile.fileUrl : `http://localhost:5000${previewFile.fileUrl}`} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary-500/20"
                                    >
                                        Open in New Tab
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex justify-between bg-dark-card/50 border-t border-dark-border">
                             <p className="text-xs text-dark-muted uppercase font-bold tracking-widest">CollabSphere File Viewer</p>
                             <div className="flex items-center space-x-6">
                                <a 
                                    href={previewFile.fileUrl.startsWith('http') ? previewFile.fileUrl : `http://localhost:5000${previewFile.fileUrl}`} 
                                    download 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-primary-500 hover:text-primary-400 font-bold text-sm"
                                >
                                    Open Original
                                </a>
                                <button
                                    onClick={() => {
                                        handleDelete(previewFile._id);
                                        setPreviewFile(null);
                                    }}
                                    className="text-red-500 hover:text-red-400 font-bold flex items-center space-x-1"
                                >
                                    <Trash2 size={18} />
                                    <span>Delete File</span>
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploader;

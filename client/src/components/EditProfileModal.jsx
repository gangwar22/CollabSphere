import React, { useState, useRef } from 'react';
import { User, Mail, Shield, Save, Loader2, X, Fingerprint, Camera, AlignLeft } from 'lucide-react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        username: user?.username || '',
        bio: user?.bio || '',
        password: '',
    });
    const [previewImg, setPreviewImg] = useState(user?.profilePicture || '');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('username', formData.username);
        data.append('bio', formData.bio);
        if (formData.password) data.append('password', formData.password);
        if (selectedFile) data.append('profilePicture', selectedFile);

        try {
            const response = await API.put('/users/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addToast('Profile updated successfully!', 'success');
            onUpdate(response.data);
            onClose();
        } catch (err) {
            addToast(err.response?.data?.message || 'Update failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden scale-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="p-6 border-b border-dark-border flex items-center justify-between bg-dark-bg/50 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/10 rounded-lg text-primary-500">
                            <User size={20} />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Edit Profile</h2>
                    </div>
                    <button onClick={onClose} className="text-dark-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center gap-4 py-2">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-24 h-24 rounded-full bg-dark-bg border-2 border-dark-border overflow-hidden flex items-center justify-center group-hover:border-primary-500 transition-all">
                                {previewImg ? (
                                    <img src={previewImg} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-dark-muted" />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                        </div>
                        <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest italic">Click to change photo</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-dark-muted uppercase tracking-widest flex items-center gap-2">
                                <User size={12} /> Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary-500 outline-none transition-all font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-dark-muted uppercase tracking-widest flex items-center gap-2">
                                <Fingerprint size={12} /> Username
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary-500 transition-colors font-bold">@</span>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="choose_username"
                                    className="w-full bg-dark-bg border border-dark-border rounded-lg pl-8 pr-4 py-2.5 text-white focus:border-primary-500 outline-none transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-dark-muted uppercase tracking-widest flex items-center gap-2">
                                <AlignLeft size={12} /> Bio
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary-500 outline-none transition-all font-medium h-24 resize-none"
                            />
                        </div>

                        <div className="space-y-2 opacity-70">
                            <label className="text-xs font-bold text-dark-muted uppercase tracking-widest flex items-center gap-2">
                                <Mail size={12} /> Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full bg-dark-bg/50 border border-dark-border rounded-lg px-4 py-2.5 text-dark-muted cursor-not-allowed font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-dark-muted uppercase tracking-widest flex items-center gap-2">
                                <Shield size={12} /> New Password (Optional)
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:border-primary-500 outline-none transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-dark-border text-white font-bold text-sm uppercase tracking-widest hover:bg-dark-border transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm uppercase tracking-widest py-2.5 rounded-lg shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;

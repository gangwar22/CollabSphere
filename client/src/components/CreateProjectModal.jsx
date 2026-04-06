import React, { useState } from 'react';
import { X, Globe, Lock, Shield } from 'lucide-react';
import Spinner from './Spinner';
import { useToast } from '../context/ToastContext';

const CreateProjectModal = ({ isOpen, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        projectName: '',
        description: '',
        isPublic: true,
    });
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Sending project data:', formData);
        setLoading(true);
        try {
            await onCreate(formData);
            setFormData({ projectName: '', description: '', isPublic: true });
        } catch (err) {
            // Error handled in parent, but we reset loading here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-lg rounded-2xl p-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">New Project</h2>
                    <button onClick={onClose} className="text-dark-muted hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-dark-muted">Project Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-white"
                            placeholder="e.g. Skyline Dashboard"
                            value={formData.projectName}
                            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-dark-muted">Description (Optional)</label>
                        <textarea
                            rows="3"
                            className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-white resize-none"
                            placeholder="Tell us about the project..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-dark-bg/50 rounded-xl border border-dark-border">
                        <div className="flex items-center space-x-3">
                            {formData.isPublic ? <Globe size={20} className="text-primary-500" /> : <Lock size={20} className="text-dark-muted" />}
                            <div>
                                <p className="text-sm font-medium text-white">{formData.isPublic ? 'Public Project' : 'Private Project'}</p>
                                <p className="text-xs text-dark-muted">Visible to {formData.isPublic ? 'everyone' : 'only members'}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                            className={`w-12 h-6 rounded-full transition-all relative ${formData.isPublic ? 'bg-primary-600' : 'bg-dark-border'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isPublic ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-primary-500/20 flex justify-center items-center"
                    >
                        {loading ? <Spinner size="sm" /> : 'Create Project'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;

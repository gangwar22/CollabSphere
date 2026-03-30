import React, { useState } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { Save, X, Sparkles, ChevronRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Spinner from './Spinner';

const NoteEditor = ({ note, onSave, onCancel, onAIAction }) => {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const mdeOptions = {
        autofocus: true,
        spellChecker: false,
        placeholder: "Write your documentation in markdown...",
        status: false,
        maxHeight: "400px",
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            addToast('Title and content are required', 'error');
            return;
        }
        setLoading(true);
        try {
            await onSave({ title, content });
            // addToast is now handled by the parent handleSaveNote for more context
        } catch (err) {
            // Error handled by parent catch block
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-6 rounded-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Note Title"
                    className="bg-transparent text-2xl font-bold text-white outline-none placeholder:text-dark-muted w-full"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => onAIAction(content)}
                        className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium"
                        title="AI Help"
                    >
                        <Sparkles size={18} />
                        <span>AI Assist</span>
                    </button>
                    {note?.aiPending && (
                        <button
                            onClick={() => {
                                setContent(note.aiPending);
                                addToast('AI content applied!', 'success');
                            }}
                            className="bg-green-500/10 text-green-500 border border-green-500/30 px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-500 hover:text-white transition-all"
                        >
                            Apply AI Result
                        </button>
                    )}
                    <button onClick={onCancel} className="p-2 text-dark-muted hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="prose prose-invert max-w-none mb-6 custom-mde">
                <SimpleMDE
                    value={content}
                    onChange={(val) => setContent(val)}
                    options={mdeOptions}
                />
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Spinner size={20} />
                    ) : (
                        <>
                            <Save size={20} />
                            <span>Save Note</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default NoteEditor;

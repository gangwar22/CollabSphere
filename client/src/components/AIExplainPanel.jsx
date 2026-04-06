import React, { useState } from 'react';
import API from '../api/axios';
import { Sparkles, Brain, Code, FileText, X, Loader, Copy, Check } from 'lucide-react';

const AIExplainPanel = ({ initialContent, onClose }) => {
    const [content, setContent] = useState(initialContent || '');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('explain'); // explain, docs
    const [copied, setCopied] = useState(false);

    const handleAIAction = async (actionType) => {
        if (!content.trim()) {
            setResult('Please provide some content first.');
            return;
        }

        setLoading(true);
        setResult('');
        setCopied(false);
        try {
            let res;
            if (actionType === 'explain') {
                res = await API.post('/gemini/explain', { content, type: 'note/code' });
                setResult(res.data.explanation || 'No explanation available.');
            } else if (actionType === 'docs') {
                res = await API.post('/gemini/docs', { code: content });
                setResult(res.data.documentation || 'No documentation generated.');
            } else if (actionType === 'readme') {
                res = await API.post('/gemini/readme', { projectName: 'Project', description: content });
                setResult(res.data.readme || 'No README generated.');
            }
            
            if (res && (!res.data || Object.keys(res.data).length === 0)) {
                setResult('Received empty response from server.');
            }
        } catch (err) {
            console.error('AI error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to connect to Gemini';
            setResult('AI error: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass rounded-2xl p-6 h-full flex flex-col border-primary-500/30">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2 text-primary-400">
                    <Sparkles size={20} />
                    <h2 className="font-bold">Gemini AI Assistant</h2>
                </div>
                <button onClick={onClose} className="text-dark-muted hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <textarea
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-dark-text focus:outline-none focus:ring-1 focus:ring-primary-500 mb-4 resize-none h-32"
                placeholder="Paste code or text to analyze..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />

            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => handleAIAction('explain')}
                    disabled={loading || !content}
                    className="flex-1 flex items-center justify-center space-x-1 bg-dark-bg border border-dark-border hover:border-primary-500/50 text-xs py-2 rounded-lg transition-all"
                >
                    <Brain size={14} />
                    <span>Explain</span>
                </button>
                <button
                    onClick={() => handleAIAction('docs')}
                    disabled={loading || !content}
                    className="flex-1 flex items-center justify-center space-x-1 bg-dark-bg border border-dark-border hover:border-primary-500/50 text-xs py-2 rounded-lg transition-all"
                >
                    <Code size={14} />
                    <span>JS Docs</span>
                </button>
                <button
                    onClick={() => handleAIAction('readme')}
                    disabled={loading || !content}
                    className="flex-1 flex items-center justify-center space-x-1 bg-dark-bg border border-dark-border hover:border-primary-500/50 text-xs py-2 rounded-lg transition-all"
                >
                    <FileText size={14} />
                    <span>README</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-dark-bg/50 rounded-xl p-4 border border-dark-border">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-50">
                        <Loader className="animate-spin text-primary-500" size={24} />
                        <p className="text-xs">Thinking...</p>
                    </div>
                ) : result ? (
                    <div className="prose prose-invert prose-sm relative group h-full">
                        <div className="flex justify-between items-center mb-2">
                             <p className="text-xs text-primary-400 font-bold uppercase tracking-widest">Result</p>
                             <button 
                                onClick={copyToClipboard}
                                className="p-1.5 rounded-md bg-dark-bg border border-dark-border hover:border-primary-500/50 transition-all text-dark-text hover:text-white"
                                title="Copy to clipboard"
                             >
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                             </button>
                        </div>
                        <div className="whitespace-pre-wrap text-dark-text leading-relaxed bg-dark-bg/30 p-3 rounded-lg border border-dark-border/50">
                            {result}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                        <Brain size={48} className="mb-4" />
                        <p className="text-sm">Select an action to begin AI analysis</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIExplainPanel;

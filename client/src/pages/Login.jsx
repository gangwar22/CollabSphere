import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Code, ArrowRight, Github } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const Login = ({ setUser }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        const tokenToken = localStorage.getItem('token');
        if (tokenToken && !localStorage.getItem('user')) {
            const fetchProfile = async () => {
                try {
                    const { data } = await API.get('/auth/profile');
                    localStorage.setItem('user', JSON.stringify(data));
                    setUser(data);
                } catch (err) {
                    console.error('Failed to fetch profile', err);
                }
            };
            fetchProfile();
        }
    }, [setUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await API.post('/auth/login', formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            addToast(`Welcome back, ${data.name}!`, 'success');
            
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
            addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="mb-8 flex flex-col items-center">
                <div className="bg-dark-card p-3 rounded-xl border border-dark-border mb-4 shadow-lg">
                    <Code size={40} className="text-primary-500" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">Sign in to CollabSphere</h2>
            </div>

            <div className="w-full max-w-[340px]">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-md mb-4 text-xs font-medium text-center">
                        {error}
                    </div>
                )}

                <div className="github-card p-6 bg-dark-card border-dark-border shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-dark-text">Email address</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-dark-bg border border-dark-border text-dark-text rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-dark-text">Password</label>
                                <button type="button" className="text-xs text-primary-500 hover:underline">Forgot password?</button>
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full bg-dark-bg border border-dark-border text-dark-text rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full github-btn-primary !py-2 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                        >
                            {loading ? <Spinner size="sm" /> : <span>Sign in</span>}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-border"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-dark-card px-2 text-dark-muted font-bold tracking-widest">Or continue with</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
                                type="button" 
                                className="github-btn-secondary !py-2 flex items-center justify-center gap-2"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                                <span className="text-xs">Google</span>
                            </button>
                            <button 
                                onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'}
                                type="button" 
                                className="github-btn-secondary !py-2 flex items-center justify-center gap-2"
                            >
                                <Github size={16} />
                                <span className="text-xs">GitHub</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 border border-dark-border rounded-md p-4 text-center">
                    <p className="text-sm text-dark-text">
                        New to CollabSphere?{' '}
                        <Link to="/register" className="text-primary-500 hover:underline font-medium">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

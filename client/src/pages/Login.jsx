import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const Login = ({ setUser }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Check for user info after OAuth success (handled in OAuthSuccess, but dashboard need it)
    useEffect(() => {
        const tokenToken = localStorage.getItem('token');
        if (tokenToken && !localStorage.getItem('user')) {
            // Fetch profile if we have token but no user data (mostly for first time OAuth)
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
            
            // Redirect admin to admin panel, regular users to dashboard
            if (data.isAdmin || data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
            addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 animate-fade-in">
            <div className="glass p-8 rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Welcome Back</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-dark-muted">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-white"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-dark-muted">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-white"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 text-dark-muted cursor-pointer hover:text-white transition-colors">
                            <input type="checkbox" className="w-4 h-4 rounded border-dark-border bg-dark-bg text-primary-600 focus:ring-offset-0 focus:ring-primary-500" />
                            <span>Remember me</span>
                        </label>
                        <button type="button" className="text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                    >
                        {loading ? <Spinner size="sm" /> : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-border"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-dark-card px-2 text-dark-muted">Or continue with</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
                            type="button" 
                            className="flex items-center justify-center space-x-2 py-2.5 border border-dark-border rounded-xl hover:bg-dark-bg transition-all text-sm font-medium text-white"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            <span>Google</span>
                        </button>
                        <button 
                            onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'}
                            type="button" 
                            className="flex items-center justify-center space-x-2 py-2.5 border border-dark-border rounded-xl hover:bg-dark-bg transition-all text-sm font-medium text-white"
                        >
                            <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5 invert" alt="GitHub" />
                            <span>GitHub</span>
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-dark-muted text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

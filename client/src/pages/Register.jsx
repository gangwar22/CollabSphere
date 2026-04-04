import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import API from '../api/axios';

const Register = ({ setUser }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await API.post('/users', formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            addToast('Account created successfully!', 'success');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            setError(msg);
            addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="mb-8 flex flex-col items-center text-center">
                <div className="bg-dark-card p-3 rounded-xl border border-dark-border mb-4 shadow-lg">
                    <Code size={40} className="text-primary-500" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">Join CollabSphere</h2>
                <p className="text-dark-muted text-sm mt-2">The AI-powered developer collaboration platform.</p>
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
                            <label className="block text-sm font-medium mb-1.5 text-dark-text">Full name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-dark-bg border border-dark-border text-dark-text rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-dark-text">Email address</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-dark-bg border border-dark-border text-dark-text rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-dark-text">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-dark-bg border border-dark-border text-dark-text rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full github-btn-primary !py-2 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                        >
                            {loading ? <Spinner size="sm" /> : <span>Create account</span>}
                        </button>
                    </form>
                </div>

                <div className="mt-6 border border-dark-border rounded-md p-4 text-center">
                    <p className="text-sm text-dark-text">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-500 hover:underline font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

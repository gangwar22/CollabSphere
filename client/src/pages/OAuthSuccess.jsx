import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);
            window.location.href = '/dashboard';
        } else {
            navigate('/login');
        }
    }, [location, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-dark-bg text-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold">Authenticating...</h2>
            </div>
        </div>
    );
};

export default OAuthSuccess;

import React, { useState } from 'react';
import { Truck, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../features/auth/authSlice';
import { loginRestaurant } from '../features/auth/authApi';
import image from '../icons/preview-login.png';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);

    // Redirect to /home if already logged in
    if (user) {
        return <Navigate to="/home" replace />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await loginRestaurant(username, password);
            dispatch(loginSuccess(data));
            toast.success("Login successful");
            navigate("/home", { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
            console.error('Login failed', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100 flex items-center justify-center p-4">
            <Toaster position="top-center" />
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-6xl w-full relative">
                <div className="flex flex-col lg:flex-row min-h-[600px]">
                    {/* Left Panel - Login Form */}
                    <div className="lg:flex-1 p-8 lg:p-12 flex items-center justify-center bg-[#bfd0e2] relative">
                        <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg">
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center mb-6">
                                    <div className="bg-[#224f7E] p-3 rounded-xl mr-3 shadow-lg">
                                        <Truck className="h-6 w-6 text-white" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-[#224f7E]">
                                        BillMaster
                                    </h1>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Login to access your billing management system
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#224f7E] focus:border-transparent transition-all duration-200 hover:border-gray-300"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Password
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#224f7E] focus:border-transparent transition-all duration-200 pr-12 hover:border-gray-300"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#224f7E] hover:bg-[#1a3d63] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                            Logging in...
                                        </>
                                    ) : (
                                        'Login'
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                                <p className="text-xs text-gray-400">
                                    © 2024 BillMaster Billing Management System. All rights reserved.
                                </p>
                                <p className="text-xs text-gray-500 font-medium mt-1">
                                    Created by <span className="text-[#224f7E]">RS</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Right Panel - Full Screen Image */}
                    <div className="lh-screen lg:flex-1 bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100 flex items-center justify-center relative overflow-hidden">
                        {/* Full Screen Image */}
                        <div className="absolute inset-0 w-full h-full z-0">
                            <img
                                src={image}
                                alt="Monstera Leaves"
                                className="w-full h-full object-cover object-center"
                            />
                        </div>

                        {/* Subtle overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/5 to-black/10 pointer-events-none"></div>

                        {/* Decorative elements */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-20 left-20 w-2 h-2 bg-green-300 rounded-full opacity-30 animate-pulse"></div>
                            <div className="absolute bottom-32 right-20 w-1 h-1 bg-emerald-400 rounded-full opacity-40 animate-pulse delay-1000"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
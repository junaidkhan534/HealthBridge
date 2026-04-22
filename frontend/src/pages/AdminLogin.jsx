import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/features/userSlice';
import { message } from 'antd';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const onFinish = async (e) => {
        e.preventDefault();
        const values = { contact: identifier, password };

        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const res = await axios.post(`${API_URL}/api/v1/user/login`, values);
            setLoading(false);
            if (res.data.success) {
                message.success(res.data.message);
                dispatch(setUser({ user: res.data.user, token: res.data.token }));
                // Checking the role
                if (res.data.user.isAdmin && res.data.user.role === "admin") {
                    toast.success("Login succesfully")
                    navigate('/admin');
                } else if (res.data.user.role === "doctor") {
                    toast.success("Login succesfully")
                    navigate("/doctor");
                } else {
                    toast.error("Unauthorized Access")
                }
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            setLoading(false);
            toast.error('Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-xl shadow-lg">
                {/* Header */}
                <div className="mb-8 text-center">
                    <Link to="/" className="flex items-center justify-center space-x-2">
                        <Stethoscope className="h-10 w-10 text-teal-600" />
                        <span className="text-3xl font-bold text-teal-600">HealthBridge</span>
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold text-slate-900">
                        Admin & Doctor Portal Login
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Access your HealthBridge dashboard.
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={onFinish}>
                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="identifier"
                                name="identifier"
                                type="text"
                                autoComplete="email"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                placeholder="Enter Your Email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <Eye className="h-5 w-5" />
                                ) : (
                                    <EyeOff className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <Link to="/forgotPassword" className="font-medium text-teal-600 hover:text-teal-500">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
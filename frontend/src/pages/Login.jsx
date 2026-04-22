import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/features/userSlice';
import { message } from 'antd';
import toast from 'react-hot-toast';

const LoginPage = () => {
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
                localStorage.setItem("token", res.data.token);
                
                message.success(res.data.message);
                dispatch(setUser({ user: res.data.user, token: res.data.token }));
                
                if (res.data.user.role === "patient") {
                    toast.success("Login Successfully!");
                    navigate("/patient");
                } else {
                    toast.error("Unauthorized Access");
                }
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            setLoading(false);
            const errorMsg = error.response?.data?.message || "Something went wrong";
            toast.error(errorMsg);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
                <div className="max-w-md w-full">
                    <div className="mb-8 text-center">
                        <Link to="/" className="flex items-center justify-center space-x-2">
                            <Stethoscope className="h-10 w-10 text-teal-600" />
                            <span className="text-3xl font-bold text-teal-600">HealthBridge</span>
                        </Link>
                        <h2 className="mt-6 text-2xl font-bold text-slate-900">Welcome Back!</h2>
                        <p className="mt-2 text-sm text-slate-600">Sign in using your Email or Phone Number.</p>
                    </div>

                    <form className="space-y-6" onSubmit={onFinish}>
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">
                                Email or Phone Number
                            </label>
                            <div className="mt-1">
                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Enter your email or phone No."
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Enter Your Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
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
                                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="text-sm text-right">
                            <Link to="/forgotPassword" icon="forgot" className="font-medium text-teal-600 hover:text-teal-500">
                                Forgot your password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500">Sign up</Link>
                    </p>
                </div>
            </div>

            <div className="hidden lg:block lg:w-1/2 relative">
                <img className="absolute inset-0 h-full w-full object-cover" src="/loginpic.jpg" alt="Doctor" />
                <div className="absolute inset-0 bg-teal-800 mix-blend-multiply" aria-hidden="true" />
            </div>
        </div>
    );
};

export default LoginPage;
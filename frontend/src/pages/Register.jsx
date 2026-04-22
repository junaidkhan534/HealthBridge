import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [identifier, setIdentifier] = useState(''); 
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const validateInput = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[6-9]\d{9}$/; 
        
        if (emailRegex.test(value)) return 'email';
        if (phoneRegex.test(value)) return 'phone';
        return null;
    };

    const onFinish = async (e) => {
        e.preventDefault();
        const inputType = validateInput(identifier);

        if (!inputType) {
            toast.error("Enter a valid email or 10-digit phone number");
            return;
        }

        const values = { 
            name, 
            contact: identifier, 
            password 
        };

        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8080/api/v1/user/register', values);
            setLoading(false);

            if (res.data.success) {
                message.success(res.data.message);
                toast.success("Verification code sent!");
                navigate('/verifyOtp', { state: { contact: identifier } });
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
        <div className="min-h-screen flex bg-slate-50 overflow-hidden">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <Link to="/" className="flex items-center justify-center space-x-2">
                            <Stethoscope className="h-10 w-10 text-teal-600" />
                            <span className="text-3xl font-bold text-teal-600">HealthBridge</span>
                        </Link>
                        <h2 className="mt-6 text-2xl font-bold text-slate-900">
                            Create Your Account
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Join HealthBridge using your Email or Phone number.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={onFinish}>
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                                Enter your Full name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email/Phone Field */}
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">
                                Enter your Email Id or Phone No. 
                            </label>
                            <div className="mt-1">
                                <input
                                    id="identifier"
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Email or 10-digit Phone no."
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Create your Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 transition-colors"
                            >
                                {loading ? 'Processing...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Image Overlay */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img
                    className="absolute inset-0 h-full w-full object-cover "
                    src="registerpic.jpg"
                    alt="Medical professional at a desk"
                />
                <div className="absolute inset-0 bg-teal-900 mix-blend-multiply" aria-hidden="true" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-teal-200 text-center">
                        <h3 className="text-4xl font-bold mb-4">Welcome to HealthBridge</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;


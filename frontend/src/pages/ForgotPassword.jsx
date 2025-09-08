import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 for email, 2 for OTP/password
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);



    const handleSendOtp = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8080/api/v1/user/forgot-password', { email });
            setLoading(false);
            if (res.data.success) {
                message.success(res.data.message);
                toast.success("OPT is Send!");
                setStep(2); // Move to the next step
            } else {
                toast.error("Something went wrong. Please try again!");
            }
        } catch (error) {
            setLoading(false);
            toast.error('Something went wrong');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const payload = { email, otp, password };
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8080/api/v1/user/reset-password-otp', payload);
            setLoading(false);
            if (res.data.success) {
                toast.success("Password Reset Successfully!");
                navigate('/');
            } else {
                message.error(res.data.message);
                toast.error("Password is not Reset!");
            }
        } catch (error) {
            setLoading(false);
            toast.error('Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-xl shadow-lg">
                <div className="mb-8 text-center">
                    <Link to="/" className="flex items-center justify-center space-x-2">
                        <Stethoscope className="h-10 w-10 text-teal-600" />
                        <span className="text-3xl font-bold text-teal-600">HealthBridge</span>
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold text-slate-900">
                        Reset Your Password
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        {step === 1 ? "Enter your email to receive a verification code." : `An OTP has been sent to ${email}.`}
                    </p>
                </div>

                {/* Step 1: Enter Email */}
                {step === 1 && (
                    <form className="space-y-6" onSubmit={handleSendOtp}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: Enter OTP and New Password */}
                {step === 2 && (
                    <form className="space-y-6" onSubmit={handleResetPassword}>
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-slate-700">6-Digit OTP</label>
                            <input
                                id="otp" type="text" maxLength="6" required
                                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-center tracking-[0.5em]"
                                placeholder="_ _ _ _ _ _"
                                value={otp} onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">New Password</label>
                            <div className="mt-1 relative">
                                <input
                                    id="password" type={showPassword ? 'text' : 'password'} required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
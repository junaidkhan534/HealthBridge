import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/features/userSlice';
import toast from 'react-hot-toast';

const VerifyOtp = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [cooldown, setCooldown] = useState(0);

    const contact = location.state?.contact;

    useEffect(() => {
        if (!contact) {
            navigate('/register');
        }
    }, [contact, navigate]);

    // Cooldown timer effect
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    const onFinish = async (e) => {
        e.preventDefault();
        
        const payload = { contact, otp };
        
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8080/api/v1/user/verify-otp', payload);
            setLoading(false);
            
            if (res.data.success) {
                dispatch(setUser({ user: res.data.user, token: res.data.token }));
                toast.success("Registered Successfully!");
                navigate('/patient');
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || "Something went wrong!");
        }
    };

    const handleResendOtp = async () => {
        if (cooldown > 0) return; 
        try {
            const res = await axios.post('http://localhost:8080/api/v1/user/resend-otp', { contact });
            if (res.data.success) {
                toast.success("OTP has been resent!");
                setCooldown(60); 
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Failed to resend OTP.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-xl shadow-lg">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <Stethoscope className="h-10 w-10 text-teal-600" />
                        <span className="text-3xl font-bold text-teal-600">HealthBridge</span>
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-slate-900">
                        Verify Your Account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        An OTP has been sent to <strong>{contact || 'your contact'}</strong>.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={onFinish}>
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-slate-700">
                            Enter 6-Digit OTP
                        </label>
                        <div className="mt-1">
                            <input
                                id="otp"
                                type="text"
                                maxLength="6"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-center tracking-[0.5em] focus:ring-teal-500 focus:border-teal-500"
                                placeholder="· · · · · ·"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 font-medium"
                    >
                        {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Didn't receive the code?{' '}
                    <button 
                        onClick={handleResendOtp}
                        disabled={cooldown > 0}
                        className="font-medium text-teal-600 hover:text-teal-500 disabled:text-slate-400"
                    >
                        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default VerifyOtp;
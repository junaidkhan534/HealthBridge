import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { message } from 'antd';
import axios from 'axios';
import { setUser } from '../../redux/features/userSlice';
import toast from 'react-hot-toast';

const DoctorProfilePage = () => {
    const { user, token } = useSelector(state => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [profileData, setProfileData] = useState({
        name: '', email: '', doctorId: '', phone: '', address: '', bio: ''
    });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [previewPicture, setPreviewPicture] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                doctorId: user.doctorId || 'N/A',
                phone: user.phone || '',
                address: user.address || '',
                bio: user.bio || '',
            });
            setPreviewPicture(user.profilePicture || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=0D9488&color=fff`);
        }
    }, [user]);

    const handleChange = (e) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            setPreviewPicture(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
        toast.error("Please enter a valid email address.");
        return;
    }

    // Phone validation 
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(profileData.phone)) {
        toast.error("Please enter a valid 10-digit phone number.");
        return;
    }

    setLoading(true);

    const formData = new FormData();
    for (const key in profileData) {
        formData.append(key, profileData[key]);
    }
    if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
    }

    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await axios.put(`${API_URL}/api/v1/doctor/profile`, formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res.data.success) {
            const updatedUser = res.data.data;
            dispatch(setUser({ user: updatedUser, token }));
            setPreviewPicture(updatedUser.profilePicture);
            toast.success('Profile updated successfully!');
        } else {
            throw new Error(res.data.message);
        }
    } catch (error) {
        message.error(error.message || 'An error occurred.');
        toast.error("Something Went Wrong!");
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="bg-slate-100 min-h-screen">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex space-x-4 items-center">
                    <Link to="/doctor" className="text-teal-500 hover:text-teal-600">
                        <ArrowLeft className="h-7 w-7" />
                    </Link>
                    <span className="text-xl font-semibold text-slate-800">My Profile</span>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="max-w-auto mx-auto">
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <div className="pb-10 pt-5">
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 flex flex-col items-center">
                                    {previewPicture && <img src={previewPicture} alt="Profile" className="h-40 w-40 rounded-full object-cover shadow-md" />}
                                    <label htmlFor="photo-upload" className="mt-4 cursor-pointer flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-sm">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Change Photo
                                    </label>
                                    <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                </div>
                                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Doctor ID</label>
                                        <input type="text" value={profileData.doctorId} disabled className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-100" />
                                    </div>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                                        <input type="text" name="name" id="name" value={profileData.name} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                                        <input type="email" name="email" id="email" value={profileData.email} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
                                        <input type="number" name="phone" id="phone" value={profileData.phone} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md" />
                                    </div>
                                     <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-slate-700">Appointment Address</label>
                                        <input type="text" name="address" id="address" value={profileData.address} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label htmlFor="bio" className="block text-sm font-medium text-slate-700">About Yourself</label>
                                        <textarea name="bio" id="bio" rows="3" value={profileData.bio} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md"></textarea>
                                    </div>  
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 flex justify-end space-x-4">
                            <button type="button" onClick={() => navigate('/doctor')} className="px-6 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition duration-300">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="px-6 py-2 font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition duration-300 disabled:bg-teal-400">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default DoctorProfilePage;
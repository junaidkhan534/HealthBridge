import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, User, Mail, Phone, Home, Calendar, Upload, Droplets,ArrowLeft } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { message } from 'antd';
import axios from 'axios';
import { setUser } from '../../redux/features/userSlice';
import toast from 'react-hot-toast';

const MyProfilePage = () => {
    const { user, token } = useSelector(state => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        dob: '',
        gender: '',
        bloodGroup: '',
    });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [previewPicture, setPreviewPicture] = useState(null);
    const [age, setAge] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                dob: user.dob ? user.dob.split('T')[0] : '',
                gender: user.gender || '',
                bloodGroup: user.bloodGroup || '',
            });
            setPreviewPicture(user.profilePicture || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=0D9488&color=fff`);
        }
    }, [user]);

    useEffect(() => {
        if (profileData.dob) {
            const birthDate = new Date(profileData.dob);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            setAge(calculatedAge >= 0 ? calculatedAge : null);
        } else {
            setAge(null);
        }
    }, [profileData.dob]);

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

    const validateInputs = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
        toast.error("Please enter a valid email address");
        return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(profileData.phone)) {
        toast.error("Please enter a valid phone number");
        return false;
    }

        return true;
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return; 

    setLoading(true);
    const formData = new FormData();

    for (const key in profileData) {
        formData.append(key, profileData[key]);
    }

    if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
    }

    try {
        const res = await axios.put('http://localhost:8080/api/v1/user/profile', formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res.data.success) {
            const updatedUser = res.data.data;
            dispatch(setUser({ user: updatedUser, token }));
            setPreviewPicture(updatedUser.profilePicture);
            message.success('Profile updated successfully!');
            toast.success('Profile updated successfully!');
        } else {
            throw new Error(res.data.message);
        }
    } catch (error) {
        message.error(error.message || 'An error occurred.');
        toast.error("Something Went Wrong");
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="bg-slate-100 min-h-screen">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center space-x-4">
                    <Link to="/patient" className="text-teal-500 hover:text-teal-600">
                        <ArrowLeft className="h-7 w-7" />
                    </Link>
                    <span className="text-xl font-semibold text-slate-800">My Profile</span>
                </div>
            </header>

            <div className="container mx-auto px-6 py-3">
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-5">
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
                                <label className="block text-sm font-medium text-slate-700">Patient ID</label>
                                <input type="text" value={user?.patientId} disabled className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-100" />
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
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Contact Number</label>
                                <input type="number" name="phone" id="phone" value={profileData.phone} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="dob" className="block text-sm font-medium text-slate-700">Date of Birth</label>
                                <input type="date" name="dob" id="dob" value={profileData.dob} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Age</label>
                                <input type="text" value={age !== null ? `${age} years` : ''} disabled className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-100" />
                            </div>
                             <div>
                                <label htmlFor="bloodGroup" className="block text-sm font-medium text-slate-700">Blood Group</label>
                                <select name="bloodGroup" id="bloodGroup" value={profileData.bloodGroup} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md">
                                    <option value="">Select...</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="Unknown">Unknown</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address</label>
                                <input type="text" name="address" id="address" value={profileData.address} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Gender</label>
                                <div className="mt-2 flex space-x-4">
                                    <label className="flex items-center">
                                        <input type="radio" name="gender" value="Male" checked={profileData.gender === 'Male'} onChange={handleChange} className="h-4 w-4 text-teal-600 border-slate-300" />
                                        <span className="ml-2 text-sm">Male</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="gender" value="Female" checked={profileData.gender === 'Female'} onChange={handleChange} className="h-4 w-4 text-teal-600 border-slate-300" />
                                        <span className="ml-2 text-sm">Female</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="gender" value="Other" checked={profileData.gender === 'Other'} onChange={handleChange} className="h-4 w-4 text-teal-600 border-slate-300" />
                                        <span className="ml-2 text-sm">Other</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 text-right flex justify-end space-x-4">
                            <button type="button" onClick={() => navigate('/patient')} className="px-6 py-2 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition duration-300">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="px-6 py-2 font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition duration-300 disabled:bg-teal-400">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const AddDoctorPage = () => {
    const navigate = useNavigate();
    const { token } = useSelector(state => state.user);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [formData, setFormData] = useState({
        doctorId: `DOC-${Date.now().toString().slice(-6)}`,
        name: '',
        email: '',
        phone: '',
        password: '',
        gender: '',
        dob: '',
        profilePicture: null,
        specialty: '',
        qualifications: '',
        experience: '',
        address: '',
        fees: '',
        availableDays: [],
        timings: [{ start: '', end: '' }, { start: '', end: '' }],
        bio: ''
    });

    // Form validation logic
    useEffect(() => {
        const { name, email, phone, password, specialty, qualifications, experience, address, fees, gender, dob } = formData;
        const requiredFields = [name, email, phone, password, specialty, qualifications, experience, address, fees, gender, dob];
        const allFieldsFilled = requiredFields.every(field => field && field.toString().trim() !== '');
        
        // email and phone validation
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isPhoneValid = /^\d{10}$/.test(phone);

        setIsFormValid(allFieldsFilled && isEmailValid && isPhoneValid);
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleTimeChange = (index, field, value) => {
        const newTimings = formData.timings.map((item, i) => i === index ? { ...item, [field]: value } : item);
        setFormData(prev => ({ ...prev, timings: newTimings }));
    };

    const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Corrected: Changed 'profilePhoto' to 'profilePicture' to match the backend
        setFormData(prev => ({ ...prev, profilePicture: file }));
    }
};
    const handleDayChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const days = checked
                ? [...prev.availableDays, value]
                : prev.availableDays.filter(day => day !== value);
            return { ...prev, availableDays: days };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            toast.error("Please fill out all required fields with valid information.");
            return;
        }
        
        const doctorData = new FormData();
        for (const key in formData) {
            doctorData.append(key, formData[key]);
        }
        

        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8080/api/v1/admin/add-doctor', doctorData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setLoading(false);
            if (res.data.success) {
                message.success('Doctor added successfully!');
                toast.success('Doctor added successfully!');
                navigate('/admin/doctors');
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            setLoading(false);
            toast.error('Something went wrong');
            console.error("Add Doctor Error:", error.response?.data || error.message);
        }
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const specialties = ["General Physician", "Cardiologist", "Dermatologist", "Pediatrician", "Neurologist", "Orthopedist", "Gynecologist", "Gastroenterologist", "Urologist", "Otolaryngologist (ENT)", "Endocrinologist", "Pulmonologist"];
    const qualifications = ["MBBS", "MD", "MS", "DM", "MCh", "DNB", "PHD"];

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-6 py-3 flex items-center space-x-4">
                    <Link to="/admin" className="text-teal-500 hover:text-teal-600">
                        <ArrowLeft className="h-7 w-7" />
                    </Link>
                    <span className="text-xl font-semibold text-slate-800">Add New Doctor</span>
                </div>
            </header>
            
            <main className="flex-1 p-6">
                <form onSubmit={handleSubmit}>
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <div className="border-b pb-6 mb-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium">Doctor ID</label>
                                    <input type="text" value={formData.doctorId} disabled className="mt-1 w-full p-2 border bg-slate-100 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Phone Number</label>
                                    <input type="number" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium">Password</label>
                                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400">
                                        {showPassword ? <Eye size={20}/> : <EyeOff size={20}/>}
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Date of Birth</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md">
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium">Profile Photo</label>
                                    <input type="file" name="profilePicture" onChange={handlePhotoChange} className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                                </div>
                            </div>
                        </div>

                        <div className="border-b pb-6 mb-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Professional Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium">Specialty</label>
                                    <select name="specialty" value={formData.specialty} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md">
                                        <option value="">Select Specialty</option>
                                        {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Qualifications</label>
                                    <select name="qualifications" value={formData.qualifications} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md">
                                        <option value="">Select Qualification</option>
                                        {qualifications.map(q => <option key={q} value={q}>{q}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Experience (Years)</label>
                                    <input type="number" name="experience" value={formData.experience} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Consultation Fee (₹)</label>
                                    <input type="number" name="fees" value={formData.fees} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium">Appointment Address</label>
                                    <textarea name="address" rows="1" value={formData.address} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md"></textarea>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium">Short Bio</label>
                                    <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"></textarea>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Availability</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Available Days</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {daysOfWeek.map(day => (
                                            <label key={day} className="flex items-center space-x-2 p-2 border rounded-md">
                                                <input type="checkbox" value={day} checked={formData.availableDays.includes(day)} onChange={handleDayChange} className="h-4 w-4 text-teal-600"/>
                                                <span>{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Morning Shift</label>
                                        <div className="flex items-center space-x-2">
                                            <input type="time" name="startTime1" value={formData.startTime1} onChange={handleChange} className="w-full p-2 border rounded-md"/>
                                            <span>to</span>
                                            <input type="time" name="endTime1" value={formData.endTime1} onChange={handleChange} className="w-full p-2 border rounded-md"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Evening Shift</label>
                                        <div className="flex items-center space-x-2">
                                            <input type="time" name="startTime2" value={formData.startTime2} onChange={handleChange} className="w-full p-2 border rounded-md"/>
                                            <span>to</span>
                                            <input type="time" name="endTime2" value={formData.endTime2} onChange={handleChange} className="w-full p-2 border rounded-md"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                            <button type="button" onClick={() => navigate('/admin')} className="px-6 py-2 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
                                Cancel
                            </button>
                            <button type="submit" disabled={!isFormValid || loading} className="px-6 py-2 font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed">
                                {loading ? 'Adding Doctor...' : 'Add Doctor'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AddDoctorPage;
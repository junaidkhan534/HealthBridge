import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { message, Switch } from 'antd';
import { setUser } from '../../redux/features/userSlice';
import toast from 'react-hot-toast';

const AvailabilityPage = () => {
    const { user, token } = useSelector(state => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [availability, setAvailability] = useState({
        available: true,
        availableDays: [],
        timings: [{ start: '', end: '' }, { start: '', end: '' }]
    });

    // This effect populates the form with the doctor current availability from  Redux state
    useEffect(() => {
        if (user) {
            setAvailability({
                available: user.available !== undefined ? user.available : true,
                availableDays: user.availableDays || [],
                timings: user.timings && user.timings.length >= 2 
                    ? user.timings 
                    : [{ start: '', end: '' }, { start: '', end: '' }]
            });
        }
    }, [user]);

    const handleDayChange = (e) => {
        const { value, checked } = e.target;
        setAvailability(prev => {
            const days = checked
                ? [...prev.availableDays, value]
                : prev.availableDays.filter(day => day !== value);
            return { ...prev, availableDays: days };
        });
    };

    const handleTimeChange = (index, field, value) => {
        // Corrected: Create a deep copy to avoid mutating state directly
        const newTimings = availability.timings.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setAvailability(prev => ({ ...prev, timings: newTimings }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8080/api/v1/doctor/update-availability', availability, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                dispatch(setUser({ user: res.data.data, token }));
                toast.success('Availability updated successfully!');
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            message.error('Something went wrong');
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="flex min-h-screen bg-slate-100">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="container mx-auto px-4 sm:px-6 py-4 flex space-x-4 items-center">
                        <Link to="/doctor" className="text-teal-500 hover:text-teal-600">
                        <ArrowLeft className="h-7 w-7" />
                        </Link>
                        <span className="text-xl font-semibold text-slate-800">Manage Availability</span>
                    </div>
                </header>

                {/*  Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6">
                    <div className="bg-white p-8 rounded-lg shadow-md max-w-auto mx-auto">
                        <form onSubmit={handleSubmit}>
                            {/* Availability Toggle */}
                            <div className="flex items-center justify-between border-b pb-6 mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Your Availability Status</h2>
                                    <p className="text-sm text-slate-500">Toggle this switch to mark yourself as available or unavailable for new appointments.</p>
                                </div>
                                <Switch 
                                    checked={availability.available} 
                                    onChange={(checked) => setAvailability(prev => ({...prev, available: checked}))}
                                    checkedChildren="Available"
                                    unCheckedChildren="Unavailable"
                                />
                            </div>

                            {/*  Days */}
                            <div className="border-b pb-6 mb-6">
                                <h2 className="text-lg font-bold text-slate-800 mb-4">Set Your Working Days</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {daysOfWeek.map(day => (
                                        <label key={day} className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <input 
                                                type="checkbox" 
                                                value={day} 
                                                checked={availability.availableDays.includes(day)} 
                                                onChange={handleDayChange} 
                                                className="h-5 w-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                            />
                                            <span className="font-medium">{day}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Time  */}
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 mb-4">Set Your Working Hours</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Morning Shift</label>
                                        <div className="flex items-center space-x-2">
                                            <input type="time" value={availability.timings[0]?.start || ''} onChange={(e) => handleTimeChange(0, 'start', e.target.value)} className="w-full p-2 border rounded-md"/>
                                            <span className="text-slate-500">to</span>
                                            <input type="time" value={availability.timings[0]?.end || ''} onChange={(e) => handleTimeChange(0, 'end', e.target.value)} className="w-full p-2 border rounded-md"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Evening Shift</label>
                                        <div className="flex items-center space-x-2">
                                            <input type="time" value={availability.timings[1]?.start || ''} onChange={(e) => handleTimeChange(1, 'start', e.target.value)} className="w-full p-2 border rounded-md"/>
                                            <span className="text-slate-500">to</span>
                                            <input type="time" value={availability.timings[1]?.end || ''} onChange={(e) => handleTimeChange(1, 'end', e.target.value)} className="w-full p-2 border rounded-md"/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end mt-8 pt-6 border-t space-x-4">
                                <button type="button" onClick={() => navigate('/doctor')} className="px-6 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition duration-300">
                                Cancel
                                </button>
                                <button type="submit" disabled={loading} className="px-6 py-2 font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-teal-400">
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AvailabilityPage;
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { message } from 'antd';

const AppointmentsPage = () => {
    const { user, token } = useSelector(state => state.user);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        date: ''
    });
    const [showUserMenu, setShowUserMenu] = useState(false);

    const getAppointments = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const res = await axios.get(`${API_URL}/api/v1/admin/getAllAppointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setAppointments(res.data.data);
            }
        } catch (error) {
            message.error('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            getAppointments();
        }
    }, [token]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter(appt => {
            const appointmentDate = new Date(appt.date.split('-').reverse().join('-'));
            const filterDate = filters.date ? new Date(filters.date) : null;
            const isDateMatch = !filterDate || appointmentDate.toDateString() === filterDate.toDateString();

            return (
                (appt.userInfo.toLowerCase().includes(searchTerm.toLowerCase()) || appt.doctorInfo.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (filters.specialty === '' || appt.specialty === filters.specialty) &&
                (filters.status === '' || appt.status === filters.status) &&
                isDateMatch
            );
        });
    }, [appointments, searchTerm, filters]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'approved': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Top Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link to="/admin" className="text-teal-500 hover:text-teal-600" >
                            <ArrowLeft className="h-7 w-7" />
                        </Link>
                        <span className="text-xl font-semibold text-slate-800">List of All Appointments</span>
                    </div>
                </div>
            </header>
            
            {/* Page Content */}
            <main className="p-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {/* Filters and Search */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="relative lg:col-span-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                            <input 
                                type="text"
                                placeholder="Search by Name..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option value="">All Statuses</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"/>
                    </div>

                    {/* Appointments Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-slate-50">
                                    <th className="p-3">Patient Name</th>
                                    <th className="p-3">Doctor Name</th>
                                    <th className="p-3">Date & Time</th>
                                    <th className="p-3">Fees</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-8">Loading appointments...</td></tr>
                                ) : filteredAppointments.map(appt => (
                                    <tr key={appt._id} className="border-b hover:bg-slate-50">
                                        <td className="p-3 font-semibold text-slate-800">{appt.userInfo}</td>
                                        <td className="p-3">
                                            <div>
                                                <p className="font-medium">Dr. {appt.doctorInfo}</p>
                                                <p className="text-xs text-slate-500">{appt.specialty}</p>
                                            </div>
                                        </td>
                                        <td className="p-3 text-sm text-slate-600">{appt.date} at {appt.time}</td>
                                        <td className="p-3 font-semibold text-slate-700">
                                            ₹{appt.fees}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AppointmentsPage;

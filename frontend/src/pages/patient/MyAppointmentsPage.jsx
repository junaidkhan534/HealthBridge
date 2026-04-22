import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { message } from 'antd';
import moment from 'moment';
import toast from 'react-hot-toast';

const MyAppointmentsPage = () => {
    const { user, token } = useSelector(state => state.user);
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAppointments = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            `${API_URL}/api/v1/appointment/user-appointments`
            const res = await axios.get(`${API_URL}/api/v1/appointment/user-appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                const sorted = res.data.data.sort((a, b) => 
                    moment(`${b.date} ${b.time}`, 'DD-MM-YYYY hh:mm A').valueOf() - 
                    moment(`${a.date} ${a.time}`, 'DD-MM-YYYY hh:mm A').valueOf()
                );
                setAppointments(sorted);
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
        } else {
            navigate('/login');
        }
    }, [token]);

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                const res = await axios.post(`${API_URL}/api/v1/appointment/cancel-appointment`, 
                    { appointmentId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data.success) {
                    toast.success('Appointment cancelled successfully!');
                    getAppointments();
                } else {
                    message.error(res.data.message);
                }
            } catch (error) {
                toast.error('Failed to cancel appointment.');
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'approved': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getPaymentBadge = (status) => {
        // return status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
    };

    return (
        <div className="bg-slate-100 min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex space-x-4 items-center">
                    <Link to="/patient" className="text-teal-500 hover:text-teal-600">
                        <ArrowLeft className="h-7 w-7" />
                    </Link>
                    <span className="text-xl font-semibold text-slate-800">My Appointments</span>
                </div>
            </header>

            {/* Main */}
            <main className="container mx-auto px-4 sm:px-6 py-5">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-slate-50 text-sm">
                                    <th className="p-3">Doctor Name</th>
                                    <th className="p-3">Date & Time</th>
                                    <th className="p-3">Payment Mode</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-8">Loading appointments...</td></tr>
                                ) : appointments.length > 0 ? (
                                    appointments.map(appt => (
                                        <tr key={appt._id} className="border-b hover:bg-slate-50">
                                            <td className="p-3 font-semibold">
                                                <Link to={`/book-appointment/${appt.doctorId}`} className="hover:text-teal-600">
                                                    Dr. {appt.doctorInfo}
                                                </Link>
                                            </td>
                                            <td className="p-3 text-sm text-slate-600">{appt.date} at {appt.time}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentBadge(appt.payment)}`}>
                                                    {appt.payment}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(appt.status)}`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {appt.status !== 'completed' && appt.status !== 'cancelled' && appt.status !== '' ? (
                                                    <button 
                                                        onClick={() => handleCancelAppointment(appt._id)}
                                                        className="text-sm font-medium text-red-600 hover:text-red-800"
                                                    >
                                                        Cancel
                                                    </button>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="text-center py-8 text-slate-500">You have no appointments.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="sm:hidden space-y-4">
                        {loading ? (
                            <p className="text-center py-8">Loading appointments...</p>
                        ) : appointments.length > 0 ? (
                            appointments.map(appt => (
                                <div key={appt._id} className="border rounded-lg p-4 shadow-sm bg-slate-50">
                                    <h2 className="font-semibold text-teal-600">Dr. {appt.doctorInfo}</h2>
                                    <p className="text-sm text-slate-600">{appt.date} at {appt.time}</p>
                                    <p className="mt-1">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentBadge(appt.payment)}`}>
                                            {appt.payment}
                                        </span>
                                    </p>
                                    <p className="mt-1">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(appt.status)}`}>
                                            {appt.status}
                                        </span>
                                    </p>
                                    <div className="mt-2">
                                        {appt.status !== 'completed' && appt.status !== 'cancelled' ? (
                                            <button 
                                                onClick={() => handleCancelAppointment(appt._id)}
                                                className="text-sm font-medium text-red-600 hover:text-red-800"
                                            >
                                                Cancel
                                            </button>
                                        ) : (
                                            <span className="text-sm text-slate-500">No action</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-slate-500">You have no appointments.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyAppointmentsPage;


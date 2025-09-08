import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { message } from 'antd';
import moment from 'moment';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
    const { user, token } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAppointments = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/doctor/getDoctorAppointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                // Sort by date, most recent first
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
        }
    }, [token]);

    const handleStatusUpdate = async (appointmentId, status) => {
        try {
            const res = await axios.post('http://localhost:8080/api/v1/doctor/updateAppointmentStatus', 
                { appointmentId, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success('Appointment status updated successfully!');
                getAppointments(); // Refresh the list
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            toast.error('Something went wrong');
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

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex space-x-4 items-center">
                    <Link to="/doctor" className="text-teal-500 hover:text-teal-600">
                        <ArrowLeft className="h-7 w-7" />
                    </Link>
                    <span className="text-xl font-semibold text-slate-800">My Appointments</span>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-6 overflow-x-auto">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-slate-50">
                                    <th className="p-3">Patient ID</th>
                                    <th className="p-3">Patient Name</th>
                                    <th className="p-3">Age</th>
                                    <th className="p-3">Date & Time</th>
                                    <th className="p-3">Payment Mode</th>
                                    <th className="p-3 ">Status</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center py-8">Loading appointments...</td></tr>
                                ) : appointments.length > 0 ? (
                                    appointments.map(appt => (
                                        <tr key={appt._id} className="border-b hover:bg-slate-50">
                                            <td className="p-3 font-mono text-xs text-slate-500">{appt.patientId || 'N/A'}</td>
                                            <td className="p-3 font-semibold">{appt.userInfo}</td>
                                            <td className="p-3 text-sm text-slate-600">{appt.patientAge || 'N/A'}</td>
                                            <td className="p-3 text-sm text-slate-600">{appt.date} at {appt.time}</td>
                                            <td className="p-3 text-sm text-slate-600">{appt.payment}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(appt.status)}`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {appt.status === 'pending' && (
                                                    <div className="flex justify-center space-x-2">
                                                        <button onClick={() => handleStatusUpdate(appt._id, 'cancelled')} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200" title="Reject"><X className="w-4 h-4"/></button>
                                                        <button onClick={() => handleStatusUpdate(appt._id, 'approved')} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200" title="Approve"><Check className="w-4 h-4"/></button>
                                                    </div>
                                                )}
                                                {appt.status === 'approved' && (
                                                    <div className="flex justify-center space-x-2">
                                                        <button onClick={() => handleStatusUpdate(appt._id, 'cancelled')} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200" title="Cancel Appointment"><X className="w-4 h-4"/></button>
                                                        <button onClick={() => handleStatusUpdate(appt._id, 'completed')} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200" title="Mark as Completed"><Check className="w-4 h-4"/></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" className="text-center py-8 text-slate-500">You have no appointments.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DoctorAppointments;
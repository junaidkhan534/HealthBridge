import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, LayoutDashboard, Calendar, User, Settings, LogOut, Bell, Check, X, Clock, Users, BarChart2, Menu, ChevronDown } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { message } from 'antd';
import { logout } from '../../redux/features/userSlice';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
    const { user, token } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({ totalAppointments: 0, totalPatients: 0, appointmentsToday: 0 });
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const getDoctorData = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/doctor/getDoctorAppointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                const allAppointments = res.data.data;
                setAppointments(allAppointments);

                const totalPatients = new Set(allAppointments.map(a => a.userId)).size;
                const todayString = new Date().toDateString();
                
                const appointmentsTodayCount = allAppointments.filter(appt => {
                    const apptDate = new Date(appt.date.split('-').reverse().join('-'));
                    return apptDate.toDateString() === todayString && appt.status === 'approved';
                }).length;

                const activeAppointments = allAppointments.filter(appt => appt.status !== 'cancelled');

                setStats({
                    totalAppointments: activeAppointments.length,
                    totalPatients: totalPatients,
                    appointmentsToday: appointmentsTodayCount
                });
            }
        } catch (error) {
            message.error('Failed to fetch dashboard data');
        }
    };

    useEffect(() => {
        if (token) {
            getDoctorData();
        }
    }, [token]);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (!e.target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Logout Successfully!")
        navigate('/');
    };

    const handleStatusUpdate = async (appointmentId, status) => {
        try {
            const res = await axios.post('http://localhost:8080/api/v1/doctor/updateAppointmentStatus', 
                { appointmentId, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                message.success(res.data.message);
                toast.success(res.data.message);
                getDoctorData(); // Refresh data after update
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    const todaysAppointments = appointments.filter(appt => {
        const apptDate = new Date(appt.date.split('-').reverse().join('-'));
        return apptDate.toDateString() === new Date().toDateString() && appt.status === 'approved';
    });

    const appointmentRequests = appointments.filter(appt => appt.status === 'pending');

    return (
        <div className="flex min-h-screen bg-slate-100">
            {/* Sidebar Navigation */}
            <aside className={`bg-white shadow-lg flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-0 md:w-60'} overflow-hidden h-screen sticky top-0`}>
                <div className="p-6">
                    <Link to="/doctor" className="flex items-center space-x-2">
                        <Stethoscope className="h-8 w-8 text-teal-600" />
                        <span className="text-2xl font-bold text-teal-600">HealthBridge</span>
                    </Link>
                </div>
                <nav className="mt-10">
                    <Link to="/doctor" className="flex items-center px-6 py-3 bg-teal-50 text-teal-600 font-semibold">
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Dashboard
                    </Link>
                    <Link to="/doctor/appointments" className="flex items-center px-6 py-3 text-slate-600 hover:bg-slate-100">
                        <Calendar className="w-5 h-5 mr-3" />
                        Appointments
                    </Link>
                    <Link to="/doctor/patients" className="flex items-center px-6 py-3 text-slate-600 hover:bg-slate-100">
                        <Users className="w-5 h-5 mr-3" />
                        Patients
                    </Link>
                    <Link to="/doctor/availability" className="flex items-center px-6 py-3 text-slate-600 hover:bg-slate-100">
                        <Settings className="w-5 h-5 mr-3" />
                        Set Availability
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm sticky top-0 z-40">
                    <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                        <div className="flex items-center">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden mr-4 text-slate-600">
                                {isSidebarOpen ? <X/> : <Menu/>}
                            </button>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="relative text-slate-500 hover:text-teal-600">
                                <Bell className="h-6 w-6" />
                            </button>
                            <div className="relative user-menu-container">
                                <button onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }} className="flex items-center space-x-2">
                                    <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name.replace(' ', '+')}&background=0D9488&color=fff`} alt="Doctor" className="h-9 w-9 rounded-full object-cover" />
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                </button>
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                                        <Link to="/doctor/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><User className="w-4 h-4 mr-2"/> My Profile</Link>
                                        <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><LogOut className="w-4 h-4 mr-2"/> Logout</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="container mx-auto">
                        <div className="mb-5">
                            <h2 className="text-3xl font-bold text-slate-800">Welcome Dr. {user?.name}</h2>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-md flex items-start"><div className="bg-teal-100 p-3 rounded-full mr-4"><Calendar className="w-6 h-6 text-teal-600"/></div><div><p className="text-slate-600">Today's Appointments</p><p className="text-2xl font-bold text-slate-900">{stats.appointmentsToday}</p></div></div>
                            <div className="bg-white p-6 rounded-lg shadow-md flex items-start"><div className="bg-blue-100 p-3 rounded-full mr-4"><Users className="w-6 h-6 text-blue-600"/></div><div><p className="text-slate-600">Total Patients</p><p className="text-2xl font-bold text-slate-900">{stats.totalPatients}</p></div></div>
                            <div className="bg-white p-6 rounded-lg shadow-md flex items-start"><div className="bg-indigo-100 p-3 rounded-full mr-4"><BarChart2 className="w-6 h-6 text-indigo-600"/></div><div><p className="text-slate-600">Total Appointments</p><p className="text-2xl font-bold text-slate-900">{stats.totalAppointments}</p></div></div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">Today's Appointments</h3>
                                <div className="space-y-4">
                                    {todaysAppointments.length > 0 ? todaysAppointments.map(appt => (
                                        <div key={appt._id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border">
                                            <div className="flex items-center">
                                                <div className="bg-teal-100 p-2 rounded-full mr-4"><Clock className="h-5 w-5 text-teal-600" /></div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{appt.userInfo}</p>
                                                    <p className="text-sm text-slate-500 flex justify-between gap-14">
                                                        <span>{appt.time}</span>
                                                        <span>Age: {appt.patientAge} yrs</span>
                                                        <span>Blood Group: {appt.patientBloodGroup}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleStatusUpdate(appt._id, 'cancelled')} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200" title="Cancel Appointment"><X className="w-4 h-4"/></button>
                                                <button onClick={() => handleStatusUpdate(appt._id, 'completed')} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200" title="Mark as Done"><Check className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    )) : <p className="text-slate-500 text-center py-4">No appointments scheduled for today.</p>}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">Appointment Requests</h3>
                                <div className="space-y-4">
                                    {appointmentRequests.length > 0 ? appointmentRequests.map(req => (
                                        <div key={req._id} className="p-4 rounded-lg bg-slate-50 border">
                                            <p className="font-semibold text-slate-800">{req.userInfo}</p>
                                            <p className="text-sm text-slate-500">{req.date} at {req.time}</p>
                                            <div className="flex justify-end space-x-2 mt-2">
                                                <button onClick={() => handleStatusUpdate(req._id, 'cancelled')} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200" title="Reject"><X className="w-4 h-4"/></button>
                                                <button onClick={() => handleStatusUpdate(req._id, 'approved')} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200" title="Approve"><Check className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    )) : <p className="text-slate-500 text-center py-4">No new appointment requests.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DoctorDashboard;

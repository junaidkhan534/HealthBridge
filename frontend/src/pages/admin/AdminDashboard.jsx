import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, LayoutDashboard, User, Users,CreditCard,Plus, Calendar, Bell, LogOut, ChevronDown, Clock, Menu, X, BedSingle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout } from '../../redux/features/userSlice';
import toast from "react-hot-toast";

const AdminDashboard = () => {
    const { user, token } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, totalAppointments: 0, appointmentsToday: 0 });
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [previewPicture, setPreviewPicture] = useState(null);

    useEffect(() => {
    if (user) {
        setPreviewPicture(user.profilePicture || `https://ui-avatars.com/api/?name=Admin&background=0D9488&color=fff`);
    }
}, [user]); 

    // Helper function to parse DD-MM-YYYY and HH:mm AM/PM into a Date object
    const parseAppointmentDateTime = (dateStr, timeStr) => {
        const [day, month, year] = dateStr.split('-');
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');

        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);

        if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) {
            hours += 12;
        }
        if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
        }
        return new Date(year, month - 1, day, hours, minutes);
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const fetchDashboardData = async () => {
        if (!token) return;
        try {
            const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
                axios.get(`${API_URL}/api/v1/admin/getAllDoctors`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/v1/admin/getAllUsers`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/v1/admin/getAllAppointments`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            let appointmentsTodayCount = 0;
            if (appointmentsRes.data.success) {
                const allAppointments = appointmentsRes.data.data;
                const now = new Date();

                const upcoming = allAppointments
                    .filter(appt => appt.date && appt.time && parseAppointmentDateTime(appt.date, appt.time) >= now)
                    .sort((a, b) => parseAppointmentDateTime(a.date, a.time) - parseAppointmentDateTime(b.date, b.time));
                
                setUpcomingAppointments(upcoming);

                const todayString = new Date().toDateString();
                appointmentsTodayCount = allAppointments.filter(appt => {
                    if (!appt.date) return false;
                    const apptDate = new Date(appt.date.split('-').reverse().join('-'));
                    return apptDate.toDateString() === todayString;
                }).length;
            }

            setStats({
                totalDoctors: doctorsRes.data.success ? doctorsRes.data.data.length : 0,
                totalPatients: patientsRes.data.success ? patientsRes.data.data.length : 0,
                totalAppointments: appointmentsRes.data.success ? appointmentsRes.data.data.length : 0,
                appointmentsToday: appointmentsTodayCount
            });

        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast.error('Failed to fetch dashboard data. Please check your connection and try again.');
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [token]);
    
    const handleLogout = () => {
        dispatch(logout());
        toast.success("Logout successfully!");
        navigate('/');
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
        <div className="flex min-h-screen bg-slate-100">
            {/* Sidebar Navigation */}
            <aside className={`bg-white shadow-lg flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-0 md:w-60'} overflow-hidden h-screen sticky top-0`}>
                <div className="p-6">
                    <Link to="/admin" className="flex items-center space-x-2">
                        <Stethoscope className="h-8 w-8 text-teal-600" />
                        <span className="text-2xl font-bold text-teal-600">HealthBridge</span>
                    </Link>
                </div>
                <nav className="mt-6">
                    <Link to="/admin" className="flex items-center px-6 py-3 bg-teal-50 text-teal-600 font-semibold">
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Dashboard
                    </Link>
                    <Link to="/admin/doctors" className="flex items-center px-6 py-3 text-slate-600 hover:bg-slate-100">
                        <User className="w-5 h-5 mr-3" />
                        Doctors
                    </Link>
                    <Link to="/admin/patients" className="flex items-center px-6 py-3 text-slate-600 hover:bg-slate-100">
                        <Users className="w-5 h-5 mr-3" />
                        Patients
                    </Link>
                    <Link to="/admin/appointments" className="flex items-center px-6 py-3 text-slate-600 hover:bg-slate-100">
                        <Calendar className="w-5 h-5 mr-3" />
                        Appointments
                    </Link>
                    <Link to="/admin/payment" className="flex items-center px-6 py-3 text-slate-600 hover:bg-slate-100">
                        <CreditCard className="w-5 h-5 mr-3" />
                        Payment
                    </Link>
                    <Link to="/admin/add-doctor" className="flex items-center px-6 py-3 text-slate-600 hover:bg-slate-100">
                        <Plus className="w-5 h-5 mr-3" />
                        Add a Doctor
                    </Link>
                    <Link to="/admin/ward" className="flex items-center px-6 py-3 text-slate-600 hover:bg-slate-100">
                        <BedSingle className="w-5 h-5 mr-3" />
                        Ward & Beds
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="bg-white shadow-sm sticky top-0 z-40">
                    <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                        <div className="flex items-center">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden mr-4 text-slate-600">
                                {isSidebarOpen ? <X/> : <Menu/>}
                            </button>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* <button className="relative text-slate-500 hover:text-teal-600">
                                <Bell className="h-6 w-6" />
                            </button> */}
                            <div className="relative">
                                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2">
                                    <img src={previewPicture} alt="Admin" className="h-9 w-9 rounded-full object-cover" />
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                </button>
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        <Link to="/admin/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-teal-50"><User className="w-4 h-4 mr-2"/> My Profile</Link>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"><LogOut className="w-4 h-4 mr-3"/> Sign Out</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
                
                {/* Dashboard Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="mb-1">
                        <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name}</h2>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        
                        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center"><div className="bg-teal-50 p-4 rounded-xl mr-4"><User className="w-5 h-5 text-teal-600"/></div><div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Total Doctors</p><p className="text-2xl font-black text-slate-800 m-0 mt-1">{stats.totalDoctors}</p></div></div>
                        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center"><div className="bg-blue-50 p-4 rounded-xl mr-4"><Users className="w-5 h-5 text-blue-600"/></div><div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Total Patients</p><p className="text-2xl font-black text-slate-800 m-0 mt-1">{stats.totalPatients}</p></div></div>
                        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center"><div className="bg-indigo-50 p-4 rounded-xl mr-4"><Calendar className="w-5 h-5 text-indigo-600"/></div><div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Total Appointments</p><p className="text-2xl font-black text-slate-800 m-0 mt-1">{stats.totalAppointments}</p></div></div>
                        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center"><div className="bg-amber-50 p-4 rounded-xl mr-4"><Clock className="w-5 h-5 text-amber-600"/></div><div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Today's Appointments</p><p className="text-2xl font-black text-slate-800 m-0 mt-1">{stats.appointmentsToday}</p></div></div>
                    </div>

                    {/* Upcoming Appointments Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">Upcoming Appointments</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-max w-full text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2">Patient Name</th>
                                        <th className="py-2">Doctor Name</th>
                                        <th className="py-2">Date & Time</th>
                                        <th className="py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingAppointments.length > 0 ? upcomingAppointments.map(appt => (
                                        <tr key={appt._id} className="border-b">
                                            <td className="py-3 font-semibold">{appt.userInfo}</td>
                                            <td>Dr. {appt.doctorInfo}</td>
                                            <td className="text-sm text-slate-600">{appt.date} - {appt.time}</td>
                                            <td>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(appt.status)}`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-slate-500">No upcoming appointments.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;

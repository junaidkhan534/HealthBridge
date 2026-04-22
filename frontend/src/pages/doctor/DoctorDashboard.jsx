import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Stethoscope, LayoutDashboard, Calendar, User, Settings, LogOut, 
    Check, X, Clock, Users, BarChart2, Menu, ChevronDown, 
    FileText, Activity, Bed, Inbox, CheckCircle2
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { message, Modal, Spin } from 'antd'; 
import { logout } from '../../redux/features/userSlice';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const DoctorDashboard = () => {
    const { user, token } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({ totalAppointments: 0, totalPatients: 0, appointmentsToday: 0 });
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true); 

    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState('Doctor is on emergency leave');
    const [customReason, setCustomReason] = useState('');

    const [isSelectionModalVisible, setIsSelectionModalVisible] = useState(false);
    const [selectedAppointmentForCompletion, setSelectedAppointmentForCompletion] = useState(null);

    // for notification
    useEffect(() => {
        if (!user || !user.id) {
            // console.log(" Socket paused: Waiting for Redux to load User ID...");
            return;
        }

        // console.log(" Redux loaded! Booting up Socket for Doctor:", user.id);
        
        // Connect to the backend
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        // const socket = io('http://localhost:8080'); 
        const socket = io(API_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'] 
    });

        socket.emit('joinDoctorRoom', user.id.toString());

        // Track the connection status
        socket.on('connect', () => {
            // console.log(' Socket fully connected & joined room! ID:', socket.id);
        });

        // Listen for the live appointment requests!
        socket.on('newAppointmentRequest', (newAppointment) => {
            console.log(" MESSAGE RECEIVED ON FRONTEND!", newAppointment);
            
            setAppointments((prev) => [newAppointment, ...prev]);
            toast.success(`New appointment request from ${newAppointment.userInfo}!`, {
                icon: '🔔',
                duration: 5000,
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
        });

        // Listen for cancellations
        socket.on('appointmentCancelledByPatient', (canceledAppointment) => {
            setAppointments((prev) => prev.map(appt => 
                appt._id === canceledAppointment._id ? canceledAppointment : appt
            ));
            toast.error(`${canceledAppointment.userInfo} cancelled their appointment.`, {
                icon: '⚠️'
            });
        });

        // Clean up when the doctor leaves the page
        return () => {
            // console.log(" Disconnecting Socket...");
            socket.disconnect();
        };
    }, [user]); // Keep watching user

    const getDoctorData = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const res = await axios.get(`${API_URL}/api/v1/doctor/getDoctorAppointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                const allAppointments = res.data.data;
                setAppointments(allAppointments);
                updateDashboardStats(allAppointments);
            }
        } catch (error) {
            message.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const updateDashboardStats = (allAppointments) => {
        const totalPatients = new Set(allAppointments.map(a => a.userId?._id || a.userId)).size;
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
    };

    // keep appointment state update in real
    useEffect(() => {
        if (appointments.length > 0) {
            updateDashboardStats(appointments);
        }
    }, [appointments]);

    useEffect(() => {
        if (token) getDoctorData();
    }, [token]);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (!e.target.closest('.user-menu-container')) setShowUserMenu(false);
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Logout Successfully!");
        navigate('/');
    };

    const handleStatusUpdate = async (appointmentId, status) => {
        if (status === 'completed') {
             const appt = appointments.find(a => a._id === appointmentId);
             setSelectedAppointmentForCompletion(appt);
             setIsSelectionModalVisible(true);
             return; 
        }

        if (status === 'cancelled') {
             const appt = appointments.find(a => a._id === appointmentId);
             setAppointmentToCancel(appt);
             setIsCancelModalVisible(true);
             return;
        }

        processStatusUpdate(appointmentId, status, "");
    };

    const processStatusUpdate = async (appointmentId, status, messageStr) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const res = await axios.post(`${API_URL}/api/v1/doctor/updateAppointmentStatus`, 
                { appointmentId, status, cancelMessage: messageStr }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                message.success(res.data.message);
                
                // Instantly update UI
                setAppointments(prev => prev.map(appt => 
                    appt._id === appointmentId ? { ...appt, status: status } : appt
                ));
                setIsCancelModalVisible(false); 
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    const handleConfirmCancel = () => {
        const finalMessage = cancelReason === 'Custom' ? customReason : cancelReason;
        if (!finalMessage) return toast.error("Please provide a reason");
        
        processStatusUpdate(appointmentToCancel._id, 'cancelled', finalMessage);
    };

    const handleOutPatientSelect = () => {
        setIsSelectionModalVisible(false);
        if (selectedAppointmentForCompletion) {
            navigate(`/doctor/prescription/${selectedAppointmentForCompletion._id}`, {
                state: {
                    patientId: selectedAppointmentForCompletion.patientId || selectedAppointmentForCompletion.userId?._id,
                    patientName: selectedAppointmentForCompletion.userInfo || "Patient",
                    patientAge: selectedAppointmentForCompletion.patientAge, 
                    patientGender: selectedAppointmentForCompletion.userId?.gender || "N/A",
                    patientMobile: selectedAppointmentForCompletion.userId?.phone || "N/A"
                }
            });
        }
    };

    const handleInPatientSelect = () => {
        setIsSelectionModalVisible(false);
        if (selectedAppointmentForCompletion) {
            navigate(`/doctor/inPatient/${selectedAppointmentForCompletion._id}`, {
                state: {
                    patientId: selectedAppointmentForCompletion.patientId || selectedAppointmentForCompletion.userId?._id,
                    patientName: selectedAppointmentForCompletion.userInfo || "Patient",
                }
            });
        }
    };

    const todaysAppointments = appointments.filter(appt => {
        const apptDate = new Date(appt.date.split('-').reverse().join('-'));
        return apptDate.toDateString() === new Date().toDateString() && appt.status === 'approved';
    });

    const appointmentRequests = appointments.filter(appt => appt.status === 'pending');

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar Navigation */}
            <aside className={`bg-white shadow-xl flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-0 md:w-60'} overflow-hidden h-screen sticky top-0 z-50`}>
                <div className="p-6">
                    <Link to="/doctor" className="flex items-center space-x-3">
                        <Stethoscope className="h-8 w-8 text-teal-600" />
                        <span className="text-2xl font-bold text-teal-600">HealthBridge</span>
                    </Link>
                </div>
                <nav className="mt-6">
                    <Link to="/doctor" className="flex items-center px-4 py-3 bg-teal-50 text-teal-600 font-semibold">
                        <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
                    </Link>
                    <Link to="/doctor/in-patient" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100">
                        <Bed className="w-5 h-5 mr-3" /> In-Patient Ward
                    </Link>
                    <Link to="/doctor/appointments" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100">
                        <Calendar className="w-5 h-5 mr-3" /> Appointment 
                    </Link>
                    <Link to="/doctor/patients" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100">
                        <Users className="w-5 h-5 mr-3" /> Patient 
                    </Link>
                    <Link to="/doctor/availability" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100">
                        <Settings className="w-5 h-5 mr-3" /> Availability
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-200">
                    <div className="px-4 py-2 flex justify-between items-center">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-slate-600 hover:text-teal-600 transition-colors">
                            {isSidebarOpen ? <X size={24}/> : <Menu size={24}/>}
                        </button>
                        
                        <div className="hidden md:block">
                            <h1 className="text-xl font-black text-slate-800 m-0">Welcome back, Dr. {user?.name?.split(' ')[0]}</h1>
                            <p className="text-xs font-semibold text-slate-500 uppercase m-0 mt-1">Ready for consultations</p>
                        </div>

                        <div className="flex items-center space-x-6 ml-auto">
                            <div className="relative user-menu-container">
                                <button onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }} className="flex items-center space-x-3 p-2">
                                    <div className="text-right hidden sm:block">
                                        {/* <p className="text-sm font-bold text-slate-800 m-0">Dr. {user?.name}</p> */}
                                        <p className="text-[10px] font-bold text-teal-600 uppercase m-0">{user?.specialty}</p>
                                    </div>
                                    <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name.replace(' ', '+')}&background=0D9488&color=fff`} alt="Doctor" className="h-10 w-10 rounded-full object-cover border-2 border-teal-100" />
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                </button>
                                
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                        <Link to="/doctor/profile" className="flex items-center px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"><User className="w-4 h-4 mr-3"/> My Profile</Link>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"><LogOut className="w-4 h-4 mr-3"/> Sign Out</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center hover:shadow-md transition-shadow">
                                <div className="bg-teal-50 p-4 rounded-xl mr-5"><Calendar className="w-5 h-5 text-teal-600"/></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Today's Queue</p>
                                    <p className="text-3xl font-black text-slate-800 m-0 mt-1">{stats.appointmentsToday}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center hover:shadow-md transition-shadow">
                                <div className="bg-blue-50 p-4 rounded-xl mr-5"><Users className="w-5 h-5 text-blue-600"/></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Total Patients</p>
                                    <p className="text-3xl font-black text-slate-800 m-0 mt-1">{stats.totalPatients}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center hover:shadow-md transition-shadow">
                                <div className="bg-indigo-50 p-4 rounded-xl mr-5"><BarChart2 className="w-5 h-5 text-indigo-600"/></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Total Consultations</p>
                                    <p className="text-3xl font-black text-slate-800 m-0 mt-1">{stats.totalAppointments}</p>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20"><Spin size="large" /></div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Today's Appointments Column */}
                                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <h3 className="text-lg font-black text-slate-800 flex items-center m-0"><Clock className="w-5 h-5 mr-2 text-teal-600"/> Today's Consultations</h3>
                                        <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full">{todaysAppointments.length} Active</span>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {todaysAppointments.length > 0 ? todaysAppointments.map(appt => (
                                                <div key={appt._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-teal-200 hover:shadow-sm transition-all group bg-white">
                                                    <div className="flex items-center gap-4">
                                                        <img src={`https://ui-avatars.com/api/?name=${appt.userInfo.replace(' ', '+')}&background=f8fafc&color=0f172a`} alt="Patient" className="h-12 w-12 rounded-full border border-slate-200" />
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-base m-0">{appt.userInfo}</p>
                                                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                                                                <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">{appt.time}</span>
                                                                <span>{appt.patientAge} Yrs</span>
                                                                <span>Blood: <span className="text-red-500">{appt.patientBloodGroup || '--'}</span></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleStatusUpdate(appt._id, 'cancelled')} className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors" title="Cancel Appointment"><X className="w-4 h-4"/></button>
                                                        <button onClick={() => handleStatusUpdate(appt._id, 'completed')} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors font-bold text-sm" title="Mark as Complete"><Check className="w-4 h-4"/> Complete</button>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-12 flex flex-col items-center">
                                                    <div className="bg-slate-50 p-4 rounded-full mb-4"><Calendar className="w-8 h-8 text-slate-400" /></div>
                                                    <p className="text-slate-500 font-medium">Your schedule is clear for today.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Requests Column */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <h3 className="text-lg font-black text-slate-800 flex items-center m-0"><Inbox className="w-5 h-5 mr-2 text-indigo-500"/> Incoming Requests</h3>
                                        {appointmentRequests.length > 0 && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{appointmentRequests.length} New</span>}
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {appointmentRequests.length > 0 ? appointmentRequests.map(req => (
                                                <div key={req._id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
                                                    <p className="font-bold text-slate-800 text-base m-0">{req.userInfo}</p>
                                                    <p className="text-xs font-semibold text-slate-500 mt-1 mb-4 flex items-center gap-1"><Calendar className="w-3 h-3"/> {req.date} • {req.time}</p>
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => handleStatusUpdate(req._id, 'cancelled')} className="flex-1 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">Decline</button>
                                                        <button onClick={() => handleStatusUpdate(req._id, 'approved')} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors">Approve</button>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-10 flex flex-col items-center">
                                                    <div className="bg-slate-50 p-4 rounded-full mb-3"><CheckCircle2 className="w-6 h-6 text-slate-300" /></div>
                                                    <p className="text-slate-400 font-medium text-sm">No pending requests.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* SELECTION MODAL */}
            <Modal
                title={<span className="font-black text-slate-800 text-lg">Consultation Type</span>}
                open={isSelectionModalVisible}
                onCancel={() => setIsSelectionModalVisible(false)}
                footer={null}
                centered
                className="custom-modal"
            >
                <div className="flex flex-col gap-4 py-4">
                    <p className="text-slate-500 text-sm mb-2">How would you like to process this patient's consultation?</p>
                    
                    <button 
                        onClick={handleOutPatientSelect}
                        className="flex items-center justify-start gap-4 p-5 border-2 border-slate-100 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
                    >
                        <div className="bg-teal-100 p-3 rounded-lg text-teal-600 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6"/>
                        </div>
                        <div className="text-left">
                            <h4 className="font-black text-slate-800 text-base m-0 mb-1">Out-Patient (OPD)</h4>
                            <p className="text-xs font-semibold text-slate-500 m-0">Generate a Voice-Enabled Prescription</p>
                        </div>
                    </button>

                    <button 
                        onClick={handleInPatientSelect}
                        className="flex items-center justify-start gap-4 p-5 border-2 border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                        <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform">
                            <Bed className="w-6 h-6"/>
                        </div>
                        <div className="text-left">
                            <h4 className="font-black text-slate-800 text-base m-0 mb-1">In-Patient Admission</h4>
                            <p className="text-xs font-semibold text-slate-500 m-0">Transfer to Ward & Begin Care Plan</p>
                        </div>
                    </button>
                </div>
            </Modal>
            {/* CANCEL APPOINTMENT MODAL */}
            <Modal
                title={<span className="font-bold text-red-600 flex items-center gap-2"><X className="w-5 h-5"/> Cancel Appointment</span>}
                open={isCancelModalVisible}
                onCancel={() => setIsCancelModalVisible(false)}
                footer={null}
                centered
            >
                <div className="flex flex-col gap-4 py-4">
                    <p className="text-slate-600 mb-2">Please select a reason for declining <b>{appointmentToCancel?.userInfo}</b>'s appointment:</p>
                    
                    <select 
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    >
                        <option value="Doctor is on emergency leave">Doctor is on emergency leave</option>
                        <option value="Slot no longer available due to overbooking">Doctor is on OT</option>
                        <option value="Out of town / Clinic closed">Doctor is not available</option>
                        <option value="Custom">Type a Custom Message...</option>
                    </select>

                    {cancelReason === 'Custom' && (
                        <textarea 
                            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 mt-2"
                            rows={3}
                            placeholder="Type your custom cancellation reason here..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                        />
                    )}

                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setIsCancelModalVisible(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Go Back</button>
                        <button onClick={handleConfirmCancel} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Confirm Cancellation</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DoctorDashboard;
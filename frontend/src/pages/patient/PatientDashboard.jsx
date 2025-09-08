import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope, Calendar, User, Bell, LogOut, ChevronDown, Search, HelpCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { message } from 'antd';
import { logout } from '../../redux/features/userSlice';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
    const { user, token } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [selectedSpecialty, setSelectedSpecialty] = useState('');

    const parseAppointmentDateTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return null;
        try {
            const [day, month, year] = dateStr.split('-');
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':');

            hours = parseInt(hours, 10);
            minutes = parseInt(minutes, 10);

            if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;

            const parsedDate = new Date(year, month - 1, day, hours, minutes);
            return isNaN(parsedDate) ? null : parsedDate;
        } catch (err) {
            return null;
        }
    };

    const fetchData = async () => {
        if (!token) return;
        try {
            const [appointmentsRes, doctorsRes] = await Promise.all([
                axios.get('http://localhost:8080/api/v1/appointment/user-appointments', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:8080/api/v1/user/getAllDoctors', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            
            if (appointmentsRes.data.success) {
                setAppointments(appointmentsRes.data.data);
            }
    
            if (doctorsRes.data.success) {
                setDoctors(doctorsRes.data.data);
            }
        } catch (error) {
            message.error('Failed to fetch dashboard data');
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const specialtyFromUrl = params.get('specialty');
        if (specialtyFromUrl) {
            setSelectedSpecialty(specialtyFromUrl);
        }
    }, [location.search]);

    useEffect(() => {
        const handleOutsideClick = () => {
            setShowNotifications(false);
            setShowUserMenu(false);
        };

        window.addEventListener('click', handleOutsideClick);

        return () => {
            window.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Logout Successfully!")
        navigate('/');
    };

    const now = new Date();
    const upcomingAppointments = appointments
        .map(appt => ({ ...appt, dateObj: parseAppointmentDateTime(appt.date, appt.time) }))
        .filter(appt => appt.dateObj >= now)
        .sort((a,b) => a.dateObj - b.dateObj);

    const specialties = [...new Set(doctors.map(doctor => doctor.specialty).filter(Boolean))];

    const filteredDoctors = useMemo(() => {
        const searchLower = searchQuery.toLowerCase();
        return doctors.filter(doctor => {
            const specialtyMatch = selectedSpecialty ? doctor.specialty === selectedSpecialty : true;
            const nameMatch = searchQuery ? doctor.name.toLowerCase().includes(searchLower) : true;
            return specialtyMatch && nameMatch;
        });
    }, [doctors, selectedSpecialty, searchQuery]);

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Top Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/patient" className="flex items-center space-x-2">
                        <Stethoscope className="h-8 w-8 text-teal-600" />
                        <span className="text-2xl font-bold text-teal-600">HealthBridge</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <button onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowUserMenu(false); }} className="relative text-slate-500 hover:text-teal-600">
                                <Bell className="h-6 w-6" />
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-1 z-50">
                                    {/* Notification content */}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); setShowNotifications(false); }} className="flex items-center space-x-2">
                                <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name.replace(' ', '+')}&background=0D9488&color=fff`} alt="User Avatar" className="h-8 w-8 rounded-full object-cover" />
                                <ChevronDown className="h-4 w-4 text-slate-500" />
                            </button>
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                                    <Link to="/patient/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-teal-50"><User className="w-4 h-4 mr-2"/> My Profile</Link>
                                    <Link to="/my-appointments" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-teal-50"><Calendar className="w-4 h-4 mr-2"/> My Appointments</Link>
                                    <Link to="/find-doctor" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-teal-50"><Search className="w-4 h-4 mr-2"/> Find a Doctor</Link>
                                    <Link to="/help" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-teal-50"><HelpCircle className="w-4 h-4 mr-2"/> Help & Support</Link>
                                    <hr className="my-1"/>
                                    <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-teal-50"><LogOut className="w-4 h-4 mr-2"/> Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="flex-1 p-6 overflow-y-auto">
                 {/* New Top Section */}
                <div className="grid grid-cols lg:grid-cols-3 mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Book Your Appointment Now</h1>
                    <div className="relative flex-grow mr-15">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by doctor's name..."
                                className="w-full p-10 pr-4 py-2 border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                    </div>
                </div>
                {/* Book an Appointment Section */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="mb-10 flex justify-center flex-wrap gap-2 items-center">
                        <button
                            onClick={() => setSelectedSpecialty('')}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${
                                selectedSpecialty === '' 
                                ? 'bg-teal-600 text-white' 
                                : 'bg-white text-slate-700 hover:bg-teal-100'
                            }`}
                        >
                            All Specialities
                        </button>
                        {specialties.map(specialty => (
                            <button
                                key={specialty}
                                onClick={() => setSelectedSpecialty(specialty)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${
                                    selectedSpecialty === specialty 
                                    ? 'bg-teal-600 text-white' 
                                    : 'bg-white text-slate-700 hover:bg-teal-100'
                                }`}
                            >
                                {specialty}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredDoctors.map(doctor => (
                            <Link key={doctor._id} to={`/book-appointment/${doctor._id}`} className="group block rounded-lg overflow-hidden border hover:shadow-lg transition-shadow bg-white">
                                <div className="relative">
                                    <img src={doctor.profilePicture || 'https://placehold.co/600x400/E0F2FE/14B8A6?text=Doctor'} alt={`Dr. ${doctor.name}`} className="w-full h-48 object-cover"/>
                                </div>
                                <div className="p-4">
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 ${doctor.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {doctor.available ? 'Available' : 'Unavailable'}
                                    </span>
                                    <h3 className="font-bold text-slate-900 group-hover:text-teal-600">Dr. {doctor.name}</h3>
                                    <p className="text-sm text-slate-500">{doctor.specialty}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientDashboard;
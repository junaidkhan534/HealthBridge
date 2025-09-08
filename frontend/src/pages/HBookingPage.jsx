import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Stethoscope, Clock, Calendar, Star, MapPin, Briefcase, IndianRupee } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { message, notification } from 'antd';
import moment from 'moment';
import toast from 'react-hot-toast';

const HBookingPage = () => {
    const { token } = useSelector(state => state.user);
    const params = useParams();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    const fornotification = async () => {
        toast.error("Login to Book an Appointment!")
    }

    const getDoctorData = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/user/getDoctorById/${params.doctorId}`);
            if (res.data.success) {
                setDoctor(res.data.data);
            } else {
                message.error('Could not fetch doctor details');

            }
        } catch (error) {
            console.error(error);
            message.error('Something went wrong');
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    getDoctorData();
    }, [params.doctorId]);


    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!doctor) {
        return <div className="min-h-screen flex items-center justify-center">Doctor not found.</div>;
    }

    return (
        <div className="bg-slate-100 min-h-screen">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <Stethoscope className="h-8 w-8 text-teal-600" />
                        <span className="text-2xl font-bold text-teal-600">HealthBridge</span>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-10">
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Doctor Profile Section */}
                        <div className="lg:col-span-2">
                            <div className="flex items-start space-x-6">
                                <img src={doctor.profilePicture || `https://ui-avatars.com/api/?name=${doctor.name.replace(' ', '+')}&background=0D9488&color=fff`} alt={`Dr. ${doctor.name}`} className="h-32 w-32 rounded-full object-cover shadow-md border-4 border-white" />
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900">Dr. {doctor.name}</h1>
                                    <p className="text-teal-600 font-semibold mt-1">{doctor.specialty}</p>
                                    <p className="text-slate-500 text-sm">{doctor.qualifications}</p>
                                </div>
                            </div>
                            <div className="mt-5 border-t pt-6">
                                <h2 className="text-xl font-bold text-slate-800 mb-4">About</h2>
                                <p className="text-slate-600">{doctor.bio || 'No biography available.'}</p>
                                <div className="grid grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <h3 className="font-semibold text-slate-800 flex items-center"><Briefcase className="w-5 h-5 mr-2 text-teal-600"/> Experience</h3>
                                        <p className="text-slate-600 pl-7">{doctor.experience} years</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 flex items-center"><IndianRupee className="w-5 h-5 mr-2 text-teal-600"/>Consultation Fee</h3>
                                        <p className="text-slate-600 pl-7">₹{doctor.fees}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <h3 className="font-semibold text-slate-800 flex items-center"><MapPin className="w-5 h-5 mr-2 text-teal-600"/>Appointment Address</h3>
                                        <p className="text-slate-600 pl-7">{doctor.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Availability and Booking Section */}
                        <div className="lg:col-span-1 bg-slate-50 p-6 rounded-lg border">
                            <h2 className="text-xl font-bold text-slate-800 text-center mb-4">Availability</h2>
                            <div>
                                <h3 className="font-semibold text-slate-700 mb-2">Working Days</h3>
                                <div className="flex flex-wrap gap-2">
                                    {doctor.availableDays && doctor.availableDays.length > 0 ? (
                                        doctor.availableDays.map(day => (
                                            <span key={day} className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full">{day}</span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500">Not available</p>
                                    )}
                                </div>
                            </div>
                            <hr className="my-4"/>
                            <div>
                                <h3 className="font-semibold text-slate-700 mb-4">Timings</h3>
                                <div className="space-y-2 pb-5">
                                    {doctor.timings && doctor.timings.map((shift, index) => (
                                        shift.start && shift.end && (
                                        <p key={index}>
                                            <span className="font-medium text-slate-600">
                                            {index === 0 ? "Morning" : index === 1 ? "Evening" : `Shift ${index + 1}`}
                                            </span>
                                            : {shift.start} - {shift.end}
                                        </p>
                                    )
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link to="/login" onClick={fornotification} className="w-full block text-center py-3 font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition duration-300">
                                    Book an Appointment
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HBookingPage;
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, IndianRupee } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { message } from 'antd';
import moment from 'moment';
import toast from 'react-hot-toast';

const BookingPage = () => {
    const { user, token } = useSelector(state => state.user);
    const params = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(moment());
    const [selectedTime, setSelectedTime] = useState(null);
    const [timeSlots, setTimeSlots] = useState({ morning: [], afternoon: [], evening: [] });

    const getDoctorData = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/user/doctor-details/${params.doctorId}`);
            if (res.data.success) {
                setDoctor(res.data.data.doctorProfile);
                setBookedSlots(res.data.data.bookedSlots);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDoctorData();
    }, [params.doctorId]);

    useEffect(() => {
        if (doctor) {
            generateTimeSlots();
        }
    }, [selectedDate, doctor, bookedSlots]);

    const generateTimeSlots = () => {
        if (!doctor || !doctor.availableDays || !doctor.timings) {
            setTimeSlots({ morning: [], afternoon: [], evening: [] });
            return;
        }

        const selectedDayName = selectedDate.format('dddd');
        if (!doctor.availableDays.includes(selectedDayName)) {
            setTimeSlots({ morning: [], afternoon: [], evening: [] });
            return;
        }

        const formattedSelectedDate = selectedDate.format('DD-MM-YYYY');
        const todaysBookedSlots = bookedSlots
            .filter(slot => slot.date === formattedSelectedDate)
            .map(slot => slot.time);

        const now = moment();
        const isToday = selectedDate.isSame(now, 'day');

        let slots = { morning: [], afternoon: [], evening: [] };
        doctor.timings.forEach(shift => {
            if (shift.start && shift.end) {
                let current = moment(shift.start, 'HH:mm');
                const end = moment(shift.end, 'HH:mm');
                while (current < end) {
                    const isPast = isToday && current < now;
                    const formattedTime = current.format('hh:mm A');
                    const slotData = {
                        time: formattedTime,
                        isBooked: todaysBookedSlots.includes(formattedTime) || isPast
                    };

                    if (current.hour() < 12) slots.morning.push(slotData);
                    else if (current.hour() < 17) slots.afternoon.push(slotData);
                    else slots.evening.push(slotData);

                    current.add(15, 'minutes');
                }
            }
        });
        setTimeSlots(slots);
    };

    const handleBooking = async (paymentMethod) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!selectedDate || !selectedTime) {
            return message.warning('Please select a date and an available time slot.');
        }

        if (paymentMethod === 'Online') {
            try {
                const { data: { order } } = await axios.post('http://localhost:8080/api/v1/payment/create-order',
                    { amount: doctor.fees },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const options = {
                    key: "rzp_test_R78WGz5CdFHuPK",
                    amount: order.amount,
                    currency: "INR",
                    name: "HealthBridge",
                    description: `Appointment with Dr. ${doctor.name}`,
                    order_id: order.id,
                    handler: async function (response) {
                        const verifyRes = await axios.post('http://localhost:8080/api/v1/payment/verify-payment', response, { headers: { Authorization: `Bearer ${token}` } });
                        if (verifyRes.data.success) {
                            const bookRes = await axios.post('http://localhost:8080/api/v1/appointment/book-appointment', {
                                doctorId: params.doctorId,
                                date: selectedDate.format('DD-MM-YYYY'),
                                time: selectedTime,
                                payment: 'Online'
                            }, { headers: { Authorization: `Bearer ${token}` } });

                            if (bookRes.data.success) {
                                toast.success('Appointment booked successfully!');
                                navigate('/my-appointments');
                            }
                        } else {
                            toast.error('Payment failed. Please try again.');
                        }
                    },
                    prefill: { name: user.name, email: user.email },
                    theme: { color: "#14B8A6" }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.open();

            } catch (error) {
                toast.error('Could not initiate payment.');
            }
        } else {
            try {
                const res = await axios.post('http://localhost:8080/api/v1/appointment/book-appointment', {
                    doctorId: params.doctorId,
                    date: selectedDate.format('DD-MM-YYYY'),
                    time: selectedTime,
                    payment: 'Cash'
                }, { headers: { Authorization: `Bearer ${token}` } });

                if (res.data.success) {
                    toast.success('Appointment booked successfully!');
                    navigate('/my-appointments');
                } else {
                    message.error(res.data.message);
                    toast.error(res.data.message);
                }
            } catch (error) {
                toast.error('Something went wrong with the booking.');
            }
        }
    };

    const next7Days = Array.from({ length: 7 }, (_, i) => moment().add(i, 'days'));

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!doctor) return <div className="min-h-screen flex items-center justify-center">Doctor not found.</div>;

    return (
        <div className="bg-slate-100 min-h-screen">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center space-x-4">
                    <Link to="/patient" className="text-teal-500 hover:text-teal-600">
                        <ArrowLeft className="h-7 w-7" />
                    </Link>
                    <span className="text-xl font-semibold text-slate-800">Book Now</span>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 py-6">
                <div className="bg-white p-4 sm:p-8 rounded-xl shadow-md grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Doctor Info */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 text-center sm:text-left">
                            <img src={doctor.profilePicture || `https://ui-avatars.com/api/?name=${doctor.name.replace(' ', '+')}&background=0D9488&color=fff`} alt={`Dr. ${doctor.name}`} className="h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover shadow-md border-4 border-white mb-4 sm:mb-0" />
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dr. {doctor.name}</h1>
                                <p className="text-teal-600 font-semibold mt-1">{doctor.specialty}</p>
                                <p className="text-slate-500 text-sm">{doctor.qualifications}</p>
                            </div>
                        </div>
                        <div className="mt-5 border-t pt-6">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">About</h2>
                            <p className="text-slate-600 text-sm sm:text-base">{doctor.bio || 'No biography available.'}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <h3 className="font-semibold text-slate-800 flex items-center text-sm sm:text-base"><Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-teal-600"/> Experience</h3>
                                    <p className="text-slate-600 pl-6 sm:pl-7">{doctor.experience} years</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 flex items-center text-sm sm:text-base"><IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-teal-600"/>Consultation Fee</h3>
                                    <p className="text-slate-600 pl-6 sm:pl-7">₹{doctor.fees}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <h3 className="font-semibold text-slate-800 flex items-center text-sm sm:text-base"><MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-teal-600"/>Appointment Address</h3>
                                    <p className="text-slate-600 pl-6 sm:pl-7">{doctor.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Panel */}
                    <div className="lg:col-span-1 bg-slate-50 p-4 sm:p-6 rounded-lg border">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 text-center mb-4">Book an Appointment</h2>
                        <div className="space-y-4">
                            {/* Dates */}
                            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                                {next7Days.map(day => (
                                    <button 
                                        key={day.format('YYYY-MM-DD')}
                                        onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                                        className={`flex-shrink-0 w-14 sm:w-16 p-2 rounded-lg text-center transition ${selectedDate.isSame(day, 'day') ? 'bg-teal-600 text-white' : 'bg-white border hover:bg-slate-100'}`}
                                    >
                                        <p className="font-bold text-xs sm:text-sm">{day.format('ddd')}</p>
                                        <p className="text-lg sm:text-2xl font-bold">{day.format('D')}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Time Slots */}
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 sm:pr-2">
                                {timeSlots.morning.length > 0 && <div><h4 className="font-semibold text-xs text-slate-500 mb-1">MORNING</h4><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{timeSlots.morning.map(slot => (<button key={slot.time} onClick={() => setSelectedTime(slot.time)} disabled={slot.isBooked} className={`p-2 text-xs sm:text-sm rounded-md text-center transition ${slot.isBooked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : selectedTime === slot.time ? 'bg-teal-600 text-white' : 'bg-white border hover:bg-teal-50'}`}>{slot.time}</button>))}</div></div>}
                                {timeSlots.afternoon.length > 0 && <div><h4 className="font-semibold text-xs text-slate-500 mb-1">AFTERNOON</h4><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{timeSlots.afternoon.map(slot => (<button key={slot.time} onClick={() => setSelectedTime(slot.time)} disabled={slot.isBooked} className={`p-2 text-xs sm:text-sm rounded-md text-center transition ${slot.isBooked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : selectedTime === slot.time ? 'bg-teal-600 text-white' : 'bg-white border hover:bg-teal-50'}`}>{slot.time}</button>))}</div></div>}
                                {timeSlots.evening.length > 0 && <div><h4 className="font-semibold text-xs text-slate-500 mb-1">EVENING</h4><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{timeSlots.evening.map(slot => (<button key={slot.time} onClick={() => setSelectedTime(slot.time)} disabled={slot.isBooked} className={`p-2 text-xs sm:text-sm rounded-md text-center transition ${slot.isBooked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : selectedTime === slot.time ? 'bg-teal-600 text-white' : 'bg-white border hover:bg-teal-50'}`}>{slot.time}</button>))}</div></div>}
                                {timeSlots.morning.length === 0 && timeSlots.afternoon.length === 0 && timeSlots.evening.length === 0 && <p className="text-center text-slate-500 py-4 text-sm">No available slots on this day.</p>}
                            </div>

                            {/* Payment Buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                                <button 
                                    onClick={() => handleBooking('Cash')}
                                    disabled={!selectedTime}
                                    className="w-full py-2 sm:py-3 font-semibold text-xs sm:text-base text-teal-700 bg-white border border-teal-600 rounded-lg hover:bg-teal-50 transition duration-300 disabled:bg-slate-200 disabled:text-slate-400"
                                >
                                    Pay with Cash
                                </button>
                                <button 
                                    onClick={() => handleBooking('Online')}
                                    disabled={!selectedTime}
                                    className="w-full py-2 sm:py-3 font-semibold text-xs sm:text-base text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition duration-300 disabled:bg-slate-400"
                                >
                                    Pay Online
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookingPage;

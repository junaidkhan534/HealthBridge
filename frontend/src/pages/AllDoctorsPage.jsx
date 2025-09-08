import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, MapPin, Star, Filter } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';
import { useSelector } from 'react-redux';

const AllDoctorsPage = () => {
    const { token } = useSelector(state => state.user);
    const [doctors, setDoctors] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const location = useLocation();

    const fetchDoctors = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/user/getAllDoctors');

            if (res.data.success) {
                setDoctors(res.data.data);
            }
        } catch (error) {
            message.error('Failed to fetch doctors');
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const specialtyFromUrl = params.get('specialty');
        if (specialtyFromUrl) {
            setSelectedSpecialty(specialtyFromUrl);
        }
    }, [location.search]);

    const specialties = [...new Set(doctors.map(doctor => doctor.specialty).filter(Boolean))];

    const filteredDoctors = useMemo(() => {
        return doctors.filter(doctor => {
            const specialtyMatch = selectedSpecialty ? doctor.specialty === selectedSpecialty : true;
            return specialtyMatch;
        });
    }, [doctors, selectedSpecialty]);

    return (
        <div className="bg-slate-50 min-h-screen">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="/" className="flex items-center space-x-2">
                        <Stethoscope className="h-8 w-8 text-teal-600" />
                        <span className="text-2xl font-bold text-teal-600">HealthBridge</span>
                    </a>
                </div>
            </header>

            <main className="container mx-auto px-6 py-6">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-900">Our Doctors</h1>
                    <p className="mt-2 text-lg text-slate-600">Find the right specialist for your healthcare needs.</p>
                </div>

                <div className="mb-10 flex justify-center flex-wrap gap-2 items-center">
                    {/* Specialty Filters */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredDoctors.map((doctor) => (
                        <Link 
                            key={doctor._id} 
                            to={`/doctor/book-appointment/${doctor._id}`} 
                            className="group block rounded-lg overflow-hidden border bg-white hover:shadow-xl transition-shadow"
                        >
                            <div className="relative">
                                <img 
                                    src={doctor.profilePicture || 'https://placehold.co/600x400/E0F2FE/14B8A6?text=Doctor'} 
                                    alt={`Dr. ${doctor.name}`} 
                                    className="w-full h-48 object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 ${doctor.available ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                    {doctor.available ? 'Available' : 'Unavailable'}
                                </span>
                                <h3 className="font-bold text-slate-900 group-hover:text-teal-600">Dr. {doctor.name}</h3>
                                <p className="text-sm text-slate-500">{doctor.specialty}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AllDoctorsPage;
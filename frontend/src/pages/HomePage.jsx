import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Menu, HeartPulse, Sparkles, Baby, Bone, MoreHorizontal, Award, ShieldCheck, CalendarDays } from 'lucide-react';

const HomePage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) { 
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
       

    return (
        <div className="bg-slate-50 text-slate-800">
            {/* Header */}
            <header id="main-header" className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <Stethoscope className="h-8 w-8 text-teal-600" />
                        <span className="text-2xl font-bold text-teal-600">HealthBridge</span>
                    </Link>
                    
                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="/" className="text-slate-600 hover:text-teal-600 hover:underline">Home</a>
                        <a href="#specialities" className="text-slate-600 hover:text-teal-600 hover:underline">Specialities</a>
                        <a href="/alldoctors" className="text-slate-600 hover:text-teal-600 hover:underline">All Doctors</a>
                        <a href="/finddoctor" className="text-slate-600 hover:text-teal-600 hover:underline">Find a Doctor</a>
                        <a href="/about" className="text-slate-600 hover:text-teal-600 hover:underline">About</a>
                    </div>
                    
                    {/* Desktop Login Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/portal/login" className="px-3 py-1 text-sm text-slate border-2 border-teal-600 rounded-md hover:bg-teal-100">Admin/Doctor Login</Link>
                        <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700">Patient Login</Link>
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-teal-600">
                            <Menu className="w-6 h-6"/>
                        </button>
                    </div>
                </nav>
                {/* Mobile Menu */}
                <div className={`md:hidden bg-white ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                    <Link to="/" className="block py-2 px-4 text-sm hover:bg-teal-50">Home</Link>
                    <a href="#specialities" className="block py-2 px-4 text-sm hover:bg-teal-50">Specialities</a>
                    <Link to="/alldoctors" className="block py-2 px-4 text-sm hover:bg-teal-50">All Doctors</Link>
                    <Link to="/finddoctor" className="block py-2 px-4 text-sm hover:bg-teal-50">Find a Doctor</Link>
                    <Link to="/about" className="block py-2 px-4 text-sm hover:bg-teal-50">About</Link>
                    <Link to="/login" className="block py-2 px-4 text-sm hover:bg-teal-50">Patient Login</Link>
                    <Link to="/portal/login" className="block py-2 px-4 text-sm hover:bg-teal-50">Admin/Doctor Login</Link>
                </div>
            </header>

            {/* photo Section */}
            <main id="home" className="bg-right bg-no-repeat bg-cover text-white" style={{backgroundImage: "linear-gradient(to right, rgba(5, 52, 52, 1), rgba(5, 40, 40, 1)), url('/main.jpg')"}}>
            <div className="container mx-auto px-6 py-24 md:py-40 text-left">
                <div className="max-w-3xl mx-auto transform -translate-x-15">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                        Your Health, Our Priority.
                        </h1>
                        <p className="mt-6 text-lg text-slate-200 max-w-xl text-left">
                            Find trusted specialists and book appointments hassle-free.
                            Get the best medical care without the wait.
                            </p>
                            <div className="mt-10 flex justify-left">
                                <Link
                                    to="/login"
                                    className="px-8 py-4 font-semibold text-teal-600 bg-white rounded-2xl hover:bg-teal-600 hover:text-white transition duration-300 shadow-lg transform inline-block"
                                    >
                                        Book an Appointment Now
                                </Link>
                            </div>
                        </div>
                </div>
            </main>

            {/* Speciality Section */}
           <section id="specialities" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Find by Speciality</h2>
                        <p className="mt-4 text-slate-600">Search for the right doctor from a wide range of specialties.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
                        <a href="/alldoctors?specialty=General%20Physician" className="group block p-6 bg-slate-50 rounded-xl border border-slate-100 hover:bg-teal-500 hover:text-white hover:shadow-lg transition-all duration-300">
                            <Stethoscope className="w-12 h-12 mx-auto text-teal-600 group-hover:text-white transition-colors"/>
                            <h3 className="mt-4 font-semibold">General Physician</h3>
                        </a>
                        <a href="/alldoctors?specialty=Dermatologist" className="group block p-6 bg-slate-50 rounded-xl border border-slate-100 hover:bg-teal-500 hover:text-white hover:shadow-lg transition-all duration-300">
                            <Sparkles className="w-12 h-12 mx-auto text-teal-600 group-hover:text-white transition-colors"/>
                            <h3 className="mt-4 font-semibold">Dermatologist</h3>
                        </a>
                        <a href="/alldoctors?specialty=Cardiologist" className="group block p-6 bg-slate-50 rounded-xl border border-slate-100 hover:bg-teal-500 hover:text-white hover:shadow-lg transition-all duration-300">
                            <HeartPulse className="w-12 h-12 mx-auto text-teal-600 group-hover:text-white transition-colors"/>
                            <h3 className="mt-4 font-semibold">Cardiologist</h3>
                        </a>
                        <a href="/alldoctors?specialty=Pediatrician" className="group block p-6 bg-slate-50 rounded-xl border border-slate-100 hover:bg-teal-500 hover:text-white hover:shadow-lg transition-all duration-300">
                            <Baby className="w-12 h-12 mx-auto text-teal-600 group-hover:text-white transition-colors"/>
                            <h3 className="mt-4 font-semibold">Pediatrician</h3>
                        </a>
                        <a href="/alldoctors?specialty=Orthopedist" className="group block p-6 bg-slate-50 rounded-xl border border-slate-100 hover:bg-teal-500 hover:text-white hover:shadow-lg transition-all duration-300">
                            <Bone className="w-12 h-12 mx-auto text-teal-600 group-hover:text-white transition-colors"/>
                            <h3 className="mt-4 font-semibold">Orthopedist</h3>
                        </a>
                        <a href="/alldoctors" className="group block p-6 bg-slate-50 rounded-xl border border-slate-100 hover:bg-teal-500 hover:text-white hover:shadow-lg transition-all duration-300">
                            <MoreHorizontal className="w-12 h-12 mx-auto text-teal-600 group-hover:text-white transition-colors"/>
                            <h3 className="mt-4 font-semibold">View All</h3>
                        </a>
                    </div>
                </div>
            </section>

            {/* HealthBridge Section */}
            <section className="py-20 bg-teal-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Why HealthBridge?</h2>
                        <p className="mt-4 text-slate-600">A trusted platform for your healthcare needs.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-8">
                            <Award className="w-16 h-16 mx-auto text-teal-600" />
                            <p className="text-2xl font-bold mt-4">Expert Doctors</p>
                            <p className="text-slate-600">Access a network of highly qualified and verified specialists.</p>
                        </div>
                        <div className="p-8">
                            <ShieldCheck className="w-16 h-16 mx-auto text-teal-600" />
                            <p className="text-2xl font-bold mt-4">Secure Platform</p>
                            <p className="text-slate-600">Your data is always safe and confidential with our robust security.</p>
                        </div>
                        <div className="p-8">
                            <CalendarDays className="w-16 h-16 mx-auto text-teal-600" />
                            <p className="text-2xl font-bold mt-4">Easy Scheduling</p>
                            <p className="text-slate-600">Book, or cancel appointments with just a few clicks.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Doctors Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Meet Our Top Doctors</h2>
                        <p className="mt-4 text-slate-600">Experienced professionals dedicated to your health.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden text-center transition-transform duration-300 hover:-translate-y-2">
                            <img src="/d6.png" alt="Dr. sanjay Agarwal" className="w-full h-64 object-cover"/>
                            <div className="p-6">
                                <h3 className="font-bold text-lg">Dr. sanjay Agarwal</h3>
                                <p className="text-teal-600">General Physician</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md overflow-hidden text-center transition-transform duration-300 hover:-translate-y-2">
                            <img src="/d1.jpg" alt="Dr. Indu singh" className="w-full h-64 object-cover"/>
                            <div className="p-6">
                                <h3 className="font-bold text-lg">Dr. Indu singh</h3>
                                <p className="text-teal-600">Cardiologist</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md overflow-hidden text-center transition-transform duration-300 hover:-translate-y-2">
                            <img src="/d3.jpg" alt="Dr. Mahendra Rathor" className="w-full h-64 object-cover"/>
                            <div className="p-6">
                                <h3 className="font-bold text-lg">Dr. Mahendra Rathor</h3>
                                <p className="text-teal-600">Pediatrician</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-800">
                <div className="container mx-auto px-20 py-10">
                    <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
                        <div className="md:col-span-1">
                            <div className="flex items-center space-x-2 justify-center md:justify-start">
                                <Stethoscope className="h-8 w-8 text-white"/>
                                <span className="text-2xl font-bold text-white">HealthBridge</span>
                            </div>
                            <p className="mt-4 text-slate-400">Your trusted partner in healthcare. Book appointments with ease and confidence.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Explore</h3>
                            <ul className="mt-4 space-y-2">
                                <li><a href="/about" className="text-slate-400 hover:text-white">About Us</a></li>
                                <li><a href="#specialities" className="text-slate-400 hover:text-white">Specialities</a></li>
                                <li><a href="/alldoctors" className="text-slate-400 hover:text-white">Our Doctors</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Legal</h3>
                            <ul className="mt-4 space-y-2">
                                <li><a href="/about" className="text-slate-400 hover:text-white">Privacy Policy</a></li>
                                <li><a href="/about" className="text-slate-400 hover:text-white">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 py-2">
                    <div className="container mx-auto p-2 text-center text-slate-500">
                        <p>&copy; 2025-26 HealthBridge. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
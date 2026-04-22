import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Target, Handshake, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

const AboutPage = () => {
    useEffect(() => {
        const sections = document.querySelectorAll('.fade-in-section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });
        sections.forEach(section => observer.observe(section));

        return () => sections.forEach(section => observer.unobserve(section));
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <Stethoscope className="h-8 w-8 text-teal-600" />
                        <span className="text-2xl font-bold text-teal-600">HealthBridge</span>
                    </Link>

                </div>
            </header>

            {/* main section */}
            <main>
                <section className="relative bg-teal-50 py-4 md:py-6 text-center">
                    <div className="container mx-auto px-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-teal-900">About HealthBridge</h1>
                        <p className="mt-3 text-sm text-slate-700 max-w-3xl mx-auto">
                            We are dedicated to bridging the gap between patients and healthcare providers through technology, making quality medical care accessible and convenient for everyone.
                        </p>
                    </div>
                </section>

                <section className="py-10 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="fade-in-section">
                                <img 
                                    src="/vision.jpg" 
                                    alt="Medical research" 
                                    className="rounded-lg shadow-xl"
                                />
                            </div>
                            <div className="fade-in-section">
                                <h2 className="text-2xl font-bold text-slate-900">Our Vision for the Future</h2>
                                <p className="mt-3 text-slate-600">
                                    We envision a world where healthcare is a seamless part of life, empowering every individual to take control of their health journey with confidence. HealthBridge aims to be the most trusted digital platform, fostering a healthier community one appointment at a time.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>


                <section className="py-8 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-bold text-slate-900">Our Core Values</h2>
                            <p className="mt-3 text-slate-600">The principles that guide us every day.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="fade-in-section p-8 bg-white rounded-lg shadow-sm">
                                <Target className="w-10 h-10 mx-auto text-teal-600" />
                                <h3 className="mt-4 text-lg font-semibold">Patient-Centric</h3>
                                <p className="mt-2 text-sm text-slate-600">Our users are at the heart of everything we do.</p>
                            </div>
                            <div className="fade-in-section p-8 bg-white rounded-lg shadow-sm">
                                <Handshake className="w-10 h-10 mx-auto text-teal-600" />
                                <h3 className="mt-4 text-lg font-semibold">Trust & Integrity</h3>
                                <p className="mt-2 text-sm text-slate-600">We operate with transparency and honesty.</p>
                            </div>
                            <div className="fade-in-section p-8 bg-white rounded-lg shadow-sm">
                                <ShieldCheck className="w-10 h-10 mx-auto text-teal-600" />
                                <h3 className="mt-4 text-lg font-semibold">Excellence</h3>
                                <p className="mt-2 text-sm text-slate-600">We strive for excellence in our technology and service.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-2xl font-bold text-slate-900">Contact Information</h2>
                        <p className="mt-3 text-slate-600 max-w-xl mx-auto">Have questions? We're here to help. Reach out to us via phone, email, or visit our office.</p>
                        <div className="mt-8 grid md:grid-cols-3 gap-8">
                            <div className="flex flex-col items-center">
                                <Phone className="w-8 h-8 text-teal-600"/>
                                <h3 className="mt-2 font-semibold">Phone</h3>
                                <p className="text-slate-600">1800 123-4567</p>
                            </div>
                             <div className="flex flex-col items-center">
                                <Mail className="w-8 h-8 text-teal-600"/>
                                <h3 className="mt-2 font-semibold">Email</h3>
                                <p className="text-slate-600">jkhan78908@gmail.com</p>
                            </div>
                             <div className="flex flex-col items-center">
                                <MapPin className="w-8 h-8 text-teal-600"/>
                                <h3 className="mt-2 font-semibold">Address</h3>
                                <p className="text-slate-600">123 HealthBridge,  City-Bareilly</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AboutPage;
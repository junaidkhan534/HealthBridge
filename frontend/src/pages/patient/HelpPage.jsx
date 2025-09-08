import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, HelpCircle } from 'lucide-react';

const HelpPage = () => {
    return (
        <div className="bg-slate-100 min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex space-x-4 items-center">
                    <Link to="/patient" className="text-teal-500 hover:text-teal-600">
                        <ArrowLeft className="h-7 w-7" />
                    </Link>
                    <span className="text-xl font-semibold text-slate-800">Help Center</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">
                    <div className="text-center mb-8">
                        <HelpCircle className="w-16 h-16 mx-auto text-teal-600" />
                        <h1 className="text-3xl font-bold text-slate-900 mt-4">Help & Support</h1>
                        <p className="mt-2 text-slate-600">
                            We're here to help. Find answers to common questions or get in touch with our support team.
                        </p>
                    </div>

                    {/* FAQ Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Frequently Asked Questions</h2>
                        
                        {/* FAQ Item 1 */}
                        <details className="group">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-2 rounded-lg hover:bg-slate-100">
                                <span>How do I book an appointment?</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                </span>
                            </summary>
                            <p className="text-slate-600 mt-2 px-2 pb-2">
                                From your dashboard, you can search for a doctor by specialty or browse the full list. Once you find a doctor, click on their profile to view their available time slots and complete the booking process.
                            </p>
                        </details>

                        {/* FAQ Item 2 */}
                        <details className="group">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-2 rounded-lg hover:bg-slate-100">
                                <span>How can I cancel my appointment?</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                </span>
                            </summary>
                            <p className="text-slate-600 mt-2 px-2 pb-2">
                                Navigate to the "My Appointments" page from your dashboard. You will see a list of your upcoming appointments with an option to cancel. Please note that cancellations & Refund may be subject to the HealthBridge's policy.
                            </p>
                        </details>

                        {/* FAQ Item 3 */}
                        <details className="group">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-2 rounded-lg hover:bg-slate-100">
                                <span>Is online payment secure?</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                </span>
                            </summary>
                            <p className="text-slate-600 mt-2 px-2 pb-2">
                                Yes, all online payments are processed through our secure payment gateway partner, Razorpay. We do not store any of your card or payment information on our servers.
                            </p>
                        </details>
                    </div>

                    {/* Contact Us Section */}
                    <div className="mt-10 border-t pt-8">
                        <h2 className="text-xl font-bold text-slate-800 text-center">Still Need Help?</h2>
                        <div className="mt-6 flex flex-col md:flex-row justify-center items-center gap-8">
                            <div className="flex items-center">
                                <Phone className="w-5 h-5 text-teal-600 mr-3" />
                                <span className="text-slate-700">1800 123-4567</span>
                            </div>
                            <div className="flex items-center">
                                <Mail className="w-5 h-5 text-teal-600 mr-3" />
                                <span className="text-slate-700">support@healthbridge.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HelpPage;

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Search, DollarSign, CreditCard, Landmark, Calendar, ArrowLeft, User, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { message } from 'antd';

const PaymentPage = () => {
    const { user, token } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });
    const [showUserMenu, setShowUserMenu] = useState(false);

    const getPayments = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const res = await axios.get(`${API_URL}/api/v1/admin/getAllPayments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setPayments(res.data.data);
            }
        } catch (error) {
            message.error('Failed to fetch payment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            getPayments();
        }
    }, [token]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    
    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            const searchLower = searchTerm.toLowerCase();
            const paymentDate = new Date(payment.date.split('-').reverse().join('-'));
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            return (
                (payment.userInfo.toLowerCase().includes(searchLower) || payment.doctorInfo.toLowerCase().includes(searchLower)) &&
                (!startDate || paymentDate >= startDate) &&
                (!endDate || paymentDate <= endDate)
            );
        });
    }, [payments, searchTerm, filters]);
    
    // const today = new Date().toLocaleDateString('en-CA').split('-').reverse().join('-'); // Format DD-MM-YYYY
    // const totalOnline = payments.filter(p => p.payment === 'Paid');
    // const totalCash = payments.filter(p => p.payment === 'Cash');
    // const todayOnline = totalOnline.filter(p => p.date === today);
    // const todayCash = totalCash.filter(p => p.date === today);

    // const stats = {
    //     totalOnlineCount: totalOnline.length,
    //     totalOnlineAmount: totalOnline.reduce((sum, p) => sum + (p.fees || 0), 0),
    //     totalCashCount: totalCash.length,
    //     totalCashAmount: totalCash.reduce((sum, p) => sum + (p.fees || 0), 0),
    //     todayOnlineCount: todayOnline.length,
    //     todayOnlineAmount: todayOnline.reduce((sum, p) => sum + (p.fees || 0), 0),
    //     todayCashCount: todayCash.length,
    //     todayCashAmount: todayCash.reduce((sum, p) => sum + (p.fees || 0), 0),
    // };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link to="/admin" className="text-teal-500 hover:text-teal-600" >
                            <ArrowLeft className="h-7 w-7" />
                        </Link>
                        <span className="text-xl font-semibold text-slate-800">List of Payment</span>
                    </div>
                </div>
            </header>
            
            <main className="flex-1 p-6">
                {/* Stat Cards
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
                        <div className="bg-green-100 p-3 rounded-full mr-4">
                            <CreditCard className="w-6 h-6 text-green-600"/>
                        </div>
                        <div>
                            <p className="text-slate-600">Total Online Payments</p>
                            <p className="text-2xl font-bold text-slate-900">₹{stats.totalOnlineAmount.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">{stats.totalOnlineCount} transactions</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                            <Landmark className="w-6 h-6 text-blue-600"/>
                        </div>
                        <div>
                            <p className="text-slate-600">Total Cash Payments</p>
                            <p className="text-2xl font-bold text-slate-900">₹{stats.totalCashAmount.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">{stats.totalCashCount} transactions</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
                        <div className="bg-green-100 p-3 rounded-full mr-4">
                            <CreditCard className="w-6 h-6 text-green-600"/>
                        </div>
                        <div>
                            <p className="text-slate-600">Today's Online Payments</p>
                            <p className="text-2xl font-bold text-slate-900">₹{stats.todayOnlineAmount.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">{stats.todayOnlineCount} transactions</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                            <Landmark className="w-6 h-6 text-blue-600"/>
                        </div>
                        <div>
                            <p className="text-slate-600">Today's Cash Payments</p>
                            <p className="text-2xl font-bold text-slate-900">₹{stats.todayCashAmount.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">{stats.todayCashCount} transactions</p>
                        </div>
                    </div>
                </div> */}

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="relative md:col-span-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                            <input 
                                type="text"
                                placeholder="Search by name..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2 flex items-center space-x-2">
                            <label htmlFor="startDate" className="text-sm font-medium text-slate-600">From:</label>
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"/>
                            <label htmlFor="endDate" className="text-sm font-medium text-slate-600">To:</label>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"/>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-slate-50">
                                    {/* <th className="p-3">Appointment ID</th> */}
                                    <th className="p-3">Patient Name</th>
                                    <th className="p-3">Doctor Name</th>
                                    <th className="p-3">Payment Method</th>
                                    <th className="p-3">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-8">Loading payments...</td></tr>
                                ) : filteredPayments.map(payment => (
                                    <tr key={payment._id} className="border-b hover:bg-slate-50">
                                        {/* <td className="p-3 font-mono text-xs text-slate-500">{payment._id}</td> */}
                                        <td className="p-3 font-semibold text-slate-800">{payment.userInfo}</td>
                                        <td className="p-3 text-sm">Dr. {payment.doctorInfo}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${payment.payment === 'Online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {payment.payment}
                                            </span>
                                        </td>
                                        <td className="p-3 font-semibold text-slate-800">₹{(payment.fees || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PaymentPage;

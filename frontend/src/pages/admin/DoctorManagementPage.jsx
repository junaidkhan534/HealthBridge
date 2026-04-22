import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Search, MoreVertical, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { message } from 'antd';

const DoctorManagementPage = () => {
    const { token } = useSelector(state => state.user);
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ specialty: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'joinDate', direction: 'descending' });

    const fetchDoctors = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/admin/getAllDoctors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setDoctors(res.data.data);
            } else {
                message.error('Failed to fetch doctors');
            }
        } catch (error) {
            message.error('Something went wrong');
        }
    };

    useEffect(() => {
        if (token) {
            fetchDoctors();
        }
    }, [token]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const specialties = [...new Set(doctors.map(doc => doc.specialty))];

    const sortedAndFilteredDoctors = useMemo(() => {
        let filtered = doctors.filter(doc => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (doc.name.toLowerCase().includes(searchLower) || (doc.doctorId && doc.doctorId.toLowerCase().includes(searchLower)) || doc.specialty.toLowerCase().includes(searchLower)) &&
                (filters.specialty === '' || doc.specialty === filters.specialty)
            );
        });

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [doctors, searchTerm, filters, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link to="/admin" className="text-teal-500 hover:text-teal-600" >
                            <ArrowLeft className="h-7 w-7" />
                        </Link>
                        <span className="text-xl font-semibold text-slate-800">List of All Doctors</span>
                    </div>
                </div>
            </header>
            
            <main className="flex-1 p-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                            <input 
                                type="text"
                                placeholder="Search by name, ID..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select name="specialty" value={filters.specialty} onChange={handleFilterChange} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option value="">All Specialities</option>
                            {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-slate-50">
                                    <th className="p-3">Doctor ID</th>
                                    <th className="p-3 cursor-pointer" onClick={() => requestSort('name')}>Name</th>
                                    <th className="p-3">Contact</th>
                                    <th className="p-3 cursor-pointer" onClick={() => requestSort('experience')}>Experience</th>
                                    <th className="p-3">Fees</th>
                                    <th className="p-3">Availability</th>
                                    {/* <th className="p-3 text-center">Actions</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAndFilteredDoctors.map(doc => (
                                    <tr key={doc._id} className="border-b hover:bg-slate-50">
                                        <td className="p-3 font-mono text-xs text-slate-500">{doc.doctorId}</td>
                                        <td className="p-3">
                                            <p className="font-semibold text-slate-800">{doc.name}</p>
                                            <p className="text-xs text-slate-500">{doc.specialty}</p>
                                        </td>
                                        <td className="p-3 text-sm">
                                            <p>{doc.email}</p>
                                            <p className="text-slate-500">{doc.phone}</p>
                                        </td>
                                        <td className="p-3 text-sm">{doc.experience} years</td>
                                        <td className="p-3 text-sm">₹{doc.fees}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${doc.available ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                                {doc.available ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
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

export default DoctorManagementPage;
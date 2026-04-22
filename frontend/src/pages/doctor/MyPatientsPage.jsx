import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, User, Users, Calendar, Search,ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { message } from 'antd';
import moment from 'moment';

const MyPatientsPage = () => {
    const { token } = useSelector(state => state.user);
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    const getMyPatients = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const res = await axios.get(`${API_URL}/api/v1/doctor/get-my-patients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setPatients(res.data.data);
            }
        } catch (error) {
            message.error('Failed to fetch patients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            getMyPatients();
        }
    }, [token]);

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        return moment().diff(moment(dob, 'YYYY-MM-DD'), 'years');
    };

    const sortedAndFilteredPatients = useMemo(() => {
        let filtered = patients.filter(patient => {
            const searchLower = searchTerm.toLowerCase();
            const matchesName = patient.name?.toLowerCase().includes(searchLower);
            const matchesId = patient.patientId?.toLowerCase().includes(searchLower);
            
            return matchesName || matchesId;
        });

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [patients, searchTerm, sortConfig]);

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
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex space-x-4 items-center">
                    <Link to="/doctor" className="text-teal-500 hover:text-teal-600">
                        <ArrowLeft className="h-7 w-7" />
                    </Link>
                    <span className="text-xl font-semibold text-slate-800">My Patients</span>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                            <input 
                                type="text"
                                placeholder="Search"
                                className="w-full max-w-xs pl-10 pr-4 py-2 border border-slate-300 rounded-md bg-slate-50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-t border-b bg-slate-50">
                                    <th className="p-3">Patient ID</th>
                                    <th className="p-3 cursor-pointer hover:bg-slate-200" onClick={() => requestSort('name')}>Name</th>
                                    <th className="p-3">Contact</th>
                                    <th className="p-3">Address</th>
                                    <th className="p-3">Gender</th>
                                    <th className="p-3">Age</th>
                                    <th className="p-3">Blood Group</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center py-8">Loading patients...</td></tr>
                                ) : sortedAndFilteredPatients.length > 0 ? (
                                    sortedAndFilteredPatients.map(patient => (
                                        <tr key={patient._id} className="border-b hover:bg-slate-50">
                                            <td className="p-3 font-mono text-sm">
                                                {patient.patientId ? (
                                                    <Link 
                                                        to={`/doctor/patient-history/${patient.patientId}`} 
                                                        className="text-slate-600 font-bold hover:text-teal-800 hover:underline cursor-pointer"
                                                        title="View Patient History"
                                                    >
                                                        {patient.patientId}
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-400 italic">N/A</span>
                                                )}
                                            </td>
                                            <td className="p-3 font-semibold">{patient.name}</td>
                                            <td className="p-3 text-sm">
                                                <p>{patient.email}</p>
                                                <p className="text-slate-500">{patient.phone || 'N/A'}</p>
                                            </td>
                                            <td className="p-3 text-sm">{patient.address || 'N/A'}</td>
                                            <td className="p-3 text-sm capitalize">{patient.gender || 'N/A'}</td>
                                            <td className="p-3 text-sm">{calculateAge(patient.dob)}</td>
                                            <td className="p-3 text-sm font-semibold">{patient.bloodGroup || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" className="text-center py-8 text-slate-500">No patients found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyPatientsPage;
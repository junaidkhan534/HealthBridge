import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Search, MoreVertical, ArrowLeft, Trash2, Edit, Eye, UserX, UserCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { message } from 'antd';
import moment from 'moment';

const PatientManagementPage = () => {
    const { token } = useSelector(state => state.user);
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ gender: '', ageGroup: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'registrationDate', direction: 'descending' });
    const [activeActionMenu, setActiveActionMenu] = useState(null);

    const getPatients = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/admin/getAllUsers', {
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
            getPatients();
        }
    }, [token]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        return moment().diff(moment(dob, 'YYYY-MM-DD'), 'years');
    };

    const sortedAndFilteredPatients = useMemo(() => {
    let filtered = patients.filter(patient => {
        const searchLower = (searchTerm || "").toLowerCase();
        const age = calculateAge(patient.dob);
        
        const nameMatch = (patient.name || "").toLowerCase().includes(searchLower);
        
        const emailMatch = (patient.email || "").toLowerCase().includes(searchLower);
        
        const idMatch = String(patient.patientId || "").toLowerCase().includes(searchLower);

        let ageMatch = true;
        if (filters.ageGroup) {
            const [min, max] = filters.ageGroup.split('-').map(Number);
            ageMatch = age >= min && age <= (max || Infinity);
        }

        const genderMatch = !filters.gender || patient.gender === filters.gender;

        return (nameMatch || idMatch || emailMatch) && genderMatch && ageMatch;
    });

    if (sortConfig.key) {
        filtered.sort((a, b) => {
            let aValue = a[sortConfig.key] ?? "";
            let bValue = b[sortConfig.key] ?? "";

            if (sortConfig.key === 'registrationDate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }

    return filtered;
}, [patients, searchTerm, filters, sortConfig]);

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
                                <span className="text-xl font-semibold text-slate-800">List of Patients</span>
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
                        <select name="gender" value={filters.gender} onChange={handleFilterChange} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <select name="ageGroup" value={filters.ageGroup} onChange={handleFilterChange} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option value="">All Ages</option>
                            <option value="0-18">0-18</option>
                            <option value="19-40">19-40</option>
                            <option value="41-60">41-60</option>
                            <option value="61-">61+</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-slate-50">
                                    <th className="p-3 cursor-pointer" onClick={() => requestSort('patientId')}>Patient ID</th>
                                    <th className="p-3 cursor-pointer" onClick={() => requestSort('name')}>Name</th>
                                    <th className="p-3">Contact</th>
                                    <th className="p-3">Gender</th>
                                    <th className="p-3 cursor-pointer" onClick={() => requestSort('age')}>Age</th>
                                    <th className="p-3">Address</th>
                                    {/* <th className="p-3 text-center">Actions</th> */}
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
                                            <td className="p-3 font-semibold text-slate-800">{patient.name}</td>
                                            <td className="p-3 text-sm">
                                                <p>{patient.email}</p>
                                                <p className="text-slate-500">{patient.phone}</p>
                                            </td>
                                            <td className="p-3 text-sm">{patient.gender || 'N/A'} </td>
                                            <td className="p-3 text-sm">{calculateAge(patient.dob)}</td>
                                            <td className="p-3 text-sm">{patient.address || 'N/A'}</td>
                                            {/* <td className="p-3 text-center">
                                                <div className="relative">
                                                    <button onClick={() => setActiveActionMenu(activeActionMenu === patient._id ? null : patient._id)} className="p-2 rounded-full hover:bg-slate-200">
                                                        <MoreVertical className="w-5 h-5"/>
                                                    </button>
                                                    {activeActionMenu === patient._id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                                                            <Link to={`/admin/patient/${patient._id}`} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><Eye className="w-4 h-4 mr-2"/> View Profile</Link>
                                                            <Link to={`/admin/patient/edit/${patient._id}`} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><Edit className="w-4 h-4 mr-2"/> Edit Details</Link>
                                                            <button className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">{patient.status === 'blocked' ? <UserCheck className="w-4 h-4 mr-2"/> : <UserX className="w-4 h-4 mr-2"/>} {patient.status === 'blocked' ? 'Unblock' : 'Block'}</button>
                                                            <button className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4 mr-2"/> Delete</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td> */}
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

export default PatientManagementPage;

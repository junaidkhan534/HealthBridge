import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bed, Search, ArrowLeft, Activity, CheckCircle2, Users, Eye } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { message, Tag, Select } from 'antd';
import moment from 'moment';

const { Option } = Select;

const InPatientListPage = () => {
    const { token } = useSelector(state => state.user);
    const navigate = useNavigate();
    
    const [ipdRecords, setIpdRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All'); 
    const [sortConfig, setSortConfig] = useState({ key: 'admissionDate', direction: 'descending' });

    // Fetch all IPD records for this doctor
    const getAllIpdRecords = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const res = await axios.get(`${API_URL}/api/v1/doctor/get-all-ipd-records`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setIpdRecords(res.data.data);
            }
        } catch (error) {
            message.error('Failed to fetch In-Patient records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) getAllIpdRecords();
    }, [token]);

    const stats = useMemo(() => {
        const total = ipdRecords.length;
        const discharged = ipdRecords.filter(r => r.currentStage === 2).length;
        const admitted = total - discharged;
        return { total, admitted, discharged };
    }, [ipdRecords]);

    const sortedAndFilteredRecords = useMemo(() => {
        let filtered = ipdRecords.filter(record => {
            const searchLower = searchTerm.toLowerCase();
            const matchesName = record.patientObj?.name?.toLowerCase().includes(searchLower);
            const matchesId = record.patientId?.toLowerCase().includes(searchLower);
            const matchesWard = record.wardType?.toLowerCase().includes(searchLower);
            
            return matchesName || matchesId || matchesWard;
        });

        if (filterStatus === 'Admitted') {
            filtered = filtered.filter(record => record.currentStage !== 2);
        } else if (filterStatus === 'Discharged') {
            filtered = filtered.filter(record => record.currentStage === 2);
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                // Handle nested patient name sorting
                if (sortConfig.key === 'name') {
                    valA = a.patientObj?.name || '';
                    valB = b.patientObj?.name || '';
                }

                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [ipdRecords, searchTerm, filterStatus, sortConfig]);

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
                    <Link to="/doctor" className="text-teal-500 hover:text-teal-600 transition-colors">
                        <ArrowLeft className="h-7 w-7" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 m-0 tracking-tight">In-Patient Management</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Stats Row */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-blue-500">
                        <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500"><Users size={24}/></div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase m-0">Total Admissions</p>
                            <h2 className="text-2xl font-black text-slate-800 m-0">{stats.total}</h2>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-teal-500">
                        <div className="h-12 w-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600"><Activity size={24}/></div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase m-0">Currently Admitted</p>
                            <h2 className="text-2xl font-black text-slate-800 m-0">{stats.admitted}</h2>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-emerald-500">
                        <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500"><CheckCircle2 size={24}/></div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase m-0">Discharged</p>
                            <h2 className="text-2xl font-black text-slate-800 m-0">{stats.discharged}</h2>
                        </div>
                    </div>
                </div> */}

                {/* Main Table Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    
                    {/* Controls Row */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                            <input 
                                type="text"
                                placeholder="Search by patient name, ID, or ward..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select 
                                value={filterStatus} 
                                onChange={setFilterStatus} 
                                className="w-full h-[42px]"
                                size="large"
                            >
                                <Option value="All">All Patients</Option>
                                <Option value="Admitted">Currently Admitted</Option>
                                <Option value="Discharged">Discharged</Option>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider">Patient ID</th>
                                    <th className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer hover:text-teal-600" onClick={() => requestSort('name')}>Name</th>
                                    <th className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider">Ward / Bed</th>
                                    <th className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer hover:text-teal-600" onClick={() => requestSort('admissionDate')}>Admission Date</th>
                                    <th className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider">Discharge Date</th>
                                    <th className="p-4 px-12 text-xs font-bold text-slate-800 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider text-right">View IPD-Records</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-12"><div className="animate-pulse text-slate-400 font-semibold flex flex-col items-center gap-2"><Bed size={32}/><p>Loading Records...</p></div></td></tr>
                                ) : sortedAndFilteredRecords.length > 0 ? (
                                    sortedAndFilteredRecords.map(record => {
                                        const isAdmitted = record.currentStage !== 2;
                                        return (
                                            <tr key={record._id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="p-4">
                                                    <Link to={`/doctor/patient-history/${record.patientId}`} className="font-mono text-sm font-bold text-slate-600 hover:text-teal-800 hover:underline">
                                                        {record.patientId}
                                                    </Link>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-bold text-slate-800 m-0 capitalize">{record.patientObj?.name || 'Unknown'}</p>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-700">{record.wardType}</span>
                                                        <span className="text-xs text-slate-500 font-medium">Bed: {record.bedNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-medium text-slate-700">{moment(record.admissionDate).format('DD MMM YYYY')}</span>
                                                </td>
                                                <td className="p-4">
                                                    {record.dischargeDate && !isAdmitted && (
                                                        <p className="font-medium text-slate-700 m-0">{moment(record.dischargeDate).format('DD MMM YYYY')}</p>
                                                    )}
                                                </td>
                                                <td className="p-4 ">
                                                    {isAdmitted ? (
                                                        <Tag color="cyan" className="rounded-full ml-3 px-3 py-1 font-bold border-none bg-teal-50 text-teal-700 flex items-center gap-1.5 w-max">
                                                            <span className="h-1.5 w-1.5 bg-teal-500 rounded-full animate-pulse"></span> Admitted
                                                        </Tag>
                                                    ) : (
                                                        <Tag color="default" className="rounded-full ml-3 px-3 py-1 font-bold border-slate-200 text-slate-500 w-max">
                                                            Discharged
                                                        </Tag>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <Link to={`/doctor/patient-history/${record.patientId}/ipd-records`}>
                                                        <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all">
                                                            <Eye size={20} />
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <Bed size={48} className="mb-4 opacity-50" />
                                                <p className="text-lg font-semibold text-slate-600">No records found</p>
                                                <p className="text-sm">Try adjusting your search or filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InPatientListPage;
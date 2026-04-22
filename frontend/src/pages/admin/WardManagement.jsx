import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bed as BedIcon, Plus, Building2, Info, Activity, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { message, Modal, Input, InputNumber, Tag, Tooltip, Popconfirm, Popover, Dropdown, Menu } from 'antd';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const WardManagement = () => {
    const navigate = useNavigate();
    const { token } = useSelector(state => state.user);
    const [loading, setLoading] = useState(false);
    const [wards, setWards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newWardData, setNewWardData] = useState({
        name: '',
        totalBeds: 1
    });


    const getWards = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8080/api/v1/admin/get-all-wards', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setWards(res.data.data);
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to sync ward data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) getWards();
    }, [token]);

    // 2. Handle creating a new ward
    const handleAddWard = async () => {
        if (!newWardData.name) {
            return toast.error("Please enter a ward name");
        }
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8080/api/v1/admin/add-ward', newWardData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLoading(false);
            if (res.data.success) {
                toast.success("New Ward Unit Added");
                setIsModalOpen(false);
                setNewWardData({ name: '', totalBeds: 1 });
                getWards();
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            setLoading(false);
            toast.error("Internal Server Error");
        }
    };
    const handleUpdateBedStatus = async (wardId, bedId, newStatus) => {
        try {
            const res = await axios.post('http://localhost:8080/api/v1/admin/update-bed-status',
                { wardId, bedId, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success(`Bed updated to ${newStatus}`);
                getWards();
            }
        } catch (error) {
            message.error("Status update failed");
        }
    };

    // Stats Calculation
    const totalBedsCount = wards.reduce((sum, w) => sum + w.totalBeds, 0);
    const totalOccupied = wards.reduce((sum, w) => sum + w.beds.filter(b => b.status === 'occupied').length, 0);

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link to="/admin" className="text-teal-500 hover:text-teal-600">
                            <ArrowLeft className="h-7 w-7" />
                        </Link>
                        <span className="text-xl font-semibold text-slate-800">Ward & Bed Management</span>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-all font-medium"
                    >
                        <Plus size={18} /> Add New Ward
                    </button>
                </div>
            </header>

            <main className="container mx-auto p-6">
                {/* TOP STATS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Capacity</p>
                                <h3 className="text-2xl font-bold text-slate-800">{totalBedsCount} Beds</h3>
                            </div>
                            <Building2 className="text-blue-500 h-10 w-10 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Currently Occupied</p>
                                <h3 className="text-2xl font-bold text-red-600">{totalOccupied} Patients</h3>
                            </div>
                            <Activity className="text-red-500 h-10 w-10 opacity-20" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-teal-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Available Slots</p>
                                <h3 className="text-2xl font-bold text-teal-600">{totalBedsCount - totalOccupied} Beds</h3>
                            </div>
                            <ShieldCheck className="text-teal-500 h-10 w-10 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* WARDS LISTING SECTION */}
                <div className="space-y-6">
                    {wards.map((ward) => (
                        <div key={ward._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Ward Header */}
                            <div className="px-6 py-3 border-b bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">{ward.name}</h2>
                                    {/* <p className="text-xs text-slate-500 font-medium">UNIT IDENTIFIER: {ward._id.slice(-6).toUpperCase()}</p> */}
                                </div>
                                <Tag color={ward.beds.some(b => b.status === 'available') ? 'green' : 'red'} className="rounded-full px-4 font-bold">
                                    {ward.beds.filter(b => b.status === 'available').length} AVAILABLE
                                </Tag>
                            </div>

                            {/* Bed  Visual Grid */}
                            <div className="p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
                                    {ward.beds.map((bed) => {
                                        const menu = (
                                            <Menu onClick={({ key }) => handleUpdateBedStatus(ward._id, bed._id, key)}>
                                                <Menu.Item key="available" disabled={bed.status === 'available'}>
                                                    <span className="text-teal-600 font-medium">Mark as Available</span>
                                                </Menu.Item>
                                                <Menu.Item key="maintenance" disabled={bed.status === 'maintenance'}>
                                                    <span className="text-amber-600 font-medium">Mark for Maintenance</span>
                                                </Menu.Item>
                                                <Menu.Item key="occupied" disabled={bed.status === 'occupied'}>
                                                    <span className="text-red-600 font-medium">Force Occupied</span>
                                                </Menu.Item>
                                            </Menu>
                                        );

                                        return (
                                            <Tooltip key={bed._id} title={`Status: ${bed.status.toUpperCase()} (Click to manage)`}>
                                                <Dropdown overlay={menu} trigger={['click']}>
                                                    <div className={`p-4 rounded-md border-2 flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow-md ${bed.status === 'occupied'
                                                            ? 'bg-red-50 border-red-200 text-red-600'
                                                            : bed.status === 'maintenance'
                                                                ? 'bg-amber-50 border-amber-200 text-amber-600'
                                                                : 'bg-white border-slate-100 text-slate-400 hover:border-teal-500 hover:text-teal-600'
                                                        }`}>
                                                        <BedIcon size={24} className={bed.status === 'available' ? 'opacity-30' : 'opacity-100'} />
                                                        <span className="text-[10px] font-black mt-2 uppercase tracking-tighter">{bed.bedNumber}</span>

                                                        <div className={`h-1.5 w-1.5 rounded-full mt-1 ${bed.status === 'occupied' ? 'bg-red-500' :
                                                                bed.status === 'maintenance' ? 'bg-amber-500' : 'bg-teal-400'
                                                            }`}></div>
                                                    </div>
                                                </Dropdown>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {wards.length === 0 && !loading && (
                        <div className="bg-white p-20 rounded-lg shadow-md text-center">
                            <h3 className="text-xl font-bold text-slate-400">No Wards Available</h3>
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL for new ward */}
            <Modal
                title={<span className="text-xl font-bold text-slate-800">Add New Hospital Ward</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleAddWard}
                okText="Initialize Ward"
                okButtonProps={{ className: 'bg-teal-600 hover:!bg-teal-700 active:!bg-teal-800 border-teal-600 hover:!border-teal-700' }}
                centered
            >
                <div className="space-y-4 py-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Ward Name / Designation</label>
                        <input
                            type="text"
                            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="e.g. General Ward, Private...."
                            value={newWardData.name}
                            onChange={(e) => setNewWardData({ ...newWardData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">No. of Bed</label>
                        <InputNumber
                            min={1}
                            max={50}
                            className="mt-1 w-full rounded-md"
                            value={newWardData.totalBeds}
                            onChange={(val) => setNewWardData({ ...newWardData, totalBeds: val })}
                        />
                    </div>
                    <div className="bg-slate-50 p-3 rounded-md flex items-start space-x-2 border">
                        <Info className="text-teal-600 h-4 w-4 mt-0.5" />
                        <p className="text-[11px] text-slate-500 italic">
                            It automatically generate unique bed like GEN-1, GEN-2 based on the ward name.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WardManagement;
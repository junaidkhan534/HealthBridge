import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { Card, Button, message, Spin, Empty, Badge, Tag, Divider } from "antd";
import { 
  ArrowLeft, HeartPulse, Activity, Pill, 
  Stethoscope, Bed, CalendarClock, User, Clock, AlertCircle, History 
} from "lucide-react";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";

const PatientHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.user);
  
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [patientProfile, setPatientProfile] = useState({
    name: "Unknown Patient",
    age: null,
    gender: null
  });

    const calculateAge = (dob) => {
      if (!dob) return "--";
      return moment().diff(moment(dob), 'years');
    };

  const fetchPatientHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/doctor/patient-history/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setHistoryData(res.data.data);
        
        if (res.data.patientProfile) {
          setPatientProfile(res.data.patientProfile);
        }
      }
    } catch (error) {
      message.error("Failed to fetch case history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientHistory();
  }, [patientId]);

  
  const opdRecords = historyData.filter(record => record.recordType === 'OPD');
  const ipdRecords = historyData.filter(record => record.recordType === 'IPD');

  const totalOpd = opdRecords.length;
  const totalIpd = ipdRecords.length;

  const lastOpdDate = totalOpd > 0 ? moment(opdRecords[0].sortDate).format("DD MMM YYYY") : "No previous visits";
  const activeAdmission = ipdRecords.find(record => record.currentStage !== 2 && record.isFinalized !== true);
  const isCurrentlyAdmitted = !!activeAdmission;

  return (
    <div className="bg-[#f1f5f9] min-h-screen p-4 md:p-8">
      
      <div className="flex items-center gap-4 mb-6">
        <Button shape="circle" icon={<ArrowLeft size={20} />} onClick={() => navigate(-1)} />
        <h2 className="text-2xl font-black text-slate-800 m-0 tracking-tight">Patient History</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* HEADER  */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-teal-800 px-6 py-2 text-white text-[10px] font-bold uppercase tracking-widest flex justify-between">
              <span>Patient History Overview</span>
              {/* <span>Patient ID: {patientId}</span> */}
            </div>
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="h-20 w-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center border-4 border-teal-100 flex-shrink-0">
                  <User size={40} />
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-800 m-0 tracking-tight capitalize">
                      {patientProfile.name || "Unknown Patient"}
                    </h1>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500 font-medium">
                      <span className="font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Patient ID: {patientId}</span>
                      <span className="text-slate-300">|</span>
                      <span className="capitalize">{patientProfile.gender || "Gender N/A"}</span>
                      <span className="text-slate-300">|</span>
                      <span className="flex items-center gap-1">{calculateAge(patientProfile.dob) || "Age N/A"} Yrs</span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="text-right">
                    {isCurrentlyAdmitted ? (
                      <Badge status="processing" text={<span className="text-blue-600 font-bold uppercase tracking-wide text-xs">Currently Admitted</span>} className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100" />
                    ) : (
                      <Badge status="success" text={<span className="text-emerald-600 font-bold uppercase tracking-wide text-xs">Not Admitted</span>} className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card 
              hoverable 
              className="rounded-xl border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              onClick={() => navigate(`/doctor/patient-history/${patientId}/opd-records`, { state: { patientName: patientProfile.name } })}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Stethoscope size={24} />
                </div>
                <Tag color="green" className="m-0 font-bold">OPD Records</Tag>
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 mb-1">Out-Patient (OPD)</h3>
              <p className="text-slate-500 text-sm mb-6">Prescriptions & Consultations</p>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><Pill size={16}/> Total Visits</span>
                  <span className="text-xl font-black text-slate-800">{totalOpd}</span>
                </div>
                <Divider className="my-0 border-slate-200" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><CalendarClock size={16}/> Last Consult</span>
                  <span className="font-semibold text-slate-700">{lastOpdDate}</span>
                </div>
              </div>

              <div className="mt-6 text-emerald-600 font-bold text-sm flex justify-end items-center gap-1 group-hover:text-emerald-700">
                View All Prescriptions <ArrowLeft className="rotate-180" size={16} />
              </div>
            </Card>

            <Card 
              hoverable 
              className={`rounded-xl border-t-4 shadow-sm hover:shadow-md transition-all group cursor-pointer ${isCurrentlyAdmitted ? 'border-t-blue-500 bg-blue-50/10' : 'border-t-slate-400'}`}
              onClick={() => navigate(`/doctor/patient-history/${patientId}/ipd-records`, { state: { patientName: patientProfile.name } })}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${isCurrentlyAdmitted ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                  <Bed size={24} />
                </div>
                {isCurrentlyAdmitted ? (
                  <span className="flex h-3 w-3 relative mt-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                ) : (
                  <Tag color="default" className="m-0 font-bold">IPD Records</Tag>
                )}
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 mb-1">In-Patient (IPD)</h3>
              <p className="text-slate-500 text-sm mb-6">Admissions & Discharge Summaries</p>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><History size={16}/> Total Admissions</span>
                  <span className="text-xl font-black text-slate-800">{totalIpd}</span>
                </div>
                <Divider className="my-0 border-slate-200" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm flex items-center gap-2"><AlertCircle size={16}/> Current Status</span>
                  {isCurrentlyAdmitted ? (
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Admitted ({activeAdmission.wardType})</span>
                  ) : (
                    <span className="font-semibold text-slate-600">Discharged</span>
                  )}
                </div>
              </div>

              <div className="mt-6 text-blue-600 font-bold text-sm flex justify-end items-center gap-1 group-hover:text-blue-700">
                View Admission History <ArrowLeft className="rotate-180" size={16} />
              </div>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
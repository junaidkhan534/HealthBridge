import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, message, Spin, Empty } from "antd";
import { ArrowLeft, Printer } from "lucide-react";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";

const PatientOpdRecords = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.user);
  
  const [opdRecords, setOpdRecords] = useState([]);
  const [patientProfile, setPatientProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const calculateAge = (dob) => {
    if (!dob) return "--";
    return moment().diff(moment(dob), 'years');
  };
  const fetchRecords = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/doctor/patient-history/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        const filtered = res.data.data.filter(record => record.recordType === 'OPD');
        setOpdRecords(filtered);
        if (res.data.patientProfile) setPatientProfile(res.data.patientProfile);
      }
    } catch (error) {
      message.error("Failed to fetch OPD records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  return (
    <div className="bg-[#f1f5f9] min-h-screen p-4 md:p-8 print:bg-white print:p-0">
      
      {/* Header - Hidden */}
      <div className="flex items-center justify-between mb-8 mx-auto print:hidden">
        <div className="flex items-center gap-4">
          <Button shape="circle" icon={<ArrowLeft size={20} />} onClick={() => navigate(-1)} />
          <div>
            <h2 className="text-2xl font-black text-slate-800 m-0">Prescription History</h2>
            <p className="text-slate-500 text-sm font-medium m-0 capitalize">
              {patientProfile.name || patientId} • Total Visits: {opdRecords.length}
            </p>
          </div>
        </div>
        <Button 
          type="success" 
          icon={<Printer size={16} />} 
          className="bg-teal-600" 
          onClick={() => window.print()}
        >
          Print Records
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
      ) : opdRecords.length === 0 ? (
        <Empty description="No prescriptions found for this patient" className="mt-20" />
      ) : (
        <div className="space-y-12 print:space-y-0">
          {opdRecords.map((record, index) => (
            
            /* PAPER CONTAINER */
            <div key={record._id} className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm] print:h-[80vh] print:shadow-none print:w-full flex flex-col print:break-after-page">

              {/* HEADER */}
              <div className="bg-teal-800 p-4 print:p-3" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                <div className="flex justify-start items-center text-white">
                  <div className="text-left">
                    <h1 className="text-2xl font-bold tracking-tight uppercase m-0">HealthBridge Hospital</h1>
                    <p className="text-[15px] font-bold text-teal-100 tracking-[0.1em] uppercase mt-0 mb-0">Multi-Specialty Care Center</p>
                  </div>
                </div>
              </div>

              {/* PATIENT INFO */}
              <div className="px-6 py-3 border-b border-slate-200 print:px-4 print:py-2">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="flex flex-col gap-1 text-left">
                    <div><span className="font-bold text-slate-500 uppercase">Patient Name:</span> <span className="font-bold text-slate-900 text-sm capitalize">{patientProfile.name || ""}</span></div>
                    <div><span className="font-bold text-slate-500 uppercase">Patient ID:</span> <span className="font-semibold text-slate-700">{patientId}</span></div>
                  </div>
                  <div className="flex flex-col gap-1 text-center border-l border-r border-slate-100">
                    <div><span className="font-bold text-slate-500 uppercase">Age/Sex:</span> <span className="font-bold text-slate-900 capitalize">{calculateAge(patientProfile.dob)} Yrs / {patientProfile.gender || "--"}</span></div>
                    <div><span className="font-bold text-slate-500 uppercase">Date:</span> <span className="font-semibold text-slate-700">{moment(record.sortDate).format("DD/MM/YYYY")}</span></div>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <div><span className="font-bold text-slate-500 uppercase">Dr:</span> <span className="font-bold text-slate-900 text-sm">{user?.nam || "Doctor"}</span></div>
                    <div><span className="font-semibold text-slate-500 uppercase">{user?.specialty }</span></div>
                  </div>
                </div>
              </div>

              {/* MAIN BODY */}
              <div className="flex flex-col flex-grow">
                <div className="p-6 flex-grow print:p-4">

                  {/* DIAGNOSIS / COMPLAINTS */}
                  <div className="mb-6 print:mb-4">
                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wide border-b border-teal-500 inline-block pb-0.5 mb-2">Diagnosis / Complaints</h3>
                    <p className="text-sm font-medium text-slate-900 m-0 whitespace-pre-wrap">
                      {record.diagnosis || record.symptoms || "No diagnosis documented."}
                    </p>
                  </div>

                  {/* MEDICINES */}
                  <div className="mb-6 print:mb-4">
                    <h3 className="text-2xl font-serif italic text-slate-800 font-bold print:text-lg mb-4">Rx</h3>

                    {record.medicines && record.medicines.length > 0 ? (
                      <div className="w-full">
                        <div className="flex border-b border-slate-400 pb-1 mb-3 text-[10px] font-bold uppercase text-slate-600">
                          <div className="flex-[4]">Medicine Name</div>
                          <div className="flex-[4] text-right">Instructions</div>
                        </div>

                        {record.medicines.map((med, medIndex) => (
                          <div key={medIndex} className="flex gap-2 mb-3 items-start border-b border-slate-100 pb-2 last:border-0 print:mb-2 print:pb-1">
                            {typeof med === 'object' ? (
                              <>
                                <div className="flex-[4] font-bold text-sm text-slate-900">
                                  {med.name} 
                                  {/* <span className="text-slate-500 font-normal ml-1">{med.dosage}</span> */}
                                </div>
                                <div className="flex-[4] italic text-slate-600 text-sm text-right">
                                  {/* {med.duration && <span className="mr-2">x {med.duration}</span>} */}
                                  {med.instructions && <span>({med.instructions})</span>}
                                </div>
                              </>
                            ) : (
                              // if medicine was saved as a simple string
                              <div className="flex-[8] font-bold text-sm text-slate-900">{med}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm italic text-slate-500">No medications prescribed during this visit.</p>
                    )}
                  </div>

                  {/* ADVICE */}
                  {record.advice && (
                    <div className="mb-4">
                      <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wide border-b border-teal-500 inline-block pb-0.5 mb-2">Advice</h3>
                      <p className="text-sm text-slate-800 italic m-0 whitespace-pre-wrap">
                        {record.advice}
                      </p>
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="mt-auto">
                  <div className="px-6 pb-2 print:px-4">
                    <div className="flex justify-between items-end">
                      <div className="w-1/3">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0">Follow Up</span>
                        <div className="font-bold text-sm text-slate-900 mt-1">
                          {record.followUpDate ? record.followUpDate : "As required"}
                        </div>
                      </div>

                      <div className="text-center w-1/3">
                        <div className="h-12 mb-1"></div> {/* Space for signature */}
                        <div className="border-t border-slate-800 pt-1">
                          <p className="font-bold text-xs text-slate-900 m-0">Dr. {user?.nam || "Doctor"}</p>
                          <p className="text-[9px] text-slate-500 uppercase m-0">Signature</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Footer */}
                  <div className="bg-teal-800 text-white text-center p-2 print:mt-2" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                    <div className="text-[10px] print:text-[9px] flex justify-between px-4 opacity-90">
                      <span>HealthBridge Hospital, Bareilly, UP</span>
                      <span>Emergency: +91-9876543210</span>
                      <span>www.healthbridge.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientOpdRecords;
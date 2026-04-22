import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, message, Spin, Empty, Tag, Steps, Divider, Form, Input, DatePicker, Select } from "antd";
import { ArrowLeft, HeartPulse, Bed, Activity, Stethoscope, Pill, FileText, Edit, Printer, Save, X, Mic, MicOff, AlertCircle } from "lucide-react";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const { TextArea } = Input;
const { Option } = Select;

const calculateAge = (dob) => {
  if (!dob) return "--";
  return moment().diff(moment(dob), 'years');
};

const IpdRecordCard = ({ record, patientProfile, patientId, user, token, fetchRecords, isolatedPrintId, setIsolatedPrintId }) => {
  const isCurrentlyAdmitted = record.currentStage !== 2 && record.isFinalized !== true;
  
  const [activeTab, setActiveTab] = useState(isCurrentlyAdmitted ? (record.currentStage || 0) : 0);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const [activeVoiceField, setActiveVoiceField] = useState(null);
  const recognitionRef = useRef(null);
  const activeFieldRef = useRef(null);


  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const field = activeFieldRef.current;
        if (field) {
          const currentValue = form.getFieldValue(field) || "";
          form.setFieldsValue({ [field]: currentValue + (currentValue ? " " : "") + transcript });
        }
      };
      recognition.onerror = () => { setActiveVoiceField(null); activeFieldRef.current = null; };
      recognition.onend = () => { setActiveVoiceField(null); activeFieldRef.current = null; };
      recognitionRef.current = recognition;
    }
  }, [form]);

  useEffect(() => {
    if (isEditing && activeTab === 2) {
      if (!form.getFieldValue('dischargeDate')) {
         form.setFieldsValue({ dischargeDate: moment() });
      }
    }
  }, [activeTab, isEditing, form]);

  const toggleVoice = (fieldName) => {
    if (!recognitionRef.current) {
      message.warning("Voice recognition is not supported in this browser.");
      return;
    }
    if (activeVoiceField === fieldName) {
      recognitionRef.current.stop();
      setActiveVoiceField(null);
      activeFieldRef.current = null;
    } else {
      if (activeVoiceField) recognitionRef.current.stop();
      setActiveVoiceField(fieldName);
      activeFieldRef.current = fieldName;
      recognitionRef.current.start();
    }
  };

  const startEditing = () => {
    form.setFieldsValue({
      ...record,
      dischargeDate: record.dischargeDate ? moment(record.dischargeDate, "YYYY-MM-DD") : null, 
      followUpDate: record.followUpDate ? moment(record.followUpDate, "YYYY-MM-DD") : null,
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (recognitionRef.current && activeVoiceField) recognitionRef.current.stop();
    setIsEditing(false);
    form.resetFields();
  };

  const handleSaveRecord = async (values) => {
    setSaving(true);
    if (recognitionRef.current && activeVoiceField) recognitionRef.current.stop();

    try {
      let finalStage = record.currentStage;
      let isFinalized = record.isFinalized;

      if (values.dischargeDate) {
        const hasSummaryPrepared = values.diagnosis && values.summary;
        
        if (!hasSummaryPrepared) {
           message.error("Cannot discharge: Please fill in the Final Diagnosis and Clinical Summary first.");
           setSaving(false);
           return; 
        }

        finalStage = 2; 
        isFinalized = true; 
      }

      const formattedData = {
        ...values,
        appointmentId: record.appointmentId,
        patientId: patientId,
        dischargeDate: values.dischargeDate ? values.dischargeDate.format("YYYY-MM-DD") : null,
        followUpDate: values.followUpDate ? values.followUpDate.format("YYYY-MM-DD") : null,
        currentStage: finalStage,
        isFinalized: isFinalized
      };

      const res = await axios.post(`http://localhost:8080/api/v1/doctor/save-inpatient-data`, formattedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        if (isFinalized) {
          message.success("Discharge Summary Prepared & Patient Discharged!");
          toast.success("Patient Discharged Successfully!");
        } else {
          message.success("Clinical progress saved successfully.");
          toast.success("Progress updated.");
        }
        setIsEditing(false);
        fetchRecords(); 
      } else {
        message.error(res.data.message || "Failed to update record");
      }
    } catch (error) {
      console.error("Update Error:", error);
      message.error("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Function for Discharge Summary
  const handlePrintDischarge = () => {
    setIsolatedPrintId(record._id); 
    setTimeout(() => {
      window.print();
      setIsolatedPrintId(null); 
    }, 150);
  };

  if (isolatedPrintId && isolatedPrintId !== record._id) {
    return <div className="hidden print:hidden"></div>;
  }

  const isPrintingThisCard = isolatedPrintId === record._id;

  return (
    <div className="print:break-after-page relative">
      
      {isPrintingThisCard && (
        <div className="bg-white text-black min-h-[297mm] max-w-[210mm] mx-auto hidden print:flex print:flex-col print:w-full print:absolute print:left-0 print:top-0 print:z-50 print:p-5">
          
          {/* Hospital Header */}
          <div className="border-b-[3px] border-teal-800 pb-4 flex justify-between items-end" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
            <div>
              <h1 className="text-3xl font-black text-teal-900 uppercase tracking-tight m-0">HealthBridge Hospital</h1>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-[0.15em] mt-1 mb-0">Multi-Specialty Care Center</p>
            </div>
            <div className="text-right text-[10px] text-slate-600 font-medium">
              <p className="m-0">HealthBridge Campus, Medical District</p>
              <p className="m-0">24/7 Emergency: +91-9876543210</p>
              <p className="m-0">www.healthbridge.com</p>
            </div>
          </div>

          <div className="text-center mb-6 bg-slate-100 py-2 border-y border-slate-300" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest m-0">Discharge Summary</h2>
          </div>

          {/* Patient info */}
          <div className="border border-slate-300 rounded-lg p-4 mb-8 grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
            <div className="border- border-slate-100 pb-1"><span className="font-bold text-slate-500 mr-2 uppercase">Patient Name:</span> <span className="font-bold text-slate-900 capitalize text-sm">{patientProfile.name || patientId}</span></div>
            <div className="border- border-slate-100 pb-1"><span className="font-bold text-slate-500 mr-2 uppercase">Patient ID:</span> <span className="font-bold text-slate-900">{patientId}</span></div>
            <div className="border- border-slate-100 pb-1"><span className="font-bold text-slate-500 mr-2 uppercase">Age/Sex:</span> <span className="font-bold text-slate-900 capitalize">{calculateAge(patientProfile.dob)} Yrs / {patientProfile.gender || "--"}</span></div>
            <div className="border- border-slate-100 pb-1"><span className="font-bold text-slate-500 mr-2 uppercase">Ward & Bed:</span> <span className="font-bold text-slate-900">{record.wardType || "--"} Ward / Bed {record.bedNumber || "--"}</span></div>
            <div className="border- border-slate-100 pb-1"><span className="font-bold text-slate-500 mr-2 uppercase">Date of Admission:</span> <span className="font-bold text-slate-900">{record.admissionDate || moment(record.sortDate).format("YYYY-MM-DD")}</span></div>
            <div className="border- border-slate-100 pb-1"><span className="font-bold text-slate-500 mr-2 uppercase">Date of Discharge:</span> <span className="font-bold text-slate-900">{record.dischargeDate || "Pending"}</span></div>
            <div className="col-span-2 pt-1"><span className="font-bold text-slate-500 mr-2 uppercase">Consulting Doctor:</span> <span className="font-bold text-slate-900">Dr. {user?.name || "Attending Physician"}</span></div>
          </div>

          {/* Clinical Information */}
          <div className="space-y-6 flex-grow">
            <div>
              <h3 className="text-[11px] font-black text-teal-800 uppercase border-b border-slate-200 pb-1 mb-2 tracking-wider">Final Diagnosis</h3>
              <p className="text-sm font-bold text-slate-900 m-0">{record.diagnosis || "No diagnosis documented."}</p>
            </div>

            <div>
              <h3 className="text-[11px] font-black text-teal-800 uppercase border-b border-slate-200 pb-1 mb-2 tracking-wider">Course in Hospital & Treatment Given</h3>
              <p className="text-xs text-slate-800 whitespace-pre-wrap m-0 leading-relaxed">{record.summary || record.treatmentGiven || "No course summary documented."}</p>
            </div>

            <div>
              <h3 className="text-[11px] font-black text-teal-800 uppercase border-b border-slate-200 pb-1 mb-2 tracking-wider">Advice on Discharge / Medications</h3>
              <p className="text-xs font-semibold text-slate-800 whitespace-pre-wrap m-0">{record.instructions || "No discharge instructions documented."}</p>
            </div>

            <div>
              <h3 className="text-[11px] font-black text-teal-800 uppercase border-b border-slate-200 pb-1 mb-2 tracking-wider">Follow-Up Date:</h3>
              <p className="text-sm font-bold text-slate-900 m-0">{record.followUpDate ? `Please visit OPD on: ${record.followUpDate}` : "As advised by doctor."}</p>
            </div>
          </div>

          <div className="mt-12 pt-10 flex justify-end">
             <div className="text-center border-t border-slate-800 w-56 pt-2">
                <p className="font-bold text-slate-900 text-sm m-0">Dr. {user?.name || "Doctor"}</p>
                <p className="text-[10px] text-slate-500 uppercase m-0">Authorized Signature & Seal</p>
             </div>
          </div>
          <div className="bg-slate-100 text-white text-center p-2 print:mt-2" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
            <div className="text-[10px] font-bold print:text-[9px] flex justify-between px-4 opacity-90">
              <span>HealthBridge Hospital, Bareilly, UP</span>
              <span>Emergency: +91-9876543210</span>
              <span>www.healthbridge.com</span>
            </div>
          </div>
        </div>
      )}

      <div className={isPrintingThisCard ? "hidden print:hidden" : "block"}>
        <Form form={form} layout="vertical" onFinish={handleSaveRecord}>
          
          {/* 1. PATIENT IDENTITY STRIP */}
          <div className={`bg-white shadow-sm border rounded-xl mb-6 overflow-hidden print:border-b-2 print:border-slate-800 print:shadow-none print:rounded-none ${isCurrentlyAdmitted ? 'border-teal-500 ring-2 ring-teal-100' : 'border-slate-200'}`}>
            
            <div className={`px-6 py-2 text-white text-[10px] font-bold uppercase tracking-widest flex justify-between ${isCurrentlyAdmitted ? 'bg-teal-600' : 'bg-teal-800'}`} style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
              <span className="flex items-center gap-2">
                {isCurrentlyAdmitted && <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>}
                {isCurrentlyAdmitted ? "Live Clinical Session (Currently Admitted)" : "Archived Admission Record"}
              </span>
              <span>Admitted: {moment(record.admissionDate || record.sortDate).format('DD MMM YYYY')}</span>
            </div>

            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-5">
                <div className={`h-14 w-14 rounded-xl flex items-center justify-center border ${isCurrentlyAdmitted ? 'bg-teal-50 border-teal-100' : 'bg-slate-50 border-slate-200'}`}>
                    <HeartPulse className={isCurrentlyAdmitted ? 'text-teal-600' : 'text-slate-500'} size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 m-0 tracking-tight capitalize">{patientProfile.name || patientId}</h1>
                  <p className="text-xs text-slate-500 font-medium uppercase mt-1">
                    Patient ID: {patientId} | Consultant: Dr. {user?.name || "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex gap-8 border-l pl-8 border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Ward</p>
                    <Tag color={isCurrentlyAdmitted ? "cyan" : "default"} className="m-0 font-bold">{record.wardType || 'N/A'}</Tag>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Bed No.</p>
                    <p className="font-bold text-slate-800 m-0">{record.bedNumber || '--'}</p>
                  </div>
                </div>

                {isCurrentlyAdmitted && (
                  <div className="border-l pl-6 border-slate-100 flex gap-2 print:hidden">
                    {isEditing ? (
                      <>
                        <Button onClick={cancelEditing} icon={<X size={16}/>} disabled={saving}>Cancel</Button>
                        <Button type="success" htmlType="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2" loading={saving}>
                          <Save size={16} /> Save
                        </Button>
                      </>
                    ) : (
                      <Button type="success" onClick={startEditing} className="bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-2">
                        <Edit size={16} /> Edit Record
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. MAIN CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            <div className="lg:col-span-3 print:hidden">
              <Card className="shadow-sm rounded-xl sticky top-8">
                <Steps 
                  direction="vertical" 
                  current={activeTab} 
                  onChange={(current) => setActiveTab(current)}
                  className="cursor-pointer"
                  size="small" 
                  items={[
                    { title: 'Admission', description: 'Triage & Assessment' }, 
                    { title: 'Care Plan', description: 'Treatment & Progress' }, 
                    { title: 'Discharge', description: 'Summary & Checkout' }
                  ]} 
                />
              </Card>
            </div>

            <div className="lg:col-span-9 print:col-span-12 space-y-6">
              
              {/* STEP 0: ADMISSION PROTOCOL */}
              <div className={activeTab === 0 ? "block animate-in fade-in" : "hidden print:block print:mb-8"}>
                <Card className={`shadow-sm border-t-4 rounded-xl print:shadow-none print:border-t-2 ${isEditing && activeTab === 0 ? 'border-t-emerald-500 ring-2 ring-emerald-100' : 'border-t-teal-600'}`}>
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Bed size={22} className="text-teal-600"/> Admission & Triage</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-5 border rounded-xl bg-white">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Activity size={18} className="text-red-500"/> Admission Vitals</h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">B.P.</p>
                          {isEditing ? <Form.Item name="bp" className="m-0"><Input size="small" placeholder="120/80"/></Form.Item> : <p className="font-mono font-bold text-slate-800 m-0">{record.bp || "--"}</p>}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Pulse</p>
                          {isEditing ? <Form.Item name="pulse" className="m-0"><Input size="small" placeholder="bpm"/></Form.Item> : <p className="font-mono font-bold text-slate-800 m-0">{record.pulse || "--"}</p>}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">SpO2</p>
                          {isEditing ? <Form.Item name="spo2" className="m-0"><Input size="small" placeholder="%"/></Form.Item> : <p className="font-mono font-bold text-slate-800 m-0">{record.spo2 || "--"}%</p>}
                        </div>
                      </div>
                    </div>
                    <div className="p-5 border rounded-xl bg-white">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Stethoscope size={18} className="text-teal-600"/> Triage Status</h4>
                      {isEditing ? (
                        <Form.Item name="triage" className="m-0">
                          <Select className="w-full">
                            <Option value="Emergency">Emergency</Option>
                            <Option value="Urgent">Urgent</Option>
                            <Option value="Routine">Routine</Option>
                          </Select>
                        </Form.Item>
                      ) : (
                        <div className="font-semibold">{record.triage || <span className="text-slate-400 italic">Not set</span>}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-bold text-slate-700 border-b">Initial Assessment & Chief Complaint</label>
                      {isEditing && (
                        <Button type="text" size="small" className="text-teal-600 font-semibold print:hidden" icon={activeVoiceField === "chiefComplaint" ? <MicOff size={16} className="text-red-500 animate-pulse"/> : <Mic size={16}/>} onClick={() => toggleVoice("chiefComplaint")}>
                          {activeVoiceField === "chiefComplaint" ? "Stop" : "Dictate"}
                        </Button>
                      )}
                    </div>
                    {isEditing ? (
                      <Form.Item name="chiefComplaint" className="m-0"><TextArea rows={4} /></Form.Item>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap min-h-[60px]">{record.chiefComplaint || "--"}</div>
                    )}
                  </div>
                </Card>
              </div>

              {/* STEP 1: CARE PLAN */}
              <div className={activeTab === 1 ? "block animate-in fade-in" : "hidden print:block print:mb-8"}>
                <Card className={`shadow-sm border-t-4 rounded-xl print:shadow-none print:border-t-2 ${isEditing && activeTab === 1 ? 'border-t-emerald-500 ring-2 ring-emerald-100' : 'border-t-teal-600'}`}>
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Pill size={22} className="text-teal-600"/> Clinical Care Plan</h3>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest border-b">I. Diagnosis & Investigations</label>
                        {isEditing && (
                          <Button type="text" size="small" className="text-teal-600 font-semibold print:hidden" icon={activeVoiceField === "investigations" ? <MicOff size={14} className="text-red-500 animate-pulse"/> : <Mic size={14}/>} onClick={() => toggleVoice("investigations")}>Dictate</Button>
                        )}
                      </div>
                      {isEditing ? (
                        <Form.Item name="investigations" className="m-0"><TextArea rows={3} /></Form.Item>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap min-h-[60px]">{record.investigations || "--"}</div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest border-b">II. Treatment & Care Delivery</label>
                        {isEditing && (
                          <Button type="text" size="small" className="text-teal-600 font-semibold print:hidden" icon={activeVoiceField === "treatmentGiven" ? <MicOff size={14} className="text-red-500 animate-pulse"/> : <Mic size={14}/>} onClick={() => toggleVoice("treatmentGiven")}>Dictate</Button>
                        )}
                      </div>
                      {isEditing ? (
                        <Form.Item name="treatmentGiven" className="m-0"><TextArea rows={3} /></Form.Item>
                      ) : (
                        <div className="bg-white p-4 rounded-lg border border-teal-100 text-slate-700 whitespace-pre-wrap min-h-[60px]">{record.treatmentGiven || "--"}</div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest border-b">III. Daily Progress</label>
                        {isEditing && (
                          <Button type="text" size="small" className="text-teal-600 font-semibold print:hidden" icon={activeVoiceField === "dailyProgress" ? <MicOff size={14} className="text-red-500 animate-pulse"/> : <Mic size={14}/>} onClick={() => toggleVoice("dailyProgress")}>Dictate</Button>
                        )}
                      </div>
                      {isEditing ? (
                        <Form.Item name="dailyProgress" className="m-0"><TextArea rows={4} /></Form.Item>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap min-h-[60px]">{record.dailyProgress || "--"}</div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* STEP 2: DISCHARGE SUMMARY */}
              <div className={activeTab === 2 ? "block animate-in fade-in" : "hidden print:block"}>
                <Card className={`shadow-sm border-t-4 rounded-xl print:shadow-none print:border-t-2 ${isEditing && activeTab === 2 ? 'border-t-emerald-500 ring-2 ring-emerald-100' : 'border-t-teal-600'}`}>
                  
                  {isEditing && (
                     <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-6 flex items-start gap-3">
                       <AlertCircle className="text-orange-500 mt-0.5" size={20}/>
                       <div>
                         <h4 className="font-bold text-orange-800 m-0">Finalize Discharge Summary</h4>
                         <p className="text-sm text-orange-700 m-0">Once the summary is prepared and saved can not be edited!</p>
                       </div>
                     </div>
                  )}

                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 m-0 flex items-center gap-2"><FileText size={22} className="text-teal-600"/> Final Discharge Summary</h3>
                    
                    {!isEditing && (
                      <Button 
                        type="dashed" 
                        icon={<Printer size={16} />} 
                        className="border-teal-600 text-teal-700 hover:bg-teal-50 hover:border-teal-700 font-semibold print:hidden"
                        onClick={handlePrintDischarge}
                      >
                        Print Discharge Summary
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="font-bold text-slate-700 block mb-2">Date of Admission</label>
                        <div className="p-1 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-bold">{record.admissionDate || moment(record.sortDate).format("YYYY-MM-DD")}</div>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-2">Date of Discharge</label>
                        {isEditing ? (
                          <Form.Item name="dischargeDate" className="m-0">
                            <DatePicker className="w-full" format="YYYY-MM-DD" placeholder="Select to Discharge Patient" />
                          </Form.Item>
                        ) : (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-bold">{record.dischargeDate || "Pending"}</div>
                        )}
                      </div>
                    </div>

                    <Divider className="print:my-4" />

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-slate-700">Final Diagnosis</label>
                        {isEditing && <Button type="text" size="small" className="text-teal-600 font-semibold print:hidden" icon={activeVoiceField === "diagnosis" ? <MicOff size={14} className="text-red-500 animate-pulse"/> : <Mic size={14}/>} onClick={() => toggleVoice("diagnosis")}>Dictate</Button>}
                      </div>
                      {isEditing ? (
                        <Form.Item name="diagnosis" className="m-0"><TextArea rows={2} /></Form.Item>
                      ) : (
                        <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800 font-bold">{record.diagnosis || "Pending"}</div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-slate-700">Clinical Summary & Course in Hospital</label>
                        {isEditing && <Button type="text" size="small" className="text-teal-600 font-semibold print:hidden" icon={activeVoiceField === "summary" ? <MicOff size={14} className="text-red-500 animate-pulse"/> : <Mic size={14}/>} onClick={() => toggleVoice("summary")}>Dictate</Button>}
                      </div>
                      {isEditing ? (
                        <Form.Item name="summary" className="m-0"><TextArea rows={4} /></Form.Item>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap">{record.summary || "Pending"}</div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-slate-700">Advice on Discharge / Instructions</label>
                        {isEditing && <Button type="text" size="small" className="text-teal-600 font-semibold print:hidden" icon={activeVoiceField === "instructions" ? <MicOff size={14} className="text-red-500 animate-pulse"/> : <Mic size={14}/>} onClick={() => toggleVoice("instructions")}>Dictate</Button>}
                      </div>
                      {isEditing ? (
                        <Form.Item name="instructions" className="m-0"><TextArea rows={3} /></Form.Item>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap">{record.instructions || "Pending"}</div>
                      )}
                    </div>

                    <div className="w-full md:w-1/3">
                      <label className="font-bold text-slate-700 block mb-2">Follow Up Date</label>
                      {isEditing ? (
                        <Form.Item name="followUpDate" className="m-0"><DatePicker className="w-full" format="YYYY-MM-DD" /></Form.Item>
                      ) : (
                        <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 text-teal-900 font-bold">{record.followUpDate || "As advised"}</div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};


const PatientIpdRecords = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.user);
  
  const [ipdRecords, setIpdRecords] = useState([]);
  const [patientProfile, setPatientProfile] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [isolatedPrintId, setIsolatedPrintId] = useState(null);

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/doctor/patient-history/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        const filtered = res.data.data.filter(record => record.recordType === 'IPD');
        setIpdRecords(filtered);
        if (res.data.patientProfile) setPatientProfile(res.data.patientProfile);
      }
    } catch (error) {
      message.error("Failed to fetch IPD records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  return (
    <div className="bg-[#f1f5f9] min-h-screen p-4 md:p-8 print:bg-white print:p-0">
      
      {/* PAGE HEADER */}
      <div className={`flex items-center justify-between mb-8 max-w-6xl mx-auto ${isolatedPrintId ? 'hidden print:hidden' : 'print:hidden'}`}>
        <div className="flex items-center gap-4">
          <Button shape="circle" icon={<ArrowLeft size={20} />} onClick={() => navigate(-1)} />
          <div>
            <h2 className="text-2xl font-black text-slate-800 m-0">In-Patient Records</h2>
            <p className="text-slate-500 text-sm font-medium m-0 capitalize">
              {patientProfile.name || patientId} • Admissions: {ipdRecords.length}
            </p>
          </div>
        </div>
        <Button type="primary" icon={<Printer size={16} />} className="bg-slate-800" onClick={() => window.print()}>
          Print All Records
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
      ) : ipdRecords.length === 0 ? (
        <Empty description="No inpatient admissions found for this patient" className="mt-20" />
      ) : (
        <div className="max-w-6xl mx-auto space-y-16 print:space-y-0">
          {ipdRecords.map((record, index) => (
            <React.Fragment key={record._id}>
              <IpdRecordCard 
                record={record} 
                patientProfile={patientProfile} 
                patientId={patientId} 
                user={user} 
                token={token}
                fetchRecords={fetchRecords} 
                isolatedPrintId={isolatedPrintId}
                setIsolatedPrintId={setIsolatedPrintId}
              />
              {index !== ipdRecords.length - 1 && !isolatedPrintId && (
                <div className="my-12 border-b-2 border-dashed border-slate-300 print:hidden"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientIpdRecords;
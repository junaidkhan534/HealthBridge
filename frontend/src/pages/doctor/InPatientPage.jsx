import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { 
  Form, Input, Button, DatePicker, message, Divider, 
  Steps, Card, Badge, Tag, Select, Tooltip, InputNumber 
} from "antd";
import { 
  Mic, MicOff, Printer, Bed, CheckCircle2, 
  ArrowLeft, HeartPulse, Pill, Activity, Stethoscope, FileText, History
} from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";

const { TextArea } = Input;
const { Option } = Select;

const InPatientPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId, patientName } = location.state || {};
  const { token, user } = useSelector((state) => state.user);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  //  STATE FOR WARD/BEDS
  const [beds, setBeds] = useState([]);
  const [allWards, setAllWards] = useState([]); 

  const [activeVoiceField, setActiveVoiceField] = useState(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (activeVoiceField && transcript) {
      form.setFieldsValue({ [activeVoiceField]: transcript });
    }
  }, [transcript, activeVoiceField, form]);

  useEffect(() => {
  const fetchWards = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await axios.get(`${API_URL}/api/v1/admin/get-all-wards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAllWards(res.data.data); // Save the backend array here
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };
  fetchWards();
}, [token]);

  const handleWardChange = (value) => {
  form.setFieldsValue({ bedNumber: undefined });
  const selectedWard = allWards.find(ward => ward.name === value);
  setBeds(selectedWard ? selectedWard.beds : []);
};

  const toggleVoice = (fieldId) => {
    if (listening && activeVoiceField === fieldId) {
      SpeechRecognition.stopListening();
      setActiveVoiceField(null);
    } else {
      resetTranscript();
      setActiveVoiceField(fieldId);
      SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    }
  };

  const handleUpdateCase = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        appointmentId: id,
        patientId,
        admissionDate: values.admissionDate?.format("YYYY-MM-DD"),
        dischargeDate: values.dischargeDate?.format("YYYY-MM-DD"),
        followUpDate: values.followUpDate?.format("YYYY-MM-DD"),
        currentStage: currentStep,
        
       
        isFinalized: currentStep === 2, 
        
        completeAppointment: true 
      };
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const endpoint = `${API_URL}/api/v1/doctor/save-inpatient-data`;

      const res = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        message.success("Data Saved & Appointment Completed!");
        
        // At Step 2: Save, Print, and Navigate
        if (currentStep === 2) {
            setTimeout(() => {
                window.print();
                navigate('/doctor'); 
            }, 500);
        } else {
            // At Step 0 & 1: Just Save and Navigate
            navigate('/doctor');
        }
      }
    } catch (error) {
      message.error("Data Synchronization Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="p-10 text-center">Voice recognition is not supported in this browser.</div>;
  }

  const handleFormChanges = (changedValues, allValues) => {
    if (changedValues.admissionDate) {
      form.setFieldsValue({
        admissionDate: changedValues.admissionDate
      });
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8 print:bg-white print:p-0">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <Button shape="circle" icon={<ArrowLeft size={20} />} onClick={() => navigate(-1)} />
          <h2 className="text-xl font-bold text-slate-800 m-0">In-Patient Management</h2>
        </div>
        <Button 
          type="success" 
          ghost 
          icon={<History size={18}/>} 
          onClick={() => navigate(`/doctor/patient-history/${patientId}`)}
          className="flex items-center gap-2 border-teal-600 text-teal-600 font-semibold"
        >
          Case History
        </Button>
      </div>

      {/* PATIENT IDENTITY STRIP */}
      <div className="bg-white shadow-sm border rounded-xl mb-6 overflow-hidden border-slate-200 print:hidden">
        <div className="bg-teal-600 px-6 py-2 text-white text-[10px] font-bold uppercase tracking-widest flex justify-between">
          <span>Live Clinical Session</span>
          <span>{moment().format('LLLL')}</span>
        </div>
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100">
                <HeartPulse className="text-teal-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 m-0 tracking-tight">{patientName}</h1>
              <p className="text-xs text-slate-500 font-medium uppercase">Patient ID: {patientId} | Consultant: Dr. {user?.name}</p>
            </div>
          </div>
          <div className="hidden md:flex gap-8 border-l pl-8 border-slate-100">
             <div><p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Ward</p><Tag color="blue" className="m-0">{form.getFieldValue('wardType') || 'N/A'}</Tag></div>
             <div><p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Bed No.</p><p className="font-bold m-0">{form.getFieldValue('bedNumber') || '--'}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDEBAR */}
        <div className="lg:col-span-3 print:hidden">
          <Card className="shadow-sm rounded-xl sticky top-8">
            <Steps
              direction="vertical"
              current={currentStep}
              onChange={(s) => setCurrentStep(s)}
              size="small"
              items={[
                { title: 'Admission', description: 'Triage & Assignment' },
                { title: 'Care Plan', description: 'Treatment & Progress' },
                // { title: 'Discharge', description: 'Summary' },
              ]}
            />
          </Card>
        </div>

        {/* MAIN */}
        <div className="lg:col-span-9">
          <Form form={form} layout="vertical" onValuesChange={handleFormChanges} onFinish={handleUpdateCase} initialValues={{ admissionDate: moment() }}>
            
            {/* STEP 0: ADMISSION & TRIAGE */}
            {/* {currentStep === 0 && ( */}
            <div className={currentStep === 0 ? "block animate-in fade-in duration-500" : "hidden"}>
              <Card className="shadow-sm border-t-4 border-t-teal-600 rounded-xl">
                <div className="animate-in fade-in duration-500">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Bed size={22} className="text-teal-600"/> Admission Protocol</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-xl mb-6 border border-slate-100">
                    <Form.Item name="wardType" label="Ward Category" rules={[{required: true}]}>
                      <Select size="large" onChange={handleWardChange} placeholder="Select Ward">
                        {allWards.map((ward) => (
                          <Option key={ward._id} value={ward.name}>{ward.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item name="bedNumber" label="Bed Assignment" rules={[{required: true}]}>
                      <Select size="large" placeholder="Pick a Bed" disabled={!beds.length}>
                        {beds.map((bed) => (
                          <Option 
                            key={bed._id || bed.bedNumber} 
                            value={bed.bedNumber} 
                            disabled={bed.status === 'occupied'}
                          >
                            {bed.bedNumber} {bed.status === 'occupied' ? '(Occupied)' : '(Available)'}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item name="admissionDate" label="Admission Date">
                      <DatePicker className="w-full" size="large"/>
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-5 border rounded-xl bg-white">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Stethoscope size={18} className="text-teal-600"/> Triage Category</h4>
                      <Form.Item name="triage" rules={[{required: true}]}>
                        <Select size="large" placeholder="Set Severity">
                          <Option value="Emergency"><Badge color="red" text="Emergency (High Priority)"/></Option>
                          <Option value="Urgent"><Badge color="gold" text="Urgent (Stable)"/></Option>
                          <Option value="Routine"><Badge color="green" text="Routine (Non-Urgent)"/></Option>
                        </Select>
                      </Form.Item>
                    </div>
                    <div className="p-5 border rounded-xl bg-white">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Activity size={18} className="text-red-500"/> Admission Vitals</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <Form.Item name="bp" label="B.P."><Input placeholder="120/80" /></Form.Item>
                        <Form.Item name="pulse" label="Pulse"><Input placeholder="bpm" /></Form.Item>
                        <Form.Item name="spo2" label="SpO2"><Input placeholder="%" /></Form.Item>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-slate-700">Initial Assessment & Chief Complaint</label>
                      <Button 
                        type="text" 
                        size="small"
                        className="text-teal-600 font-semibold"
                        icon={activeVoiceField === "chiefComplaint" ? <MicOff size={16} className="text-red-500 animate-pulse"/> : <Mic size={16}/>} 
                        onClick={() => toggleVoice("chiefComplaint")}
                      >
                      {activeVoiceField === "chiefComplaint" ? "Stop" : "Voice Entry"}
                      </Button>
                    </div>
                    <Form.Item name="chiefComplaint">
                      <TextArea 
                        rows={4} 
                        placeholder="Describe the reason for admission, symptoms, and medical history..." 
                        className="rounded-xl border-slate-200 focus:border-teal-500" 
                      />
                    </Form.Item>
                  </div>
                </div>
              </Card>
            </div>

            {/* STEP 1: CARE PLAN */}
            {/* {currentStep === 1 && ( */}
            <div className={currentStep === 1 ? "block animate-in slide-in-from-right-4 duration-500" : "hidden print:block print:mb-8"}>
              <Card className="shadow-sm border-t-4 border-t-teal-600 rounded-xl">
                <div className="animate-in slide-in-from-right-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Pill size={22} className="text-teal-600"/> Clinical Care Plan</h3>

                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">I. Diagnosis & Investigations</label>
                        <Button type="text" className="text-teal-600 font-semibold" size="small" icon={<Mic size={14}/>} onClick={() => toggleVoice("investigations")}>Voice Entry</Button>
                    </div>
                    <Form.Item name="investigations">
                      <TextArea rows={4} className="rounded-xl" placeholder="Lab results, Imaging, and Clinical Hypotheses..." />
                    </Form.Item>
                  </div>

                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">II. Treatment & Care Delivery</label>
                        <Button type="text" className="text-teal-600 font-semibold" size="small" icon={<Mic size={14}/>} onClick={() => toggleVoice("treatmentGiven")}>Voice Entry</Button>
                    </div>
                    <Form.Item name="treatmentGiven">
                      <TextArea rows={4} className="rounded-xl border-blue-200" placeholder="Medications, IV fluids, Nursing care instructions..." />
                    </Form.Item>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">III. Daily Progress (Records Management)</label>
                        <Button type="text" className="text-teal-600 font-semibold" size="small" icon={<Mic size={14}/>} onClick={() => toggleVoice("dailyProgress")}>Voice Entry</Button>
                    </div>
                    <Form.Item name="dailyProgress">
                      <TextArea rows={5} className="rounded-xl" placeholder="Daily improvement notes, complications, and patient response..." />
                    </Form.Item>
                  </div>
                </div>
              </Card>
            </div>

            {/* STEP 2: FINAL DISCHARGE SUMMARY  */}
            {/* {currentStep === 2 && ( */}
            <div className={currentStep === 2 ? "block animate-in zoom-in-95 duration-300" : "hidden print:block"}>
              <div className="animate-in zoom-in-95 duration-300">
                <div className="p-6 max-w-5xl mx-auto print:p-0 print:w-full">
                  
                  {/* PRINT HEADER */}
                  <div className="bg-white p-6 rounded-t-xl shadow-md mb-6 border-b-4 border-teal-600 print:shadow-none print:mb-4">
                    <div className="flex justify-between items-center pb-4 mb-4">
                      <div>
                        <h1 className="text-3xl font-black text-teal-700 m-0 tracking-tight">HealthBridge Hospital</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Department of General Medicine</p>
                        <p className="text-sm text-slate-700 font-medium mt-1">Consultant: Dr. {user?.name}</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-800 m-0">Discharge Summary</h2>
                        <p className="text-slate-600 font-semibold italic">Date: {moment().format("DD MMM YYYY")}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100 print:bg-white print:border-none">
                      <div>
                        <p className="m-0"><span className="text-slate-400 font-bold uppercase text-[10px]">Patient Name:</span></p>
                        <p className="text-lg font-bold text-slate-800">{patientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="m-0"><span className="text-slate-400 font-bold uppercase text-[10px]">Patient ID:</span></p>
                        <p className="font-mono font-bold text-teal-700">{patientId}</p>
                      </div>
                    </div>
                  </div>

                  
                  <div className="bg-white p-8 rounded-b-xl shadow-md print:shadow-none print:p-0">
                    
                    {/* DATES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <Form.Item 
                        label={<span className="font-bold">Date of Admission</span>} 
                        name="admissionDate" 
                      >
                        <DatePicker className="w-full h-10 rounded-lg bg-slate-50" format="YYYY-MM-DD" disabled />
                      </Form.Item>
                      
                      <Form.Item 
                        label={<span className="font-bold">Date of Discharge</span>} 
                        name="dischargeDate" 
                        initialValue={moment()}
                      >
                        <DatePicker className="w-full h-10 rounded-lg" format="YYYY-MM-DD" disabled />
                      </Form.Item>
                    </div>

                    <Divider orientation="left"><span className="text-[10px] uppercase font-bold text-slate-400">Clinical Record</span></Divider>

                    {/* I. FINAL DIAGNOSIS */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700">Final Diagnosis</label>
                        <Button 
                          type="text" 
                          size="small"
                          className="text-teal-600 font-semibold print:hidden"
                          icon={activeVoiceField === "diagnosis" ? <MicOff size={16} className="text-red-500 animate-pulse"/> : <Mic size={16}/>} 
                          onClick={() => toggleVoice("diagnosis")} 
                        >
                          {activeVoiceField === "diagnosis" ? "Stop" : "Voice Entry"}
                        </Button>
                      </div>
                      <Form.Item name="diagnosis">
                        <TextArea placeholder="Primary Diagnosis..." rows={2} className="h-10 rounded-lg" />
                      </Form.Item>
                    </div>

                    <div className="mb-6">
                       <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700">Clinical Summary & Course in Hospital</label>
                        <Button 
                          type="text" 
                          size="small"
                          className="text-teal-600 font-semibold print:hidden"
                          icon={activeVoiceField === "summary" ? <MicOff size={16} className="text-red-500 animate-pulse"/> : <Mic size={16}/>} 
                          onClick={() => toggleVoice("summary")}
                        >
                          {activeVoiceField === "summary" ? "Stop" : "Voice Entry"}
                        </Button>
                      </div>
                      <Form.Item name="summary">
                        <TextArea rows={6} placeholder="Speak hospital course details..." className="rounded-xl"/>
                      </Form.Item>
                    </div>

                      
                     <div className="mb-6">
                       <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-slate-700">Advice on Discharge / Instructions</label>
                        <Button 
                          type="text" 
                          size="small"
                          className="text-teal-600 font-semibold print:hidden"
                          icon={activeVoiceField === "instructions" ? <MicOff size={16} className="text-red-500 animate-pulse"/> : <Mic size={16}/>} 
                          onClick={() => toggleVoice("instructions")}
                        >
                          {activeVoiceField === "summary" ? "Stop" : "Voice Entry"}
                        </Button>
                      </div>
                      <Form.Item name="instructions">
                        <TextArea rows={3} placeholder="Diet, rest, warning signs..." className="rounded-xl" />
                      </Form.Item>
                    </div>

                    {/* V. FOLLOW UP */}
                    <div className="mb-6 w-full md:w-1/3">
                      <Form.Item label={<span className="font-bold">Review / Follow Up Date</span>} name="followUpDate">
                        <DatePicker className="w-full h-10 rounded-lg" format="YYYY-MM-DD" />
                      </Form.Item>
                    </div>

                    <div className="hidden print:flex justify-end mt-20 pt-10 border-t border-dashed border-slate-300">
                        <div className="text-center px-10">
                          <p className="font-bold text-lg text-slate-900 m-0">Dr. {user?.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Authorized Medical Officer</p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* FOOTER btn  */}
            <div className="mt-12 pt-8 border-t flex justify-between print:hidden">
              <Button size="large" className="rounded-lg px-8" disabled={currentStep === 0} onClick={() => setCurrentStep(currentStep - 1)}>Back</Button>
              <div className="flex gap-4">
                <Button size="large" onClick={() => navigate(-1)} className="border-none hover:bg-red-50 hover:text-red-600 transition-all">Cancel & Exit</Button>
                <Button type="primary" size="large" htmlType="submit" loading={loading} className={`rounded-lg px-10 font-bold ${currentStep === 2 ? "bg-indigo-600" : "bg-teal-600 hover:bg-teal-700"}`}>
                  {currentStep === 2 ? "Save & Print" : "Save"}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default InPatientPage;
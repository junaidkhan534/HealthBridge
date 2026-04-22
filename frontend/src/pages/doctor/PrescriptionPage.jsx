import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Button, DatePicker, message } from "antd";
import { Plus, Trash, Mic, Printer, ArrowLeft } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const PrescriptionPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { patientId, patientName, patientAge, patientGender } = location.state || {};
  const { token, user } = useSelector((state) => state.user);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [activeVoiceField, setActiveVoiceField] = useState(null);
  const [medicines, setMedicines] = useState([{ name: "", instructions: "" }]);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/v1/doctor/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setDoctorProfile(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching doctor profile", error);
      }
    };
    if (token) fetchDoctorProfile();
  }, [token]);

  useEffect(() => {
    if (activeVoiceField && transcript) {
      if (activeVoiceField === "diagnosis") {
        const current = form.getFieldValue("diagnosis") || "";
        if (!current.includes(transcript)) {
          form.setFieldsValue({ diagnosis: transcript });
        }
      } else if (activeVoiceField.startsWith("med_")) {
        const [_, index, key] = activeVoiceField.split("_");
        const newMedicines = [...medicines];
        newMedicines[parseInt(index)][key] = transcript;
        setMedicines(newMedicines);
      }
    }
  }, [transcript, activeVoiceField, form, medicines]);

  const toggleListening = (fieldId) => {
    if (listening && activeVoiceField === fieldId) {
      SpeechRecognition.stopListening();
      setActiveVoiceField(null);
    } else {
      resetTranscript();
      setActiveVoiceField(fieldId);
      SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    }
  };

  const handleMedicineChange = (index, key, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][key] = value;
    setMedicines(newMedicines);
  };

  const addMedicineRow = () => {
    setMedicines([...medicines, { name: "", instructions: "" }]);
  };

  const removeMedicineRow = (index) => {
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const handleFinish = async (values) => {
    if (!patientId || !id) {
      message.error("Missing Patient Data. Cannot save.");
      return;
    }
    setLoading(true);
    try {
      const formattedMedicines = medicines.map(med => ({
        name: med.name,
        instructions: med.instructions,
        dosage: "As Advised", 
        duration: "N/A"
      }));

      const payload = {
        appointmentId: id,
        patientId: patientId,
        medicines: formattedMedicines,
        diagnosis: values.diagnosis,
        followUpDate: values.followUpDate ? values.followUpDate.format("YYYY-MM-DD") : null,
      };

      const res = await axios.post("http://localhost:8080/api/v1/doctor/create-prescription", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        message.success("Prescription Saved!");
        setTimeout(() => window.print(), 100);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      message.error("Error saving prescription");
    } finally {
      setLoading(false);
    }
  };

  if (!browserSupportsSpeechRecognition) return <div>Browser not supported.</div>;

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:py-0 print:bg-white">
      <style>{`
        @media print {
          @page { margin: 0mm; size: A4; }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white;
            font-size: 12px;
          }

          .print\\:hidden { display: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:text-black { color: black !important; }

          input::placeholder, textarea::placeholder { color: transparent; }

          .ant-input, .ant-picker, .ant-input-textarea, textarea {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            outline: none !important;
            resize: none;
            min-height: auto !important;
          }

          *:focus { outline: none !important; box-shadow: none !important; }

          .print\\:p-0 { padding: 0 !important; }
          .print\\:m-0 { margin: 0 !important; }
          .print\\:gap-1 { gap: 4px !important; }
          .print\\:text-sm { font-size: 11px !important; }
          .print\\:text-xs { font-size: 10px !important; }

          /* Force header/footer backgrounds to print and keep white text */
          .print-header-bg,
          .print-footer-bg {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: #0f766e !important; /* teal-800 */
            color: #ffffff !important; /* ensure white text */
          }

          /* ensure text inside header/footer stays white */
          .print-header-bg * { color: #ffffff !important; }
          .print-footer-bg * { color: #ffffff !important; }

          .medicine-row { border-bottom: none !important; margin-bottom: 2px !important; }
        }
      `}</style>

      {/* BACK BUTTON */}
      <div className="flex items-center gap-4 pl-5">
        <Button shape="circle" icon={<ArrowLeft size={20} />} onClick={() => navigate(-1)} />
        {/* <h2 className="text-xl font-bold text-slate-800 m-0">Prescription</h2> */}
      </div>

      {/* PAPER CONTAINER */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm] print:h-[290mm] print:shadow-none print:w-full flex flex-col">

        {/* HEADER - use print-header-bg but do NOT force print text to black */}
        <div className="bg-teal-800 p-4 print:p-3 print-header-bg">
          <div className="flex justify-start items-center text-white">
            <div className="text-left">
              {/* heading will remain white in print because .print-header-bg * forces white */}
              <h1 className="text-2xl font-bold tracking-tight uppercase">HealthBridge Hospital</h1>
              <p className="text-[15px] font-bold text-teal-100 tracking-[0.1em] uppercase mt-0">Multi-Specialty Care Center</p>
            </div>
          </div>
        </div>

        {/* PATIENT INFO */}
        <div className="px-6 py-3 border-b border-slate-200 print:px-4 print:py-2">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1 text-left">
              <div><span className="font-bold text-slate-500 uppercase">Patient Name:</span> <span className="font-bold text-slate-900 text-sm">{patientName || "N/A"}</span></div>
              <div><span className="font-bold text-slate-500 uppercase">Patient ID:</span> <span className="font-semibold text-slate-700">{patientId || "N/A"}</span></div>
            </div>
            <div className="flex flex-col gap-1 text-center border-l border-r border-slate-100">
              <div><span className="font-bold text-slate-500 uppercase">Age/Sex:</span> <span className="font-bold text-slate-900">{patientAge || "--"} / {patientGender || "--"}</span></div>
              <div><span className="font-bold text-slate-500 uppercase">Date:</span> <span className="font-semibold text-slate-700">{moment().format("DD/MM/YYYY")}</span></div>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <div><span className="font-bold text-slate-500 uppercase">Dr:</span> <span className="font-bold text-slate-900 text-sm">{doctorProfile?.name || "Doctor"}</span></div>
              <div><span className="font-semibold text-slate-500 uppercase">{doctorProfile?.specialty || "Physician"}</span></div>
            </div>
          </div>
        </div>

        {/* MAIN FORM */}
        <Form layout="vertical" form={form} onFinish={handleFinish} className="flex flex-col flex-grow">
          <div className="p-6 flex-grow print:p-4">

            {/* DIAGNOSIS */}
            <div className="mb-4 print:mb-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wide border-b border-teal-500 inline-block pb-0.5">Diagnosis</h3>
                <Button type="text" size="small" className="print:hidden text-teal-600 p-0 h-auto" onClick={() => toggleListening("diagnosis")}>
                  {activeVoiceField === "diagnosis" ? "Stop" : <Mic size={14}/>}
                </Button>
              </div>
              <Form.Item name="diagnosis" rules={[{ required: true }]} className="mb-0">
                <Input.TextArea 
                  autoSize={{ minRows: 1, maxRows: 3 }} 
                  className="text-sm font-medium text-slate-900 print:text-xs print:leading-tight" 
                  placeholder="Enter diagnosis..." 
                />
              </Form.Item>
            </div>

            {/* MEDICINES */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-2 print:mb-1">
                <h3 className="text-2xl font-serif italic text-slate-800 font-bold print:text-lg">Rx</h3>
                <Button type="dashed" size="small" onClick={addMedicineRow} icon={<Plus size={12}/>} className="print:hidden h-6 text-xs">Add</Button>
              </div>

              <div className="w-full">
                <div className="flex border-b border-slate-400 pb-1 mb-2 text-[10px] font-bold uppercase text-slate-600">
                  <div className="flex-[4]">Medicine Name</div>
                  <div className="flex-[4] text-right">Instructions</div>
                  <div className="w-6 print:hidden"></div>
                </div>

                {medicines.map((med, index) => (
                  <div key={index} className="medicine-row flex gap-2 mb-2 items-start group border-b border-slate-100 pb-1 last:border-0 print:gap-4 print:mb-1">
                    <div className="flex-[4] relative">
                      <Input 
                        className="font-bold text-sm text-slate-900 print:text-xs print:p-0" 
                        placeholder="Drug Name"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(index, "name", e.target.value)} 
                        suffix={
                          <Mic size={12} className={`cursor-pointer print:hidden opacity-0 group-hover:opacity-100 ${activeVoiceField === `med_${index}_name` ? 'text-red-500 opacity-100' : 'text-slate-300'}`} onClick={() => toggleListening(`med_${index}_name`)}/>
                        }
                      />
                    </div>
                    <div className="flex-[4] relative">
                      <Input 
                        className="italic text-slate-600 text-sm text-right print:text-xs print:p-0"
                        placeholder="Instructions"
                        value={med.instructions}
                        onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                        suffix={
                          <Mic size={12} className={`cursor-pointer print:hidden opacity-0 group-hover:opacity-100 ${activeVoiceField === `med_${index}_instructions` ? 'text-red-500 opacity-100' : 'text-slate-300'}`} onClick={() => toggleListening(`med_${index}_instructions`)}/>
                        } 
                      />
                    </div>
                    <div className="w-6 print:hidden text-center mt-1">
                      <Trash size={12} className="text-red-300 cursor-pointer hover:text-red-600" onClick={() => removeMedicineRow(index)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-auto">
            <div className="px-6 pb-2 print:px-4">
              <div className="flex justify-between items-end">
                <div className="w-1/3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0">Follow Up</span>
                  <Form.Item name="followUpDate" noStyle>
                    <DatePicker 
                      className="w-full print:hidden h-8" 
                      format="DD-MM-YYYY"
                      disabledDate={(current) => current && current < moment().endOf('day')}
                    />
                  </Form.Item>
                  <div className="hidden print:block font-bold text-sm text-slate-900 mt-1">
                    {form.getFieldValue("followUpDate") ? form.getFieldValue("followUpDate").format("DD MMM YYYY") : "As required"}
                  </div>
                </div>

                <div className="text-center w-1/3">
                  <div className="h-10 mb-1"></div> 
                  <div className="border-t border-slate-800 pt-1">
                    <p className="font-bold text-xs text-slate-900">Dr. {doctorProfile?.name || "Dr. Doctor "}</p>
                    <p className="text-[9px] text-slate-500 uppercase">Signature</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Footer */}
            <div className="bg-teal-800 text-white text-center p-2 print-footer-bg print:mt-2">
              <div className="text-base [10px] print:text-[9px] flex justify-between px-4 opacity-90">
                <span>HealthBridge Hospital, Bareilly, UP</span>
                <span>Emergency: +91-9876543210</span>
                <span>www.healthbridge.com</span>
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="fixed bottom-6 right-3 flex gap-3 print:hidden z-50">
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="success" htmlType="submit" loading={loading} icon={<Printer size={16}/>} className="bg-teal-600">Save & Print</Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PrescriptionPage;
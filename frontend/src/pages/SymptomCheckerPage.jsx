import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Mic, MicOff } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';
import toast from 'react-hot-toast';

const SymptomCheckerPage = () => {
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // VOICE RECOGNITION STATE
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition on component mount
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                setSymptoms((prev) => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + transcript);
            };

            recognition.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    message.error("Microphone access denied. Please check your browser permissions.");
                    toast.error("Microphone access denied. Please check your browser permissions.");
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    // Toggle Voice Listening
    const toggleListening = () => {
        if (!recognitionRef.current) {
            message.warning("Voice recognition is not supported in this browser.");
            toast.warning("Voice recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error("Could not start speech recognition:", err);
            }
        }
    };

    const handleSymptomCheck = async () => {
        if (!symptoms.trim()) {
            message.warning('Please enter your symptoms.');
            return;
        }

        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }

        setLoading(true);
        setError('');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const backendUrl = `${API_URL}/api/v1/doctor/ai-search`;

            const { data } = await axios.post(backendUrl, {
                prompt: symptoms // Send the symptoms to your backend
            });

            if (data.success) {
                const specialty = data.data.trim().replace(/\./g, '');
                message.success(`Suggested Specialist: ${specialty}`);
                navigate(`/alldoctors?specialty=${encodeURIComponent(specialty)}`);
            } else {
                throw new Error(data.message || 'AI could not determine a specialty.');
            }

        } catch (err) {
            console.error('SEARCH ERROR:', err);
            setError(err.response?.data?.message || err.message || 'Failed to connect to AI server.');
            toast.error("Could not suggest a specialist. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); 
            handleSymptomCheck();
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <Stethoscope className="h-8 w-8 text-teal-600" />
                        <span className="text-2xl font-bold text-teal-600">HealthBridge</span>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">AI Symptom Checker</h1>
                        <p className="mt-4 text-slate-600">Not sure which doctor to see? Describe your symptoms below, and our AI will suggest a specialist.</p>
                    </div>
                    <div className="space-y-4">

                        <div className="flex justify-between items-center mb-1">
                            <label className="font-bold text-slate-700">Describe your symptoms</label>
                            <button 
                                type="button"
                                onClick={toggleListening}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded-full transition-all ${
                                    isListening 
                                    ? 'bg-red-100 text-red-600 shadow-inner' 
                                    : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                                }`}
                            >
                                {isListening ? <MicOff size={16} className="animate-pulse" /> : <Mic size={16} />}
                                {isListening ? 'Listening...' : 'Dictate Symptoms'}
                            </button>
                        </div>

                        <textarea 
                            rows="4" 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 transition" 
                            placeholder="e.g., I have a persistent headache and dizziness..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button 
                            className="w-full flex items-center justify-center px-6 py-3 font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition duration-300 disabled:bg-teal-400"
                            onClick={handleSymptomCheck}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span>Find a Specialist</span>
                            )}
                        </button>
                        {error && <p className="text-center text-red-600 text-sm px-4">{error}</p>}
                        <p className="mt-4 text-xs text-slate-500 text-center">Disclaimer: This is an AI-powered suggestion and not a medical diagnosis. Please consult a qualified healthcare professional.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SymptomCheckerPage;



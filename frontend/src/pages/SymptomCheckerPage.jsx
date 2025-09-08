import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';

const SymptomCheckerPage = () => {
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSymptomCheck = async () => {
        if (!symptoms.trim()) {
            message.warning('Please enter your symptoms.');
            return;
        }

        setLoading(true);
        setError('');

        const apiKey = "AIzaSyBIHpNFALgMd9q9GLOGfXGwPJ4eVP7QGX0";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        const prompt = `
            Based on the following symptoms, suggest the single most relevant medical specialty from this list: 
            Cardiologist, Dermatologist, Pediatrician, Neurologist, Orthopedist, Gynecologist, Gastroenterologist, Urologist, Otolaryngologist (ENT), Endocrinologist, Pulmonologist, General Physician.
            Respond with only the name of the specialty. For example: 'Cardiologist'. 
            Do not add any other text, explanation, or punctuation. This is a suggestion, not a diagnosis.
            Symptoms: "${symptoms}"
        `;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) throw new Error(`API request failed`);

            const apiResponse = await response.json();
            
            if (apiResponse.candidates && apiResponse.candidates.length > 0) {
                const specialty = apiResponse.candidates[0].content.parts[0].text.trim().replace('.', '');
                navigate(`/alldoctors?specialty=${(specialty)}`);
            } else {
                throw new Error('Unexpected API response format');
            }

        } catch (err) {
            console.error('Error calling Gemini API:', err);
            setError('Sorry, we couldn\'t process your request. Please try again.');
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
                                <div className="loader w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span>Find a Specialist</span>
                            )}
                        </button>
                        {error && <p className="text-center text-red-600">{error}</p>}
                        <p className="mt-4 text-xs text-slate-500 text-center">Disclaimer: This is an AI-powered suggestion and not a medical diagnosis. Please consult a qualified healthcare professional.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SymptomCheckerPage;
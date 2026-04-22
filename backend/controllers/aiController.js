const axios = require('axios');

const searchDoctorsWithAI = async (req, res) => {
    try {
        const { prompt: userSymptoms } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{
                    text: `Act as a medical triage assistant. Identify the specialty for: "${userSymptoms}". 
                    Specialties: Cardiologist, Dermatologist, Pediatrician, Neurologist, Orthopedist, Gynecologist, Gastroenterologist, Urologist, Otolaryngologist, Endocrinologist, Pulmonologist, General Physician.
                    Return ONLY the name.`
                }]
            }]
        };

        // Making the direct call
        const response = await axios.post(apiUrl, payload);

        // Extracting data safely from the Google JSON structure
        const specialty = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (specialty) {
            const cleanResult = specialty.trim().replace(/[*"']/g, "");
            // console.log(` AI Response: ${cleanResult}`);
            return res.status(200).json({ success: true, data: cleanResult });
        }

        throw new Error("Invalid API response structure");

    } catch (error) {
        // console.error("AI Error:", error.response?.data || error.message);
        
        res.status(200).json({ 
            success: true, 
            data: "General Physician" 
        });
    }
};

module.exports = { searchDoctorsWithAI };
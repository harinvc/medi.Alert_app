const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let ai;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

exports.analyzeSymptoms = async (symptoms, allergies, condition) => {
  if (!ai) {
    console.log("No GEMINI_API_KEY found, using fallback mock AI response.");
    let severity = 'AMBER';
    let resources = ['General Bed'];
    if (symptoms.toLowerCase().includes('chest') || symptoms.toLowerCase().includes('heart')) {
      severity = 'RED';
      resources = ['ICU', 'Cardiologist'];
    }
    return {
      severity: severity,
      required_resources: resources,
      clinical_summary: `[MOCK AI] Patient presents with: ${symptoms}.`
    };
  }

  const prompt = `
    You are a medical triage AI. Analyze the following emergency case.
    Symptoms: ${symptoms}
    Allergies: ${allergies || 'None'}
    Pre-existing Conditions: ${condition || 'None'}

    Return ONLY a raw JSON object with no markdown formatting and no backticks. The JSON must have exactly these keys:
    - severity: string (either "RED", "AMBER", or "GREEN")
    - required_resources: array of strings (e.g., ["ICU", "Cardiologist", "Trauma Surgeon", "General Bed"])
    - clinical_summary: string (a short 1-sentence medical summary)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    const result = JSON.parse(text);
    return result;
  } catch (error) {
    console.error("AI Triage Error:", error);
    // Fallback on error
    return {
      severity: 'RED',
      required_resources: ['ICU'],
      clinical_summary: `[FALLBACK] System error during AI triage for: ${symptoms}`
    };
  }
};

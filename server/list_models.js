const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function list() {
  try {
     // The JS SDK doesn't have a direct listModels, we have to use fetch or just guess common names
     const guesses = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-2.0-flash-exp', 'gemini-2.0-flash'];
     for (const g of guesses) {
        try {
           const model = genAI.getGenerativeModel({ model: g });
           const res = await model.generateContent("test");
           console.log(`Model ${g} is available`);
        } catch (e) {
           console.log(`Model ${g} error: ${e.message}`);
        }
     }
  } catch (err) {
    console.error(err);
  }
}
list();

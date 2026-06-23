const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const modelName = 'gemini-3.5-flash';
  try {
    console.log(`Testing model: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Write a 5-word SEO tip for an AI blog.");
    const response = await result.response;
    console.log(`Result for ${modelName}: ${response.text()}`);
  } catch (e) {
    console.error(`Error for ${modelName}: ${e.message}`);
  }
}

test();

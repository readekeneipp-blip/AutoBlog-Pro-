const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
  try {
    console.log(`Testing model: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Respond with 'Success' and your model name.");
    const response = await result.response;
    console.log(`Result for ${modelName}: ${response.text()}`);
    return true;
  } catch (e) {
    console.error(`Error for ${modelName}: ${e.message}`);
    return false;
  }
}

async function runTests() {
  const models = [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-flash-latest'
  ];
  for (const m of models) {
    await testModel(m);
  }
}

runTests();

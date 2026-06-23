const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const models = ['gemini-1.5-flash-latest', 'gemini-2.0-flash-exp', 'gemini-pro'];
  for (const modelName of models) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("test");
      const response = await result.response;
      console.log(`Result for ${modelName}: ${response.text()}`);
    } catch (e) {
      console.error(`Error for ${modelName}: ${e.message}`);
    }
  }
}
test();

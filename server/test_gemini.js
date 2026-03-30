import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
    const genAI = new GoogleGenerativeAI("AIzaSyC_Xs68tcTQyWPSeCJPZ0PqNuyUUpQu56I");
    // Use gemini-1.5-flash as requested by user initially, but note that it might need to match versioning
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = "Say hello in one word.";

    try {
        const result = await model.generateContent(prompt);
        
        console.log("--- Extraction Test ---");
        try {
            const textFunctionOutput = result.response.text();
            console.log("result.response.text() output:", textFunctionOutput);
        } catch (e) {
            console.log("result.response.text() ERROR:", e.message);
        }

        try {
            const directAccess = result.response.candidates[0].content.parts[0].text;
            console.log("Direct access output:", directAccess);
        } catch (e) {
            console.log("Direct access ERROR:", e.message);
        }

    } catch (error) {
        console.error("API Call failed:", error.message);
    }
}

testGemini();

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

async function listGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Starting model listing using API key...");
    
    // In newer versions of the SDK, listModels might be on the client or requires a different approach.
    // However, the error "genAI.listModels is not a function" suggests it's not a direct method on the instance.
    // Let's try the direct API call listModels via the client if available or use the REST API approach.
    // Actually, in @google/generative-ai, listModels is not a standard export for the main class.
    
    // We can try to use the specific model name to see if it works or if it returns an error.
    // But the user specifically asked for listModels.
    // In v0.10.0+ of @google/generative-ai, listModels is not part of the surface.
    // Let's check the package documentation/standard calls.
    
    // Alternative: use fetch to the Google AI API endpoint.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.models) {
      console.log("Available Models:");
      data.models.forEach((model) => {
        console.log(`- Name: ${model.name}`);
        console.log(`  Display Name: ${model.displayName}`);
        console.log(`  Supported Methods: ${model.supportedGenerationMethods.join(", ")}`);
        console.log("---");
      });

      const textGenerationModels = data.models.filter(m => 
          m.supportedGenerationMethods.includes("generateContent")
      );
      
      console.log("\nRecommended model names for generateContent:");
      textGenerationModels.forEach(m => console.log(`- ${m.name.replace("models/", "")}`));
    } else {
      console.log("No models found or error in response:", data);
    }

  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listGeminiModels();

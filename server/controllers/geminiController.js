const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to try multiple models in order of priority
const generateWithFallback = async (prompt) => {
    const modelsToTry = [
        'gemini-flash-latest',
        'gemini-pro-latest',
        'gemini-1.5-flash-latest',
        'gemini-2.0-flash',
        'gemini-pro'
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting generation with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            
            if (response && response.candidates && response.candidates.length > 0) {
                const text = response.text();
                if (text) return text;
            }
        } catch (error) {
            console.warn(`Model ${modelName} failed: ${error.message}`);
            lastError = error;
            // Continue to next model if 404 or 429
            if (error.message.includes('404') || error.message.includes('429')) {
                continue;
            } else {
                throw error; // Rethrow if it's a different kind of error
            }
        }
    }

    throw lastError || new Error('All Gemini models failed to generate content');
};

// @desc    Explain code or notes
// @route   POST /api/gemini/explain
// @access  Private
const explainContent = asyncHandler(async (req, res) => {
    const { content, type } = req.body;

    if (!content) {
        res.status(400);
        throw new Error('Please provide content to explain');
    }

    try {
        const prompt = `Explain the following ${type || 'content'} in a clear, concise way for a developer:\n\n${content}`;
        const text = await generateWithFallback(prompt);
        res.status(200).json({ explanation: text });
    } catch (error) {
        console.error('Gemini Explain Error:', error);
        res.status(500);
        throw new Error(`AI generation failed: ${error.message}`);
    }
});

// @desc    Generate documentation from code
// @route   POST /api/gemini/docs
// @access  Private
const generateDocs = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
        res.status(400);
        throw new Error('Please provide code to document');
    }

    try {
        const prompt = `Generate a professional markdown documentation for the following code:\n\n${code}`;
        const text = await generateWithFallback(prompt);
        res.status(200).json({ documentation: text });
    } catch (error) {
        console.error('Gemini Docs Error:', error);
        res.status(500);
        throw new Error(`AI generation failed: ${error.message}`);
    }
});

// @desc    Generate README from project description
// @route   POST /api/gemini/readme
// @access  Private
const generateReadme = asyncHandler(async (req, res) => {
    const { projectName, description } = req.body;

    if (!projectName || !description) {
        res.status(400);
        throw new Error('Please provide project name and description');
    }

    try {
        const prompt = `Create a comprehensive README.md file for a project named "${projectName}" with the following description: ${description}`;
        const text = await generateWithFallback(prompt);
        res.status(200).json({ readme: text });
    } catch (error) {
        console.error('Gemini Readme Error:', error);
        res.status(500);
        throw new Error(`AI generation failed: ${error.message}`);
    }
});

module.exports = {
    explainContent,
    generateDocs,
    generateReadme,
};

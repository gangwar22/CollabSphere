const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Explain code or notes
// @route   POST /api/gemini/explain
// @access  Private
const explainContent = asyncHandler(async (req, res) => {
    const { content, type } = req.body; // type: 'code' or 'note'

    if (!content) {
        res.status(400);
        throw new Error('Please provide content to explain');
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const prompt = `Explain the following ${type || 'content'} in a clear, concise way for a developer:\n\n${content}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        if (!response || !response.candidates || response.candidates.length === 0) {
            throw new Error('No candidates returned from Gemini API');
        }

        const text = response.text();

        if (!text) {
            throw new Error('Empty response from Gemini');
        }

        res.status(200).json({ explanation: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
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
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const prompt = `Generate a professional markdown documentation for the following code:\n\n${code}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        if (!response || !response.candidates || response.candidates.length === 0) {
            throw new Error('No candidates returned from Gemini API');
        }

        const text = response.text();

        if (!text) {
            throw new Error('Empty response from Gemini');
        }

        res.status(200).json({ documentation: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
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
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const prompt = `Create a comprehensive README.md file for a project named "${projectName}" with the following description: ${description}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        if (!response || !response.candidates || response.candidates.length === 0) {
            throw new Error('No candidates returned from Gemini API');
        }

        const text = response.text();

        if (!text) {
            throw new Error('Empty response from Gemini');
        }

        res.status(200).json({ readme: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500);
        throw new Error(`AI generation failed: ${error.message}`);
    }
});

module.exports = {
    explainContent,
    generateDocs,
    generateReadme,
};

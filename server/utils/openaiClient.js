const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate home design details (text) and an image via OpenAI
 * @param {string} prompt - User's home design preferences
 * @returns {Promise<{ imageUrl: string, description: string }>}
 */
async function generateHomeDesign(prompt) {
    try {
        // 1. Generate text description using GPT
        const textPromise = openai.chat.completions.create({
            model: 'gpt-4o', // or gpt-3.5-turbo if needed, using gpt-4o for best results
            messages: [
                {
                    role: "system",
                    content: `You are an expert AI Architect and Interior Designer. 
                    Based on the user's preferences, generate a detailed home design description.
                    Include specific sections for: Rooms, Layout Plans, Colors, and Materials.
                    Do not use markdown blocks, just format it nicely.`
                },
                {
                    role: "user",
                    content: `Design preferences: ${prompt}`
                }
            ],
            temperature: 0.7,
        });

        // 2. Generate architectural render using gpt-image-1
        const imagePromise = openai.images.generate({
            model: "gpt-image-1",
            prompt: `A high-end, photorealistic 3D architectural render of a modern house interior or exterior based on these preferences: ${prompt}. Style: Modern Indian Residential, cinematic lighting, ultra-detailed, 8k resolution, architectural photography style, no text, no watermarks.`,
            n: 1,
            size: "1024x1024",
        });

        const [textResponse, imageResponse] = await Promise.all([textPromise, imagePromise]);

        const description = textResponse.choices[0].message.content.trim();
        const imageUrl = imageResponse.data[0].url;

        return { image: imageUrl, description };
    } catch (error) {
        console.error("OpenAI generation error:", error.message);
        throw new Error("Failed to generate design with OpenAI");
    }
}

module.exports = {
    generateHomeDesign,
};

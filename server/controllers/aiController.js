const archiver = require('archiver');
const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler');
const { generateHomeDesign } = require('../utils/openaiClient');
const History = require('../models/History');

// New unified approach: generate both text and image from a single prompt
const generateDesign = asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        const { image, description } = await generateHomeDesign(prompt);
        res.json({ image, description });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Design generation failed' });
    }
});

// History Save (Modified slightly to accept only simple string array for this new UI if needed)
// Keep as is so previous data isn't broken
const saveHistory = asyncHandler(async (req, res) => {
    const { messages, layout, palette, renders } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: 'Must be logged in to save history' });
    }

    try {
        let history = await History.findOne({ user: req.user._id });

        if (history) {
            history.messages = messages || history.messages;
            history.layout = layout || history.layout;
            history.palette = palette || history.palette;
            history.renders = renders || history.renders;
            await history.save();
        } else {
            history = await History.create({
                user: req.user._id,
                messages: messages || [],
                layout: layout || null,
                palette: palette || null,
                renders: renders || []
            });
        }

        res.json(history);
    } catch (error) {
        console.error('History save failed:', error);
        res.status(500).json({ message: 'Failed to save history' });
    }
});

module.exports = {
    generateDesign,
    saveHistory
};

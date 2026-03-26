const prisma = require('../config/db');

// Get system settings (singleton row)
const getSettings = async (req, res) => {
    try {
        let settings = await prisma.settings.findFirst();
        if (!settings) {
            // Create default settings if not exist
            settings = await prisma.settings.create({ data: {} });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update system settings (singleton row)
const updateSettings = async (req, res) => {
    try {
        let settings = await prisma.settings.findFirst();
        if (!settings) {
            settings = await prisma.settings.create({ data: {} });
        }
        const updated = await prisma.settings.update({
            where: { id: settings.id },
            data: req.body
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getSettings, updateSettings };
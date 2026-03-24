const prisma = require('../config/db');
const { sendUpdateEmail } = require('../utils/emailUtil');

// Get all updates for a job
const getJobUpdates = async (req, res) => {
    try {
        const { id } = req.params; // appointmentId
        const updates = await prisma.jobUpdate.findMany({
            where: { appointmentId: parseInt(id) },
            orderBy: { createdAt: 'desc' }
        });
        res.json(updates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a new update/note to a job
const addJobUpdate = async (req, res) => {
    try {
        const { id } = req.params; // appointmentId
        const { content } = req.body;

        if (!content) return res.status(400).json({ error: "Content is required" });

        const update = await prisma.jobUpdate.create({
            data: {
                appointmentId: parseInt(id),
                content
            }
        });

        res.status(201).json(update);

        // Fetch user details and send email
        const appointment = await prisma.appointment.findUnique({
            where: { id: parseInt(id) },
            include: { user: true }
        });

        if (appointment && appointment.user && appointment.user.email) {
            sendUpdateEmail(
                appointment.user.email, 
                appointment.user.name || 'Customer', 
                appointment.service, 
                `New update added: \n\n${content}`
            );
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getJobUpdates,
    addJobUpdate
};

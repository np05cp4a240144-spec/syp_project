const prisma = require('../config/db');

// Get all parts used in a specific job
const getJobParts = async (req, res) => {
    try {
        const { id } = req.params; // appointmentId
        const parts = await prisma.jobPart.findMany({
            where: { appointmentId: parseInt(id) },
            include: { part: true }
        });
        res.json(parts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a part to a job
const addPartToJob = async (req, res) => {
    try {
        const { id } = req.params; // appointmentId
        const { partId, quantity } = req.body;

        const qty = parseInt(quantity) || 1;

        // 1. Find the part
        const part = await prisma.part.findUnique({
            where: { id: parseInt(partId) }
        });

        if (!part) {
            return res.status(404).json({ error: "Part not found" });
        }

        if (part.stock < qty) {
            return res.status(400).json({ error: "Insufficient stock" });
        }

        // 2. Create JobPart entry or update existing
        const existingJobPart = await prisma.jobPart.findFirst({
            where: {
                appointmentId: parseInt(id),
                partId: parseInt(partId)
            }
        });

        let jobPart;
        if (existingJobPart) {
            jobPart = await prisma.jobPart.update({
                where: { id: existingJobPart.id },
                data: { 
                    quantity: existingJobPart.quantity + qty,
                    priceAtTime: part.price // Update with latest price? Or keep original? Let's use latest since they added more.
                }
            });
        } else {
            jobPart = await prisma.jobPart.create({
                data: {
                    appointmentId: parseInt(id),
                    partId: parseInt(partId),
                    quantity: qty,
                    priceAtTime: part.price
                }
            });
        }

        // 3. Update Inventory Stock
        await prisma.part.update({
            where: { id: parseInt(partId) },
            data: { 
                stock: { decrement: qty }
            }
        });

        // 4. Create Audit Log
        await prisma.partLog.create({
            data: {
                partId: parseInt(partId),
                type: 'Stock Out',
                amount: qty,
                notes: `Used in Job #${id}`,
                userId: req.user.id
            }
        });

        res.status(201).json(jobPart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove or decrease part from job (optional, but good for corrections)
const removePartFromJob = async (req, res) => {
    try {
        const { id } = req.params; // jobPartId
        
        const jobPart = await prisma.jobPart.findUnique({
            where: { id: parseInt(id) },
            include: { part: true }
        });

        if (!jobPart) return res.status(404).json({ error: "Job part record not found" });

        // Restore stock
        await prisma.part.update({
            where: { id: jobPart.partId },
            data: { stock: { increment: jobPart.quantity } }
        });

        // Log restoration
        await prisma.partLog.create({
            data: {
                partId: jobPart.partId,
                type: 'Stock In',
                amount: jobPart.quantity,
                notes: `Restored/Removed from Job #${jobPart.appointmentId}`,
                userId: req.user.id
            }
        });

        // Delete record
        await prisma.jobPart.delete({ where: { id: parseInt(id) } });

        res.json({ message: "Part removed and stock restored" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getJobParts,
    addPartToJob,
    removePartFromJob
};

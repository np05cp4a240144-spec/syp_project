const prisma = require('../config/db');

// Create or update invoice for an appointment
const createInvoice = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { laborCost, tax, notes } = req.body;

        // 1. Get appointment with parts to calculate parts total
        const appointment = await prisma.appointment.findUnique({
            where: { id: parseInt(appointmentId) },
            include: { parts: true }
        });

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        const partsTotal = appointment.parts.reduce((acc, jp) => {
            return acc + (jp.quantity * (jp.priceAtTime || 0));
        }, 0);

        const labor = parseFloat(laborCost) || 0;
        const taxAmount = parseFloat(tax) || 0;
        const total = partsTotal + labor + taxAmount;

        // Generate invoice number if not existing
        const invoiceNumber = `INV-${Date.now()}-${appointmentId}`;

        const invoice = await prisma.invoice.upsert({
            where: { appointmentId: parseInt(appointmentId) },
            update: {
                laborCost: labor,
                partsTotal,
                tax: taxAmount,
                totalAmount: total,
                notes
            },
            create: {
                appointmentId: parseInt(appointmentId),
                invoiceNumber,
                laborCost: labor,
                partsTotal,
                tax: taxAmount,
                totalAmount: total,
                notes
            }
        });

        // Update appointment amount to match invoice total
        await prisma.appointment.update({
            where: { id: parseInt(appointmentId) },
            data: { amount: total }
        });

        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get invoice for an appointment
const getInvoice = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const invoice = await prisma.invoice.findUnique({
            where: { appointmentId: parseInt(appointmentId) },
            include: {
                appointment: {
                    include: {
                        user: { select: { name: true, email: true, phone: true } },
                        vehicle: true,
                        parts: { include: { part: true } }
                    }
                }
            }
        });

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createInvoice,
    getInvoice
};

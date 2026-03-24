const prisma = require('../config/db');

// Create or update invoice for an appointment
const createInvoice = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { laborCost, notes } = req.body;

        // 1. Get appointment with parts to calculate parts total
        const appointment = await prisma.appointment.findUnique({
            where: { id: parseInt(appointmentId) },
            include: { parts: true, user: true }
        });

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        // 2. Get global settings for tax and discount
        const settings = await prisma.settings.findFirst();
        const taxRate = settings?.taxRate || 8.0;
        const loyaltyDiscounts = settings?.loyaltyDiscounts;
        const loyaltyDiscountRate = settings?.loyaltyDiscountRate || 10.0;

        const partsTotal = appointment.parts.reduce((acc, jp) => {
            return acc + (jp.quantity * (jp.priceAtTime || 0));
        }, 0);

        const labor = parseFloat(laborCost) || 0;
        // Always use admin settings for discount calculation
        let discountAmount = 0;
        if (settings?.loyaltyDiscounts && settings?.loyaltyDiscountRate) {
            discountAmount = ((partsTotal + labor) * settings.loyaltyDiscountRate) / 100;
        }

        const subtotal = partsTotal + labor - discountAmount;
        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;

        // Generate invoice number if not existing
        const invoiceNumber = `INV-${Date.now()}-${appointmentId}`;

        const invoice = await prisma.invoice.upsert({
            where: { appointmentId: parseInt(appointmentId) },
            update: {
                laborCost: labor,
                partsTotal,
                tax: taxAmount,
                discountAmount,
                totalAmount: total,
                notes
            },
            create: {
                appointmentId: parseInt(appointmentId),
                invoiceNumber,
                laborCost: labor,
                partsTotal,
                tax: taxAmount,
                discountAmount,
                totalAmount: total,
                notes
            }
        });

        // Update appointment amount to match invoice total
        await prisma.appointment.update({
            where: { id: parseInt(appointmentId) },
            data: { amount: total }
        });

        res.status(201).json({ ...invoice, discountAmount, taxAmount });
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
        // Debug log to verify appointment relations
        console.log('Invoice API debug:', {
            appointmentId,
            invoice,
            user: invoice?.appointment?.user,
            vehicle: invoice?.appointment?.vehicle,
            parts: invoice?.appointment?.parts
        });

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        // Recalculate discountAmount and taxAmount if missing
        let discountAmount = invoice.discountAmount ?? 0;
        let taxAmount = invoice.taxAmount ?? invoice.tax ?? 0;

        // If missing, recalculate using admin settings
        if (discountAmount === 0 || taxAmount === 0) {
            const settings = await prisma.settings.findFirst();
            const taxRate = settings?.taxRate || 8.0;
            const loyaltyDiscountRate = settings?.loyaltyDiscountRate || 10.0;
            const parts = invoice.appointment?.parts || [];
            const partsTotal = invoice.partsTotal || parts.reduce((acc, jp) => acc + (jp.quantity * (jp.priceAtTime || 0)), 0);
            const labor = invoice.laborCost || 0;
            // Always use admin settings for discount
            discountAmount = ((partsTotal + labor) * loyaltyDiscountRate) / 100;
            const subtotal = partsTotal + labor - discountAmount;
            taxAmount = (subtotal * taxRate) / 100;
        }

        // Add customer name, vehicle info, and appointment date to response
        // Defensive: fallback if appointment, user, vehicle, or parts are missing
        const appointment = invoice.appointment || {};
        const customerName = appointment.user?.name || '-';
        const vehicleMake = appointment.vehicle?.make || '-';
        const vehicleModel = appointment.vehicle?.model || '-';
        const appointmentDate = appointment.createdAt || invoice.createdAt || null;
        const parts = Array.isArray(appointment.parts)
            ? appointment.parts.map(jp => ({
                id: jp.id,
                name: jp.part?.name || jp.name || 'Part',
                quantity: jp.quantity,
                priceAtTime: jp.priceAtTime ?? jp.part?.price ?? 0
            }))
            : [];

        res.json({
            ...invoice,
            discountAmount,
            taxAmount,
            customerName,
            vehicleMake,
            vehicleModel,
            appointmentDate,
            parts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createInvoice,
    getInvoice
};

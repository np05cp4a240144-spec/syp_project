const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const { sendCredentialsEmail } = require('../utils/emailUtil');
const crypto = require('crypto');

const getMechanics = async (req, res) => {
    try {
        const mechanics = await prisma.user.findMany({
            where: { role: 'MECHANIC' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                speciality: true,
                createdAt: true
            }
        });
        res.json(mechanics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createMechanic = async (req, res) => {
    try {
        const { name, email, phone, speciality } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: "Name and email are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        // Generate a random temporary password
        const tempPassword = crypto.randomBytes(4).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        const mechanic = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                speciality,
                password: hashedPassword,
                role: 'MECHANIC'
            }
        });

        // Send email with credentials
        try {
            await sendCredentialsEmail(email, tempPassword, name);
        } catch (emailError) {
            console.error("Mechanic created but email failed:", emailError);
            // Optionally: return success but with a warning about email
        }

        res.status(201).json({
            message: "Mechanic created successfully and credentials emailed",
            mechanic: {
                id: mechanic.id,
                name: mechanic.name,
                email: mechanic.email,
                role: mechanic.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateMechanic = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, speciality } = req.body;

        const mechanic = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { name, email, phone, speciality }
        });

        res.json({ message: "Mechanic updated successfully", mechanic });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteMechanic = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: "Mechanic deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMechanicProfile = async (req, res) => {
    try {
        const mechanic = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                speciality: true,
                createdAt: true
            }
        });
        res.json(mechanic);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateMechanicProfile = async (req, res) => {
    try {
        const { name, email, phone, speciality } = req.body;
        const mechanic = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, email, phone, speciality }
        });
        res.json({ message: "Profile updated successfully", mechanic });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getMechanics,
    createMechanic,
    updateMechanic,
    deleteMechanic,
    getMechanicProfile,
    updateMechanicProfile
};

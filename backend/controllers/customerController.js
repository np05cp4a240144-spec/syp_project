const prisma = require('../config/db');


const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                vehicles: true,
                appointments: {
                    select: {
                        amount: true,
                        status: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate stats
        const totalServices = user.appointments.length;
        const totalSpent = user.appointments.reduce((sum, appt) => sum + (appt.amount || 0), 0);
        
        // Mock rating for now as we don't have a rating system yet
        const rating = "4.9";

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt
            },
            vehicles: user.vehicles,
            stats: {
                services: totalServices,
                spent: totalSpent,
                rating: rating
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    const { name, phone } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, phone },
            select: { id: true, name: true, email: true, phone: true }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};


const getAdminStats = async (req, res) => {
    try {
        const totalCustomers = await prisma.user.count({ where: { role: 'USER' } });
        const totalMechanics = await prisma.user.count({ where: { role: 'MECHANIC' } });
        const activeAppointments = await prisma.appointment.count({
            where: { status: { in: ['Pending', 'In Progress'] } }
        });
        
        const appointmentsWithAmount = await prisma.appointment.findMany({
            where: { status: 'Completed', amount: { not: null } },
            select: { amount: true }
        });
        
        const totalRevenue = appointmentsWithAmount.reduce((sum, app) => sum + (app.amount || 0), 0);

        res.json({
            customers: totalCustomers,
            mechanics: totalMechanics,
            activeAppointments,
            totalRevenue: totalRevenue.toFixed(2)
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


const getAllCustomers = async (req, res) => {
    try {
        const customers = await prisma.user.findMany({
            where: { role: 'USER' },
            include: {
                vehicles: true,
                appointments: {
                    select: { amount: true, status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedCustomers = customers.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone || 'N/A',
            visits: c.appointments.length,
            spent: c.appointments
                .filter(a => a.status === 'Completed')
                .reduce((sum, a) => sum + (a.amount || 0), 0)
                .toFixed(2),
            vehicles: c.vehicles.map(v => `${v.make} ${v.model}`)
        }));

        res.json(formattedCustomers);
    } catch (error) {
        console.error('Error fetching all customers:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getAdminStats,
    getAllCustomers
};

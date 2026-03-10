const prisma = require('../config/db');

const addVehicle = async (req, res) => {
    const { make, model, year, plate, color, mileage } = req.body;

    try {
        const vehicle = await prisma.vehicle.create({
            data: {
                make,
                model,
                year: parseInt(year),
                plate,
                color,
                mileage: mileage ? parseInt(mileage) : null,
                ownerId: req.user.id
            }
        });

        res.status(201).json(vehicle);
    } catch (error) {
        console.error(error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A vehicle with this license plate already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};


const removeVehicle = async (req, res) => {
    const { id } = req.params;

    try {
        // Ensure the vehicle belongs to the user
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: parseInt(id) }
        });

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        if (vehicle.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to remove this vehicle' });
        }

        await prisma.vehicle.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Vehicle removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateVehicle = async (req, res) => {
    const { id } = req.params;
    const { make, model, year, plate, color, mileage } = req.body;

    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: parseInt(id) }
        });

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        if (vehicle.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this vehicle' });
        }

        const updatedVehicle = await prisma.vehicle.update({
            where: { id: parseInt(id) },
            data: {
                make,
                model,
                year: year ? parseInt(year) : undefined,
                plate,
                color,
                mileage: mileage ? parseInt(mileage) : undefined
            }
        });

        res.json(updatedVehicle);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    addVehicle,
    removeVehicle,
    updateVehicle
};

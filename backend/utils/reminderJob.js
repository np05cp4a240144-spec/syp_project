const prisma = require('../config/db');
const { sendReminderEmail } = require('./emailUtil');

const parseBookingTime = (rawTime) => {
    if (!rawTime) return null;

    const directDate = new Date(rawTime);
    if (!Number.isNaN(directDate.getTime())) {
        return directDate;
    }

    const normalized = String(rawTime).replace(/·/g, '').replace(/\s+/g, ' ').trim();
    const normalizedDate = new Date(normalized);
    if (!Number.isNaN(normalizedDate.getTime())) {
        return normalizedDate;
    }

    return null;
};

const triggerReminders = async () => {
    try {
        console.log('Running scheduled reminder check...');
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        
        // Find appointments for tomorrow
        const startDate = new Date(tomorrow.setHours(0, 0, 0, 0));
        const endDate = new Date(tomorrow.setHours(23, 59, 59, 999));

        const upcomingAppointments = await prisma.appointment.findMany({
            where: {
                status: {
                    notIn: ['Completed', 'Cancelled']
                },
            },
            include: {
                user: true
            }
        });

        // Filter and send emails
        let count = 0;
        for (const app of upcomingAppointments) {
            const appDate = parseBookingTime(app.time);
            if (!appDate) continue;

            if (appDate >= startDate && appDate <= endDate) {
                if (app.user && app.user.email) {
                    await sendReminderEmail(app.user.email, app.user.name || 'Customer', app);
                    count++;
                }
            }
        }
        console.log(`Sent ${count} reminder emails for upcoming appointments.`);

    } catch (error) {
        console.error('Error running reminder job:', error);
    }
};

const startReminderJob = () => {
    // Run once on startup
    triggerReminders();
    
    // Run every 24 hours
    const interval = 24 * 60 * 60 * 1000;
    setInterval(triggerReminders, interval);
};

module.exports = { startReminderJob, triggerReminders };

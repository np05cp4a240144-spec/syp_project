const prisma = require('../config/db');
const { sendReminderEmail } = require('./emailUtil');

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
            const appDateStr = app.time; 
            const appDate = new Date(appDateStr);
            if (!isNaN(appDate.getTime())) {
                if (appDate >= startDate && appDate <= endDate) {
                    if (app.user && app.user.email) {
                        sendReminderEmail(app.user.email, app.user.name || 'Customer', app);
                        count++;
                    }
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

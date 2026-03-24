const nodemailer = require('nodemailer');

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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendCredentialsEmail = async (email, password, name) => {
    const mailOptions = {
        from: `"Auto Assist" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Auto Assist Mechanic Credentials',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <h2 style="color: #F06A00;">Welcome to Auto Assist, ${name}!</h2>
                <p>You have been added as a mechanic to the Auto Assist dashboard.</p>
                <p>Here are your login credentials:</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #F06A00; margin: 20px 0;">
                    <p style="margin: 0; margin-bottom: 8px;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 0;"><strong>Password:</strong> ${password}</p>
                </div>
                <p>Please log in at your earliest convenience and change your password in the settings.</p>
                <p style="color: #64748B; font-size: 12px; margin-top: 30px;">This is an automated message. Please do not reply.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Credentials email sent to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send credentials email');
    }
};

const sendConfirmationEmail = async (email, name, bookingDetails) => {
    const serviceName = bookingDetails?.service || 'Service Booking';
    const vehicleNameRaw = bookingDetails?.vehicle
        ? `${bookingDetails.vehicle.year || ''} ${bookingDetails.vehicle.make || ''} ${bookingDetails.vehicle.model || ''}`.replace(/\s+/g, ' ').trim()
        : '';
    const vehicleName = vehicleNameRaw || 'N/A';
    const plateNumber = bookingDetails?.vehicle?.plateNumber || bookingDetails?.vehicle?.plate || 'N/A';

    const mailOptions = {
        from: `"Auto Assist" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Booking Confirmation - Auto Assist',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <h2 style="color: #10B981;">Booking Confirmed!</h2>
                <p>Hello ${name},</p>
                <p>Your booking has been received and confirmed by Auto Assist.</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #10B981; margin: 20px 0;">
                    <p style="margin: 0; margin-bottom: 8px;"><strong>Service:</strong> ${serviceName}</p>
                    <p style="margin: 0; margin-bottom: 8px;"><strong>Vehicle:</strong> ${vehicleName}</p>
                    <p style="margin: 0;"><strong>Plate Number:</strong> ${plateNumber}</p>
                </div>
                <p>Thank you for choosing Auto Assist!</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${email}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

const sendMechanicAssignedCustomerEmail = async (email, name, assignmentDetails = {}) => {
    const serviceName = assignmentDetails?.service || 'your service';
    const mechanicName = assignmentDetails?.mechanicName || 'a mechanic';

    const mailOptions = {
        from: `"Auto Assist" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Mechanic Assigned - Auto Assist',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <h2 style="color: #3B82F6;">Mechanic Assigned</h2>
                <p>Hello ${name},</p>
                <p>Your booking has been assigned to a mechanic.</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6; margin: 20px 0;">
                    <p style="margin: 0; margin-bottom: 8px;"><strong>Service:</strong> ${serviceName}</p>
                    <p style="margin: 0;"><strong>Mechanic:</strong> ${mechanicName}</p>
                </div>
                <p>Thank you for choosing Auto Assist.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Mechanic assigned email sent to customer ${email}`);
    } catch (error) {
        console.error('Error sending mechanic assigned customer email:', error);
    }
};

const sendUpdateEmail = async (email, name, service, updateMessage) => {
    const mailOptions = {
        from: `"Auto Assist" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Job Update - Auto Assist',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <h2 style="color: #3B82F6;">Update on your Vehicle</h2>
                <p>Hello ${name},</p>
                <p>There is an update regarding your <strong>${service}</strong> service:</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6; margin: 20px 0;">
                    <p style="margin: 0; white-space: pre-wrap;">${updateMessage}</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Update email sent to ${email}`);
    } catch (error) {
        console.error('Error sending update email:', error);
    }
};

const sendReminderEmail = async (email, name, bookingDetails) => {
    const parsedBookingTime = parseBookingTime(bookingDetails?.time);
    const displayBookingTime = parsedBookingTime
        ? parsedBookingTime.toLocaleString()
        : (bookingDetails?.time || 'As scheduled');

    const mailOptions = {
        from: `"Auto Assist" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Upcoming Appointment Reminder - Auto Assist',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <h2 style="color: #F59E0B;">Appointment Reminder</h2>
                <p>Hello ${name},</p>
                <p>This is a reminder for your upcoming <strong>${bookingDetails.service}</strong> service tomorrow.</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #F59E0B; margin: 20px 0;">
                    <p style="margin: 0; margin-bottom: 8px;"><strong>Date/Time:</strong> ${displayBookingTime}</p>
                </div>
                <p>We look forward to seeing you!</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${email}`);
    } catch (error) {
        console.error('Error sending reminder email:', error);
    }
};

const sendPaymentReceivedEmail = async (email, name, paymentDetails = {}) => {
    const amount = Number(paymentDetails?.amount || 0);
    const formattedAmount = amount > 0 ? `NPR ${amount.toLocaleString()}` : 'NPR 0';
    const typeLabel = paymentDetails?.mode === 'parts' ? 'Parts Purchase' : 'Service Payment';

    const mailOptions = {
        from: `"Auto Assist" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Payment Received - Auto Assist',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <h2 style="color: #10B981;">Payment Successfully Received</h2>
                <p>Hello ${name},</p>
                <p>Your payment has been received successfully.</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #10B981; margin: 20px 0;">
                    <p style="margin: 0; margin-bottom: 8px;"><strong>Type:</strong> ${typeLabel}</p>
                    <p style="margin: 0;"><strong>Amount:</strong> ${formattedAmount}</p>
                </div>
                <p>Thank you for choosing Auto Assist.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Payment received email sent to ${email}`);
    } catch (error) {
        console.error('Error sending payment received email:', error);
        throw new Error('Failed to send payment received email');
    }
};

const sendServiceFinalizedEmail = async (email, name, serviceDetails = {}) => {
    const serviceName = serviceDetails?.service || 'your service';

    const mailOptions = {
        from: `"Auto Assist" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Service Finalized - Auto Assist',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <h2 style="color: #10B981;">Service Finalized</h2>
                <p>Hello ${name},</p>
                <p>Your service has been finalized successfully.</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #10B981; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Service:</strong> ${serviceName}</p>
                </div>
                <p>Thank you for choosing Auto Assist.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Service finalized email sent to ${email}`);
    } catch (error) {
        console.error('Error sending service finalized email:', error);
        throw new Error('Failed to send service finalized email');
    }
};

const sendMechanicJobAssignedEmail = async (email, name, assignmentDetails = {}) => {
    const serviceName = assignmentDetails?.service || 'New Service Job';
    const appointmentId = assignmentDetails?.appointmentId || 'N/A';
    const schedule = assignmentDetails?.time ? new Date(assignmentDetails.time).toLocaleString() : 'As scheduled';

    const mailOptions = {
        from: `"Auto Assist" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'New Job Assigned - Auto Assist',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <h2 style="color: #3B82F6;">New Job Assigned</h2>
                <p>Hello ${name},</p>
                <p>A new job has been assigned to you.</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6; margin: 20px 0;">
                    <p style="margin: 0; margin-bottom: 8px;"><strong>Job ID:</strong> #${appointmentId}</p>
                    <p style="margin: 0; margin-bottom: 8px;"><strong>Service:</strong> ${serviceName}</p>
                    <p style="margin: 0;"><strong>Schedule:</strong> ${schedule}</p>
                </div>
                <p>Please check your mechanic dashboard for details.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Mechanic assignment email sent to ${email}`);
    } catch (error) {
        console.error('Error sending mechanic assignment email:', error);
        throw new Error('Failed to send mechanic assignment email');
    }
};

module.exports = {
    sendCredentialsEmail,
    sendConfirmationEmail,
    sendMechanicAssignedCustomerEmail,
    sendUpdateEmail,
    sendReminderEmail,
    sendPaymentReceivedEmail,
    sendServiceFinalizedEmail,
    sendMechanicJobAssignedEmail
};

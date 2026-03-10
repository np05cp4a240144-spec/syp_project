const prisma = require('../config/db');

const buildSupportReply = ({ content = '', pidx, amount, mode }) => {
    const lowered = String(content || '').toLowerCase();
    const refs = [];
    if (pidx) refs.push(`Reference: ${String(pidx).slice(0, 12)}...`);
    if (amount) refs.push(`Amount: NPR ${Number(amount).toLocaleString()}`);
    if (mode) refs.push(`Type: ${mode}`);

    if (lowered.includes('deduct') || lowered.includes('charged')) {
        return `AI Support: We understand your concern. If money was deducted but status is failed, do not retry immediately. We will verify the transaction with Khalti and update you shortly. ${refs.join(' | ')}`;
    }

    if (lowered.includes('retry') || lowered.includes('again')) {
        return `AI Support: Please retry once after 2-3 minutes using a stable network. If it fails again, keep the transaction reference and we will escalate to admin support. ${refs.join(' | ')}`;
    }

    return `AI Support: We have logged your payment-failure request and informed admin support. Please share screenshot/reference if available so we can resolve faster. ${refs.join(' | ')}`;
};

const getMessages = async (req, res) => {
    const { appointmentId, otherUserId } = req.query;
    const userId = req.user.id;

    try {
        let messages;

        if (appointmentId) {
            messages = await prisma.message.findMany({
                where: {
                    appointmentId: parseInt(appointmentId),
                },
                orderBy: {
                    createdAt: 'asc',
                },
                include: {
                    sender: { select: { id: true, name: true } },
                    receiver: { select: { id: true, name: true } }
                }
            });
        } else if (otherUserId) {
            await prisma.message.updateMany({
                where: {
                    senderId: parseInt(otherUserId),
                    receiverId: userId,
                    read: false
                },
                data: {
                    read: true
                }
            });

            messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: userId, receiverId: parseInt(otherUserId) },
                        { senderId: parseInt(otherUserId), receiverId: userId },
                    ],
                },
                orderBy: {
                    createdAt: 'asc',
                },
                include: {
                    sender: { select: { id: true, name: true } },
                    receiver: { select: { id: true, name: true } }
                }
            });
        } else {
            return res.status(400).json({ error: 'Appointment ID or Other User ID is required' });
        }

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

const getRecentChats = async (req, res) => {
    const userId = req.user.id;

    try {
       
        const messages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: {
                createdAt: 'desc',
            },
            distinct: ['senderId', 'receiverId'], 
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } },
            }
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching recent chats:', error);
        res.status(500).json({ error: 'Failed to fetch recent chats' });
    }
};

const getUnreadMessageCount = async (req, res) => {
    const userId = req.user.id;

    try {
        const unread = await prisma.message.count({
            where: {
                receiverId: userId,
                read: false
            }
        });

        res.json({ unreadCount: unread });
    } catch (error) {
        console.error('Error fetching unread message count:', error);
        res.status(500).json({ error: 'Failed to fetch unread message count' });
    }
};

const markConversationRead = async (req, res) => {
    const userId = req.user.id;
    const { otherUserId } = req.body || {};

    const parsedOtherUserId = parseInt(otherUserId);
    if (!Number.isFinite(parsedOtherUserId)) {
        return res.status(400).json({ error: 'otherUserId is required' });
    }

    try {
        const result = await prisma.message.updateMany({
            where: {
                senderId: parsedOtherUserId,
                receiverId: userId,
                read: false
            },
            data: {
                read: true
            }
        });

        res.json({ updated: result.count });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};

const startPaymentSupport = async (req, res) => {
    const userId = req.user.id;
    const { pidx, amount, appointmentId, mode } = req.body || {};

    try {
        const adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            orderBy: { id: 'asc' }
        });

        if (!adminUser) {
            return res.status(404).json({ error: 'No admin account available for support' });
        }

        const customerMsg = `Payment failed. I need help.${pidx ? ` Ref: ${pidx}` : ''}${amount ? ` Amount: NPR ${amount}` : ''}${appointmentId ? ` Appointment: ${appointmentId}` : ''}`;

        const createdCustomerMsg = await prisma.message.create({
            data: {
                senderId: userId,
                receiverId: adminUser.id,
                content: customerMsg
            },
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } }
            }
        });

        const aiReply = buildSupportReply({ content: customerMsg, pidx, amount, mode });
        const createdAiReply = await prisma.message.create({
            data: {
                senderId: adminUser.id,
                receiverId: userId,
                content: aiReply
            },
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } }
            }
        });

        res.status(201).json({
            adminId: adminUser.id,
            messages: [createdCustomerMsg, createdAiReply]
        });
    } catch (error) {
        console.error('Error starting payment support:', error);
        res.status(500).json({ error: 'Failed to start payment support chat' });
    }
};

const sendPaymentSupportMessage = async (req, res) => {
    const userId = req.user.id;
    const { adminId, content, pidx, amount, mode } = req.body || {};

    const parsedAdminId = parseInt(adminId);
    if (!Number.isFinite(parsedAdminId) || !content?.trim()) {
        return res.status(400).json({ error: 'adminId and content are required' });
    }

    try {
        const adminUser = await prisma.user.findUnique({ where: { id: parsedAdminId } });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            return res.status(404).json({ error: 'Support admin not found' });
        }

        const userMessage = await prisma.message.create({
            data: {
                senderId: userId,
                receiverId: parsedAdminId,
                content: content.trim()
            },
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } }
            }
        });

        const aiReply = await prisma.message.create({
            data: {
                senderId: parsedAdminId,
                receiverId: userId,
                content: buildSupportReply({ content, pidx, amount, mode })
            },
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } }
            }
        });

        res.status(201).json({ messages: [userMessage, aiReply] });
    } catch (error) {
        console.error('Error sending payment support message:', error);
        res.status(500).json({ error: 'Failed to send support message' });
    }
};

module.exports = {
    getMessages,
    getRecentChats,
    getUnreadMessageCount,
    markConversationRead,
    startPaymentSupport,
    sendPaymentSupportMessage
};

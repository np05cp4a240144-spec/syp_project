const prisma = require('../config/db');

let io;

const initSocket = (socketIo) => {
    io = socketIo;

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room: ${roomId}`);
        });

        socket.on('send_message', async (data) => {
            const { senderId, receiverId, content, appointmentId } = data;

            try {
                // Save message to database
                const newMessage = await prisma.message.create({
                    data: {
                        content,
                        senderId: parseInt(senderId),
                        receiverId: parseInt(receiverId),
                        appointmentId: appointmentId ? parseInt(appointmentId) : null,
                    },
                    include: {
                        sender: {
                            select: { id: true, name: true }
                        }
                    }
                });

                // Emit to the specific room (appointmentId or a private room between users)
                const roomId = appointmentId ? `appointment_${appointmentId}` : `user_${receiverId}`;
                io.to(roomId).emit('receive_message', newMessage);
                
                // Also emit back to sender to confirm (optional, usually handled by local UI update)
                // socket.emit('message_sent', newMessage);

            } catch (error) {
                console.error('Error saving message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initSocket, getIO };

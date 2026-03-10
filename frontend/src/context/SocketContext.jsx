import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:5000'); // Replace with your backend URL
            setSocket(newSocket);

            // Join a private room for the user
            newSocket.emit('join_room', `user_${user.id}`);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user]);

    const joinAppointmentRoom = (appointmentId) => {
        if (socket && appointmentId) {
            socket.emit('join_room', `appointment_${appointmentId}`);
        }
    };

    const sendMessage = (data) => {
        if (socket) {
            socket.emit('send_message', data);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, joinAppointmentRoom, sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

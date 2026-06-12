import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

/**
 * usePaymentSocket - Custom hook for managing payment-related WebSocket events
 * 
 * Handles:
 * - Socket connection
 * - Payment info transmission
 * - Payment confirmation flow
 * - Driver/Passenger dual confirmation
 */
export default function usePaymentSocket(userId, rideId) {
    const [socket, setSocket] = useState(null);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'passenger_confirmed', 'completed'
    const [notification, setNotification] = useState(null);

    // Initialize socket connection
    useEffect(() => {
        if (!userId) return;

        const newSocket = io(`http://${window.location.hostname}:3000`, {
            transports: ['websocket'],
            reconnection: true
        });

        newSocket.on('connect', () => {
            console.log('[Payment Socket] Connected:', newSocket.id);
            // Join user's private room for targeted notifications
            newSocket.emit('join_user_room', userId);
        });

        newSocket.on('disconnect', () => {
            console.log('[Payment Socket] Disconnected');
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [userId]);

    // Listen for payment info (Passenger receives this)
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_payment_info', (data) => {
            console.log('[Payment] Received payment info for ride:', data.rideId);
            if (data.rideId === rideId) {
                setPaymentInfo(data.paymentData);
            }
        });

        return () => {
            socket.off('receive_payment_info');
        };
    }, [socket, rideId]);

    // Listen for payment notifications (Driver receives this)
    useEffect(() => {
        if (!socket) return;

        socket.on('payment_notification', (data) => {
            console.log('[Payment] Notification:', data);
            if (data.rideId === rideId) {
                setPaymentStatus(data.status);
                setNotification(data.message);
            }
        });

        return () => {
            socket.off('payment_notification');
        };
    }, [socket, rideId]);

    // Listen for payment complete (Both receive this)
    useEffect(() => {
        if (!socket) return;

        socket.on('payment_complete', (data) => {
            console.log('[Payment] Transaction complete:', data);
            if (data.rideId === rideId) {
                setPaymentStatus('completed');
                setNotification(data.message);
            }
        });

        return () => {
            socket.off('payment_complete');
        };
    }, [socket, rideId]);

    // Driver sends payment info to passenger
    const sendPaymentInfo = useCallback((recipientId, bankCode, accountNumber, amount) => {
        if (!socket) {
            console.error('[Payment] Socket not connected');
            return;
        }

        socket.emit('send_payment_info', {
            rideId,
            recipientId,
            paymentData: {
                bankCode,
                accountNumber,
                amount
            }
        });

        console.log('[Payment] Payment info sent to passenger:', recipientId);
    }, [socket, rideId]);

    // Passenger confirms payment sent
    const confirmPaymentSent = useCallback((driverId, passengerId) => {
        if (!socket) {
            console.error('[Payment] Socket not connected');
            return;
        }

        socket.emit('payment_sent', {
            rideId,
            driverId,
            passengerId
        });

        setPaymentStatus('passenger_confirmed');
        console.log('[Payment] Passenger confirmed payment sent');
    }, [socket, rideId]);

    // Driver confirms payment received
    const confirmPaymentReceived = useCallback((passengerId, driverId) => {
        if (!socket) {
            console.error('[Payment] Socket not connected');
            return;
        }

        socket.emit('payment_received', {
            rideId,
            passengerId,
            driverId
        });

        setPaymentStatus('completed');
        console.log('[Payment] Driver confirmed payment received');
    }, [socket, rideId]);

    return {
        socket,
        paymentInfo,
        paymentStatus,
        notification,
        sendPaymentInfo,
        confirmPaymentSent,
        confirmPaymentReceived,
        isConnected: socket?.connected || false
    };
}

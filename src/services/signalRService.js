import * as signalR from '@microsoft/signalr';
import api from './api';

class SignalRService {
    constructor() {
        this.notificationConnection = null;
        this.messageConnection = null;
        this.onNotificationReceived = null;
        this.onMessageReceived = null;
    }

    async startNotificationConnection(onNotification) {
        if (this.notificationConnection?.state === signalR.HubConnectionState.Connected) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No token found, cannot connect to SignalR');
            return;
        }

        this.notificationConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_URL || 'https://localhost:7000'}/notificationHub`, {
                accessTokenFactory: () => token,
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
            })
            .withAutomaticReconnect()
            .build();

        this.onNotificationReceived = onNotification;

        this.notificationConnection.on('ReceiveNotification', (notification) => {
            if (this.onNotificationReceived) {
                this.onNotificationReceived(notification);
            }
        });

        try {
            await this.notificationConnection.start();
            console.log('Notification hub connected');
        } catch (error) {
            console.error('Error starting notification connection:', error);
        }
    }

    async startMessageConnection(onMessage) {
        if (this.messageConnection?.state === signalR.HubConnectionState.Connected) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No token found, cannot connect to SignalR');
            return;
        }

        this.messageConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_URL || 'https://localhost:7000'}/messageHub`, {
                accessTokenFactory: () => token,
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
            })
            .withAutomaticReconnect()
            .build();

        this.onMessageReceived = onMessage;

        this.messageConnection.on('ReceiveMessage', (message) => {
            if (this.onMessageReceived) {
                this.onMessageReceived(message);
            }
        });

        this.messageConnection.on('NewMessage', (message) => {
            if (this.onMessageReceived) {
                this.onMessageReceived(message);
            }
        });

        try {
            await this.messageConnection.start();
            console.log('Message hub connected');
        } catch (error) {
            console.error('Error starting message connection:', error);
        }
    }

    async joinConversation(otherUserId) {
        if (this.messageConnection?.state === signalR.HubConnectionState.Connected) {
            await this.messageConnection.invoke('JoinConversation', otherUserId);
        }
    }

    async stopConnections() {
        if (this.notificationConnection) {
            await this.notificationConnection.stop();
        }
        if (this.messageConnection) {
            await this.messageConnection.stop();
        }
    }
}

export const signalRService = new SignalRService();


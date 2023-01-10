import { inject, injectable } from "inversify";
import * as socketIo from "socket.io";
import { IMessage } from "../../models/message";
import { TYPES } from "../../const/types";
import { ChannelDatabaseService } from "../database/channel-db.service";
import { MAIN_ROOM } from "../../const/main_socket_room";
let moment = require('moment-timezone');
moment.locale("fr");

@injectable()
export class ChannelSocketService {

    private io: socketIo.Server;
    public constructor(
        @inject(TYPES.ChannelDatabaseService) 
        private channelDatabaseService: ChannelDatabaseService) {}

    public initializeSocket(io: socketIo.Server) : void { 
        this.io = io;
        this.listen();
    }
    
    private listen(): void {
        this.io.on('connection', (socket) => {
            this.onJoinChat(socket);
            this.onLeaveChat(socket);
            this.onDeleteChat(socket);
            this.onSendMessage(socket);
            this.onUpdateUsername(socket);
            this.onDisconnecting(socket);
        });
    }

    private onJoinChat(socket) : void {
        socket.on("join-chat", (username: string, channelName: string) => {
            console.log(`User ${username} has joined channel ${channelName}`);
            socket.join(channelName);
            this.io.in(channelName).emit("join-chat", username, channelName);
        });
    }

    private onLeaveChat(socket) : void {
        socket.on("leave-chat", (username: string, channelName: string) => {
            console.log(`User ${username} has left channel ${channelName}`);
            this.io.in(channelName).emit("leave-chat", username, channelName);
            socket.leave(channelName);
        });
    }

    private onDeleteChat(socket) : void {
        socket.on("delete-chat", async (username: string, channelName: string) => {

            // Cant delete Public
            if (channelName == "Public")
                return;

            console.log(`Host ${username} has deleted channel ${channelName}`);

            // get sockets in room
            const clients = this.io.sockets.adapter.rooms.get(channelName);

            this.io.in(channelName).emit("delete-chat", username, channelName);

            if (clients != undefined) {
                for (const clientId of clients) {
                    //socket of each client in the room.
                    const clientSocket = this.io.sockets.sockets.get(clientId);
                    if (clientSocket != undefined)
                        clientSocket.leave(channelName);
                }
            }
            

            // Delete channel in database
            this.channelDatabaseService.deleteChannel(channelName);
        });
    }
      

    private onSendMessage(socket) : void {
        socket.on("send-message", (message: IMessage, channelName: string, ) => {            
            const currentDatetime = moment().tz('America/Montreal').format("Do MMMM YYYY HH[h]mm");
            message.timestamp = currentDatetime;

            console.log(`User ${message.sender} sent: ${message.text} in channel ${channelName}`);
            this.io.in(channelName).emit("send-message", message, channelName);

            // Update history
            this.channelDatabaseService.updateHistoryChannel(channelName, message);
        });
    }

    private onUpdateUsername(socket) : void {
        socket.on("update-username", (username: string, newUsername: string) => {
            console.log(`updated username ${username} for ${newUsername} in every sent message`);
            this.channelDatabaseService.updatePreviousMessageSender(username, newUsername);
        });
    }

    private onDisconnecting(socket) : void {
        socket.on("disconnecting", (_: any) => {
            const username = socket.username;
            for(let room of socket.rooms) {
                // Skip first element in set which is the socket id
                if (room == socket.id || room == MAIN_ROOM) 
                    continue;
    
                // emit leave chat for every room the user is currently in
                console.log(`User ${username} has left channel ${room}`);
                this.io.in(room).emit("leave-chat", username, room);
                socket.leave(room);
            }
        });
    }
}

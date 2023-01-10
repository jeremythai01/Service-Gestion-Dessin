import { inject, injectable } from "inversify";
import * as socketIo from "socket.io";
import { MAIN_ROOM } from "../../const/main_socket_room";
import { TYPES } from "../../const/types";
import { ProfileDatabaseService } from "../database/profile-db.service";

@injectable()
export class ConnectionSocketService {

    private io: socketIo.Server;
    public constructor(@inject(TYPES.ProfileDatabaseService)
        private profileDatabaseService: ProfileDatabaseService) {}

    public initializeSocket(io: socketIo.Server) : void {
        this.io = io;
        this.listen();
    }
    
    private listen(): void {
        this.io.on('connection', async (socket) => {
            if (!this.profileDatabaseService.users) {
                socket.disconnect();
                return;
            }
            const username = socket.handshake.query.username;
            console.log(`Socket connection with user ${username} of socket ${socket.id} has been established`);
            socket.username = username;
            this.onLogout(socket);
            this.onDisconnect(socket);
            this.onUpdateUsername(socket);
            this.onUpdateAvatar(socket);

            const userId = await this.profileDatabaseService.fetchIdByUsername(socket.username);
            const avatar = await this.profileDatabaseService.fetchAvatarById(userId);

            // update logon activity history
            this.profileDatabaseService.updateLogonHistory(userId);


            this.io.in(MAIN_ROOM).emit("update-avatar", userId, avatar);
            socket.join(MAIN_ROOM);
        });
    }

    private onLogout(socket) : void {
        socket.on("logout", (username: string) => {
            socket.disconnect();
        });
    }

    private onDisconnect(socket) : void {
        socket.on("disconnect", async (_: any) => {

            if (!this.profileDatabaseService.users)
                return;
        
            const username = socket.username;
            console.log(`User ${username} disconnected`);
            this.profileDatabaseService.updateUserConnection(username, false);
            socket.leave(MAIN_ROOM);

            // update logon activity history
            const userId = await this.profileDatabaseService.fetchIdByUsername(socket.username);
            this.profileDatabaseService.updateLogoutHistory(userId);
        });
    }

    private onUpdateUsername(socket) : void {
        socket.on("update-username", (username: string, newUsername: string) => {

            if (username != socket.username) {
                console.log("ERROR: old username does not match with socket.username");
                return;
            }
            // we wont use socket.username in channel-socket.service because it is overwritten with newUsername
            socket.username = newUsername; 
            console.log(`change username ${username} for ${newUsername}`);
        });
    }

    private onUpdateAvatar(socket) : void {
        socket.on("update-avatar", async (userId: string, newAvatar: string) => {
            await this.profileDatabaseService.updateAvatar(userId, newAvatar);
            this.io.in(MAIN_ROOM).emit("update-avatar", userId, newAvatar);
            console.log(`user has changed their avatar`);
        });
    }
}

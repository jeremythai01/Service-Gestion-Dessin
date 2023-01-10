import * as http from "http";
import { inject, injectable } from "inversify";
import * as socketIo from "socket.io";
import { TYPES } from "../../const/types";
import { ChannelSocketService } from "./channel-socket.service";
import { ConnectionSocketService } from "./connection-socket.service";
import { DrawingSocketService } from "./drawing-socket.service";
import { LobbySocketService } from "./lobby-socket.service";

@injectable()
export class SocketService {

    private io: socketIo.Server;
    public constructor(
        @inject(TYPES.ConnectionSocketService) 
        private connectionSocketService: ConnectionSocketService,
        @inject(TYPES.ChannelSocketService) 
        private channelSocketService: ChannelSocketService,
        @inject(TYPES.DrawingSocketService) 
        private drawingSocketService: DrawingSocketService,
        @inject(TYPES.LobbySocketService) 
        private lobbySocketService: LobbySocketService) {}

    public initializeSocket(server: http.Server) : void {

        this.io = new socketIo.Server(server);

        this.connectionSocketService.initializeSocket(this.io);
        this.channelSocketService.initializeSocket(this.io);
        this.drawingSocketService.initializeSocket(this.io);
        this.lobbySocketService.initializeSocket(this.io);
    }
}
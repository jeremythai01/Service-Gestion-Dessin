import { Container } from "inversify";
import { Application } from "./app";
import { AuthenticationController } from './controllers/authentication.controller';
import { Server } from "./server";
import { ChannelSocketService } from "./services/socket/channel-socket.service";
import { AuthenticationDatabaseService } from "./services/database/authentication-db.service";
import { SocketService } from "./services/socket/socket.service";
import { TYPES } from "./const/types";
import { ChannelDatabaseService } from "./services/database/channel-db.service";
import { ChannelController } from "./controllers/channel.controller";
import { ConnectionSocketService } from "./services/socket/connection-socket.service";
import { ChannelRouter } from "./routes/channel.router";
import { AuthenticationRouter } from "./routes/authentication.router";
import { ProfileDatabaseService } from "./services/database/profile-db.service";
import { ProfileController } from "./controllers/profile.controller";
import { ProfileRouter } from "./routes/profile.router";
import { DrawingSocketService } from "./services/socket/drawing-socket.service";
import { DrawingDatabaseService } from "./services/firebase/drawing-db.service";
import { AlbumController } from "./controllers/album-controller";
import { AlbumRouter } from "./routes/album-router";
import { AlbumDatabaseService } from "./services/database/album-db.service";
import { LobbyRouter } from "./routes/lobby-router";
import { LobbyController } from "./controllers/lobby-controller";
import { LobbyDatabaseService } from "./services/firebase/lobby-db.service";
import { LobbySocketService } from "./services/socket/lobby-socket.service";
import { DrawingRouter } from "./routes/drawing-router";
import { DrawingController } from "./controllers/drawing-controller";


export const containerBootstrapper: () => Promise<Container> = async () => {

    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);

    // Controllers
    container.bind(TYPES.AuthenticationController).to(AuthenticationController);
    container.bind(TYPES.ChannelController).to(ChannelController);
    container.bind(TYPES.ProfileController).to(ProfileController);
    container.bind(TYPES.AlbumController).to(AlbumController);
    container.bind(TYPES.DrawingController).to(DrawingController);
    container.bind(TYPES.LobbyController).to(LobbyController);

    // Routers
    container.bind(TYPES.ChannelRouter).to(ChannelRouter);
    container.bind(TYPES.AuthenticationRouter).to(AuthenticationRouter);
    container.bind(TYPES.ProfileRouter).to(ProfileRouter);
    container.bind(TYPES.AlbumRouter).to(AlbumRouter);
    container.bind(TYPES.DrawingRouter).to(DrawingRouter);
    container.bind(TYPES.LobbyRouter).to(LobbyRouter);

    // Database Services
    container.bind(TYPES.AuthenticationDatabaseService).to(AuthenticationDatabaseService);
    container.bind(TYPES.ChannelDatabaseService).to(ChannelDatabaseService);
    container.bind(TYPES.ProfileDatabaseService).to(ProfileDatabaseService);
    container.bind(TYPES.DrawingDatabaseService).to(DrawingDatabaseService);
    container.bind(TYPES.AlbumDatabaseService).to(AlbumDatabaseService);
    container.bind(TYPES.LobbyDatabaseService).to(LobbyDatabaseService)

    // Socket Services
    container.bind(TYPES.SocketService).to(SocketService);
    container.bind(TYPES.ChannelSocketService).to(ChannelSocketService);
    container.bind(TYPES.ConnectionSocketService).to(ConnectionSocketService);
    container.bind(TYPES.DrawingSocketService).to(DrawingSocketService);
    container.bind(TYPES.LobbySocketService).to(LobbySocketService);
    
    return container;
};

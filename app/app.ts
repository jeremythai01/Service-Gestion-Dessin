import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import * as express from "express";
import { inject, injectable } from "inversify";
import * as logger from "morgan";
import { TYPES } from "./const/types";
import { ChannelRouter } from "./routes/channel.router";
import { AuthenticationRouter } from "./routes/authentication.router";
import { ProfileRouter } from "./routes/profile.router";
import { AlbumRouter } from "./routes/album-router";
import { LobbyRouter } from "./routes/lobby-router";
import { DrawingRouter } from "./routes/drawing-router";

@injectable()
export class Application {

    private readonly internalError: number = 500;
    public app: express.Application;

    public constructor(
        @inject(TYPES.AuthenticationRouter) private authenticationRouter: AuthenticationRouter,
        @inject(TYPES.ChannelRouter) private channelRouter: ChannelRouter,
        @inject(TYPES.ProfileRouter) private profileRouter: ProfileRouter,
        @inject(TYPES.AlbumRouter) private albumRouter: AlbumRouter,
        @inject(TYPES.DrawingRouter) private drawingRouter: DrawingRouter,
        @inject(TYPES.LobbyRouter) private lobbyRouter: LobbyRouter) {
        this.app = express();
        this.config();
        this.bindRoutes();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(logger("dev"));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    public bindRoutes(): void {
        // Notre application utilise le routeur de notre API
        this.app.use("/api", this.authenticationRouter.router);
        this.app.use("/api", this.channelRouter.router);
        this.app.use("/api", this.profileRouter.router);
        this.app.use("/api", this.albumRouter.router);
        this.app.use("/api", this.drawingRouter.router);
        this.app.use("/api", this.lobbyRouter.router);
        this.errorHandeling();
    }

    private errorHandeling(): void {
        // Gestion des erreurs
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: Error = new Error("Not Found");
            next(err);
        });

        // development error handler
        // will print stacktrace
        // if (this.app.get("env") === "development") {
        if (true) {   
        // tslint:disable-next-line:no-any
            this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        // tslint:disable-next-line:no-any
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}

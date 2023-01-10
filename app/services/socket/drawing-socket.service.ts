import { inject, injectable } from "inversify";
import * as socketIo from "socket.io";
import { TYPES } from "../../const/types";
import { ProfileDatabaseService } from "../database/profile-db.service";
import { DrawingDatabaseService } from "../firebase/drawing-db.service";

@injectable()
export class DrawingSocketService {

    private io: socketIo.Server;
    private connectedSockets : Map<string, string>; // socketId - drawingId
    public constructor(@inject(TYPES.DrawingDatabaseService)
    private drawingDatabaseService: DrawingDatabaseService,
    @inject(TYPES.ProfileDatabaseService)
        private profileDatabaseService: ProfileDatabaseService) {
    }
    
    public initializeSocket(io: socketIo.Server) : void { 
        this.io = io;
        this.listen();
        this.connectedSockets = new Map<string, string>();
    }
    
    private listen(): void {
        this.io.on('connection', (socket) => {
            this.onJoinDrawing(socket);
            this.onUpdateDrawing(socket);
            this.onLeaveDrawing(socket);
            this.onDisconnecting(socket);
            this.updateDrawingActionIndex(socket);
            this.updateDrawingAction(socket);
            this.deleteDrawingAction(socket);
        });
    }

    private onJoinDrawing(socket) : void {
        socket.on("join-drawing", async (username: string, drawingId: string) => {

            if (!await this.drawingDatabaseService.drawingExist(drawingId)) {
                this.io.to(socket.id).emit("join-drawing", "does not exist");
                return;
            }


            if (!await this.drawingDatabaseService.canJoinDrawing(drawingId)) {
                this.io.to(socket.id).emit("join-drawing", "player limit reached");
                return;
            }

            const userId = await this.profileDatabaseService.fetchIdByUsername(socket.username);
            this.profileDatabaseService.updateDrawingCount(userId);
            this.profileDatabaseService.updateStartDrawingTime(userId);

            // JOIN SOCKET ROOM
            console.log(`User ${username} has joined drawing ${drawingId}`);
            
            // Link socketId to drawingId
            this.connectedSockets.set(socket.id, drawingId);

            // GET ALL ACTIONS IN DRAWING
            const actions = await this.drawingDatabaseService.fetchActions(drawingId);
            this.io.to(socket.id).emit("join-drawing", actions);
            
            // Increase count of users currently editing
            this.drawingDatabaseService.updateDrawingUserCount(drawingId, '+');
        })
    }

    private onUpdateDrawing(socket) : void {
        socket.on("update-drawing", async (drawingId: string, action: any) => {
            const pushedAction = await this.drawingDatabaseService.addAction(drawingId, action);
            console.log(`drawing ${drawingId} has been updated`);
            this.io.in(drawingId).emit('update-drawing', pushedAction);
        });
    }

    private onDisconnecting(socket) : void {
        socket.on("disconnecting", async (_: any) => {

            // Decrease count of users currently editing
            const drawingId = this.connectedSockets.get(socket.id);
            if (drawingId) {
                this.drawingDatabaseService.updateDrawingUserCount(drawingId, '-');
                this.connectedSockets.delete(socket.id);
                const username = socket.username;
                    
                // emit leave drawing for drawing the user is currently editing
                console.log(`User ${username} has left drawing ${drawingId}`);
                socket.leave(drawingId);
            }
        });
    }

    private onLeaveDrawing(socket) : void {
        socket.on("leave-drawing", async (username: string, drawingId: string, bitmap: any) => {
            // Decrease count of users currently editing
            this.drawingDatabaseService.updateDrawingUserCount(drawingId, '-');

            //update drawing bitmap
            this.drawingDatabaseService.updateDrawingBitmap(drawingId, bitmap);

            this.connectedSockets.delete(socket.id);

            console.log(`User ${username} has left drawing ${drawingId}`);
            this.io.in(drawingId).emit("leave-drawing", username, drawingId);

            const userId = await this.profileDatabaseService.fetchIdByUsername(socket.username);
            await this.profileDatabaseService.updateDrawingTimeStats(userId);
            const drawingName = await this.drawingDatabaseService.getDrawingNameById(drawingId);
            await this.profileDatabaseService.updateDrawingEditHistory(userId, drawingId, drawingName);
        });
    }

    private updateDrawingActionIndex(socket) : void {
        socket.on("update-drawing-action-index", (drawingId: string, actionId: string, newIndex: string) => {
            this.drawingDatabaseService.updateDrawingActionIndex(drawingId, actionId,+newIndex).then(async () => {
                const actions = await this.drawingDatabaseService.fetchActions(drawingId);
                this.io.to(drawingId).emit("update-drawing-action-index", actions);
            })
        });
    }

    private updateDrawingAction(socket) : void {
        socket.on("update-drawing-action", async (drawingId: string, action: any) => {
            const updatedAction = await this.drawingDatabaseService.updateDrawingAction(drawingId, action);
            console.log(`action ${action._id} in drawing ${drawingId} has been updated`);
            this.io.to(drawingId).emit("update-drawing-action", updatedAction);
        });
    }

    private deleteDrawingAction(socket) : void {
        socket.on("delete-drawing-action", async (drawingId: string, actionId: number) => {
            const deletedActionId = await this.drawingDatabaseService.deleteDrawingAction(drawingId, actionId);
            console.log(`action ${actionId} in drawing ${drawingId} has been deleted`);
            this.io.to(drawingId).emit("delete-drawing-action", deletedActionId);
        });
    }
}
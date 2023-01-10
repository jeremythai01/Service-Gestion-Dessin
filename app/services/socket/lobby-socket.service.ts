import { inject, injectable } from "inversify";
import * as socketIo from "socket.io";
import { TYPES } from "../../const/types";
import { ProfileDatabaseService } from "../database/profile-db.service";
import { DrawingDatabaseService } from "../firebase/drawing-db.service";
import { LobbyDatabaseService } from "../firebase/lobby-db.service";
import { ConnectionSocketService } from "./connection-socket.service";

@injectable()
export class LobbySocketService {

    private io: socketIo.Server;
    private connectedSockets : Map<string, string>; // socketId - lobbyId
    public constructor(@inject(TYPES.DrawingDatabaseService)
    private drawingDatabaseService: DrawingDatabaseService,
    @inject(TYPES.LobbyDatabaseService)
    private lobbyDatabaseService: LobbyDatabaseService,
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
            this.onJoinLobby(socket);
            this.onLeaveLobby(socket);
            this.onDisconnecting(socket);
            this.onPlayerReady(socket);
            this.onStartDrawing(socket);
            this.onSendDrawing(socket);
            this.onStartCompetition(socket);
            this.onRateReady(socket);
            this.onSendRating(socket);
            this.onUpdateSettings(socket);
            this.onOwnerPlayAgain(socket);
        });
    }

    private onJoinLobby(socket) : void {
        socket.on("join-lobby", async (lobbyId: string, playerId: string) => {

            if (!await this.lobbyDatabaseService.lobbyExists(lobbyId)) {
                console.log("lobby does not exist on join-lobby");
                return;
            }
                
            if (!await this.lobbyDatabaseService.canJoinLobby(lobbyId)) {
                console.log("MAX PLAYERS REACHED");
                this.io.in(lobbyId).emit("join-lobby", null);
                return;
            } 

            const newPlayer = await this.lobbyDatabaseService.addPlayer(lobbyId, playerId);

            this.io.in(lobbyId).emit("add-player", newPlayer);

            // Link socketId to lobbyId
            this.connectedSockets.set(socket.id, lobbyId);

            // JOIN SOCKET ROOM*/
            console.log(`User ${socket.username} has joined lobby ${lobbyId}`);
            socket.join(lobbyId); // gets ignored if a user rejoin same lobby

            const updateLobby = await this.lobbyDatabaseService.getLobby(lobbyId);
            this.io.to(socket.id).emit("join-lobby", updateLobby);
        })
    }


    private onLeaveLobby(socket) : void {
        socket.on("leave-lobby", async (lobbyId: string, playerId: string) => {

            if (!await this.lobbyDatabaseService.lobbyExists(lobbyId)) {
                console.log("lobby does not exist on leave-lobby");
                return;
            }

            const lobby = await this.lobbyDatabaseService.getLobby(lobbyId);

            if (lobby == undefined) {
                console.log("getLobby failed on leave-lobby");
                return;
            }
                
            if (playerId == lobby.ownerId) {

                this.io.in(lobbyId).emit("leave-lobby", lobbyId);
                this.deleteLobby(lobbyId);
            } else {
                console.log(`User ${socket.username} has left lobby ${lobbyId}`);
                this.connectedSockets.delete(socket.id);
                await this.lobbyDatabaseService.removePlayer(lobbyId, playerId);
                await this.drawingDatabaseService.deleteCompetitionDrawingOfPlayer(lobbyId, playerId);
                this.io.in(lobbyId).emit("remove-player", playerId);
                socket.leave(lobbyId);
            }
        })
    }

    private onDisconnecting(socket) : void {
        socket.on("disconnecting", async (_: any) => {
            const lobbyId = this.connectedSockets.get(socket.id);
            if (lobbyId == undefined)
                return;

            if (!await this.lobbyDatabaseService.lobbyExists(lobbyId)) {
                console.log("lobby does not exist on disconnecting");
                return;
            }

            const playersStats = await this.lobbyDatabaseService.getAllPlayersStats(lobbyId);
            this.connectedSockets.delete(socket.id);

            const disconnectedPlayer = playersStats.find(player => player.username == socket.username);
            if (disconnectedPlayer == undefined) {
                console.log("ERROR DISCONNECTED PLAYER NOT FOUND")
                return;
            }

            const lobby = await this.lobbyDatabaseService.getLobby(lobbyId);

            if (lobby == undefined) {
                console.log("getLobby failed on disconnect");
                return;
            }

            if (disconnectedPlayer._id == lobby.ownerId) {                
                this.io.in(lobbyId).emit("leave-lobby", lobbyId);
                this.deleteLobby(lobbyId);
                
            } else {
                console.log(`User ${socket.username} has left lobby ${lobbyId}`);
                this.connectedSockets.delete(socket.id);
                socket.leave(lobbyId);
                await this.lobbyDatabaseService.removePlayer(lobbyId, disconnectedPlayer._id);
                await this.drawingDatabaseService.deleteCompetitionDrawingOfPlayer(lobbyId, disconnectedPlayer._id);
                this.io.in(lobbyId).emit("remove-player", disconnectedPlayer._id);
            }
        })
    }

    private async deleteLobby(lobbyId: string) : Promise<void> {

        if (!await this.lobbyDatabaseService.lobbyExists(lobbyId)) {
            console.log("lobby does not exist on delete the lobby");
            return;
        }

        console.log(`Host has deleted lobby ${lobbyId}`);

        // get sockets in room
        const clients = this.io.sockets.adapter.rooms.get(lobbyId);
        
        if (clients != undefined) {
            for (const clientId of clients) {
                //socket of each client in the room.
                const clientSocket = this.io.sockets.sockets.get(clientId);
                if (clientSocket != undefined) {
                    this.connectedSockets.delete(clientSocket.id);
                    clientSocket.leave(lobbyId);
                }
            }
        }
        this.lobbyDatabaseService.deleteLobby(lobbyId);
        
        // delete created drawings for this lobby
        await this.drawingDatabaseService.deleteCompetitionDrawings(lobbyId);            
    }

    private onPlayerReady(socket) : void {
        socket.on("player-ready", async (lobbyId: string, playerId: string, isReady: boolean) => {

            if (!await this.lobbyDatabaseService.lobbyExists(lobbyId)) {
                console.log("lobby does not exist on player-ready");
                return;
            }

            await this.lobbyDatabaseService.updatePlayerIsReady(lobbyId, playerId, isReady);

            this.io.in(lobbyId).emit("player-ready", playerId, isReady);
        })
    }

    private onUpdateSettings(socket) : void {
        socket.on("update-settings", async (lobbyId: string, drawTime: number, rateTime: number) => {

            if (!await this.lobbyDatabaseService.lobbyExists(lobbyId)) {
                console.log("lobby does not exist on update-settings");
                return;
            }

            await this.lobbyDatabaseService.updateLobbyDrawTime(lobbyId, drawTime);
            await this.lobbyDatabaseService.updateLobbyRateTime(lobbyId, rateTime);

            console.log("UPDATE TIME SETTINGS");
            this.io.in(lobbyId).emit("update-settings", +drawTime, +rateTime);
        })
    }


    private onStartCompetition(socket) : void {
        socket.on("start-competition", async (lobbyId: string) => {

            if (!await this.lobbyDatabaseService.lobbyExists(lobbyId)) {
                console.log("lobby does not exist on start-competition");
                return;
            }

            if (await !this.lobbyDatabaseService.canStartGame(lobbyId)){
                console.log("PLAYERS ARE NOT READY YET");
                return;
            }

            await this.lobbyDatabaseService.updateLobbyGameStarted(lobbyId, true);

            // get players stats
            const playersStats = await this.lobbyDatabaseService.getAllPlayersStats(lobbyId);

            // get sockets in room
            const clients = this.io.sockets.adapter.rooms.get(lobbyId);
            if (clients != undefined) {
                for (const clientId of clients) {
                    //socket of each client in the room.
                    const clientSocket : any = this.io.sockets.sockets.get(clientId);
                    if (clientSocket != undefined) {
                        // get playerId by username
                        const player = playersStats.find(player => player.username == clientSocket.username);
                        if (player != undefined) {
                            const drawingId = await this.drawingDatabaseService.addCompetitionDrawing(lobbyId, player._id);
                            console.log("START COMPETITION");
                            this.io.to(clientSocket.id).emit("start-competition", drawingId);
                        }
                    }
                }
            }      
        })
    }

    private onStartDrawing(socket): void {
        socket.on("start-drawing", async (lobbyId: string, drawingId: string) => {

            if (!await this.lobbyDatabaseService.lobbyExists(lobbyId)) {
                console.log("lobby does not exist on start-drawing");
                return;
            }

            //update drawing bitmap
            console.log("START DRAWING");

            // GET ALL ACTIONS IN DRAWING
            socket.join(drawingId);
            const actions = await this.drawingDatabaseService.fetchActions(drawingId);
            this.io.to(socket.id).emit("start-drawing", actions);
        });
    }

    private onSendDrawing(socket): void {
        socket.on("send-drawing", async (lobbyId: string, drawingId: string, bitmap: string) => {

            if (!await this.lobbyDatabaseService.lobbyExists(lobbyId)) {
                console.log("lobby does not exist on send-drawing");
                return;
            }
            //update drawing bitmap
            console.log("SEND DRAWING");
            this.drawingDatabaseService.updateDrawingBitmap(drawingId, bitmap);
            socket.leave(drawingId);
        });
    }


    private onRateReady(socket) : void {
        socket.on("rate-ready", async (lobbyId: string, playerId: string) => {

            if (!await this.lobbyDatabaseService.lobbyExists(lobbyId)) {
                console.log("lobby does not exist on rate-ready");
                return;
            }

            await this.lobbyDatabaseService.setPlayerIsRateReady(lobbyId, playerId, true);
            console.log(`${socket.username} is ready to rate`);
            // if all drawings are ready, we start rating them
            if (await this.lobbyDatabaseService.playersRateReady(lobbyId)) {

                console.log("ALL PLAYERS ARE READY TO START RATING")

                // get fist ratee id
                const rateeId = await this.lobbyDatabaseService.getNextRateeId(lobbyId);

                // get drawing bitmap of ratee
                const bitmap = await this.drawingDatabaseService.getCompetitionDrawingBitmapByPlayerId(lobbyId, rateeId);

                this.io.in(lobbyId).emit("rate-drawing", rateeId, bitmap);
            }
        });
    }

    private onSendRating(socket) : void {
        socket.on("send-rating", async (lobbyId: string, rateeId: string, score:number) => {

            if (!await this.lobbyDatabaseService.lobbyExists(lobbyId)) {
                console.log("lobby does not exist on send-rating");
                return;
            }

            console.log(`${socket.username} sent rating for ${rateeId}`);

            // update overall score for ratee
            await this.profileDatabaseService.updateCompetitionScore(rateeId, +score);

            // update game score of ratee
            await this.lobbyDatabaseService.updatePlayerScore(lobbyId, rateeId, +score);

            // update ratee rate count
            await this.lobbyDatabaseService.updatePlayerRateCount(lobbyId, rateeId);
           
           // if all ratings for all players have been added, show game results 
            if (await this.lobbyDatabaseService.isRatingOverForAllPlayers(lobbyId)) {
                console.log(`GAME ENDED`);
                // get player info
                const playersInfos = await this.lobbyDatabaseService.getAllPlayersStats(lobbyId);

                // add drawing bitmap for every player
                for (let player of playersInfos) {
                    player.bitmap = await this.drawingDatabaseService.getCompetitionDrawingBitmapByPlayerId(lobbyId, player._id);
                }

                // Save activity history for every remaining players
                await this.lobbyDatabaseService.saveAllPlayersCompetitionHistory(lobbyId); 


                // delete created drawings for this lobby
                await this.drawingDatabaseService.deleteCompetitionDrawings(lobbyId);

                this.io.in(lobbyId).emit("show-winner", playersInfos);
            }

            // if all ratings for ratee have been added, proceed with next ratee
            else if (await this.lobbyDatabaseService.isRatingOverForPlayer(lobbyId, rateeId)) {

                console.log(`changing ratee`);
                
                // get next ratee id
                const rateeId = await this.lobbyDatabaseService.getNextRateeId(lobbyId);
                if (rateeId == undefined){
                    console.log("ERROR no ratee Found");
                    return;
                }

                // get drawing bitmap of ratee
                const bitmap = await this.drawingDatabaseService.getCompetitionDrawingBitmapByPlayerId(lobbyId, rateeId);

                this.io.in(lobbyId).emit("rate-drawing", rateeId, bitmap);
            }
        })
    }

    private onOwnerPlayAgain(socket) : void {
        socket.on("owner-play-again", async (lobbyId: string) => {
            if (!await this.lobbyDatabaseService.lobbyExists(lobbyId)) {
                console.log("lobby does not exist on owner-play-again");
            }
            console.log(`${socket.username} want to play again`);

            // reset game data
            await this.lobbyDatabaseService.resetGameData(lobbyId);

            this.io.in(lobbyId).emit("owner-play-again", lobbyId);
            });
        }
}
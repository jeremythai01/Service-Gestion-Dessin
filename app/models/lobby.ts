import { IPlayer } from "./player";

export interface ILobby {
    _id: string;
    name: string;
    drawTime: number;
    rateTime: number;
    ownerId: string;
    maxPlayers: number;
    word: string;
    gameStarted: boolean;
    players: IPlayer[];
}
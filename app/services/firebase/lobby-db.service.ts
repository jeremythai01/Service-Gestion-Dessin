import { injectable, inject} from "inversify";
import { Status } from "../../const/status";
import { TYPES } from "../../const/types";
import { WORDS } from "../../const/words";
import { ILobby } from "../../models/lobby";
import { IHttpResponse } from "../../models/response";
import { ProfileDatabaseService } from "../database/profile-db.service";
import { lobbiesDB, admin } from "./config";

@injectable()
export class LobbyDatabaseService {

  public constructor(@inject(TYPES.ProfileDatabaseService)
  private profileDatabaseService: ProfileDatabaseService) {}

  private getRandomWord(): string {
    return WORDS[Math.floor(Math.random()*WORDS.length)];
  }

  private async lobbyNameExists(name: string) : Promise<boolean> {

    const response = await this.getLobbies();
    const lobbies = response.data;

    // no lobbies in db yet
    if (lobbies == null)
      return false;
    
    const lobby = lobbies.find(lobby => lobby.name == name);
    return lobby == undefined ? false : true;
  }

  public async lobbyExists(lobbyId: string) : Promise<boolean> {
    const snapshot = await lobbiesDB.ref().child(lobbyId).once("value");
    return snapshot.val() != null;
  }

  public async createLobby(lobby: ILobby): Promise<IHttpResponse>{

    if (await this.lobbyNameExists(lobby.name)) {
      const response: IHttpResponse = {
        status: Status.ALREADY_EXISTS,
        data: "lobby name already exists"
      }
      return response;
    }

    lobby.word = this.getRandomWord();
    lobby.players = [];

    return lobbiesDB
      .ref()
      .push(lobby)
      .then(async (childRef: any) => {          
        // update _id: no other way
        const generatedId = childRef.key;
        lobby._id = generatedId;
        childRef.child("_id").set(generatedId);

        const response: IHttpResponse = {
            status: Status.HTTP_OK,
            data: {_id: generatedId}
        };
        return response;
      })
      .catch((error: Error) => {
          throw error;
      });
  }

  public async getLobby(lobbyId: string): Promise<any> {
    const snapshot = await lobbiesDB.ref().child(lobbyId).once("value");

    if (snapshot.val() == null)
      return;
    const lobby: any = snapshot.val(); // removed id keys

    lobby.players = await this.getAllPlayersStats(lobbyId);



    for (let player of lobby.players) {
      player = this.getPlayerStats(player);
    }

    return lobby;
  }

  public async getLobbies() {
    const snapshot = await lobbiesDB.ref().once("value");

    if (snapshot.val() == null) {
      const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: null
      };
      return response;
    }

    const lobbies: any = Object.values(snapshot.val()); // removed id keys

    for (let lobby of lobbies) {
      lobby.players = await this.getAllPlayersStats(lobby._id);
    }

    const response: IHttpResponse = {
      status: Status.HTTP_OK,
      data: lobbies
    };

    return response;
  }

  public async canJoinLobby(lobbyId: string) {
    const currentNumPlayers = await this.getNumberPlayers(lobbyId);

    // fetch number of maximum players allowed
    const snapshot = await lobbiesDB.ref().child(lobbyId).child("maxPlayers").once("value");
    const maxPlayers = snapshot.val();

    return currentNumPlayers < maxPlayers;
  }

  public async deleteLobby(lobbyId: string): Promise<IHttpResponse>{
    return lobbiesDB
      .ref()
      .child(lobbyId)
      .remove()
      .then(() => {
        const response: IHttpResponse = {
            status: Status.HTTP_OK,
            data: {_id: lobbyId}
        };
        return response;
      })
      .catch((error: Error) => {
          throw error;
      });
  }

  // get username and avatar
  public async getPlayerStats(player: any): Promise<any> {
    const username = await this.profileDatabaseService.fetchUsernameById(player._id);
    const avatar = await this.profileDatabaseService.fetchAvatarById(player._id);
    
    player.username = username;
    player.avatar = avatar;

    return player;
  }

  public async getAllPlayersStats(lobbyId: string | undefined): Promise<any> {
    const snapshot = await lobbiesDB.ref().child(lobbyId).child("players").once('value');

    if (snapshot.val() == null)
      return [];

    const players = Object.values(snapshot.val()); // removed id keys 

    // sort by score
    players.sort((player1: any, player2: any) => {
      return player2.score - player1.score;
    });

    const result: any[] = [];
    for (const player of players) {
      result.push(await this.getPlayerStats(player));
    }
    return result;
  }

  private async playerNameExists(lobbyId: string, _id: string) : Promise<boolean> {

    const snapshot = await lobbiesDB.ref().child(lobbyId).child("players").once('value');

    if (snapshot.val() == null)
      return false;

    const players: any[] = Object.values(snapshot.val());// removed id keys

    const player = players.find(player => player._id == _id);
    return player == undefined ? false : true;
  }

  public async addPlayer(lobbyId: string, playerId: string) {   
    
    // if player rejoins a lobby (play again), delete their old stats
    if (await this.playerNameExists(lobbyId, playerId)) {
      await this.removePlayer(lobbyId, playerId);
    }

    return lobbiesDB
    .ref()
    .child(lobbyId)
    .child("players")
    .push({_id: playerId, score: 0, rateCount: 0, isReady: false, isRateReady: false})
    .then(async (childRef: any) => {
      const snapshot = await childRef.once("value");
      const addedPlayer = snapshot.val();
      return this.getPlayerStats(addedPlayer);
    });
  }

  public async removePlayer(lobbyId: string, playerId: string) {    

    const playerKey = await this.getKeyByPlayerId(lobbyId, playerId);
    if (playerKey == "") {
      console.log("WTF");
      return;
    }

    await lobbiesDB
    .ref()
    .child(lobbyId)
    .child("players")
    .child(playerKey)
    .remove();

    return playerId;
  }

  public async updateLobbyName(lobbyId: string, newLobbyName: string): Promise<IHttpResponse> {
    return lobbiesDB
    .ref()
    .child(lobbyId)
    .child("name")
    .set(newLobbyName);
  }

  public async updateLobbyDrawTime(lobbyId: string, newDrawTime: number): Promise<IHttpResponse> {
    return lobbiesDB
    .ref()
    .child(lobbyId)
    .child("drawTime")
    .set(newDrawTime)
  }

  public async updateLobbyRateTime(lobbyId: string, newRateTime: number): Promise<IHttpResponse> {
    return lobbiesDB
    .ref()
    .child(lobbyId)
    .child("rateTime")
    .set(newRateTime)
  }

  public async updateLobbyGameStarted(lobbyId: string, gameStarted: boolean): Promise<any> {
    return lobbiesDB
    .ref()
    .child(lobbyId)
    .child("gameStarted")
    .set(gameStarted);
  }

  public async getKeyByPlayerId(lobbyId, playerId: string): Promise<any> {
    
    const snapshots = 
    await lobbiesDB
    .ref()
    .child(lobbyId)
    .child("players")
    .orderByChild('_id')
    .equalTo(playerId).once('value');

    let key: string = "";
    snapshots.forEach((snapshot) => {
      const player = snapshot.val();
      if (player._id == playerId) {
        key = snapshot.key;
      }
    });

    return key;
  }

  public async updatePlayerScore(lobbyId: string, playerId: string, score: number): Promise<any> {
    const playerKey = await this.getKeyByPlayerId(lobbyId, playerId);
    if (playerKey == "")
      return;

    return lobbiesDB
    .ref()
    .child(lobbyId)
    .child("players")
    .child(playerKey)
    .child("score")
    .set(admin.database.ServerValue.increment(score));
  }

  public async updatePlayerIsReady(lobbyId: string, playerId: string, isReady: boolean): Promise<any> {
    const playerKey = await this.getKeyByPlayerId(lobbyId, playerId);
    if (playerKey == "")
      return;

    return lobbiesDB
    .ref()
    .child(lobbyId)
    .child("players")
    .child(playerKey)
    .child("isReady")
    .set(isReady);
  }

  public async setPlayerIsRateReady(lobbyId: string, playerId: string, isRateReady: boolean): Promise<any> {
    const playerKey = await this.getKeyByPlayerId(lobbyId, playerId);
    if (playerKey == "")
      return;

    return lobbiesDB
    .ref()
    .child(lobbyId)
    .child("players")
    .child(playerKey)
    .child("isRateReady")
    .set(isRateReady);
  }

  public async updatePlayerRateCount(lobbyId: string, playerId: string): Promise<any> {
    const playerKey = await this.getKeyByPlayerId(lobbyId, playerId);
    if (playerKey == "")
      return;

    return lobbiesDB
    .ref()
    .child(lobbyId)
    .child("players")
    .child(playerKey)
    .child("rateCount")
    .set(admin.database.ServerValue.increment(1));
  }

  public async canStartGame(lobbyId: string): Promise<boolean> {

    const numPlayers = await this.getNumberPlayers(lobbyId);
    const MIN_PLAYERS = 3;
    if (numPlayers < MIN_PLAYERS)
      return false;

    const snapshot = await lobbiesDB.ref().child(lobbyId).child("players").once('value');
    const players: any[] = Object.values(snapshot.val());// removed id keys

    for (let player of players) {
      if (!player.isReady)
        return false;
    }
    return true;
  }

  public async playersRateReady(lobbyId: string): Promise<boolean> {
    const snapshot = await lobbiesDB.ref().child(lobbyId).child("players").once('value');
    const players: any[] = Object.values(snapshot.val());// removed id keys

    for (let player of players) {
      if (!player.isRateReady) 
        return false;
    }
    return true;
  }

  // get id of first player in database whose drawing hasnt been rated yet
  public async getNextRateeId(lobbyId) {
    const snapshot = await lobbiesDB.ref().child(lobbyId).child("players").once('value');
    const players: any[] = Object.values(snapshot.val());// removed id keys

    for (const player of players) {
      if (player.rateCount == 0)
        return player._id;
    }

    // all players drawings have been rated
    return undefined;
  }

  public async isRatingOverForPlayer(lobbyId: string, rateeId: string): Promise<boolean> {
    const snapshot = await lobbiesDB.ref().child(lobbyId).child("players").once('value');
    const players: any[] = Object.values(snapshot.val());// removed id keys

    // check if player is still in lobby
    const playerExist = players.find(player => player._id == rateeId);
    if (playerExist == undefined)
      return true;

    // check if player with this condition was found
    const playerFound = players.find(player => player._id == rateeId && player.rateCount >= players.length);
  
    return playerFound != undefined;
  }

  public async isRatingOverForAllPlayers(lobbyId: string): Promise<boolean> {
    const snapshot = await lobbiesDB.ref().child(lobbyId).child("players").once('value');

    if (snapshot.val() == undefined)
      return true;

    const players: any[] = Object.values(snapshot.val());// removed id keys

    // check if player with this condition was found
    const player = players.find(player => player.rateCount < players.length);
  
    return player == undefined;
  }


  public async getNumberPlayers(lobbyId: string) {
    const snapshot = await lobbiesDB.ref().child(lobbyId).child("players").once("value");
    return snapshot.numChildren();
  }


  public async resetGameData(lobbyId: string) {
    await lobbiesDB.ref().child(lobbyId).child("players").set(null);

    await lobbiesDB.ref().child(lobbyId).child("word").set(this.getRandomWord());

    await this.updateLobbyGameStarted(lobbyId, false);
  }

  public async saveAllPlayersCompetitionHistory(lobbyId: string): Promise<any> {

    console.log(`Saving competition activity history for lobby ${lobbyId}`);
    const lobby = await this.getLobby(lobbyId);

    for (let i = 0; i < lobby.players.length; i++) {
      await this.profileDatabaseService.updateCompetitionHistory(lobby.players[i]._id, lobby.name, i + 1);
    }
  }

  public async getLeaderboard(): Promise<any> {
    return await this.profileDatabaseService.getCompetitionRankings();
  }
}
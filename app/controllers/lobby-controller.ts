import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IHttpResponse } from "../models/response";
import { TYPES } from "../const/types";
import { BaseController } from "./base.controller";
import { LobbyDatabaseService } from "../services/firebase/lobby-db.service";
import { ILobby } from "../models/lobby";
@injectable()
export class LobbyController extends BaseController {

  public constructor(
    @inject(TYPES.LobbyDatabaseService)
    private lobbyDatabaseService: LobbyDatabaseService) {
      super();
  }

  public async root(res: Response) : Promise<void> {
    const result = "Colorimage Lobby Database API";
    this.jsonRes(res, result);
  }

  public async createLobby(req: Request, res: Response): Promise<void> {
    const lobby : ILobby = req.body;
    this.lobbyDatabaseService
    .createLobby(lobby)
    .then((result: IHttpResponse) => {
        this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("createLobby failed");
      this.handleError(res, error);
    });
  }

  public async deleteLobby(req: Request, res: Response): Promise<void> {
    const lobbyId: string = req.query._id!.toString();
    this.lobbyDatabaseService
    .deleteLobby(lobbyId)
    .then((result: IHttpResponse) => {
        this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("deleteLobby failed");
      this.handleError(res, error);
    });
  }

  public async getLobbies(req: Request, res: Response): Promise<void> {
    this.lobbyDatabaseService
    .getLobbies()
    .then((result: any) => {
        this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("getLobbies failed");
      this.handleError(res, error);
    });
  }
  
  public async getLeaderboard(req: Request, res: Response): Promise<void> {
    this.lobbyDatabaseService
    .getLeaderboard()
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: any) => {
      console.log("getAlbums failed");
      this.handleError(res, error);
    });
  }
}

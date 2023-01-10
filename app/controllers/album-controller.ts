import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IHttpResponse } from "../models/response";
import { TYPES } from "../const/types";
import { BaseController } from "./base.controller";
import { AlbumDatabaseService } from "../services/database/album-db.service";
import { IAlbum } from "../models/album";
import { DrawingDatabaseService } from "../services/firebase/drawing-db.service";

@injectable()
export class AlbumController extends BaseController {

  public constructor(
    @inject(TYPES.AlbumDatabaseService)
    private albumDatabaseService: AlbumDatabaseService,
    @inject(TYPES.DrawingDatabaseService)
    private drawingDatabaseService: DrawingDatabaseService) {
      super();
  }

  public async root(res: Response) : Promise<void> {
    const result = "Colorimage Album Database API";
    this.jsonRes(res, result);
  }

  public async createAlbum(req: Request, res: Response): Promise<void> {
    const album: IAlbum = req.body;
    this.albumDatabaseService
    .createAlbum(album)
    .then((result: IHttpResponse) => {
        this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("createAlbum failed");
      this.handleError(res, error);
    });
  }

  public async deleteAlbum(req: Request, res: Response): Promise<void> {
    const albumId: string = req.query._id!.toString();
    this.albumDatabaseService
    .deleteAlbum(albumId)
    .then((result: IHttpResponse) => {
      this.drawingDatabaseService.deleteDrawingsInAlbum(albumId);
        this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("deleteAlbum failed");
      this.handleError(res, error);
    });
  }

  public async leaveAlbum(req: Request, res: Response): Promise<void> {
    const albumId = req.body._id;
    const userId = req.body.userId;
    this.albumDatabaseService
    .leaveAlbum(albumId, userId)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: any) => {
      console.log("leaveAlbum failed");
      this.handleError(res, error);
    });
  }

  public async getAlbums(req: Request, res: Response): Promise<void> {
    this.albumDatabaseService
    .getAlbums()
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: any) => {
      console.log("getAlbums failed");
      this.handleError(res, error);
    });
  }


  public async deleteAlbums(req: Request, res: Response): Promise<void> {
    this.albumDatabaseService
    .deleteAlbums()
    .then((result: IHttpResponse) => {
      this.drawingDatabaseService.deleteDrawings();
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("deleteAlbums failed");
      this.handleError(res, error);
    });
  }

  public async updateAlbumName(req: Request, res: Response): Promise<void> {
    const albumId = req.body._id;
    const newAlbumName = req.body.newAlbumName;
    this.albumDatabaseService
    .updateAlbumName(albumId, newAlbumName)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updateAlbumName failed");
      this.handleError(res, error);
    });
  }

  public async updateAlbumDescription(req: Request, res: Response): Promise<void> {
    const albumId = req.body._id;
    const newDescription = req.body.newDescription;
    this.albumDatabaseService
    .updateAlbumDescription(albumId, newDescription)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updateAlbumDescription failed");
      this.handleError(res, error);
    });
  }

  public async updateAlbumIsPrivate(req: Request, res: Response): Promise<void> {
    const albumId = req.body._id;
    const newIsPrivate = req.body.newIsPrivate;
    this.albumDatabaseService
    .updateAlbumIsPrivate(albumId, newIsPrivate)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updateAlbumIsPrivate failed");
      this.handleError(res, error);
    });
  }

  public async sendJoinRequest(req: Request, res: Response): Promise<void> {
    const albumId = req.body._id;
    const userId = req.body.userId;
    this.albumDatabaseService
    .sendJoinRequest(albumId, userId)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("sendJoinRequest failed");
      this.handleError(res, error);
    });
  }

  public async respondJoinRequest(req: Request, res: Response): Promise<void> {
    const albumId = req.body._id;
    const userId = req.body.userId;
    const response = req.body.accept;
    this.albumDatabaseService
    .respondJoinRequest(albumId, userId, response)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("respondJoinRequest failed");
      this.handleError(res, error);
    });
  }

  public async getAlbumWaitingList(req: Request, res: Response): Promise<void> {
    const albumId: string = req.query._id!.toString();
    this.albumDatabaseService
    .getAlbumWaitingList(albumId)
    .then((result: any) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("getAlbumWaitingList failed");
      this.handleError(res, error);
    });
  }

  public async filterDrawings(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const albumId = req.body.albumId;
    const filter = req.body.filter;
    const text = req.body.text;
    this.albumDatabaseService
    .filterDrawings(userId, albumId, filter, text)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("filterDrawings failed");
      this.handleError(res, error);
    });
  }
}

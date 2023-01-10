import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IHttpResponse } from "../models/response";
import { TYPES } from "../const/types";
import { BaseController } from "./base.controller";
import { DrawingDatabaseService } from "../services/firebase/drawing-db.service";
import { IDrawing } from "../models/drawing";

@injectable()
export class DrawingController extends BaseController {

  public constructor(
    @inject(TYPES.DrawingDatabaseService)
    private drawingDatabaseService: DrawingDatabaseService) {
      super();
  }

  public async root(res: Response) : Promise<void> {
    const result = "Colorimage Drawing Database API";
    this.jsonRes(res, result);
  }

  public async addDrawingInAlbum(req: Request, res: Response): Promise<void> {
    const drawing: IDrawing = req.body;
    this.drawingDatabaseService
    .addDrawingInAlbum(drawing)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("addDrawingInAlbum failed");
      this.handleError(res, error);
    });
  }

  public async deleteDrawingInAlbum(req: Request, res: Response): Promise<void> {
    const drawingId: string = req.query._id!.toString();
    this.drawingDatabaseService
    .deleteDrawingInAlbum(drawingId)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("deleteDrawingInAlbum failed");
      this.handleError(res, error);
    });
  }


  public async getDrawingsInAlbum(req: Request, res: Response): Promise<void> {
    const albumId: string = req.query._id!.toString();
    this.drawingDatabaseService
    .getDrawingsInAlbum(albumId)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("getDrawingsInAlbum failed");
      this.handleError(res, error);
    });
  }

  public async getExposedDrawingsInAlbum(req: Request, res: Response): Promise<void> {
    const albumId: string = req.query._id!.toString();
    this.drawingDatabaseService
    .getExposedDrawingsInAlbum(albumId)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("getExposedDrawingsInAlbum failed");
      this.handleError(res, error);
    });
  }

  public async updateDrawingAlbumId(req: Request, res: Response): Promise<void> {
    const drawingId = req.body._id;
    const newAlbumId = req.body.newAlbumId;
    this.drawingDatabaseService
    .updateDrawingAlbumId(drawingId, newAlbumId)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updateDrawingAlbumId failed");
      this.handleError(res, error);
    });
  }

  public async updateDrawingName(req: Request, res: Response): Promise<void> {
    const drawingId = req.body._id;
    const newDrawingName = req.body.newDrawingName;
    this.drawingDatabaseService
    .updateDrawingName(drawingId, newDrawingName)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updateDrawingName failed");
      this.handleError(res, error);
    });
  }

  public async updateDrawingPassword(req: Request, res: Response): Promise<void> {
    const drawingId = req.body._id;
    const newPassword = req.body.newPassword;
    this.drawingDatabaseService
    .updateDrawingPassword(drawingId, newPassword)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updateDrawingPassword failed");
      this.handleError(res, error);
    });
  }

  public async updateDrawingIsExposed(req: Request, res: Response): Promise<void> {
    const drawingId = req.body._id;
    const newIsExposed = req.body.newIsExposed;
    this.drawingDatabaseService
    .updateDrawingIsExposed(drawingId, newIsExposed)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updateDrawingIsExposed failed");
      this.handleError(res, error);
    });
  }

  public async updateDrawingIsProtected(req: Request, res: Response): Promise<void> {
    const drawingId = req.body._id;
    const newIsProtected = req.body.newIsProtected;
    this.drawingDatabaseService
    .updateDrawingIsProtected(drawingId, newIsProtected)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updateDrawingIsProtected failed");
      this.handleError(res, error);
    });
  }

  public async accessDrawing(req: Request, res: Response): Promise<void> {
    const drawingId = req.body._id;
    const sentPassword = req.body.sentPassword;
    this.drawingDatabaseService
    .accessDrawing(drawingId, sentPassword)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("accessDrawing failed");
      this.handleError(res, error);
    });
  }

  public async deleteDrawings(req: Request, res: Response): Promise<void> {
    this.drawingDatabaseService
    .deleteDrawings()
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("filterDrawings failed");
      this.handleError(res, error);
    });
  }
}
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IChannel } from "../models/channel";
import { IHttpResponse } from "../models/response";
import { ChannelDatabaseService } from "../services/database/channel-db.service";
import { TYPES } from "../const/types";
import { BaseController } from "./base.controller";

@injectable()
export class ChannelController extends BaseController {

  public constructor(
    @inject(TYPES.ChannelDatabaseService)
    private channelDatabaseService: ChannelDatabaseService) {
      super();
  }

  public async root(res: Response) : Promise<void> {
    const result = "Colorimage Channel Database API";
    this.jsonRes(res, result);
  }


  public async createChannel(req: Request, res: Response): Promise<void> {
    const channel: IChannel = req.body;
    this.channelDatabaseService
    .createChannel(channel)
    .then((result: IHttpResponse) => {
        this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("createChannel failed");
      this.handleError(res, error);
    });
  }

  public async deleteChannel(req: Request, res: Response): Promise<void> {
    const channelName: string = req.query.channelName!.toString();
    this.channelDatabaseService
    .deleteChannel(channelName)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("deleteChannel failed");
      this.handleError(res, error);
    });
  }

  public async getHistoryChannel(req: Request, res: Response): Promise<void> {
    const channelName: string = req.query.channelName!.toString();
    this.channelDatabaseService
    .getHistoryChannel(channelName)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("getHistoryChannel failed");
      this.handleError(res, error);
    });
  }

  public async getChannels(req: Request, res: Response): Promise<void> {
    this.channelDatabaseService
    .getChannels()
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: any) => {
      console.log("getChannels failed");
      this.handleError(res, error);
    });
  }

  public async deleteChannels(req: Request, res: Response): Promise<void> {
    this.channelDatabaseService
    .deleteChannels()
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("deleteChannels failed");
      this.handleError(res, error);
    });
  }
}

import { Response } from "express";
import { injectable } from "inversify";
import { Status } from "../const/status";
import { IHttpResponse } from "../models/response";
@injectable()
export abstract class BaseController {
  
  public jsonRes(res: Response, result: any) {
    res.status(200).json(result);
  }
  
  public handleError(res: Response, error: Error) : void {
    const response: IHttpResponse = {
      status: Status.HTTP_ERROR,
      data: error.stack,
    };
    res.status(Status.HTTP_ERROR).json(response);
  }

  public abstract root(res: Response): Promise<void>;
}
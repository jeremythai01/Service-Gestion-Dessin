import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IHttpResponse } from "../models/response";
import { IUser } from "../models/user";
import { AuthenticationDatabaseService } from "../services/database/authentication-db.service";
import { TYPES } from "../const/types";
import { BaseController } from "./base.controller";

@injectable()
export class AuthenticationController extends BaseController {

  public constructor(
    @inject(TYPES.AuthenticationDatabaseService)
    private authenticationDatabaseService: AuthenticationDatabaseService) {
      super();
  }

  public async root(res: Response) {
    const result = "Colorimage Authentication Database API";
    this.jsonRes(res, result);
  } 

  public async createUser(req: Request, res: Response): Promise<void> {
    const user: IUser = req.body;
    this.authenticationDatabaseService
    .createUser(user)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("createUser failed");
      this.handleError(res, error);
    });
  }

  public async loginUser(req: Request, res: Response): Promise<void> {
    const user: IUser = req.body;
    this.authenticationDatabaseService
    .loginUser(user)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("loginUser failed");
      this.handleError(res, error);
    });
  }

  public async deleteUsers(req: Request, res: Response): Promise<void> {
    this.authenticationDatabaseService
    .deleteUsers()
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("deleteUsers failed");
      this.handleError(res, error);
    });
  }
}
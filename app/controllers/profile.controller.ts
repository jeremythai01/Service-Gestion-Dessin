import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IHttpResponse } from "../models/response";
import { TYPES } from "../const/types";
import { BaseController } from "./base.controller";
import { ProfileDatabaseService } from "../services/database/profile-db.service";

@injectable()
export class ProfileController extends BaseController {

  public constructor(
    @inject(TYPES.ProfileDatabaseService)
    private profileDatabaseService: ProfileDatabaseService) {
      super();
  }

  public async root(res: Response) {
    const result = "Colorimage Profile Database API";
    this.jsonRes(res, result);
  } 


  public async getAvatars(req: Request, res: Response): Promise<void> {
    this.profileDatabaseService
    .getAvatars()
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("getAvatars failed");
      this.handleError(res, error);
    });
  }


  public async updateUsername(req: Request, res: Response): Promise<void> {
    const username = req.body.username;
    const newUsername = req.body.newUsername;
    this.profileDatabaseService
    .updateUsername(username, newUsername)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updateUsername failed");
      this.handleError(res, error);
    });
  }

  public async updatePassword(req: Request, res: Response): Promise<void> {
    const username = req.body.username;
    const newPassword = req.body.newPassword;
    this.profileDatabaseService
    .updatePassword(username, newPassword)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updatePassword failed");
      this.handleError(res, error);
    });
  }

  public async updateAvatar(req: Request, res: Response): Promise<void> {
    const userId = req.body._id;
    const newAvatar = req.body.newAvatar;
    this.profileDatabaseService
    .updateAvatar(userId, newAvatar)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updateAvatar failed");
      this.handleError(res, error);
    });
  }

  public async updatePrivacy(req: Request, res: Response): Promise<void> {
    const username = req.body.username;
    const newPrivacy = req.body.newPrivacy;
    this.profileDatabaseService
    .updatePrivacy(username, newPrivacy)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updatePrivacy failed");
      this.handleError(res, error);
    });
  }

  public async updateEmail(req: Request, res: Response): Promise<void> {
    const username = req.body.username;
    const newEmail = req.body.newEmail;
    this.profileDatabaseService
    .updateEmail(username, newEmail)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("updateEmail failed");
      this.handleError(res, error);
    });
  }

  public async getUserStats(req: Request, res: Response): Promise<void> {
    const userId: string = req.query._id!.toString();
    this.profileDatabaseService
    .getUserStats(userId)
    .then((result: IHttpResponse) => {
      this.jsonRes(res, result);
      })
    .catch((error: Error) => {
      console.log("getUserStats failed");
      this.handleError(res, error);
    });
  }
}
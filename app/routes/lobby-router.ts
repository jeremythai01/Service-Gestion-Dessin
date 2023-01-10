import { Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../const/types";
import { LobbyController } from "../controllers/lobby-controller";
import { ModelValidator } from "../middlewares/model.validator";
import { ModelLobbyValidationRule } from "../middlewares/model-lobby-validation.rule";

@injectable()
export class LobbyRouter {
  public router: Router;

  public constructor(
    @inject(TYPES.LobbyController)
    private lobbyController: LobbyController) {
      this.configureRouter();
  }
  
  private configureRouter(): void {
    this.router = Router();

    this.router.get("/lobbyAPI", (req: Request, res: Response) => { 
        this.lobbyController.root(res);
    });

    this.router.get("/getLobbies", (req: Request, res: Response) => { 
        this.lobbyController.getLobbies(req, res);
    });

    this.router.get("/getLeaderboard", (req: Request, res: Response) => { 
      this.lobbyController.getLeaderboard(req, res);
    });

    this.router.post("/createLobby", ModelLobbyValidationRule.createLobbyValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
        this.lobbyController.createLobby(req, res);
    });

    this.router.delete("/deleteLobby", ModelLobbyValidationRule.deleteLobbyValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.lobbyController.deleteLobby(req, res);
    });
  }
}
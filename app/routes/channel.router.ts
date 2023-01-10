import { Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { ChannelController } from "../controllers/channel.controller";
import { TYPES } from "../const/types";
import { ModelValidator } from "../middlewares/model.validator";
import { ModelChannelValidationRule } from "../middlewares/model-channel-validation.rule";

@injectable()
export class ChannelRouter {
  public router: Router;

  public constructor(
    @inject(TYPES.ChannelController)
    private channelController: ChannelController) {
      this.configureRouter();
  }
  
  private configureRouter(): void {
    this.router = Router();

    this.router.get("/channelAPI", (req: Request, res: Response) => { 
        this.channelController.root(res);
    });

    this.router.get("/getHistoryChannel", ModelChannelValidationRule.getHistoryChannelValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
        this.channelController.getHistoryChannel(req, res);
    });

    this.router.get("/getChannels", (req: Request, res: Response) => { 
        this.channelController.getChannels(req, res);
    });

    this.router.delete("/deleteChannel",  (req: Request, res: Response) => { 
      this.channelController.deleteChannel(req, res);
    });

    this.router.delete("/deleteChannels", (req: Request, res: Response) => { 
        this.channelController.deleteChannels(req, res);
    });

    this.router.post("/createChannel", ModelChannelValidationRule.createChannelValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.channelController.createChannel(req, res);
    });
  }
}
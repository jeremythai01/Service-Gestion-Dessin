import { Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../const/types";
import { AlbumController } from "../controllers/album-controller";
import { ModelAlbumValidationRule } from "../middlewares/model-album-validation.rule";
import { ModelDrawingValidationRule } from "../middlewares/model-drawing-validation.rule";

import { ModelValidator } from "../middlewares/model.validator";

@injectable()
export class AlbumRouter {
  public router: Router;

  public constructor(
    @inject(TYPES.AlbumController)
    private albumController: AlbumController) {
      this.configureRouter();
  }
  
  private configureRouter(): void {
    this.router = Router();

    /**************************** ALBUM ***********************************/

    this.router.get("/albumAPI", (req: Request, res: Response) => { 
        this.albumController.root(res);
    });

    this.router.get("/getAlbums", (req: Request, res: Response) => { 
        this.albumController.getAlbums(req, res);
    });

    this.router.get("/getAlbumWaitingList", ModelAlbumValidationRule.getAlbumWaitingListValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.albumController.getAlbumWaitingList(req, res);
    });

    this.router.delete("/deleteAlbum", ModelAlbumValidationRule.deleteAlbumValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.albumController.deleteAlbum(req, res);
    });

    this.router.delete("/deleteAlbums", (req: Request, res: Response) => { 
        this.albumController.deleteAlbums(req, res);
    });

    this.router.post("/createAlbum", ModelAlbumValidationRule.createAlbumValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.albumController.createAlbum(req, res);
    });

    this.router.post("/updateAlbumName", ModelAlbumValidationRule.updateAlbumNameValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
        this.albumController.updateAlbumName(req, res);
    });

    this.router.post("/updateAlbumDescription", ModelAlbumValidationRule.updateAlbumDescriptionValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
        this.albumController.updateAlbumDescription(req, res);
    });

    this.router.post("/updateAlbumIsPrivate", ModelAlbumValidationRule.updateAlbumIsPrivateValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.albumController.updateAlbumIsPrivate(req, res);
    });
    
    this.router.post("/sendJoinRequest", ModelAlbumValidationRule.sendJoinRequestValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.albumController.sendJoinRequest(req, res);
    });

    this.router.post("/respondJoinRequest", ModelAlbumValidationRule.sendJoinRequestValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.albumController.respondJoinRequest(req, res);
    });

    this.router.post("/leaveAlbum", ModelAlbumValidationRule.sendJoinRequestValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.albumController.leaveAlbum(req, res);
    });

    this.router.post("/filterDrawings", ModelDrawingValidationRule.filterDrawingsValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.albumController.filterDrawings(req, res);
    });
  }
}
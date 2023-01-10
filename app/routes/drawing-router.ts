import { Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../const/types";
import { DrawingController } from "../controllers/drawing-controller";
import { ModelDrawingValidationRule } from "../middlewares/model-drawing-validation.rule";
import { ModelValidator } from "../middlewares/model.validator";

@injectable()
export class DrawingRouter {
  public router: Router;

  public constructor(
    @inject(TYPES.DrawingController)
    private drawingController: DrawingController) {
      this.configureRouter();
  }
  
  private configureRouter(): void {
    this.router = Router();

    this.router.get("/drawingAPI", (req: Request, res: Response) => { 
        this.drawingController.root(res);
    });

    this.router.post("/addDrawingInAlbum", ModelDrawingValidationRule.addDrawingInAlbumValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.drawingController.addDrawingInAlbum(req, res);
    });

    this.router.delete("/deleteDrawingInAlbum", ModelDrawingValidationRule.deleteDrawingInAlbumValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.drawingController.deleteDrawingInAlbum(req, res);
    });

    this.router.delete("/deleteDrawings", (req: Request, res: Response) => { 
      this.drawingController.deleteDrawings(req, res);
  });

    this.router.get("/getDrawingsInAlbum", ModelDrawingValidationRule.getDrawingsInAlbumValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.drawingController.getDrawingsInAlbum(req, res);
    });

    this.router.get("/getExposedDrawingsInAlbum", ModelDrawingValidationRule.getExposedDrawingsInAlbumValidationRules(), ModelValidator.validate,  (req: Request, res: Response) => { 
      this.drawingController.getExposedDrawingsInAlbum(req, res);
    });

    this.router.post("/updateDrawingAlbumId", ModelDrawingValidationRule.updateDrawingAlbumIdValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.drawingController.updateDrawingAlbumId(req, res);
    });

    this.router.post("/updateDrawingName", ModelDrawingValidationRule.updateDrawingNameValidationRules(), ModelValidator.validate,  (req: Request, res: Response) => { 
      this.drawingController.updateDrawingName(req, res);
    });

    this.router.post("/updateDrawingPassword", ModelDrawingValidationRule.updateDrawingPasswordValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.drawingController.updateDrawingPassword(req, res);
    });

    this.router.post("/updateDrawingIsExposed", ModelDrawingValidationRule.updateDrawingIsExposedValidationRules(), ModelValidator.validate,  (req: Request, res: Response) => { 
      this.drawingController.updateDrawingIsExposed(req, res);
    });

    this.router.post("/updateDrawingIsProtected", ModelDrawingValidationRule.updateDrawingIsProtectedValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.drawingController.updateDrawingIsProtected(req, res);
    });

    this.router.post("/accessDrawing", ModelDrawingValidationRule.accessDrawingValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.drawingController.accessDrawing(req, res);
    });
  }
}
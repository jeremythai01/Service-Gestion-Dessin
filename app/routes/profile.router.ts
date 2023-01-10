import { Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../const/types";
import { ProfileController } from "../controllers/profile.controller";
import { ModelProfileValidationRule } from "../middlewares/model-profile-validation.rule";
import { ModelValidator } from "../middlewares/model.validator";


@injectable()
export class ProfileRouter {
  public router: Router;

  public constructor(
    @inject(TYPES.ProfileController)
    private profileController: ProfileController
    ) {
      this.configureRouter();
  }
  
  private configureRouter(): void {
    this.router = Router();

    this.router.get("/profileAPI", (req: Request, res: Response) => { 
        this.profileController.root(res);
    });

    this.router.get("/getAvatars", (req: Request, res: Response) => { 
      this.profileController.getAvatars(req, res);
    });

  this.router.get("/getUserStats", ModelProfileValidationRule.getUserStatsValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
    this.profileController.getUserStats(req, res);
  });

    this.router.post("/updateUsername", ModelProfileValidationRule.updateUsernameValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
        this.profileController.updateUsername(req, res);
    });

    this.router.post("/updatePassword", ModelProfileValidationRule.updatePasswordValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 

        this.profileController.updatePassword(req, res);
    });

    this.router.post("/updateAvatar", ModelProfileValidationRule.updateAvatarValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
      this.profileController.updateAvatar(req, res);
    });

    this.router.post("/updatePrivacy", ModelProfileValidationRule.updatePrivacyValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
        this.profileController.updatePrivacy(req, res);
    });

    this.router.post("/updateEmail", ModelProfileValidationRule.updateEmailValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
        this.profileController.updateEmail(req, res);
    });
  }
}
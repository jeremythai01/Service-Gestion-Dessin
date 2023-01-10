import { Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../const/types";
import { AuthenticationController } from "../controllers/authentication.controller";
import { ModelValidator } from "../middlewares/model.validator";
import { ModelAuthenticationValidationRule } from "../middlewares/model-authentication-validation.rule";

@injectable()
export class AuthenticationRouter {
  public router: Router;

  public constructor(
    @inject(TYPES.AuthenticationController)
    private authenticationController: AuthenticationController
    ) {
      this.configureRouter();
  }
  
  private configureRouter(): void {
    this.router = Router();

    this.router.get("/loginAPI", (req: Request, res: Response) => { 
        this.authenticationController.root(res);
    });

    this.router.post("/createUser", ModelAuthenticationValidationRule.createUserValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
        this.authenticationController.createUser(req, res);
    });

    this.router.post("/loginUser", ModelAuthenticationValidationRule.loginUserValidationRules(), ModelValidator.validate, (req: Request, res: Response) => { 
        this.authenticationController.loginUser(req, res);
    });

    this.router.delete("/deleteUsers",(req: Request, res: Response) => { 
      this.authenticationController.deleteUsers(req, res);
    });
  }
}
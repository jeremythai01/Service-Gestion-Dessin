import { Response, Request, NextFunction } from "express";
import { Status } from "../const/status";
import { IHttpResponse } from "../models/response";
const { validationResult } = require('express-validator/check');
export namespace ModelValidator {

  export function validate(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      handleInputError(res, errors);
    else 
      next();
  }

  function handleInputError(res: Response, errors) {
    const response: IHttpResponse = {
      status: Status.HTTP_UNPROCESSABLE_ENTITY,
      data: errors.array(),
    };
    res.status(Status.HTTP_UNPROCESSABLE_ENTITY).json(response);
  }
}
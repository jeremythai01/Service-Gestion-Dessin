const { body } = require('express-validator/check');

export namespace ModelAuthenticationValidationRule {
  
  export function createUserValidationRules() {
      return [
        body("username", "username is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("password", "password is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("avatar", "avatar is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("email", "email is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("privacy", "privacy is either unspecified or specified incorrectly").isIn([true, false]),
        body('isConnected', "isConnected is either unspecified or specified incorrectly").isIn([true, false])
      ]
    }
  
    export function loginUserValidationRules() {
      return [
        body("username", "username is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("password", "password is either unspecified or specified incorrectly").optional().isString().not().isEmpty(),
        body('avatar', "avatar is either unspecified or specified incorrectly").optional().isString(),
        body('isConnected', "isConnected is either unspecified or specified incorrectly").isIn([true, false])
      ]
    }
}
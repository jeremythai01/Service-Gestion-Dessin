const { body, query } = require('express-validator/check');
export namespace ModelProfileValidationRule {

      export function getUserStatsValidationRules() {
        return [
          query("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
      }
    
      export function updateUsernameValidationRules() {
        return [
          body("username", "username is either unspecified or specified incorrectly").isString().not().isEmpty(),
          body("newUsername", "newUsername is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
      }
      getUserStatsValidationRules
      export function updatePasswordValidationRules() {
        return [
          body("username", "username is either unspecified or specified incorrectly").isString().not().isEmpty(),
          body("newPassword", "newPassword is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
      }

      export function updateAvatarValidationRules() {
        return [
          body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
          body("newAvatar", "newAvatar is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
      }

      export function updatePrivacyValidationRules() {
        return [
          body("username", "username is either unspecified or specified incorrectly").isString().not().isEmpty(),
          body("newPrivacy", "newPrivacy is either unspecified or specified incorrectly").isIn([true, false])
        ]
      }

      export function updateEmailValidationRules() {
        return [
          body("username", "username is either unspecified or specified incorrectly").isString().not().isEmpty(),
          body("newEmail", "newEmail is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
      }
}
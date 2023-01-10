const { body } = require('express-validator/check');

export namespace ModelValidationRule {

    export function userValidationRules() {
        return [
          body("username", "username is either unspecified or specified incorrectly").isString(),
          body("password", "password is either unspecified or specified incorrectly").isString(),
          body("avatar", "avatar is either unspecified or specified incorrectly").isString(),
          body('isConnected', "isConnected is either unspecified or specified incorrectly").isIn([true, false])
        ]
      }
    
      export function channelValidationRules() {
        return [
          body("channelName", "channelName is either unspecified or specified incorrectly").isString(),
          body("hostUsername", "hostUsername is either unspecified or specified incorrectly").optional().isString(),
          body('messageHistory', "messageHistory is either unspecified or specified incorrectly").isArray()
        ]
      }
    
      export function updateUsernameValidationRules() {
        return [
          body("username", "username is either unspecified or specified incorrectly").isString(),
          body("newUsername", "newUsername is either unspecified or specified incorrectly").isString(),
        ]
      }

      export function updatePasswordValidationRules() {
        return [
          body("username", "username is either unspecified or specified incorrectly").isString(),
          body("newPassword", "newPassword is either unspecified or specified incorrectly").isString(),
        ]
      }

      export function updateAvatarValidationRules() {
        return [
          body("username", "username is either unspecified or specified incorrectly").isString(),
          body("newAvatar", "newAvatar is either unspecified or specified incorrectly").isString(),
        ]
      }

      export function updatePrivacyValidationRules() {
        return [
          body("username", "username is either unspecified or specified incorrectly").isString(),
          body("newPrivacy", "newPrivacy is either unspecified or specified incorrectly").isIn([true, false])
        ]
      }

      export function updateEmailValidationRules() {
        return [
          body("username", "username is either unspecified or specified incorrectly").isString(),
          body("newEmail", "newEmail is either unspecified or specified incorrectly").isString(),
        ]
      }

      export function albumValidationRules() {
        return [
          body("albumId", "albumId is either unspecified or specified incorrectly").isString(),
          body("password", "password is either unspecified or specified incorrectly").isString(),
          body("avatar", "avatar is either unspecified or specified incorrectly").isString(),
          body('isConnected', "isConnected is either unspecified or specified incorrectly").isIn([true, false])
        ]
      }
}
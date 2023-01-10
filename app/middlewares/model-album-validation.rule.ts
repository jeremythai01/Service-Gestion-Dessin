const { body, query } = require('express-validator/check');

export namespace ModelAlbumValidationRule {

    export function getAlbumWaitingListValidationRules() {
      return [
        query("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
      ]
    }
    
    export function deleteAlbumValidationRules() {
      return [
        query("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
      ]
    }

    export function createAlbumValidationRules() {
      return [
        body("albumName", "albumName is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("description", "description is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("ownerId", "ownerId is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body('membersId', "membersId is either unspecified or specified incorrectly").optional().isArray(),
        body('waitingList', "waitingList is either unspecified or specified incorrectly").optional().isArray(),
        body('containsExposedDrawings', "containsExposedDrawings is either unspecified or specified incorrectly").optional(),
        body("isPrivate", "isPrivate is either unspecified or specified incorrectly").isIn([true, false]),
      ]
    }

      export function updateAlbumNameValidationRules() {
        return [
          body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
          body("newAlbumName", "newAlbumName is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
      }

      export function updateAlbumDescriptionValidationRules() {
        return [
          body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
          body("newDescription", "newDescription is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
      }

      export function updateAlbumIsPrivateValidationRules() {
        return [
          body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
          body("newIsPrivate", "newIsPrivate is either unspecified or specified incorrectly").isIn([true, false]),
        ]
      }

      export function sendJoinRequestValidationRules() {
        return [
          body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
          body("userId", "userId is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
      }

      export function respondJoinRequestValidationRules() {
        return [
          body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
          body("userId", "userId is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
      }


      export function leaveAlbumValidationRules() {
        return [
          body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
          body("userId", "userId is either unspecified or specified incorrectly").isString().not().isEmpty()
        ]
      }
}
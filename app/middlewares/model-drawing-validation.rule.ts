const { body, query } = require('express-validator/check');

export namespace ModelDrawingValidationRule {

    export function addDrawingInAlbumValidationRules() {
      return [
        body("drawingName", "drawingName is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("albumId", "albumId is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("ownerId", "ownerId is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("password", "password is either unspecified or specified incorrectly").isString(),
        body("isProtected", "isProtected is either unspecified or specified incorrectly").isIn([true, false]),
        body("isExposed", "isExposed is either unspecified or specified incorrectly").isIn([true, false]),
        body("userCount", "userCount is either unspecified or specified incorrectly").isNumeric(),
        body("bitmap", "bitmap is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("createdAt", "createdAt is either unspecified or specified incorrectly").optional().isString(),
      ]
    }
    
    export function deleteDrawingInAlbumValidationRules() {
      return [
        query("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty()
      ]
    }

    export function getDrawingsInAlbumValidationRules() {
      return [
        query("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
      ]
    }

    export function getExposedDrawingsInAlbumValidationRules() {
        return [
            query("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
    }

    export function updateDrawingAlbumIdValidationRules() {
        return [
            body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
            body("newAlbumId", "newAlbumId is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
    }

    export function updateDrawingNameValidationRules() {
        return [
            body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
            body("newDrawingName", "newDrawingName is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
    }

    export function updateDrawingPasswordValidationRules() {
        return [
            body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
            body("newPassword", "newPassword is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
    }

    export function updateDrawingIsExposedValidationRules() {
        return [
            body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
            body("newIsExposed", "newIsExposed is either unspecified or specified incorrectly").isIn([true, false]),
        ]
    }

    export function updateDrawingIsProtectedValidationRules() {
        return [
            body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
            body("newIsProtected", "newIsProtected is either unspecified or specified incorrectly").isIn([true, false]),
        ]
    }

    export function accessDrawingValidationRules() {
        return [
            body("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
            body("sentPassword", "sentPassword is either unspecified or specified incorrectly").isString().not().isEmpty(),
        ]
    }

    export function filterDrawingsValidationRules() {
        return [
            body("userId", "userId is either unspecified or specified incorrectly").isString().not().isEmpty(),
            body("albumId", "albumId is either unspecified or specified incorrectly").isString(),
            body("text", "albumId is either unspecified or specified incorrectly").isString().not().isEmpty(),
            body("filter.drawingName", "filter.drawingName is either unspecified or specified incorrectly").isIn([true, false]),
            body("filter.ownerUsername", "filter.ownerUsername is either unspecified or specified incorrectly").isIn([true, false]),
            body("filter.createdAt", "filter.createdAt is either unspecified or specified incorrectly").isIn([true, false]),
            body("filter.ownerEmail", "filter.ownerEmail is either unspecified or specified incorrectly").isIn([true, false]),
        ]
    }
}
const { body, query } = require('express-validator/check');

export namespace ModelLobbyValidationRule {

    export function createLobbyValidationRules() {
      return [
        body("name", "name is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("ownerId", "ownerId is either unspecified or specified incorrectly").isString().not().isEmpty(),
        body("maxPlayers", "maxPlayers is either unspecified or specified incorrectly").isNumeric().not().isEmpty(),
        body("drawTime", "drawTime is either unspecified or specified incorrectly").isNumeric().not().isEmpty(),
        body("rateTime", "rateTime is either unspecified or specified incorrectly").isNumeric().not().isEmpty(),
        body("gameStarted", "gameStarted is either unspecified or specified incorrectly").isIn([true, false]),
      ]
    }
    
    export function deleteLobbyValidationRules() {
      return [
        query("_id", "_id is either unspecified or specified incorrectly").isString().not().isEmpty(),
      ]
    }
}
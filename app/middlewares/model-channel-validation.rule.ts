const { body, query } = require('express-validator/check');

export namespace ModelChannelValidationRule {

    export function createChannelValidationRules() {
        return [
            body("channelName", "channelName is either unspecified or specified incorrectly").isString().not().isEmpty(),
            body("hostUsername", "hostUsername is either unspecified or specified incorrectly").optional().isString(),
            body('messageHistory', "messageHistory is either unspecified or specified incorrectly").isArray()
        ]
    }

    export function getHistoryChannelValidationRules() {
        return [
            query("channelName", "channelName is either unspecified or specified incorrectly").isString().not().isEmpty()
        ]
    }
}
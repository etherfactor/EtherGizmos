const $UpdateClasses = require('./update-classes');

const Controller = new $UpdateClasses.UpdateController();

module.exports.Controller = Controller;

var update = new $UpdateClasses.Update()
    .SetFromApplication('@warframe-beta')
    .SetToApplication('@warframe')
    .AddReplacement(/@warframe-beta/g, '@warframe')
    .AddReplacement(/@WARFRAME_BETA/g, '@WARFRAME')
    .AddReplacement(/1081/g, '1080')
    .AddReplacement(/1444/g, '1443');

update.Run();
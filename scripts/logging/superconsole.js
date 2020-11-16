var Debug = false;
function SetDebug(debug) {
    Debug = debug;
}
module.exports.SetDebug = SetDebug;

const MessageLevel = {
    INFORMATION: 1,
    SUCCESS: 11,
    WARNING: 21,
    ERROR: 101,
    DEBUG: 201,
    ERROR_DEBUG: 202
}
module.exports.MessageLevel = MessageLevel;

const Colors = {
    reset:	"\x1b[0m",
    bright:	"\x1b[1m",
    dim:	"\x1b[2m",
    underscore:	"\x1b[4m",
    blink:	"\x1b[5m",
    reverse:	"\x1b[7m",
    hidden:	"\x1b[8m",
    black:	"\x1b[30m",
    red:	"\x1b[31m",
    green:	"\x1b[32m",
    yellow:	"\x1b[33m",
    blue:	"\x1b[34m",
    magenta:	"\x1b[35m",
    cyan:	"\x1b[36m",
    white:	"\x1b[37m",
    brightblack:	"\x1b[90m",
    brightred:	"\x1b[91m",
    brightgreen:	"\x1b[92m",
    brightyellow:	"\x1b[93m",
    brightblue:	"\x1b[94m",
    brightmagenta:	"\x1b[95m",
    brightcyan:	"\x1b[96m",
    brightwhite:	"\x1b[97m",
    bgblack:	"\x1b[40m",
    bgred:	"\x1b[41m",
    bggreen:	"\x1b[42m",
    bgyellow:	"\x1b[43m",
    bgblue:	"\x1b[44m",
    bgmagenta:	"\x1b[45m",
    bgcyan:	"\x1b[46m",
    bgwhite:	"\x1b[47m",
    bgbrightblack:	"\x1b[100m",
    bgbrightred:	"\x1b[101m",
    bgbrightgreen:	"\x1b[102m",
    bgbrightyellow:	"\x1b[103m",
    bgbrightblue:	"\x1b[104m",
    bgbrightmagenta:	"\x1b[105m",
    bgbrightcyan:	"\x1b[106m",
    bgbrightwhite:	"\x1b[107m"
}

const ColorRegex = /\$([\w,]+)(?::|{(.*?)})/s;

function log(level, message, ...optionalParams) {
    var allMessages = [message];
    allMessages = allMessages.concat(optionalParams);

    for (var a = 0; a < allMessages.length; a++)
    {
        if (typeof(allMessages[a]) != 'string')
            continue;

        /** @type {string} */
        var curMessage = allMessages[a];

        var prevReplacementColor = '';
        
        var result;
        while ((result = ColorRegex.exec(curMessage)) != undefined)
        {
            var colorNames = result[1].split(',');
            var colorText = result[2];

            var replacementColor = '';
            for (var i = 0; i < colorNames.length; i++)
            {
                var colorName = colorNames[i];
                replacementColor += Colors[colorName];
            }
            var replacement = '';

            if (replacementColor != undefined) {
                replacement += replacementColor;
                if (colorText == undefined) {
                    prevReplacementColor += replacementColor;
                }
            }

            if (colorText != undefined) {
                replacement += colorText + Colors.reset + prevReplacementColor;
            }

            curMessage = curMessage.substring(0, result.index) + replacement + curMessage.substring(result.index + result[0].length, curMessage.length);
        }

        allMessages[a] = curMessage + Colors.reset;
    }

    var timestamp = new Date().toTimeString().split(' ')[0];
    if (Debug || level == MessageLevel.DEBUG || level == MessageLevel.ERROR_DEBUG) {
        console.log(`[${timestamp}] @ ${global.__debug}:`, ...allMessages);
    } else {
        console.log(`[${timestamp}]:`, ...allMessages);
    }
}
module.exports.log = log;

module.exports.SetProperties =
(properties) => {
    Properties = properties;
}
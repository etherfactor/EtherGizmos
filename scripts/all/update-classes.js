const fs = require('fs');
const path = require('path');

/**
 * Keeps track of all upcoming updates.
 */
class UpdateController {
    constructor() {
        /** @type {Update[]} */
        this.Updates = [];
    }

    /**
     * 
     * @param {Update} update 
     */
    QueueUpdate(update) {
        this.Updates.push(update);
        return this;
    }
}
module.exports.UpdateController = UpdateController;

/**
 * A queued update, containing a run time and replacement information.
 */
class Update {
    constructor() {
        /** @type {string[]} */
        this.FromText = [];
        /** @type {string[]} */
        this.ToText = [];
    }

    /**
     * 
     * @param {Date} dateTime 
     */
    SetDateTime(dateTime) {
        this.DateTime = dateTime;
        return this;
    }

    /**
     * 
     * @param {string} application 
     */
    SetFromApplication(application) {
        this.FromApplication = application;
        return this;
    }

    /**
     * 
     * @param {string} application 
     */
    SetToApplication(application) {
        this.ToApplication = application;
        return this;
    }

    /**
     * 
     * @param {RegExp} fromRegex 
     * @param {string} toText 
     */
    AddReplacement(fromRegex, toText) {
        if (!(fromRegex instanceof RegExp))
            throw new Error('Argument fromRegex must be a regex!');

        if (typeof(toText) != 'string')
            throw new Error('Argument toText must be a string!');

        this.FromText.push(fromRegex);
        this.ToText.push(toText);

        return this;
    }

    /**
     * Handle the bin/apps, routes, scripts, styles, and views folders.
     */
    Run() {
        this.$_HandleRunDirectory('bin/apps');
        this.$_HandleRunDirectory('routes');
        this.$_HandleRunDirectory('scripts');
        this.$_HandleRunDirectory('styles');
        this.$_HandleRunDirectory('views');
    }

    /**
     * Handles replacements in a specified directory, recursively.
     * @param {string} name Name of the directory in the root directory.
     */
    $_HandleRunDirectory(name) {
        const MAIN = this;

        var fullPathName = path.join('../../', name, this.FromApplication);

        var files = $_GetAllFilesInDirectory(fullPathName);
        files.forEach(file => {
            var newFile = file.replace(MAIN.FromApplication, MAIN.ToApplication);

            var newDirectory = /.*[\\\/]/.exec(newFile)[0];
            fs.mkdirSync(newDirectory, { recursive: true });

            var fileData = fs.readFileSync(file, 'utf8');
            for (var i = 0; i < MAIN.FromText.length; i++)
            {
                var fromRegex = MAIN.FromText[i];
                var toText = MAIN.ToText[i];

                fileData = fileData.replace(fromRegex, toText);
            }

            fs.writeFileSync(newFile, fileData);
        });
    }
}
module.exports.Update = Update;

/**
 * Fetches all file names and paths in a directory, recursively.
 * @param {*} directory 
 * @returns {string[]}
 */
function $_GetAllFilesInDirectory(directory) {
    var thisDirFiles = [];
    var filesAndFolders = fs.readdirSync(directory);
    
    filesAndFolders.forEach(fileOrFolder => {
        console.log(fileOrFolder);
        var fileOrFolderPath = path.join(directory, fileOrFolder);
        var fileOrFolderStat = fs.lstatSync(fileOrFolderPath);
        if (fileOrFolderStat.isDirectory()) {
            var subPath = path.join(directory, fileOrFolder);
            thisDirFiles = thisDirFiles.concat($_GetAllFilesInDirectory(subPath));
        } else {
            thisDirFiles.push(fileOrFolderPath);
        }
    });

    return thisDirFiles;
}
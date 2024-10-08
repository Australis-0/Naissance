//ABRS - Requires fs; JSONPack for JSON compression features
{
  /*
    changeSaveDirectory() - Changes the default save directory to a defined path.
    arg0_path: (String) - The path string to change the save directory to.
  */
  function changeSaveDirectory (arg0_path) {
    //Convert from parameters
    var path = arg0_path;

    //Set global varaible
    global.ABRS_directory = path;
  }

  /*
    cleanCorruptFiles() - Cleans empty files and files that cannot be parsed to JSON.
    arg0_options: (Object)
      log: (Boolean) - Optional. Whether to log the backup array. True by default.
  */
  function cleanCorruptFiles (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Initialise options
    if (options.log == undefined) options.log = true;

    //Guard clause if ABRS_directory is not defined
    if (!global.ABRS_directory) {
      log.error(`cleanCorruptFiles() - global.ABRS_directory is not defined.`);
      return false;
    }

    //Clean empty files; clean invalid JSON
    cleanEmptyFiles(options);
    cleanInvalidJSONFiles(options);
  }

  /*
    cleanEmptyFiles() - Removes empty files in a directory.
    arg0_options: (Object)
      log: (Boolean) - Optional. Whether to log the cleanup. True by default.
  */
  function cleanEmptyFiles (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Initialise options
    if (options.log == undefined) options.log = true;

    //Guard clause if ABRS_directory is not defined
    if (!global.ABRS_directory) {
      log.error(`cleanEmptyFiles() - global.ABRS_directory is not defined.`);
      return false;
    }

    //Declare local instance variables
    var backup_files = loadDirectory(global.ABRS_directory);

    //Iterate over backup_files and test each one
    for (var i = 0; i < backup_files.length; i++) {
      var local_rawdata = fs.readFileSync(`${global.ABRS_directory}/${backup_files[i]}`);

      if (local_rawdata.toString().length == 0)
        try {
          if (options.log)
            log.info(`cleanEmptyFiles() - Deleted ${backup_files[i]} as it had nothing in it.`);
          fs.unlinkSync(backup_files[i]);

          backups_deleted++;
        } catch (e) {
          if (options.log)
            log.error(`cleanEmptyFiles() - Could not delete ${backup_files[i]}.`);
        }
    }

    //Reload backup array
    loadBackupArray();
  }

  /*
    cleanInvalidJSONFiles() - Removes corrupted JSON files from a directory.
    arg0_options: (Object)
      log: (Boolean) - Optional. Whether to log the backup array. True by default.
  */
  function cleanInvalidJSONFiles (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Initialise options
    if (options.log == undefined) options.log = true;

    //Guard clause if ABRS_directory is not defined
    if (!global.ABRS_directory) {
      log.error(`cleanEmptyFiles() - global.ABRS_directory is not defined.`);
      return false;
    }

    //Declare local instance variables
    var backup_files = loadDirectory(global.ABRS_directory);

    for (var i = 0; i < backup_files.length; i++) {
      var local_rawdata = fs.readFileSync(`${global.ABRS_directory}/${backup_files[i]}`);

      if (local_rawdata.toString().length != 0)
        try {
          //Check if JSON is valid
          JSON.parse(current_backup);
        } catch (error) {
          //Delete file
          if (options.log)
            log.info(`cleanInvalidJSONFiles() - Deleted ${backup_files[i]} as its JSON could not be parsed.`);
          fs.unlinkSync(backup_files[i]);
        }
    }
  }

  /*
    cleanEscapeStrings() - Cleans escape strings from a given string.
    arg0_string: (String) - The input string to pass to the function.

    Returns: (String)
  */
  function cleanEscapeStrings (arg0_string) {
    //Convert from parameters
    var string = arg0_string;

    //Declare local instance variables
    var pattern = /\\+"?/g;

    //Return statement
    return string.replace(pattern, "");
  }

  /*
    loadBackupArray() - Loads a backup array in chronological order
    arg0_options: (Object)
      log: (Boolean) - Optional. Whether to log the backup array. True by default.
  */
  function loadBackupArray (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Initialise options
    if (options.log == undefined) options.log = true;

    //Guard clause if ABRS_directory is not defined
    if (!global.ABRS_directory) {
      log.error(`loadBackupArray() - global.ABRS_directory is not defined.`);
      return false;
    }

    //Declare backup array
    global.backup_array = fs.readdirSync(global.ABRS_directory);
    global.backup_loaded = false;

    //Sort backup array in chronological order
    backup_array.sort(function(a, b) {
      try {
        return fs.statSync(global.ABRS_directory + a).mtime.getTime() - fs.statSync(global.ABRS_directory + b).mtime.getTime();
      } catch {}
    });

    //Reverse backup array to sort by most recent first
    backup_array = backup_array.reverse();

    //Print to console
    if (options.log)
      log.info(`loadBackupArray() - Backup Array: ${backup_array.join(", ")}`);
  }

  /*
    loadMostRecentSave() - Loads the most recent save in the current global.backup_array.
    arg0_options: (Same as loadSave())
  */
  function loadMostRecentSave (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Load save once reloading global.backup_array
    loadBackupArray();

    var file_path = `${global.ABRS_directory}/${global.backup_array[global.backup_array.length - 1]}`;

    //Load save
    loadSave(file_path, options);
  }

  //loadRequirements() - Loads requirements for ABRS
  function loadRequirements () {
    //Declare global requirements
    global.fs = require("fs");
    global.JSONPack = require("jsonpack");
  }

  /*
    loadSave() - Loads a save from a file into global.main, or initialises a custom function for it.
    arg0_file: (String) - The file name to attempt loading.
    arg1_options: (Object)
      compressed_json: (Boolean) - Optional. Whether compressed JSON is enabled. True by default
      db_file: (String) - Optional. The database path. 'database.js' by default
      load_object_function: (String) - Optional. The string variable address for the current load object function. Undefined by default, meaning objects will be loaded into global.main
  */
  function loadSave (arg0_file, arg1_options) {
    //Convert from parameters
    var file_path = arg0_file;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (options.compressed_json == undefined) options.compressed_json = true;
    if (options.db_file == undefined) options.db_file = "database.js";

    //Declare local instance variables
    var current_save = fs.readFileSync(file_path);

    if (current_save.toString().length != 0) {
      var is_valid_json;

      try {
  			JSON.parse(current_backup);
  			is_valid_json = true;
  		} catch (error) {
  			is_valid_json = false;
        log.error(`Error when parsing save file '${file_path}' ...`);
  		}

      //Load backup if a backup is detected as valid JSON
      if (is_valid_json) {
        var file_string = backup_array[i];
        global.backup_loaded = true;

        //Overwrite database file with new backup file
        log.info(`Loading file '${file_path}' ...`);
  			fs.copyFile(file_path, options.db_file, (err) => {
          if (err) throw err;
        });

        setTimeout(function(){
          //Load data from new database.js
          rawdata = fs.readFileSync(options.db_file);

          var decompressed_json = (options.compressed_json) ?
            JSONPack.unpack(rawdata.toString()) :
            JSON.parse(rawdata.toString());

          //options.load_object_function handler
          if (options.load_object_function) {
            global[options.load_object_function](decompressed_json);
          } else {
      		  global.main = decompressed_json;
          }
        }, 1000);
      }
    }
  }

  /*
    returnABRSDateString() - Returns the current date as an ABRS debug string.
    Returns: (String)
  */
  function returnABRSDateString () {
    //Declare local instance Variables
    var d = new Date();
    var hour_prefix = (d.getHours() < 10) ? "0" : "",
      minute_prefix = (d.getMinutes() < 10) ? "0" : "",
      second_prefix = (d.getSeconds() < 10) ? "0" : "";

    //Return statement
    return `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()} ${hour_prefix}${d.getHours()}.${minute_prefix}${d.getMinutes()}.${second_prefix}${d.getSeconds()}`;
  }

  /*
    writeDB() - Writes the DB to a current file.
    arg0_options: (Object)
      log: (Boolean) -  Optional. Whether to log the backup array. True by default.
  */
  function writeDB (arg0_file, arg1_options) {
    //Convert from parameters
    var file_path = (arg0_file) ? arg0_file : "database.js";
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (options.log == undefined) options.log = true;

    //Write DB
    try {
    	fs.writeFile(file_path, JSON.stringify(main), function (err, data) {
    		if (err) return log.info(err);
    	});
    } catch (e) {
      if (options.log)
        log.error(`Ran into an error whilst attempting to save to database.js! ${e}.`);
      console.log(e);
    }
  }

  /*
    writeSave() - Writes a save to backups folder.
    arg0_options: (Object)
      do_not_clean_escapes: (Boolean) - Optional. Whether to clear escapes. False by default.
      file_limit: (Number) - Optional. The amount of backups to keep
      save_object_function: (String) - The string variable address for the current save object function.
  */
  function writeSave (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Guard clauses
    if (!global.ABRS_directory) {
      log.error(`writeSave() - global.ABRS_directory is not defined.`);
      return false;
    }
    if (!options.save_object_function)
      log.error(`writeSave() - options.save_object_function must be defined.`);

    //Declare local instance variables
    var file_path = `${global.ABRS_directory}/${returnABRSDateString()}.txt`;
    var string_json = JSON.stringify(global[options.save_object_function]());

    if (!options.do_not_clean_escapes)
      string_json = cleanEscapeStrings(string_json);

    //Write to file if JSON is not defined
    if (string_json.length != 0) {
      //Initialise file first
      var create_backup = fs.createWriteStream(file_path);
      create_backup.end();

      //Write to new file
      fs.writeFile(file_path, string_json, function (err, data) {
        if (err) return log.error(err);
      });
    } else {
      loadMostRecentSave();
    }

    //Make sure total amount of files complies with current options.file_limit
    if (options.file_limit) {
      loadBackupArray();
      var total_backups = backup_array;

      //Delete oldest file from backup_array if limit is exceeded
      if (total_backups.length > file_limit) try {
        var backups_deleted = 0;
        var backups_to_delete = total_backups.length - file_limit;

        //Loop over total_backups in reverse
        for (var i = total_backups.length - 1; i >= 0; i--)
          if (backups_deleted < backups_to_delete) {
            log.info(`Deleted ${total_backups[i]} as it exceeded the set limit of ${file_limit} simultaneous backups.`);
            fs.unlinkSync(`./backups/${total_backups[i]}`);

            backups_deleted++;
          } else {
            //Check file size
            var local_file_stats = fs.statSync(`./backups/${total_backups[i]}`);

            if (local_file_stats.size == 0) {
              log.info(`Deleted ${total_backups[i]} as it had nothing in it.`);
              fs.unlinkSync(`./backups/${total_backups[i]}`);
            }
          }
      } catch (e) {
        log.error(`Could not delete excess backup file!`);
        console.log(e);
      }
    }

    //Reload backup array
    loadBackupArray();
  }
}

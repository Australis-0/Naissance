//Basic files - Requires path and fs to function.

/*
  getAllFiles() - Fetches an array of all files in a given folder.
  arg0_folder: (String) - The folder path.
  
  Returns: (Array<String, ...>)
*/
function getAllFiles (arg0_folder) {
  //Convert from parameters
  var folder = arg0_folder;

  //Declare local instance variables
  var file_array = [];

    try {
      var files = fs.readdirSync(folder);

      for (var i = 0; i < files.length; i++) {
        //Self-reference to fetch files in sub-directories
        local_dir_array = (fs.statSync(folder + "/" + files[i]).isDirectory()) ? module.exports.getAllFiles(folder + "/" + files[i]) : file_array.push(path.join(folder, "/", files[i]));

        //Add files from local_dir_array to file_array
        for (var x = 0; x < local_dir_array.length; x++)
          file_array.push(local_dir_array[x]);
      }
    } catch (e) {
      console.log(e);
    }

    //Return statement
    return file_array;
}

/*
  importFile() - Imports a Node.js file.
  arg0_require_obj: (String) - The file path to import.
*/
function importFile (arg0_require_obj) {
  //Convert from parameters
  var local_library = require(arg0_require_obj);

  //Add to global namespace
  var all_properties_in_library = Object.keys(local_library);

  for (var i = 0; i < all_properties_in_library.length; i++)
    global[all_properties_in_library[i]] = local_library[all_properties_in_library[i]];
}

/*
  loadDirectory() - Loads the files in an immediate directory in chronological order.
  arg0_folder: (String) - The directory to load.
  arg1_options: (Object)
    reverse: (Boolean) - Optional. Whether to reverse it or not. True by default.
*/
function loadDirectory (arg0_folder, arg1_options) {
  //Convert from parameters
  var folder = arg0_folder;
  var options = (arg1_options) ? arg1_options : {};

  //Initialise options
  if (options.reverse == undefined) options.reverse = true;

  //Declare local instance variables
  var folder_array = fs.readdirSync(folder);

  //Sort folder_array in chronological order
  folder_array.sort(function(a, b) {
    try {
      return fs.statSync(folder + a).mtime.getTime() - fs.statSync(folder + b).mtime.getTime();
    } catch {}
  });

  //Reverse folder_array to most recent first
  if (options.reverse)
    folder_array = folder_array.reverse();

  //Return statement
  return folder_array;
}

//loadConfig()
function loadConfig () {
  //Declare local instance variables
  var loaded_files = [];

  //Load config backend files individually first
  if (global.load_order) {
    var local_load_order = global.load_order.load_files;

    for (var i = 0; i < local_load_order.length; i++) {
      for (var x = 0; x < load_order.load_directories.length; x++) {
        var local_dir = load_order.load_directories[x];
        var all_directory_files = getAllFiles(local_dir);

        for (var y = 0; y < all_directory_files.length; y++) if (all_directory_files[y].includes(local_load_order[i])) {
          loadFile(all_directory_files[y]);
          loaded_files.push(local_load_order[i]);
          log.info(`Loaded imperative file ${all_directory_files[y]}.`);
        }
      }
    }

    //Load each load directory separately
    for (var i = 0; i < load_order.load_directories.length; i++) {
      var local_dir = load_order.load_directories[i];
      var all_directory_files = getAllFiles(local_dir);

      for (var x = 0; x < all_directory_files.length; x++) if (!loaded_files.includes(all_directory_files[x])) {
        loadFile(all_directory_files[x]);
        loaded_files.push(all_directory_files[x]);
      }
    }

    log.info(`Loaded ${loaded_files.length} files from ${load_order.load_directories.length} directories.`);
  } else {
    console.log(`No load order is defined.`);
  }
}

/*
  loadFile() - Loads a file, similar to import but with eval.
  arg0_file: (String) - The file path to load.
*/
function loadFile (arg0_file) {
  //Convert from parameters
  var file_path = path.join(__dirname, "..", arg0_file);

  //Evaluate file contents
  try {
    var rawdata = fs.readFileSync(file_path);
    eval(rawdata.toString());
  } catch (e) {
    log.error(`Failed to load ${file_path}.`);
    console.log(e);
  }
}

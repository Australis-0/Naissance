//Declare functions

//Listener events
document.getElementById("load-file").onclick = function (e) {
  var load_file_name_el = document.getElementById("load-file-path");

  var load_file_name = load_file_name_el.value;

  //Process load_file_name
  load_file_name = load_file_name.split("\\");
  load_file_name = load_file_name[load_file_name.length - 1].replace(".js", "");

  loadSave(load_file_name);
};
document.getElementById("save-file").onclick = function (e) {
  var save_file_name_el = document.getElementById("save-file-name");

  var save_file_name = save_file_name_el.value;

  //Write save
  writeSave((save_file_name.length > 0) ? save_file_name : "save");
};

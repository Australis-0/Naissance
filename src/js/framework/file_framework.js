function saveData (arg0_data, arg1_filename) {
  //Convert from parameters
  var data = arg0_data;
  var filename = arg1_filename;

  //Declare local instance variables
  var a = document.createElement("a");
  var blob = new Blob([data], { type: "text/obj" });
  var e = document.createEvent("MouseEvents");

  if (!filename) filename = "save.geojson";

  if (typeof data == "object")
    data = JSON.stringify(data, undefined, 4);

  //Open save as dialog
  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ["text/obj", a.download, a.href].join(":");
  e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  a.dispatchEvent(e);
}

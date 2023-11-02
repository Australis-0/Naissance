//Declare functions
function loadSave (arg0_file_name) {
  //Convert from parameters
  var file_name = arg0_file_name;

  //Declare local instance variables
  var save_data = JSON.parse(fs.readFileSync(`./saves/${file_name}.js`, "utf8"));

  //Clear map
  clearMap();

  //Load all layers for window.layers array
  var all_save_data_keys = Object.keys(save_data);
  window.layers = [];

  for (var i = 0; i < all_save_data_keys.length; i++)
    if (!all_save_data_keys[i].includes("_groups"))
      layers.push(all_save_data_keys[i]);

  //Populate all layers
  for (var i = 0; i < layers.length; i++) {
    var local_layer = window[`${layers[i]}_layer`];

    //Load layer entities
    for (var x = 0; x < save_data[layers[i]].length; x++)
      local_layer.push(
        L.polygon(save_data[layers[i]][x].coords, save_data[layers[i]][x].options)
      );

    //Load layer groups
    if (save_data[`${layers[i]}_groups`])
      window[`${layers[i]}_groups`] = save_data[`${layers[i]}_groups`];
  }

  //Render all polities and units
  renderEntities();
  refreshSidebar();
  loadDate();
}

function writeSave (arg0_file_name) {
  //Convert from parameters
  var file_name = arg0_file_name;

  //Declare local instance variables
  var save_data = {};

  //Iterate over all layers and save
  for (var i = 0; i < layers.length; i++) {
    var local_layer = window[`${layers[i]}_layer`];

    //Initialise save_data[${layers[i]}]
    save_data[layers[i]] = [];

    for (var x = 0; x < local_layer.length; x++) {
      var local_entity = local_layer[x];

      //Process .options.history, clean keyframes
      local_layer[x] = cleanKeyframes(local_layer[x], undefined, {
        do_not_display: true
      });

      save_data[layers[i]].push({
        coords: convertToNaissance(local_layer[x]._latlngs),
        options: local_layer[x].options
      });
    }

    //Save layer groups
    save_data[`${layers[i]}_groups`] = window[`${layers[i]}_groups`];
  }

  //Write save_data to file
  fs.writeFileSync(`./saves/${file_name}.js`, JSON.stringify(save_data), function (err, data) {
    if (err) return log.error(err);
  });
}

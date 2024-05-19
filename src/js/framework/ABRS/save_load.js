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
  main.all_layers = [];

  for (var i = 0; i < all_save_data_keys.length; i++)
    if (!all_save_data_keys[i].includes("_groups"))
      main.all_layers.push(all_save_data_keys[i]);

  //Populate all layers
  for (var i = 0; i < main.all_layers.length; i++) {
    var local_layer = main.layers[main.all_layers[i]];

    //Load layer entities
    for (var x = 0; x < save_data[main.all_layers[i]].length; x++)
      local_layer.push(
        L.polygon(save_data[main.all_layers[i]][x].coords, save_data[main.all_layers[i]][x].options)
      );

    //Load layer groups
    if (save_data[`${main.all_layers[i]}_groups`])
      main.groups[main.all_layers[i]] = save_data[`${main.all_layers[i]}_groups`];
  }

  //Render all polities and units
  renderEntities();
  refreshSidebar();
  loadDate();

  //Load Brush option save
  for (var i = 0; i < main.all_layers.length; i++) {
    var local_groups = main.groups[main.all_layers[i]];

    var all_local_groups = Object.keys(local_groups);

    for (var x = 0; x < all_local_groups.length; x++) {
      var local_group = local_groups[all_local_groups[x]];

      if (local_group.mask)
        addGroupMask(all_local_groups[x], local_group.mask);
    }
  }
}

function writeSave (arg0_file_name) {
  //Convert from parameters
  var file_name = arg0_file_name;

  //Declare local instance variables
  var save_data = {};

  //Iterate over all layers and save
  for (var i = 0; i < main.all_layers.length; i++) {
    var local_layer = main.layers[main.all_layers[i]];

    //Initialise save_data[${layers[i]}]
    save_data[main.all_layers[i]] = [];

    for (var x = 0; x < local_layer.length; x++) {
      var local_entity = local_layer[x];

      //Process .options.history, clean keyframes
      local_layer[x] = cleanKeyframes(local_layer[x], undefined, {
        do_not_display: true
      });

      save_data[main.all_layers[i]].push({
        coords: convertToNaissance(local_layer[x]._latlngs),
        options: local_layer[x].options
      });
    }

    //Save layer groups
    save_data[`${main.all_layers[i]}_groups`] = main.groups[main.all_layers[i]];
  }

  //Write save_data to file
  fs.writeFileSync(`./saves/${file_name}.js`, JSON.stringify(save_data), function (err, data) {
    if (err) return log.error(err);
  });
}

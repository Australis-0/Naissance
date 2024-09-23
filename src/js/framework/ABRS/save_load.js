//Declare functions
{
  function loadSave (arg0_file_name) {
    //Convert from parameters
    var file_name = arg0_file_name;

    //Declare local instance variables
    var save_data = JSON.parse(fs.readFileSync(`./saves/${file_name}.js`, "utf8"));

    //Clear map
    clearMap();

    //Load all entities
    main.entities = [];
    main.groups = {};

    //Push new entities
    for (var i = 0; i < save_data.entities.length; i++) {
      var local_options = JSON.parse(JSON.stringify(save_data.entities[i].options));

      //Make sure entity when pushed is not displayed
      local_options.do_not_display = true;
      var local_polygon = createPolygon(save_data.entities[i].coords, local_options);
      main.entities.push(local_polygon);
    }

    //Load groups
    if (save_data.groups)
      main.groups = save_data.groups;

    //Load data into hierarchies
    main.hierarchies.hierarchy = {
      groups: main.groups,
      entities: main.entities
    };

    //Render all polities and units
    loadDate();
  }

  function writeSave (arg0_file_name) {
    //Convert from parameters
    var file_name = arg0_file_name;

    //Declare local instance variables
    var save_data = {};

    //Iterate over all main.entities and save
    save_data.entities = [];

    for (var i = 0; i < main.entities.length; i++) {
      var local_entity = main.entities[i];

      //Process .options.history, clean keyframes
      main.entities[i] = cleanKeyframes(local_entity, undefined, {
        do_not_display: true
      });
      save_data.entities.push({
        coords: convertToNaissance(local_entity._latlngs),
        options: local_entity.options
      });
    }

    //Save .groups
    main.groups = exportHierarchies({ naissance_hierarchy: "hierarchy" }).hierarchy.groups;
    save_data.groups = main.groups;

    //Write save_data to file
    fs.writeFileSync(`./saves/${file_name}.js`, JSON.stringify(save_data), function (err, data) {
      if (err) return log.error(err);
    });
  }
}

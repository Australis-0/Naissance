//Add event listeners
map.on("zoom", function (e) {
  var zoom_level = e.target._zoom;

  for (var i = 0; i < layers.length; i++) {
    var local_layer = window[`${layers[i]}_layer`];

    for (var x = 0; x < local_layer.length; x++) {
      var local_entity_maximum_zoom = getEntityProperty(local_layer[x], "maximum_zoom_level", window.date);
      var local_entity_minimum_zoom = getEntityProperty(local_layer[x], "minimum_zoom_level", window.date);
      var entity_meets_requirements = false;

      //Check if entity meets zoom requirements
      if (!local_entity_minimum_zoom) local_entity_minimum_zoom = 0;
      if (!local_entity_maximum_zoom) local_entity_maximum_zoom = 1000;

      //Add/remove to/from map based on whether entity meets curent zoom requirements
      if (zoom_level >= local_entity_minimum_zoom && zoom_level <= local_entity_maximum_zoom) {
        if (!map.hasLayer(local_layer[x]))
          local_layer[x].addTo(map);
      } else {
        local_layer[x].removeFrom(map);
      }
    }
  }
});

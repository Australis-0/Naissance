//Add event listeners
map.on("zoom", function (e) {
  //Declare local instance variables
  var brush_obj = main.brush;
  var local_render_order = getHierarchyRenderingOrder({ exclude_selection: true });
  var zoom_level = e.target._zoom;

  //Remove all local_layer entities from map
  for (var i = 0; i < main.entities.length; i++)
    main.entities[i].removeFrom(map);

  //Renders need to happen in local_render_order; so iterate over that instead
  for (var i = 0; i < local_render_order.length; i++) {
    var local_entity = getEntity(local_render_order[i]);

    if (local_entity) {
      var local_entity_maximum_zoom = getEntityProperty(local_entity, "maximum_zoom_level", main.date);
      var local_entity_minimum_zoom = getEntityProperty(local_entity, "minimum_zoom_level", main.date);

      var entity_meets_requirements = false;

      //Check if entity meets zoom requirements
      if (!local_entity_minimum_zoom) local_entity_minimum_zoom = 0;
      if (!local_entity_maximum_zoom) local_entity_maximum_zoom = 1000;

      //Add/remove to/from map based on whether entity meets curent zoom requirements
      if (zoom_level >= local_entity_minimum_zoom && zoom_level <= local_entity_maximum_zoom)
        if (!map.hasLayer(local_entity)) {
          var entity_id = local_entity.options.className;

          if (entity_id != brush_obj.editing_entity) {
            var is_hidden = isPolityHidden(entity_id, main.date);

            if (!is_hidden)
              local_entity.addTo(map);
          }
        }
    } else {
      console.log(`Entity object:`, getEntity(local_render_order[x]));
      console.warn(`${local_render_order[x]} is bugged out as an entity. Please check the savefile for malformed data structures.`);
    }
  }

  //Selection refresh to make sure it always sits on top of the current layer
  var current_selection = brush_obj.current_selection;

  if (current_selection) {
    current_selection.removeFrom(map);
    current_selection.addTo(map);
  }
});

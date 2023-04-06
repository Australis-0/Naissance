//Union brush
map.on("mousemove", function (e) {
  //Paintbrush function
  if (mouse_pressed) {
    //Try/catch clause to prevent undefined current_union glitch
    try {
      //Declare local instance variables
      var click_location = e.latlng;
      var poly_deleted = false;

      var local_circle = LGeo.circle(e.latlng, brush.radius).addTo(current_entity);

      //Unify previous cache to singular entity
      for (var i = 0; i < entity_cache.length; i++)
        entity_cache[i].remove();

      var current_layers = current_entity.getLayers();

      //Check if poly has been deleted before doing union/difference
      if (current_layers.length == 1)
        poly_deleted = true;

      //Union/difference brush
      if (!window.right_mouse) { //Paintbrush - union brush
        current_union = unify(current_layers);
      } else { //Eraser - difference brush
        if (difference(current_layers)._leaflet_id && !poly_deleted) {
          current_union = difference(current_layers);
        } else {
          poly_deleted = true;
        }
      }

      //Bind tooltip
      L.setOptions(current_union, window.polity_options);
      current_union.on("click", function (e) {
        entityUI(e, true);
      });

      //Add current_union to map
      current_union.addTo(map);

      //Only reorganise polygon if it hasn't been deleted to avoid errors
      if (!poly_deleted || (poly_deleted && !window.right_mouse)) {
        entity_cache.push(current_union);

        //Tidy up layers
        var union_layers = Object.keys(current_union._layers);

        entity_cache = [entity_cache[entity_cache.length - 1]];
        if (current_layers.length > 0) {
          current_entity._layers = {};

          L.polygon(
            current_union._layers[union_layers[0]]._latlngs,
            window.polity_options
          ).addTo(current_entity);
        }
      } else {
        clearBrush();
        if (window.polity_index != -1) {
          polities_layer.splice(polity_index, 1);
          window.polity_index = -1;
          delete window.polity_options;
        }
      }
    } catch {}
  }

  //Paintbrush cursor
  if (window.cursor)
    cursor.remove();

  cursor = LGeo.circle(e.latlng, brush.radius, {
    color: RGBToHex(0, 0, 0),
    dashArray: 4,
    fill: false,
    weight: 2
  }).addTo(map);
});

//Brush cursor outline
L.DomEvent.on(L.DomUtil.get("map"), "mousewheel", function (e) {
  if (e.wheelDeltaY < 0)
    brush.radius = brush.radius*1.1;
  if (e.wheelDeltaY > 0)
    brush.radius = brush.radius*0.9;
});

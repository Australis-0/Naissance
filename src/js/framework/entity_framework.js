//Declare functions
function applyPathToKeyframes (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var entity_obj = getEntity(entity_id);

  if (entity_obj)
    if (entity_obj.options.selected_keyframes) {
      var current_history_entry = getPolityHistory(entity_id, window.date);

      for (var i = 0; i < entity_obj.options.selected_keyframes.length; i++) {
        var local_history_entry = entity_obj.options.history[entity_obj.options.selected_keyframes[i]];

        local_history_entry.coords = current_history_entry.coords;
      }

      //Repopulate entity bio; refresh UI
      populateEntityBio(entity_id);
      if (window[`${entity_id}_apply_path`])
        applyPath(entity_id);
    }
}

function difference (arg0_polylist, arg1_mask) {
  //Convert from parameters
  var polylist = arg0_polylist;

  //Iterate over list
  for (var i = 0; i < polylist.length; ++i)
    if (i == 0) {
      var temp_union = polylist[i].toGeoJSON();
    } else {
      temp_union = turf.difference(temp_union, polylist[i].toGeoJSON());
    }

  //Return statement
  return L.geoJSON(temp_union, (window.current_union) ? current_union.options : undefined);
}

function deleteEntity (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var current_entity_class;

  //Close popups relating to entity first
  closeEntityUI(entity_id);

  //finishEntity() if entity_cache has something in it first
  if (entity_cache.length > 0)
    current_entity_class = finishEntity();

  //Delete entity now
  try {
    clearBrush();
  } catch {}

  //Remove entity from all groups
  for (var i = 0; i < layers.length; i++) {
    var local_layer_groups = window[`${layers[i]}_groups`];

    var all_layer_groups = Object.keys(local_layer_groups);

    for (var x = 0; x < all_layer_groups.length; x++) {
      var local_group = local_layer_groups[all_layer_groups[x]];

      //Splice from entities
      if (local_group.entities)
        for (var y = 0; y < local_group.entities.length; y++)
          if (local_group.entities[y] == entity_id)
            local_group.entities.splice(y, 1);
    }
  }

  //Remove entity from all layers
  for (var i = 0; i < layers.length; i++) {
    var local_layer = window[`${layers[i]}_layer`];

    for (var x = 0; x < local_layer.length; x++)
      if (local_layer[x].options.className == entity_id) {
        local_layer[x].remove();
        local_layer.splice(x, 1);
      }
  }

  //Refresh sidebar
  refreshSidebar();
}

function editEntity (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Close popups relating to entity first
  closeEntityUI(entity_id);

  //finishEntity() if entity_cache has something in it
  try {
    if (entity_cache.length > 0)
      finishEntity();
  } catch {}

  //Iterate over all polities
  for (var i = 0; i < polities_layer.length; i++)
    if (polities_layer[i].options.className == entity_id) {
      window.editing_entity = entity_id;
      window.polity_index = i;
      window.polity_options = polities_layer[i].options;

      //Set brush to this
      current_entity._layers = {};
      polities_layer[i].addTo(current_entity);

      entity_cache = [polities_layer[i]];
      current_union = unify(current_entity.getLayers());

      //Set entityUI for current selected entity
      polities_layer[i].on("click", function (e) {
        entityUI(e);
      });
    }
}

//[WIP] - Make function more general-purpose
function entityHasProperty (arg0_entity_id, arg1_date, arg2_conditional_function) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var date = arg1_date;
  var conditional_function = arg2_conditional_function;

  //Declare local instance variables
  var ending_timestamp = (date) ? getTimestamp(date) : getTimestamp(window.date);
  var entity_obj = getEntity(entity_id);
  var has_property;

  if (entity_obj)
    if (entity_obj.options)
      if (entity_obj.options.history) {
        var all_history_entries = Object.keys(entity_obj.options.history);

        for (var i = 0; i < all_history_entries.length; i++) {
          var local_history = entity_obj.options.history[all_history_entries[i]];

          if (parseInt(local_history.id) <= ending_timestamp)
            has_property = conditional_function(local_history);
        }
      }

  //Return statement
  return has_property;
}

function finishEntity () {
  //Declare local instance variables
  var date_string = getTimestamp(date);
  var local_layers = Object.keys(current_union._layers);
  var new_entity = {
    options: current_union.options
  };

  var coords = current_union._layers[local_layers[0]]._latlngs;

  //Set type to polity
  if (!new_entity.options.type) new_entity.options.type = "polity";

  //Create history entry
  createHistoryEntry(new_entity, date, {}, coords);

  //Edit options; append ID and HTML
  if (!new_entity.options.has_id) {
    var entity_id = generateEntityID();

    new_entity.options.className = (new_entity.options.className) ?
      new_entity.options.className + ` ${entity_id}` :
      entity_id.toString();
    if (current_union.options.entity_name)
      new_entity.options.entity_name = current_union.options.entity_name;
    new_entity.options.has_id = true;
  }

  var entity_id = new_entity.options.className;
  var new_union = L.polygon(coords, new_entity.options);

  clearBrush();
  if (window.polity_index != -1) {
    //Splice to correct index
    //polities_layer.splice(polity_index, 1, new_union); Deprecated
    window.polity_index = -1;
    delete window.editing_entity;
    delete window.polity_options;
  } else {
    polities_layer.push(new_union);
    new_union.addTo(map);
  }
  renderEntities(true);

  //Set current_union.options; reset current_union
  if (window.current_union)
    current_union.options = {};

  //Global brush options processing
  {
    //Auto-simplify when editing
    if (window.auto_simplify_when_editing)
      simplifyEntity(entity_id, window.simplify_tolerance);
  }

  //Return statement
  return entity_id;
}

function generateEntityID () {
  //While loop to find ID, just in-case of conflicting random ID's:
  while (true) {
    var id_taken = false;
    var local_id = generateRandomID();

    //Check to see if ID is taken in polities_layer
    for (var i = 0; i < polities_layer.length; i++)
      if (polities_layer[i].options.className)
        if (polities_layer[i].options.className.includes(local_id))
          id_taken = true;

    if (!id_taken) {
      return local_id;
      break;
    }
  }
}

function getArea (arg0_entity_id, arg1_date) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var date = arg1_date;

  //Declare local instance variables
  var entity_area = 0;
  var entity_obj = getEntity(entity_id);

  //Check to make sure entity_obj exists
  if (entity_obj) {
    var is_extinct = isPolityHidden(entity_id, date);
    var local_history = getPolityHistory(entity_id, date);

    if (local_history) {
      var local_coordinates = getTurfCoordinates(entity_id, date);

      entity_area = (!is_extinct) ? turf.area(
        turf[local_coordinates[1]](local_coordinates[0])
      ) : 0;
    }
  }

  //Return statement
  return entity_area;
}

function getEntityGroup (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Iterate over all layers and subgroups
  for (var i = 0; i < layers.length; i++) {
    var local_layer = window[`${layers[i]}_groups`];

    var all_local_groups = Object.keys(local_layer);

    for (var x = 0; x < all_local_groups.length; x++) {
      var local_group = local_layer[all_local_groups[x]];

      if (local_group.entities)
        if (local_group.entities.includes(entity_id))
          return local_group;
    }
  }
}

function getPoly (arg0_geoJSON) {
  //Convert from parameters
  var geoJSON = arg0_geoJSON;

  //Return statement
  return (geoJSON.type == "Polygon") ?
    turf.polygon(geoJSON.coordinates) :
    turf.multiPolygon(geoJSON.coordinates);
}

//Returns [coordinates, type];
function getTurfCoordinates (arg0_entity_id, arg1_date) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var date = (arg1_date) ? arg1_date : window.date;

  //Declare local instance variables
  var local_entity = getEntity(entity_id);
  var turf_coords = [];

  //Check to make sure local_entity exists
  if (local_entity) {
    var local_history = getPolityHistory(entity_id, date);

    var temp_polygon = L.polygon(local_history.coords).toGeoJSON();
    turf_coords = temp_polygon.geometry.coordinates;
  }

  //Return statement
  return [turf_coords, (temp_polygon.geometry.type == "Polygon") ? "polygon" : "multiPolygon"];
}

function getEntity (arg0_entity_id, arg1_layer) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var layer = arg1_layer;

  //Declare local isntance variables
  var local_entity;

  //Guard clause
  if (typeof entity_id == "object") return entity_id;

  if (!layer) {
    //Iterate over all layers for .options.className
    for (var i = 0; i < layers.length; i++) {
      var local_layer = window[`${layers[i]}_layer`];

      //Iterate over local_layer for .options.className
      for (var x = 0; x < local_layer.length; x++)
        if (local_layer[x].options.className == entity_id)
          local_entity = local_layer[x];
    }
  } else {
    var local_layer = window[`${layer}_layer`];

    //Iterate over local_layer for .options.className
    for (var i = 0; i < local_layer.length; i++)
      if (local_layer[i].options.className == entity_id)
          local_entity = local_layer[i];
  }

  //Return statement
  return local_entity;
}

function getEntityName (arg0_entity_id, arg1_date) {
  //Convert from parmateers
  var entity_id = arg0_entity_id;
  var date = arg1_date;

  //Declare local instance variables
  var entity_name = getEntityProperty(entity_id, "entity_name", date);
  var entity_obj = getEntity(entity_id);

  if (!entity_name)
    if (window.current_union)
      if (current_union.options.className == entity_id)
        entity_name = current_union.options.entity_name;

  //Return statement
  return (entity_name) ? entity_name : "Unnamed Polity";
}

function getPreviousEntityName (arg0_entity_id, arg1_date) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var date = arg1_date;

  //Declare local instance variables
  var entity_obj = getEntity(entity_id);
  var last_history_name = getEntityProperty(entity_id, "entity_name", date, true);

  //Return statement
  return (last_history_name) ? last_history_name : entity_obj.options.entity_name;
}

function isPolityHidden (arg0_entity_id, arg1_date) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var date = arg1_date;

  //Return statement
  return entityHasProperty(entity_id, date, function (local_history) {
    var is_extinct;

    if (local_history.options.extinct) {
      is_extinct = local_history.options.extinct;
    } else if (local_history.options.extinct == false) {
      is_extinct = false;
    }

    return is_extinct;
  });
}

function moveEntityToGroup (arg0_entity_id, arg1_group_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var group_id = arg1_group_id;

  //Declare local instance variables
  var new_group = getGroup(group_id);
  var old_group = getEntityGroup(entity_id);

  //Remove from old group if entity has already been assigned a group
  if (old_group)
    if (old_group.entities) {
      for (var i = 0; i < old_group.entities.length; i++)
        if (old_group.entities[i] == entity_id)
          old_group.entities.splice(i, 1);

      if (old_group.entities.length == 0)
        delete old_group.entities;
    }

  //Add to new group
  if (new_group) {
    //Make sure entities array exists if possible
    if (!new_group.entities)
      new_group.entities = [];

    //Push to new_group.entities
    new_group.entities.push(entity_id);
  }
}

function renderEntities (arg0_ignore_date) {
  //Convert from parameters
  var ignore_date = arg0_ignore_date;

  //Load date and refresh sidebar
  loadDate((!ignore_date) ? date : undefined);
  refreshSidebar();

  //Add Polity UI's to all polities
  for (var i = 0; i < layers.length; i++) {
    var local_layer = window[`${layers[i]}_layer`];

    //Iterate over local_layer
    for (var x = 0; x < local_layer.length; x++)
      local_layer[x].on("click", function (e) {
        entityUI(e, false, true);
      });
  }
}

function simplify (arg0_entity_id, arg1_tolerance, arg2_date) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var tolerance = (arg1_tolerance) ? arg1_tolerance : 0.01;
  var date = arg2_date;

  //Declare local instance variables
  var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

  if (entity_obj) {
    var actual_coords = getTurfCoordinates(entity_id, date);
    var turf_coords = turf[actual_coords[1]](actual_coords[0]);

    var simplified_coords = turf.simplify(turf_coords, { tolerance: tolerance, highQuality: true });

    //Return statement
    return L.geoJSON(simplified_coords);
  }
}

function simplifyAllEntityKeyframes (arg0_entity_id, arg1_tolerance) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var tolerance = arg1_tolerance;

  //Declare local instance variables
  var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

  if (entity_obj) {
    if (entity_obj.options.history) {
      var all_history_entries = Object.keys(entity_obj.options.history);

      for (var i = 0; i < all_history_entries.length; i++) {
        var local_date = parseTimestamp(all_history_entries[i]);
        var local_entry = entity_obj.options.history[all_history_entries[i]];
        var local_simplified_coords = simplify(entity_id, tolerance, local_date);

        //Extract coords from local_simplified_coords
        var local_layers = Object.keys(local_simplified_coords._layers);
        local_entry.coords = local_simplified_coords._layers[local_layers[0]]._latlngs;
      }
    }

    //Simplify current entity to update coords on map
    simplifyEntity(entity_id, tolerance);
  }
}

function simplifyEntity (arg0_entity_id, arg1_tolerance) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var tolerance = arg1_tolerance;

  //Declare local instance variables
  var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id

  if (entity_obj) {
    var simplified_coords = simplify(entity_obj, tolerance);

    var all_layers = Object.keys(simplified_coords._layers);
    var actual_coords = simplified_coords._layers[all_layers[0]]._latlngs;

    entity_obj.setLatLngs(actual_coords);

    //Set history entry to reflect actual_coords
    if (entity_obj.options.history) {
      var current_history_entry = getPolityHistory(entity_obj, window.date);

      current_history_entry.coords = actual_coords;
    }
  }
}

function unify (arg0_polylist) {
  //Convert from parameters
  var polylist = arg0_polylist;

  //Iterate over list
  for (var i = 0; i < polylist.length; ++i)
    if (i == 0) {
      var temp_union = polylist[i].toGeoJSON();
    } else {
      temp_union = turf.union(temp_union, polylist[i].toGeoJSON());
    }

  //Return statement
  return L.geoJSON(temp_union, (window.current_union) ? current_union.options : undefined);
}

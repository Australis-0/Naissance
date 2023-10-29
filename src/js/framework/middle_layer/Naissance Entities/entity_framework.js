//Entity handling functions - Functions similar to class methods
{
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

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    //Close popups relating to entity first
    closeEntityUI(entity_id);

    //finishEntity() if entity_cache has something in it
    try {
      if (entity_cache.length > 0)
        finishEntity();
    } catch {}

    if (entity_obj) {
      window.editing_entity = entity_id;
      window.polity_options = entity_obj.options;

      //Remove old entity_obj from map
      entity_obj.remove();

      //Set brush to this
      window.current_union = entity_obj._latlngs;
      window.selection = L.polygon(entity_obj._latlngs, window.polity_options).addTo(map);

      //Set entityUI for current selected entity
      selection.on("click", function (e) {
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
    var coords = convertToNaissance(current_union);
    var date_string = getTimestamp(date);
    var is_new_entity = false;
    var new_entity = {
      options: selection.options
    };

    //Set new_entity.options
    if (!new_entity.options.type) new_entity.options.type = "polity";

    //Create history entry
    createHistoryEntry(new_entity, date, {}, coords);

    //Edit options; append ID and HTML
    {
      if (!new_entity.options.has_id) {
        var entity_id = generateEntityID();

        new_entity.options.className = (new_entity.options.className) ?
          new_entity.options.className + ` ${entity_id}` :
          entity_id.toString();
        if (selection.options.entity_name)
          new_entity.options.entity_name = selection.options.entity_name;
        new_entity.options.has_id = true;
      } else {
        is_new_entity = true;
      }
    }

    //Push to polities_layer if new entity
    if (new_entity.options.className) {
      var entity_exists = getEntity(new_entity.options.className);

      if (!entity_exists) {
        var new_entity_obj = L.polygon(current_union, new_entity.options);

        window[`${window.selected_layer}_layer`].push(new_entity_obj);
      }
    }

    //Set selection.options; reset selection
    {
      delete window.editing_entity;
      delete window.polity_options;

      if (window.selection)
        selection.options = {};
      clearBrush();
    }

    //Global brush options processing
    {
      //Auto-simplify when editing
      if (window.auto_simplify_when_editing)
        simplifyEntity(entity_id, window.simplify_tolerance);
    }

    //Render entities - KEEP AT BOTTOM!
    renderEntities(true);

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
        var local_coordinates = getTurfObject(local_history);

        entity_area = (!is_extinct) ? turf.area(local_coordinates) : 0;
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

  /*
    getEntity() - Returns an entity object or [layer_key, index];
    options: {
      layer: "polities", - Optional. Optimisation parameter providing the layer
      return_key: true/false - Optional. Whether to return a [layer_key, index] instead of an object. False by default
    }
  */
  function getEntity (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local isntance variables
    var layer = options.layer;
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
            local_entity = (!options.return_key) ?
              local_layer[x] : [`${layers[i]}_layer`, x];
      }
    } else {
      var local_layer = window[`${layer}_layer`];

      //Iterate over local_layer for .options.className
      for (var i = 0; i < local_layer.length; i++)
        if (local_layer[i].options.className == entity_id)
            local_entity = (!options.return_key) ?
              local_layer[i] : [layer, i];
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
        if (selection.options.className == entity_id)
          entity_name = selection.options.entity_name;

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
}

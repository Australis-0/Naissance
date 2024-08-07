//Entity handling functions - Functions similar to class methods
{
  function applyPathToKeyframes (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    if (entity_obj)
      if (entity_obj.options.selected_keyframes) {
        var current_history_entry = getPolityHistory(entity_id, main.date);

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

    //Delete entity now
    try {
      clearBrush();
    } catch {}

    //Remove entity from all groups
    var all_groups = Object.keys(main.groups);

    for (var i = 0; i < all_groups.length; i++) {
      var local_group = main.groups[all_groups[i]];

      //Splice from entities
      if (local_group.entities)
        for (var x = 0; x < local_group.entities.length; x++)
          if (local_group.entities[x] == entity_id)
            local_group.entities.splice(x, 1);
    }

    //Remove entity
    for (var i = 0; i < main.entities.length; i++)
      if (main.entities[i].options.className == entity_id) {
        main.entities[i].remove();
        main.entities.splice(i, 1);
      }

    //Refresh sidebar
    refreshSidebar();
  }

  function editEntity (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var brush_obj = main.brush;
    var entity_obj = getEntity(entity_id);

    //Close popups relating to entity first
    closeEntityUI(entity_id);

    //finishEntity() if brush_obj.current_path has something in it
    try {
      if (brush_obj.current_path)
        finishEntity();
    } catch {}

    if (entity_obj) {
      brush_obj.editing_entity = entity_id;
      brush_obj.polity_options = entity_obj.options;

      //Remove old entity_obj from map
      entity_obj.remove();

      //Set brush to this
      brush_obj.current_path = entity_obj._latlngs;
      brush_obj.current_selection = L.polygon(brush_obj.current_path, brush_obj.polity_options).addTo(map);

      //Set entityUI for current selected entity
      brush_obj.current_selection.on("click", function (e) {
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
    var ending_timestamp = (date) ? getTimestamp(date) : getTimestamp(main.date);
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var has_property;

    if (entity_obj)
      if (entity_obj.options)
        if (entity_obj.options.history) {
          var all_history_entries = Object.keys(entity_obj.options.history);

          for (var i = 0; i < all_history_entries.length; i++) {
            var local_history = entity_obj.options.history[all_history_entries[i]];

            if (parseInt(local_history.id) <= timestampToInt(ending_timestamp))
              has_property = conditional_function(local_history);
          }
        }

    //Return statement
    return has_property;
  }

  function finishEntity () {
    //Declare local instance variables
    var brush_obj = main.brush;
    var coords = convertToNaissance(brush_obj.current_path);
    var date_string = getTimestamp(main.date);
    var entity_id;
    var entity_name;
    var new_entity = {
      options: brush_obj.current_selection.options
    };

    //Set new_entity.options
    if (!new_entity.options.type) new_entity.options.type = "polity";

    //Create history entry; sort history object
    createHistoryFrame(new_entity, main.date, {}, coords);
    new_entity.options.history = sortObject(new_entity.options.history, "numeric_ascending");

    //Edit options; append ID and HTML
    {
      if (!new_entity.options.has_id) {
        entity_id = generateEntityID();

        new_entity.options.className = (new_entity.options.className) ?
          new_entity.options.className + ` ${entity_id}` :
          entity_id.toString();
        if (brush_obj.current_selection.options.entity_name)
          entity_name = JSON.parse(JSON.stringify(selection.options.entity_name));
        new_entity.options.has_id = true;
      }
    }

    //Add new entity to relevant layer
    if (new_entity.options.className) {
      var entity_exists = getEntity(new_entity.options.className);

      if (!entity_exists) {
        var new_entity_obj = L.polygon(brush_obj.current_path, new_entity.options);

        main.entities.push(new_entity_obj);
        renameEntity(entity_id, entity_name, main.date);
      }
    }

    //Set selection.options
    {
      delete brush_obj.editing_entity;
      delete brush_obj.polity_options;

      clearBrush();
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

      //Check to see if ID is taken in main.entities
      for (var i = 0; i < main.entities.length; i++) {
        var local_entity = main.entities[i];

        if (local_entity.options)
          if (local_entity.options.className)
            if (local_entity.options.className.includes(local_id))
              id_taken = true;
      }

      if (!id_taken) {
        return local_id;
        break;
      }
    }
  }

  /*
    getEntity() - Returns an entity object or [layer_key, index];
    arg0_entity_id: (String)
    arg1_options: (Object)
      return_key: (Boolean) - Optional. Whether to return a [layer_key, index] instead of an object. False by default
  */
  function getEntity (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local isntance variables
    var entity_obj;

    //Guard clause
    if (typeof entity_id == "object") return entity_id;

    //Iterate over all main.entities for .options.className
    for (var i = 0; i < main.entities.length; i++) {
      var local_entity = main.entities[i];

      if (local_entity.options)
        if (local_entity.options.className == entity_id)
          entity_obj = (!options.return_key) ? main.entities[i] : i;
    }

    //Return statement
    return entity_obj;
  }

  function getEntityName (arg0_entity_id, arg1_date) {
    //Convert from parmateers
    var entity_id = arg0_entity_id;
    var date = arg1_date;

    //Declare local instance variables
    var brush_obj = main.brush;
    var entity_name;
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    //Check if this is an actual entity object or a new selection
    if (entity_obj) {
      var first_history_frame = getFirstHistoryFrame(entity_obj);
      var history_frame = getHistoryFrame(entity_obj, date);

      if (history_frame.options)
        if (history_frame.options.entity_name)
          entity_name = history_frame.options.entity_name;
      if (!entity_name)
        if (first_history_frame.options)
          if (first_history_frame.options.entity_name)
            entity_name = first_history_frame.options.entity_name;


      if (!entity_name)
        if (brush_obj.current_path)
          if (selection.options.className == entity_id)
            entity_name = selection.options.entity_name;
    }

    //Return statement
    return (entity_name) ? entity_name : "Unnamed Polity";
  }

  function reloadEntityInArray (arg0_array, arg1_entity_id) {
    //Convert from parameters
    var array = getList(arg0_array);
    var entity_id = arg1_entity_id;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ?
      getEntity(entity_id) : entity_id;

    if (entity_obj)
      entity_id = entity_obj.options.className;

    //Iterate over array
    for (var i = 0; i < array.length; i++)
      if (array[i]) {
        if (array[i].options) {
          var local_id = array[i].options.className;

          if (local_id == entity_id && !array[i].selection) {
            array[i].removeFrom(map);
            array[i] = entity_obj;
          }
        }
      } else {
        console.log(array);
      }

    //Return statement
    return array;
  }

  function renameEntity (arg0_entity_id, arg1_entity_name, arg2_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var entity_name = (arg1_entity_name) ? arg1_entity_name : `Unnamed Polity`;
    var date = (arg2_date) ? getTimestamp(arg2_date) : main.date;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    if (entity_obj)
      createHistoryFrame(entity_obj, date, { entity_name: entity_name });

    //Return statement
    return entity_name;
  }

  function renderEntities (arg0_ignore_date) {
    //Convert from parameters
    var ignore_date = arg0_ignore_date;

    //Load date and refresh sidebar
    loadDate((!ignore_date) ? main.date : undefined);

    //Add Polity UI's to all polities
    for (var i = 0; i < main.entities.length; i++) {
      var local_entity = main.entities[i];

      local_entity.on("click", function (e) {
        entityUI(e, false, true);
      });
    }
  }

  function setEntityNameFromInput (arg0_entity_id, arg1_element) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var element = arg1_element;

    //Declare local instance variables
    var entity_name;
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    if (element && entity_obj) {
      var is_unnamed_entity = false;

      if (!element.value || element.value == "Unnamed Polity")
        is_unnamed_entity = true;

      entity_name = (is_unnamed_entity) ? `Unnamed Polity` : element.value;
      createHistoryFrame(entity_obj, main.date, { entity_name: entity_name });
    }

    //Return statement
    return entity_name;
  }
}

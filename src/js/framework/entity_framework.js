//Entity framework handling
{
  /*
    parseEntityEffect() - Applies an entity effect from a given .effect scope.
    arg0_entity_id: (String) - The entity ID to which this effect applies.
    arg1_scope: (Object) - The effect scope to apply.
    arg2_options: (Object)
      options: (Object) - The actual options of various inputs and the data given, treated as global variables.

      depth: (Number) - The current recursive depth. Starts at 1.
      scope_type: (Array<String>) - Optional. What the current scope_type currently refers to (e.g. 'polities', 'markers'). All if undefined. Undefined by default.
      timestamp: (String) - Optional. The current timestamp of the keyframe being referenced, if any.
      ui_type: (String) - Optional. Whether the ui_type is 'entity_keyframes'/'entity_actions'. 'entity_keyframes' by default.
  */
  function parseEntityEffect (arg0_entity_id, arg1_scope, arg2_options) { //[WIP] - Finish function body.
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var scope = (arg1_scope) ? arg1_scope : {};
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (options.depth == undefined) options.depth = 0;
      options.depth++;
    if (!options.ui_type) options.ui_type = "entity_keyframes";

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);
    var brush_obj = main.brush;
    var entity_obj = getEntity(entity_id);
    var limit_fulfilled = true;

    //.interface parser; load inputs into .options
    if (options.depth == 1) {
      var common_selectors = config.defines.common.selectors;
      var entity_el = getEntityElement(entity_id);

      var actions_container_el = entity_el.querySelector(`${common_selectors.entity_actions_context_menu_anchor}`);
      var actions_input_obj = getInputsAsObject(actions_container_el, { entity_id: entity_id });
      var keyframe_container_el = entity_el.querySelector(`${common_selectors.entity_keyframe_context_menu_anchor}`);
      var keyframe_input_obj = getInputsAsObject(keyframe_container_el, { entity_id: entity_id });

      //Set options.options to be passed down
      options.options = dumbMergeObjects(actions_input_obj, keyframe_input_obj);
      options.options.timestamp = options.timestamp;
    }
    var suboptions = options.options;

    //.limit parser
    if (scope.limit) {
      var new_options = JSON.parse(JSON.stringify(options));
      limit_fulfilled = parseEntityLimit(entity_id, scope.limit, new_options);
    }

    //.effect parser
    //Iterate over all_scope_keys, recursively parsing the scope whenever 'effect_<key>' is encountered.
    if (limit_fulfilled)
      for (var i = 0; i < all_scope_keys.length; i++) {
      var local_value = getList(scope[all_scope_keys[i]]);

      //Recursive parsers/scoping
      if (all_scope_keys[i].startsWith("effect_")) {
        var new_options = JSON.parse(JSON.stringify(options));
        var parsed_effect = parseEntityEffect(entity_id, local_value[0], new_options);
      }

      //Same-scope effects
      {
        //Action effects - [WIP] - Finish adding action effects
        if (all_scope_keys[i] == "clean_keyframes")
          cleanKeyframes(entity_id, local_value[0]);
        if (all_scope_keys[i] == "edit_entity")
          editEntity(entity_id);
        if (all_scope_keys[i] == "finish_entity")
          finishEntity();
        if (all_scope_keys[i] == "hide_entity")
          if (local_value[0]) {
            hideEntity(entity_id);
          } else {
            showEntity(entity_id);
          }
        if (all_scope_keys[i] == "simplify_all_keyframes")
          simplifyAllEntityKeyframes(entity_id, brush_obj.simplify_tolerance);

        //History effects
        if (all_scope_keys[i] == "delete_keyframe")
          deleteKeyframe(entity_id, suboptions[local_value]);
        if (all_scope_keys[i] == "edit_keyframe")
          editKeyframe(entity_id, suboptions[local_value]);
        if (all_scope_keys[i] == "move_keyframe")
          moveKeyframe(entity_id, options.timestamp, suboptions[local_value]);

        //UI interface effects
        if (all_scope_keys[i] == "close_ui")
          //Parse the entity_effect being referenced
          for (var x = 0; x < local_value.length; x++) {
            var local_entity_keyframe = getEntityKeyframe(local_value[x]);
            var local_entity_order = (local_entity_keyframe.order != undefined) ?
              local_entity_keyframe.order : 1;

            closeEntityKeyframeContextMenu(entity_id, local_entity_order);
          }
        if (all_scope_keys[i] == "close_menus")
          if (local_value[0]) closeEntityKeyframeContextMenus(entity_id);
        if (all_scope_keys[i] == "close_select_multiple_keyframes")
          selectMultipleKeyframes(entity_id, { close_selection: true });
        if (all_scope_keys[i] == "interface")
          printEntityKeyframeContextMenu(entity_id, scope);
        if (["open_ui", "trigger"].includes(all_scope_keys[i]))
          if (options.ui_type == "entity_actions") {
            //Parse the entity_effect being referenced
            for (var x = 0; x < local_value.length; x++) {
              var local_entity_action = getEntityAction(local_value[x]);

              if (local_entity_action.effect) {
                var new_options = JSON.parse(JSON.stringify(options));
                var parsed_effect = parseEntityEffect(entity_id, local_entity_action.effect, new_options);
              }
              if (local_entity_action)
                printEntityActionsContextMenu(entity_id, local_entity_action);
            }
          } else if (options.ui_type == "entity_keyframes") {
            //Parse the entity_effect being referenced
            for (var x = 0; x < local_value.length; x++) {
              var local_entity_keyframe = getEntityKeyframe(local_value[x]);

              if (local_entity_keyframe.effect) {
                var new_options = JSON.parse(JSON.stringify(options));
                var parsed_effect = parseEntityEffect(entity_id, local_entity_keyframe.effect, new_options);
              }
              if (local_entity_keyframe)
                printEntityKeyframeContextMenu(entity_id, local_entity_keyframe);
            }
          }
        if (["refresh_entity_actions", "reload_entity_actions"].includes(all_scope_keys[i]))
          refreshEntityActions(entity_id);
        if (all_scope_keys[i] == "select_multiple_keyframes")
          selectMultipleKeyframes(entity_id, { assign_key: local_value[0] });
      }
    }
  }

  /*
    parseEntityLimit() - Recursively returns a boolean for an entity given its .limit scope.
    arg0_entity_id: (String) - The entity ID for which this limit checks.
    arg1_scope: (Object) - The effect limit scope to apply.
    arg2_options: (Object)
      operator: (String) - Optional. The current operator. Either 'and', 'not', 'or', or 'xor'. 'and' by default.
      options: (Object) - The actual options of various inputs and the data given, treated as global variables.

      depth: (Number) - The current recursive depth. Starts at 1.
      scope_type: (Array<String>) - Optional. What the current scope_type currently refers to. (e.g. 'polities', 'markers'). All if undefined. Undefined by default.
      timestamp: (String) - Optional. The current timestamp of the keyframe being referenced, if any.
      ui_type: (String) - Optional. Whether the ui_type is 'entity_keyframes'/'entity_actions'. 'entity_keyframes' by default.

    Returns: (Boolean)
  */
  function parseEntityLimit (arg0_entity_id, arg1_scope, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var scope = arg1_scope;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (options.depth == undefined) options.depth = 0;
      options.depth++;
    if (!options.operator) options.operator = "and";
    if (!options.ui_type) options.ui_type = "entity_keyframes";

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);
    var entity_obj = getEntity(entity_id);
    var local_checks = 0;

    //Current .limit parser
    //Iterate over all_scope_keys, recursively parsing the scope whenever a subscope is encountered.
    for (var i = 0; i < all_scope_keys.length; i++) {
      var local_value = getList(scope[all_scope_keys[i]]);

      //Recursive parsers/scoping
      {
        if (all_scope_keys[i].startsWith("limit_") || all_scope_keys[i] == "limit") {
          var new_options = JSON.parse(JSON.stringify(options));
          var parsed_limit = parseEntityLimit(entity_id, local_value[0], new_options);

          if (parsed_limit) local_checks++;
        }
        //And/Not/Or/Xor parser
        var local_boolean_type = getBooleanOperatorFromString(all_scope_keys[i]);
        if (local_boolean_type) {
          var new_options = JSON.parse(JSON.stringify(options));
            new_options.scope = local_boolean_type;
          var parsed_limit = parseEntityLimit(entity_id, local_value[0], new_options);

          if (parsed_limit) local_checks++;
        }
      }

      //Same-scope conditions
      {
        if (all_scope_keys[i] == "entity_is_being_edited")
          if (local_value[0] == true) {
            if (isEntityBeingEdited(entity_id, local_value[0]))
              local_checks++;
          } else {
            if (!isEntityBeingEdited(entity_id, local_value[0]))
              local_checks++;
          }
        if (all_scope_keys[i] == "entity_is_hidden")
          if (local_value[0] == true) {
            if (isEntityHidden(entity_id, main.date))
              local_checks++;
          } else {
            if (!isEntityHidden(entity_id, main.date))
              local_checks++;
          }
      }
    }

    //Return statement; AND/NOT/OR/XOR handler
    if (options.operator == "and")
      if (local_checks >= all_scope_keys.length) return true;
    if (options.operator == "not")
      if (local_checks == 0) return true;
    if (options.operator == "or")
      if (local_checks > 0) return true;
    if (options.operator == "xor")
      if (local_checks == 1) return true;
  }
}

//Entity actions
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
        printEntityBio(entity_id);
        if (window[`${entity_id}_apply_path`])
          applyPath(entity_id);
      }
  }

  /*
    cleanKeyframes() - Removes duplicate keyframes.
    options: {
      do_not_display: true/false - Whether to display in printEntityBio() or not. False by default.
    }
  */
  function cleanKeyframes (arg0_entity_id, arg1_tolerance, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var tolerance = (arg1_tolerance) ? convertTimestampToInt(getTimestamp(arg1_tolerance)) : Infinity;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    if (entity_obj)
      if (entity_obj.options.history) {
        var all_history_entries = Object.keys(entity_obj.options.history);

        for (var i = 0; i < all_history_entries.length; i++)
          if (parseInt(all_history_entries[i]) >= (convertTimestampToInt(getTimestamp(main.date)) - tolerance)) {
            var empty_options = false;
            var local_history_entry = entity_obj.options.history[all_history_entries[i]];

            //Process .coords
            {
              //Remove .coords if last coords are the same getLastIdenticalCoords(entity_obj, local_history_entry));
              if (getLastIdenticalCoords(entity_obj, local_history_entry))
                delete local_history_entry.coords;

              //Convert to Naissance format if applicable
              if (local_history_entry.coords)
                local_history_entry.coords = convertToNaissance(local_history_entry.coords);
            }

            //Remove frame if same .coords and options is empty
            if (local_history_entry.options) {
              if (Object.keys(local_history_entry.options).length == 0) {
                empty_options = true;
                delete local_history_entry.options;
              }
            } else {
              empty_options = true;
            }

            //Remove frame if needed
            if (!local_history_entry.coords && empty_options)
              delete entity_obj.options.history[all_history_entries[i]];
          }

        //Repopulate entity bio; refresh UI
        if (!options.do_not_display)
          try {
            printEntityBio(entity_id);
          } catch {}
      }

    //Return statement
    return entity_obj;
  }

  function deleteEntity (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var current_entity_class;

    //Close popups relating to entity first
    closeEntityContextMenu(entity_id);

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
    refreshHierarchy();
  }

  function editEntity (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var brush_obj = main.brush;
    var entity_obj = getEntity(entity_id);

    //Close popups relating to entity first
    closeEntityContextMenu(entity_id);

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
        printEntityContextMenu(e.target.options.className);
      });
    }
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
          var local_date = convertTimestampToDate(all_history_entries[i]);
          var local_history_frame = entity_obj.options.history[all_history_entries[i]];
          var local_simplified_coords = convertToNaissance(simplify(local_history_frame, tolerance));

          //Extract coords from local_simplified_coords
          local_history_frame.coords = local_simplified_coords;
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
      var simplified_coords = simplify(entity_obj._latlngs, tolerance);
      entity_obj._latlngs = simplified_coords;

      //Set history entry to reflect actual_coords
      if (entity_obj.options.history) {
        var current_history_entry = getPolityHistory(entity_obj, main.date);

        current_history_entry.coords = convertToNaissance(simplified_coords);
      }

      //Refresh entity_obj
      entity_obj.remove();
      entity_obj.addTo(map);
    }
  }
}

//Entity handling functions - Functions similar to class methods
{
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

            if (parseInt(local_history.id) <= convertTimestampToInt(ending_timestamp))
              has_property = conditional_function(local_history);
          }
        }

    //Return statement
    return has_property;
  }

  //finishEntity() - Finishes an entity's editing process.
  function finishEntity () {
    //Declare local instance variables
    var brush_obj = main.brush;
    var coords = convertToNaissance(brush_obj.current_path);
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

    //Reload date
    loadDate();

    //Return statement
    return entity_id;
  }

  /*
    generateEntityID() - Generates a random entity ID for use.

    Returns: (String)
  */
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

  /*
    getEntityAbsoluteAge() - Fetches the absolute age of an entity; the distance between its first and last frames.
    arg0_entity_id: (String) - The entity ID for which to fetch the absolute age for.

    Returns: (Object, Date)
  */
  function getEntityAbsoluteAge (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    //Attempt to fetch distance between first and last keyframe to fetch its absolute age
    if (entity_obj)
      if (entity_obj.options)
        if (entity_obj.options.history) {
          var all_history_frames = Object.keys(entity_obj.options.history);
          var first_history_frame = entity_obj.options.history[all_history_frames[0]];
          var last_history_frame = entity_obj.options.history[all_history_frames[all_history_frames.length - 1]];

          var age_timestamp = last_history_frame.id - first_history_frame.id;

          //Return statement
          return convertTimestampToDate(age_timestamp);
        }

    //Return statement if entity has no history
    return getBlankDate();
  }

  function getEntityRelativeAge (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    //Attempt to fetch distance between first keyframe and main.date to fetch its relative age
    if (entity_obj)
      if (entity_obj.options)
        if (entity_obj.options.history) {
          var all_history_frames = Object.keys(entity_obj.options.history);
          var first_history_frame = entity_obj.options.history[all_history_frames[0]];

          var age_timestamp = convertTimestampToInt(getTimestamp(main.date)) - first_history_frame.id;

          //Return statement
          return convertTimestampToDate(age_timestamp);
        }

    //Return statement if entity has no history
    return getBlankDate();
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

  /*
    isEntityBeingEdited() - Checks whether the entity is currently being edited.
    arg0_entity_id: (String) - The Entity ID to check for.

    Returns: (Boolean)
  */
  function isEntityBeingEdited (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Return statement
    if (main.brush.editing_entity == entity_id) return true;
  }

  function isEntityHidden (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = arg1_date;

    //Check if date is before first history frame
    var first_history_frame = getFirstHistoryFrame(entity_id);

    if (first_history_frame.id > convertTimestampToInt(getTimestamp(main.date)))
      return true;

    //Return statement
    return entityHasProperty(entity_id, date, function (local_history) {
      var is_extinct;

      if (local_history.options)
        if (local_history.options.extinct) {
          is_extinct = local_history.options.extinct;
        } else if (local_history.options.extinct == false) {
          is_extinct = false;
        }

      return is_extinct;
    });
  }

  function refreshEntityActions (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);
    var entity_el = getEntityElement(entity_id);

    //Check if entity_el exists
    if (!entity_el)
      printEntityContextMenu(entity_id, {
        coords: entity_obj.getBounds().getCenter(),
        is_being_edited: isEntityBeingEdited(entity_id)
      });
    setTimeout(function(){
      var entity_actions_el = getEntityActionsAnchorElement(entity_id);
      var entity_actions_ui = printEntityActionsNavigationMenu(entity_id, entity_actions_el);
    }, 1);
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

  /*
    selectMultipleKeyframes() - Opens the selection menu for multiple keyframes.
    arg0_entity_id: (String)
    arg1_options: (Object)
      assign_key: (String) - Optional. The key to assign this to. 'selected_keyframes' by default.
      close_selection: (Boolean) - Optional. Whether to close the selection. False by default.
  */
  function selectMultipleKeyframes (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.assign_key) options.assign_key = "selected_keyframes";

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);
    var entity_obj = getEntity(entity_id);

    var bio_container_el = entity_el.querySelector(common_selectors.entity_bio_container);

    //Check if selection should be closed or not first
    if (bio_container_el && !options.close_selection) {
      //Make sure bio_container_el exists in the first place before appending a checkbox to each keyframe; create a 'Select All' button at top.
      var bio_entries = bio_container_el.querySelectorAll(common_selectors.entity_bio_entries);
      var bio_top_header_el = bio_container_el.querySelectorAll(common_selectors.entity_bio_header);
      var select_all_el = document.createElement("span");

      select_all_el.innerHTML = `Select All: <input type = "checkbox" id = "select-all-${entity_id}">`;
      bio_top_header_el.prepend(select_all_el);
      entity_obj.options.selected_keyframes_key = options.assign_key;

      //Add select_all_el onclick event listener
      select_all_el.onclick = function (e) {
        var all_checkbox_els = bio_container_el.querySelectorAll(`${common_selectors.entity_bio_entries} input[type="checkbox"]`);

        //Check if select_all_el.checked is true; uncheck all if not
        entity_obj.options.selected_keyframes = [];

        //Iterate over all_checkbox_els and set them to the select_all_el .checked value; update selected timestamps
        for (var i = 0; i < all_checkbox_els.length; i++)
          all_checkbox_els[i].checked = e.target.checked;
        if (e.target.checked)
          for (var i = 0; i < all_checkbox_els.length; i++)
            entity_obj.options.selected_keyframes.push(all_checkbox_els[i].getAttribute("timestamp"));
      };

      //Iterate over each bio entry and assign each a checkbox
      for (var i = 0; i < bio_entries.length; i++) {
        var local_checkbox_el = document.createElement("input");
        var local_parent_el = bio_entries[i].parentElement.parentElement;
        var local_timestamp = local_parent_el.getAttribute("timestamp");

        //Create local_checkbox_el and prepend it to the current bio_entries[i]
        local_checkbox_el.setAttribute("type", "checkbox");
        local_checkbox_el.setAttribute("timestamp", local_timestamp);

        if (entity_obj.options.selected_keyframes.includes(local_timestamp))
          local_checkbox_el.checked = true;
        bio_entries[i].prepend(local_checkbox_el);

        //Add local_checkbox_el onclick event istener
        local_checkbox_el.onclick = function (e) {
          var actual_timestamp = e.target.getAttribute("timestamp");

          if (e.target.checked) {
            if (!entity_obj.options.selected_keyframes.includes(actual_timestamp))
              entity_obj.options.selected_keyframes.push(actual_timestamp);
          } else {
            for (var i = 0; i < entity_obj.options.selected_keyframes.length; i++)
              if (entity_obj.options.selected_keyframes[i] == actual_timestamp)
                entity_obj.options.selected_keyframes.splice(i, 1);
          }
        };
      }
    } else {
      //Close multi-keyframe selection
      var bio_entries = bio_container_el.querySelectorAll(common_selectors.entity_bio_entries);
      var bio_top_header_el = bio_container_el.querySelectorAll(common_selectors.entity_bio_header);

      //Remove select_all_el at top header; entity_obj.options.selected_keyframes_key
      try { bio_top_header_el.querySelector(`span:first-child`).remove(); } catch {}
      delete entity_obj.options.selected_keyframes;

      //Iterate over all bio_entries and remove the local_checkbox_el
      for (var i = 0; i < bio_entries.length; i++) {
        var local_checkbox_el = bio_entries[i].querySelector(`input[type="checkbox"]`);
        if (local_checkbox_el) local_checkbox_el.remove();
      }
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

//Entity parser helper functions
{
  function getBooleanOperatorFromString (arg0_string) {
    //Convert from parameters
    var string = arg0_string;

    //Return statement
    if (string.startsWith("and_") || string == "and") return "and";
    if (string.startsWith("not_") || string == "not") return "not";
    if (string.startsWith("or_") || string == "or") return "or";
    if (string.startsWith("xor_") || string == "xor") return "xor";
  }
}

//Initialise Entity Keyframes actiosn
{
  function deleteKeyframe (arg0_entity_id, arg1_timestamp) { //[WIP] - Deleting a keyframe should update the bio and close the keyframe context menus. It currently does not
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var timestamp = arg1_timestamp;

    //Declare local instance variables
    var entity_keyframe_context_menu_el = document.querySelector(`${config.ui.entity_keyframe_context_menu}-${entity_id}`);
    var entity_keyframe_context_menu_two_el = document.querySelector(`${config.ui.entity_keyframe_context_menu_two}-${entity_id}`);

    //Delete keyframe; update bio [WIP] - Make sure to update bio
    closeKeyframeContextMenus(entity_id);
    deletePolityHistory(entity_id, timestamp);

    printEntityBio(entity_id);
  }

  function editKeyframe (arg0_entity_id, arg1_timestamp) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var timestamp = arg1_timestamp;

    //Close entity UI, call editEntity()
    closeEntityUI();
    main.date = convertTimestampToDate(timestamp);
    loadDate();
    editEntity(entity_id);
  }

  function moveKeyframe (arg0_entity_id, arg1_timestamp, arg2_timestamp) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var entry_date = arg1_date;
    var move_to_date = arg2_date;

    //Declare local instance variables
    var context_menu_date_el = document.getElementById(`context-date-menu-${entity_id}`);
    var context_menu_el = document.getElementById(`entity-ui-context-menu-${entity_id}`);
    var entity_obj = getEntity(entity_id);
    var history_entry = getPolityHistory(entity_id, entry_date);
    var new_timestamp = getTimestamp(move_to_date);
    var old_timestamp = getTimestamp(convertTimestampToDate(entry_date));
    var popup_el = document.querySelector(`.leaflet-popup[class~='${entity_id}']`);

    //Move history_entry to new timestamp
    if (entity_obj)
      if (history_entry) {
        //Only change date of keyframe if it does not conflict with the same keyframe
        if (history_entry.id != convertTimestampToInt(new_timestamp)) {
          //Move to new_timestamp
          entity_obj.options.history[new_timestamp] = history_entry;
          var new_history_entry = entity_obj.options.history[new_timestamp];

          //Delete old timestamp; change ID
          delete entity_obj.options.history[old_timestamp];
          new_history_entry.id = convertTimestampToInt(new_timestamp);

          entity_obj.options.history = sortObject(entity_obj.options.history, "numeric_ascending");

          if (context_menu_el) {
            //Repopulate bio; move it to new history entry
            printEntityBio(entity_id);

            var new_history_entry_el = document.querySelector(`#entity-ui-timeline-bio-table-${entity_id} tr[timestamp="${new_history_entry.id}"]`);

            if (new_history_entry_el) {
              new_history_entry_el.after(context_menu_el);
              new_history_entry_el.after(context_menu_date_el);
            }
          }
        }
      } else {
        console.warn(`Could not find history entry for ${entity_id} at timestamp ${entry_date}!`);
      }
  }
}

//Initialise Entity Keyframes framework
{
  /*
    getAllEntityKeyframes() - Fetches all entity keyframes as either an array of keys or objects.
    arg0_options: (Object)
      return_keys: (Boolean) - Optional. Whether or not to return an array of keys instead of objects. False by default.
  */
  function getAllEntityKeyframes (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var common_defines = config.defines.common;
    var flattened_entity_keyframes = config.flattened_entity_keyframes;
    var return_keyframes = [];
    var return_keys = [];

    //Iterate over all_flattened_entity_keyframes
    var all_flattened_entity_keyframes = Object.keys(flattened_entity_keyframes);

    for (var i = 0; i < all_flattened_entity_keyframes.length; i++)
      if (!common_defines.reserved_entity_keyframes.includes(all_flattened_entity_keyframes[i])) {
        return_keyframes.push(flattened_entity_keyframes[all_flattened_entity_keyframes[i]]);
        return_keys.push(all_flattened_entity_keyframes[i]);
      }

    //Return statement
    return (!options.return_keys) ? return_keyframes : return_keys;
  }

  /*
    getEntityKeyframe() - Fetches an entity keyframe action.
    arg0_name: (String) - The name/ID of the entity keyframe category.
    arg1_options: (Object)
      return_key: (Boolean) - Optional. Whether or not to return the key. False by default.
  */
  function getEntityKeyframe (arg0_name, arg1_options) {
    //Convert from parameters
    var name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for objects; direct keys
    if (typeof name == "object") return name;
    if (config.flattened_entity_keyframes[name]) return (!options.return_key) ? config.flattened_entity_keyframes[name] : name;

    //Declare local instance variables
    var entity_keyframe_exists = [false, ""]; //[entity_keyframe_exists, entity_keyframe_key];
    var search_name = name.toLowerCase().trim();

    //ID search - soft search 1st, hard search 2nd
    {
      //Iterate over config.all_entity_keyframes
      for (var i = 0; i < config.all_entity_keyframes.length; i++) {
        var local_value = config.all_entity_keyframes[i];

        if (local_value.id.toLowerCase().includes(search_name))
          entity_keyframe_exists = [true, local_value.key];
      }
      for (var i = 0; i < config.all_entity_keyframes.length; i++) {
        var local_value = config.all_entity_keyframes[i];

        if (local_value.id.toLowerCase() == search_name)
          entity_keyframe_exists = [true, local_value.key];
      }
    }

    //Name search - soft search 1st, hard search 2nd
    {
      //Iterate over config.all_entity_keyframes
      for (var i = 0; i < config.all_entity_keyframes.length; i++) {
        var local_value = config.all_entity_keyframes[i];

        if (local_value.name)
          if (local_value.name.toLowerCase().includes(search_name))
            entity_keyframe_exists = [true, local_value.key];
      }
      for (var i = 0; i < config.all_entity_keyframes.length; i++) {
        var local_value = config.all_entity_keyframes[i];

        if (local_value.name)
          if (local_value.name.toLowerCase() == search_name)
            entity_keyframe_exists = [true, local_value.key];
      }
    }

    //Return statement
    if (entity_keyframe_exists[0])
      return (!options.return_key) ? config.flattened_entity_keyframes[entity_keyframe_exists[1]] : entity_keyframe_exists[1];
  }

  /*
    getEntityKeyframesCategory() - Fetches an entity keynames category object/key.
    arg0_name: (String) - The name/ID of the entity keyframe category.
    arg1_options: (Object)
      return_key: (Boolean) - Optional. Whether or not to return the key. False by default.
  */
  function getEntityKeyframesCategory (arg0_name, arg1_options) {
    //Convert from parameters
    var name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for objects; direct keys
    if (typeof name == "object") return name;
    if (config.entity_keyframes[name]) return (!options.return_key) ? config.entity_keyframes[name] : name;

    //Declare local instance variables
    var all_entity_keyframes = Object.keys(config.entity_keyframes);
    var entity_keyframes_exists = [false, ""]; //[entity_keyframes_exists, entity_keyframes_key];
    var search_name = name.toLowerCase().trim();

    //ID search - soft search 1st, hard search 2nd
    {
      //Iterate over all_entity_keyframes
      for (var i = 0; i < all_entity_keyframes.length; i++)
        if (all_entity_keyframes[i].toLowerCase().includes(search_name))
          entity_keyframes_exists = [true, all_entity_keyframes[i]];
      for (var i = 0; i < all_entity_keyframes.length; i++)
        if (all_entity_keyframes[i].toLowerCase() == search_name)
          entity_keyframes_exists = [true, all_entity_keyframes[i]];
    }

    //Name search - soft search 1st, hard search 2nd
    {
      //Iterate over all_entity_keyframes
      for (var i = 0; i < all_entity_keyframes.length; i++) {
        var local_value = config.entity_keyframes[all_entity_keyframes[i]];

        if (local_value.name)
          if (local_value.name.toLowerCase().includes(search_name))
            entity_keyframes_exists = [true, all_entity_keyframes[i]];
      }
      for (var i = 0; i < all_entity_keyframes.length; i++) {
        var local_value = config.entity_keyframes[all_entity_keyframes[i]];

        if (local_value.name)
          if (local_value.name.toLowerCase() == search_name)
            entity_keyframes_exists = [true, all_entity_keyframes[i]];
      }
    }

    //Return statement
    if (entity_keyframes_exists[0])
      return (!options.return_key) ? config.entity_keyframes[entity_keyframes_exists[1]] : entity_keyframes_exists[1];
  }

  /*
    getEntityKeyframesAtOrder() - Fetches all entity keyframe actions belonging to a given .order.
    arg0_options: (Object)
      order: (Number) - Optional. The current order ot fetch all relevant keyframes at. 1 by default.
      return_keys: (Boolean) - Optional. Whether or not to return an array of keys instead of objects. False by default.

    Returns: (Array<Object>/Array<String>)
  */
  function getEntityKeyframesAtOrder (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var flattened_entity_keyframes = config.flattened_entity_keyframes;
    var order = (options.order != undefined) ? options.order : 1;
    var return_keyframes = [];
    var return_keys = [];

    //Iterate over all_flattened_entity_keyframes
    var all_flattened_entity_keyframes = Object.keys(flattened_entity_keyframes);

    for (var i = 0; i < all_flattened_entity_keyframes.length; i++) {
      var local_keyframe = flattened_entity_keyframes[all_flattened_entity_keyframes[i]];

      if (local_keyframe.order == options.order) {
        return_keyframes.push(local_keyframe);
        return_keys.push(all_flattened_entity_keyframes[i]);
      }
    }

    //Return statement
    return (!options.return_key) ? return_keyframes : return_keys;
  }

  /*
    getEntityKeyframesLowestOrder() - Fetches the lowest .order from all config.entity_keyframes.

    Returns: (Number)
  */
  function getEntityKeyframesLowestOrder (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var flattened_entity_keyframes = config.flattened_entity_keyframes;
    var min_order = Infinity;

    //Iterate over all_flattened_entity_keyframes
    var all_flattened_entity_keyframes = Object.keys(flattened_entity_keyframes);

    for (var i = 0; i < all_flattened_entity_keyframes.length; i++) {
      var local_keyframe = flattened_entity_keyframes[all_flattened_entity_keyframes[i]];

      if (local_keyframe.order != undefined)
        min_order = Math.min(min_order, local_keyframe.order);
    }

    //Return statement
    return min_order;
  }

  /*
    getEntityKeyframesNavigationObject() - Fetches the navigation object for entity keyframes; the initial context menu from lowest order.

    Returns: (Object)
  */
  function getEntityKeyframesNavigationObject () {
    //Declare local instance variables
    var flattened_entity_keyframes = config.flattened_entity_keyframes;
    var lowest_order = getEntityKeyframesLowestOrder(flattened_entity_keyframes);

    //Return statement
    return getEntityKeyframesAtOrder({ order: lowest_order })[0];
  }

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
    if (!options.depth) options.depth = 0;
      options.depth++;
    if (!options.ui_type) options.ui_type = "entity_keyframes";

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);
    var entity_obj = getEntity(entity_id);

    //[WIP] - .interface parser; load inputs into .options
    if (options.depth == 1) {
      var common_selectors = config.defines.common.selectors;
      var entity_el = getEntityElement(entity_id);

      var actions_container_el = entity_el.querySelector(`${common_selectors.entity_actions_context_menu_anchor}`);
      var actions_input_obj = getInputsAsObject(actions_container_el);
      var keyframe_container_el = entity_el.querySelector(`${common_selectors.entity_keyframe_context_menu_anchor}`);
      var keyframe_input_obj = getInputsAsObject(keyframe_container_el);

      //Set options.options to be passed down
      options.options = dumbMergeObjects(actions_input_obj, keyframe_input_obj);
      options.options.timestamp = options.timestamp;
    }
    var suboptions = options.options;

    //.effect parser
    //Iterate over all_scope_keys, recursively parsing the scope whenever 'effect_<key>' is encountered.
    for (var i = 0; i < all_scope_keys.length; i++) {
      var local_value = getList(scope[all_scope_keys[i]]);

      //Recursive parsers
      if (all_scope_keys[i].startsWith("effect_")) {
        var new_options = JSON.parse(JSON.stringify(options));
        var parsed_effect = parseEntityEffect(entity_id, local_value[0], new_options);
      }

      //Same-scope effects
      {
        //History effects
        if (all_scope_keys[i] == "delete_keyframe")
          deleteKeyframe(entity_id, suboptions[local_value]);
        if (all_scope_keys[i] == "edit_keyframe")
          editKeyframe(entity_id, suboptions[local_value]);
        if (all_scope_keys[i] == "move_keyframe") {
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
        if (all_scope_keys[i] == "interface")
          printEntityKeyframeContextMenu(entity_id, scope);
        if (["open_ui", "trigger"].includes(all_scope_keys[i]))
          if (options.ui_type == "entity_keyframes") {
            //Parse the entity_effect being referenced
            for (var x = 0; x < local_value.length; x++) {
              var local_entity_keyframe = getEntityKeyframe(local_value[x]);
              console.log(local_value[x]);

              if (local_entity_keyframe.effect) {
                var new_options = JSON.parse(JSON.stringify(options));
                var parsed_effect = parseEntityEffect(entity_id, local_entity_keyframe.effect, new_options);
              }
              if (local_entity_keyframe)
                printEntityKeyframeContextMenu(entity_id, local_entity_keyframe);
            }
          }
      }
    }
  }
}

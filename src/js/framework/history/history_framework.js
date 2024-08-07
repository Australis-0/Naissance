//Marked for review functions
{
  function adjustPolityHistory (arg0_entity_id, arg1_date, arg2_date) {
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
    var old_timestamp = getTimestamp(parseTimestamp(entry_date));
    var popup_el = document.querySelector(`.leaflet-popup[class~='${entity_id}']`);

    //Move history_entry to new timestamp
    if (entity_obj)
      if (history_entry) {
        //Only change date of keyframe if it does not conflict with the same keyframe
        if (history_entry.id != timestampToInt(new_timestamp)) {
          //Move to new_timestamp
          entity_obj.options.history[new_timestamp] = history_entry;
          var new_history_entry = entity_obj.options.history[new_timestamp];

          //Delete old timestamp; change ID
          delete entity_obj.options.history[old_timestamp];
          new_history_entry.id = timestampToInt(new_timestamp);

          entity_obj.options.history = sortObject(entity_obj.options.history, "numeric_ascending");

          if (context_menu_el) {
            //Repopulate bio; move it to new history entry
            populateEntityBio(entity_id);

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

  function createHistoryFrame (arg0_entity_id, arg1_date, arg2_options, arg3_coords) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = arg1_date;
    var options = arg2_options;
    var coords = arg3_coords;

    //Declare local instance variables
    var date_string = getTimestamp(date);
    var entity_key = getEntity(entity_id, { return_key: true });
    var hierarchy_obj = main.hierarchies.hierarchy;
    var old_history_entry = getPolityHistory(entity_id, date);

    var entity_obj = (typeof entity_id != "object") ?
      main.entities[entity_key] : entity_id;

    if (entity_obj) {
      //Make sure history object is initailised
      if (!entity_obj.options.history) entity_obj.options.history = {};

      //Fetch actual coords
      var actual_coords;

      if (!coords) {
        actual_coords = (old_history_entry) ?
          old_history_entry.coords :
          entity_obj._latlngs;
      } else {
        actual_coords = coords;
      }

      //Create new history object
      if (!entity_obj.options.history[date_string])
        entity_obj.options.history[date_string] = {
          id: timestampToInt(date_string),

          coords: actual_coords,
          options: {}
        };

      //Manually transcribe options to avoid recursion
      var all_option_keys = Object.keys(options);
      var local_history = entity_obj.options.history[date_string];

      local_history.coords = actual_coords;
      if (!local_history.options) local_history.options;

      for (var i = 0; i < all_option_keys.length; i++)
        if (!["history", "type"].includes(all_option_keys[i]))
          local_history.options[all_option_keys[i]] = options[all_option_keys[i]];

      //Delete local_history if it's the same as old_history_entry
      if (old_history_entry)
        if (
          JSON.stringify(old_history_entry.coords) == JSON.stringify(local_history.coords) && JSON.stringify(old_history_entry.options) == JSON.stringify(local_history.options) &&
          old_history_entry.id != local_history.id
        )
          delete entity_obj.options.history[date_string];

      //Delete local_history.options if not needed
      if (!local_history.options)
        delete local_history.options;

      //Fix entity_obj history order
      entity_obj.options.history = sortObject(entity_obj.options.history, "numeric_ascending");
    }
  }

  function deletePolityHistory (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var entry_date = arg1_date;

    //Declare local instance variables
    var context_menu_el = document.getElementById(`entity-ui-context-menu-${entity_id}`);
    var entity_obj = getEntity(entity_id);
    var history_key = getPolityHistory(entity_id, entry_date, { return_key: true });
    var popup_el = document.querySelector(`.leaflet-popup[class~='${entity_id}']`);

    //Delete polity history if it exists
    if (entity_obj.options.history)
      if (history_key) {
        delete entity_obj.options.history[history_key];

        if (context_menu_el) {
          popup_el.after(context_menu_el);
          closeContextMenu(entity_id);

          populateEntityBio(entity_id);
        }

        //Delete entity if no history entries are left
        if (Object.keys(entity_obj.options.history).length == 0)
          deleteEntity(entity_id);
      }
  }

  function editPolityHistory (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var entry_date = arg1_date;

    //Change date to entry_date
    date = entry_date;

    //Edit entity
    editEntity(entity_id);
  }

  function getEntityProperty (arg0_entity_id, arg1_property, arg2_date, arg3_previous_property) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var property = arg1_property;
    var date = arg2_date;
    var previous_property = arg3_previous_property;

    //Declare local instance variables
    var ending_timestamp = (date) ? getTimestamp(date) : getTimestamp(main.date);
    var entity_value;
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    if (entity_obj) {
      if (entity_obj.options)
        if (entity_obj.options.history) {
          var all_history_entries = Object.keys(entity_obj.options.history);

          for (var i = 0; i < all_history_entries.length; i++) {
            var local_history = entity_obj.options.history[all_history_entries[i]];

            if (parseInt(local_history.id) <= ending_timestamp)
              if (local_history.options)
                if (local_history.options[property])
                  entity_value = local_history.options[property];
          }

          if (!entity_value)
            entity_value = entity_obj.options[property];
        }

      //Return statement
      return entity_value;
    }
  }

  function getFirstHistoryFrame (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    //If entity_obj exists, check options.history for first date
    if (entity_obj)
      if (entity_obj.options)
        if (entity_obj.options.history) {
          var all_history_frames = Object.keys(entity_obj.options.history);
          var history_frame = {
            coords: [],
            options: {}
          };

          if (all_history_frames.length >= 1) {
            var first_history_frame = entity_obj.options.history[all_history_frames[0]];

            history_frame.id = first_history_frame.id;
            history_frame.is_founding = true;
            if (first_history_frame.coords)
              history_frame.coords = first_history_frame.coords;
            if (first_history_frame.options)
              history_frame.options = mergeObjects(history_frame.options, first_history_frame.options, "override");

            //Return statement
            return history_frame;
          }
        }
  }

  /*
    getHistoryFrame() - Returns the history frame of an entity.
    Returns: {
      is_founding: true/false, - Whether this frame is the founding frame

      id: "1943983189043", - The current history timestamp
      coords: [], - An array of Naissance coords representing the poly
      options: {} - A list of customisation options
    }
  */
  function getHistoryFrame (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = (arg1_date) ? arg1_date : main.date;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var history_frame = {
      coords: [],
      options: {}
    };
    var current_timestamp = timestampToInt(getTimestamp(date));

    var all_history_frames = Object.keys(entity_obj.options.history);

    //Iterate over all_history_frames
    for (var i = 0; i < all_history_frames.length; i++)
      if (timestampToInt(all_history_frames[i]) <= current_timestamp) {
        var local_history_frame = entity_obj.options.history[all_history_frames[i]];

        //is_founding handler
        if (i == 0) {
          history_frame.is_founding = true;
        } else {
          delete history_frame.is_founding;
        }

        //Other data structures
        history_frame.id = local_history_frame.id;
        if (local_history_frame.coords)
          history_frame.coords = local_history_frame.coords;
        if (local_history_frame.options)
          history_frame.options = mergeObjects(history_frame.options, local_history_frame.options, "override");
      } else {
        break; //Break once past timestamp, no point in continuing on
      }

    //Return statement
    return history_frame;
  }

  /*
    getPolityHistory() - Returns a polity history entry for the specified date
    options: (Object)
      return_key: (Boolean) - Whether to return the key instead of the object. False by default
  */
  function getPolityHistory (arg0_entity_id, arg1_date, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var entry_date = arg1_date;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var entry_timestamp = getTimestamp(arg1_date);

    //Check that entity_obj actually exists
    if (entity_obj)
      if (entity_obj.options.history) {
        var all_entity_histories = Object.keys(entity_obj.options.history);
        var current_entry = undefined;

        for (var i = 0; i < all_entity_histories.length; i++)
          if (timestampToInt(entry_timestamp) >= timestampToInt(all_entity_histories[i]))
            current_entry = (!options.return_key) ? entity_obj.options.history[all_entity_histories[i]] : all_entity_histories[i];
      }

    //Return statement
    return current_entry;
  }
}

//Entity keyframe handling
{
  function getEntityCoords (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = (arg1_date) ? arg1_date : main.date;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    //Return statement
    return entityHasProperty(entity_obj, date, function (local_history) {
      if (local_history.coords)
        return local_history.coords;
    })
  }

  /*
    getLastCoords() - Fetches the last valid .coords field from a Naissance entity.
    options: {
      different_coords: true/false - Optional. Whether the coords are required to be different. False by default.
    }
  */
  function getLastCoords (arg0_entity_id, arg1_history_frame, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var history_frame = arg1_history_frame;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var last_history_coords = [];

    if (entity_obj)
      if (entity_obj.options.history) {
        var all_history_frames = Object.keys(entity_obj.options.history);
        var current_index = all_history_frames.indexOf(history_frame.id.toString());

        //Iterate backwards from current_index
        for (var i = current_index; i >= 0; i--) {
          var local_history_entry = entity_obj.options.history[all_history_frames[i]];

          //Return statement
          if (local_history_entry.coords)
            if (options.different_coords) {
              if (JSON.stringify(local_history_entry.coords) != JSON.stringify(history_frame.coords))
                return local_history_entry.coords;
            } else {
              if (local_history_entry.coords.length > 0)
                return local_history_entry.coords;
            }
        }
      }
  }

  function getLastIdenticalCoords (arg0_entity_id, arg1_history_frame) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var history_frame = arg1_history_frame;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    if (entity_obj)
      if (entity_obj.options.history) {
        var all_history_frames = Object.keys(entity_obj.options.history);
        var current_index = all_history_frames.indexOf(history_frame.id.toString());

        //Iterate backwards from current_index
        for (var i = current_index; i >= 0; i--)
          if (i != current_index) {
            var local_history_entry = entity_obj.options.history[all_history_frames[i]];

            if (JSON.stringify(local_history_entry.coords) == JSON.stringify(history_frame.coords))
              //Return statement
              return local_history_entry.coords;
          }
      }
  }
}

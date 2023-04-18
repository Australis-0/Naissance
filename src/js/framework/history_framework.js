//Declare functions
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
  var popup_el = document.querySelector(`.leaflet-popup[class~='${entity_id}']`);

  //Move history_entry to new timestamp
  if (entity_obj)
    if (history_entry) {
      //Only change date of keyframe if it does not conflict with the same keyframe
      if (history_entry.id != new_timestamp) {
        //Move to new_timestamp
        entity_obj.options.history[new_timestamp] = history_entry;
        var new_history_entry = entity_obj.options.history[new_timestamp];

        //Delete old timestamp; change ID
        delete entity_obj.options.history[history_entry.id];
        new_history_entry.id = new_timestamp;

        if (context_menu_el) {
          //Repopulate bio; move it to new history entry
          populateEntityBio(entity_id);

          var new_history_entry_el = document.querySelector(`#entity-ui-timeline-bio-table-${entity_id} tr[timestamp="${new_history_entry.id}"]`);

          new_history_entry_el.after(context_menu_el);
          new_history_entry_el.after(context_menu_date_el);
        }
      }
    } else {
      console.warn(`Could not find history entry for ${entity_id} at timestamp ${entry_date}!`);
    }
}

function createHistoryEntry (arg0_entity_id, arg1_date, arg2_options, arg3_coords) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var date = arg1_date;
  var options = arg2_options;
  var coords = arg3_coords;

  //Declare local instance variables
  var date_string = getTimestamp(date);
  var entity_obj = getEntity(entity_id);
  var old_history_entry = getPolityHistory(entity_id, date);

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
        id: date_string,

        coords: actual_coords,
        options: {}
      };

    //Manually transcribe options to avoid recursion
    var all_option_keys = Object.keys(options);
    var local_history = entity_obj.options.history[date_string];

    local_history.coords = actual_coords;

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

/*
  getPolityHistory() - Returns a polity history entry for the specified date
  options: {
    layer: "" - Layer the polity sits on. Used for optimisation
    return_key: true/false - Whether to return the key instead of the object. False by default
  }
*/
function getPolityHistory (arg0_entity_id, arg1_date, arg2_options) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var entry_date = arg1_date;
  var options = (arg2_options) ? arg2_options : {};

  //Declare local instance variables
  var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id, options.layer) : entity_id;
  var entry_timestamp = getTimestamp(arg1_date);

  //Check that entity_obj actually exists
  if (entity_obj)
    if (entity_obj.options.history) {
      var all_entity_histories = Object.keys(entity_obj.options.history);
      var current_entry = undefined;

      for (var i = 0; i < all_entity_histories.length; i++)
        if (entry_timestamp >= parseInt(all_entity_histories[i]))
          current_entry = (!options.return_key) ? entity_obj.options.history[all_entity_histories[i]] : all_entity_histories[i];
    }

  //Return statement
  return current_entry;
}

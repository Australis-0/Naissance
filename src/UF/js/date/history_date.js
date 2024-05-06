/*
  adjustObjectHistory() - Adjusts an object history keyframe to that of another date/timestamp.
  arg0_object: (Object) - The object being referenced.
  arg1_date_object: (Object, Date) - The keyframe to move.
  arg2_date_object: (Object, Date) - The date to move the keyframe to.

  Returns: (Object)
*/
function adjustObjectHistory (arg0_object, arg1_date_object, arg2_date_object) {
  //Convert from parameters
  var local_object = arg0_object;
  var entry_date = arg1_date;
  var move_to_date = arg2_date;

  //Declare local instance variables
  var history_entry = getObjectHistory(local_object, entry_date);
  var new_timestamp = getTimestamp(move_to_date);
  var old_timestamp = getTimestamp(parseTimestamp(entry_date));

  //Move history_entry to new_timestamp
  if (history_entry)
    if (history_entry.id != timestampToInt(new_timestamp)) {
      //Move to new_timestamp
      local_object.options.history[new_timestamp] = history_entry;
      var new_history_entry = local_object.options.history[new_timestamp];

      //Delete old timestamp; change ID
      delete local_object.options.history[old_timestamp];
      new_history_entry.id = timestampToInt(new_timestamp);

      local_object.options.history = sortObject(local_object.options.history, "numeric_ascending");
    }

  //Return statement
  return local_object;
}

/*
  checkObjectHistory() - Checks whether an object has a given property defined somewhere in its history.
  arg0_object: (Object) - The object being referenced.
  arg1_date_object: (Object, Date) - The date being referenced.
  arg2_conditional_function: (Function) - The conditional function to check for in all history entries.

  Returns: (Boolean/Variable)
*/
function checkObjectHistory (arg0_object, arg1_date_object, arg2_conditional_function) {
  //Convert from parameters
  var local_object = arg0_object;
  var date = getTimestamp(arg1_date_object);
  var conditional_function = arg2_conditional_function;

  //Declare local instance variables
  var ending_timestamp = (date) ? getTimestamp(date) : getTimestamp(window.date);
  var has_property;

  //Check if object has history
  if (local_object.options)
    if (local_object.options.history) {
      var all_history_frames = Object.keys(local_object.options.history);

      //Iterate over all_history_frames
      for (var i = 0; i < all_history_frames.length; i++) {
        var local_history = local_object.options.history[all_history_frames[i]];

        if (parseInt(local_history.id) <= timestampToInt(ending_timestamp))
          has_property = conditional_function(local_history);
      }
    }

  //Return statement
  return has_property;
}

/*
  createObjectHistory() - Creates an object history keyframe at the current date.
  arg0_object: (Object) - The object being referenced.
  arg1_date_object: (Object, Date) - The date to create a history keyframe at.
  arg2_options: (Object) - Optional. The actual .options styling data being carried at this frame. Undefined by default
  arg3_coords: (Array<Array<Number, Number>, ...>) - The coordinates to input for this frame. Defaults to old coordinates if available.

  Returns: (Object)
*/
function createObjectHistory (arg0_object, arg1_date_object, arg2_options, arg3_coords) {
  //Convert from parameters
  var local_object = arg0_object;
  var date = arg1_date_object;
  var options = arg2_options;
  var coords = arg3_coords;

  //Declare local instance variables
  var date_string = getTimestamp(date);
  var old_history_entry = getObjectHistory(local_object, date);

  if (local_object) {
    //Make sure history object is initialised
    if (!local_object.options) local_object.options = {};
    if (!local_object.options.history) local_object.options.history = {};

    //Fetch actual_coords
    var actual_coords;

    if (!coords) {
      if (old_history_entry)
        actual_coords = old_history_entry.coords;
    } else {
      actual_coords = coords;
    }

    //Create new history object
    if (!local_object.options.history[date_string])
      local_object.options.history[date_string] = {
        id: timestampToInt(date_string),
        coords: actual_coords,
        options: {};
      };

    //Manually transcribe options to avoid recursion
    var all_option_keys = Object.keys(options);
    var local_history = local_object.options.history[date_string];

    local_history.coords = actual_coords;
    if (!local_history.options) local_history.options);

    //Iterate over all_option_keys
    for (var i = 0; i < all_option_keys.length; i++)
        if (!["history", "type"].includes(all_option_keys[i]))
          local_history.options[all_option_keys[i]] = options[all_option_keys[i]];

      //Delete local_history if it's the same as old_history_entry
      if (old_history_entry)
        if (
          JSON.stringify(old_history_entry.coords) == JSON.stringify(local_history.coords) && JSON.stringify(old_history_entry.options) == JSON.stringify(local_history.options) &&
          old_history_entry.id != local_history.id
        )
          delete local_object.options.history[date_string];

    //Delete local_history.options if not needed
    if (!local_history.options)
      delete local_history.options;

    //Fix local_object history order
    local_object.options.history = sortObject(local_object.options.history, "numeric_ascending");
  }

  //Return statement
  return local_object;
}

/*
  deleteObjectHistory() - Deletes an object history keyframe.
  arg0_object: (Object) - The object being referenced.
  arg1_date_object: (Object, Date) - The date to delete a history keyframe at.

  Returns: (Object)/undefined if all history entries deleted
*/
function deleteObjectHistory (arg0_object, arg1_date_object) {
  //Convert from parameters
  var local_object = arg0_object;
  var date = getTimestamp(arg1_date_object);

  //Declare local instance variables
  var history_key = getObjectHistory(local_object, date, { return_key: true });

  //Delete object history if it exists
  if (local_object.options)
    if (local_object.options.history)
      if (history_key) {
        delete local_object.options.history[history_key];

        //Delete entity if no history entries are left by returning undefined
        if (Object.keys(local_object.options.history).length == 0)
          return undefined;
      }

  //Return statement
  return local_object;
}

/*
  getFirstHistoryFrame() - Returns the first history frame of an object.
  arg0_object: (Object) - The object being referenced.

  Returns: (Object)
*/
function getFirstHistoryFrame (arg0_object) {
  //Convert from parameters
  var local_object = arg0_object;

  //Check options.history for first date
  if (local_object.options)
    if (local_object.options.history) {
      var all_history_frames = Object.keys(local_object.options.history);
      var history_frame = {
        coords: [],
        options: {};
      };

      if (all_history_frames.length >= 1) {
        var first_history_frame = local_object.options.history[all_history_frames[0]];

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
  getHistoryCoords() - Fetches the coords of an object at a certain date.
  arg0_object: (Object) - The object being referenced.
  arg1_date_object: (Object, Date) - The date being referenced.

  Returns: (Array<Array<Number, Number>, ...>)
*/
function getHistoryCoords (arg0_object, arg1_date_object) {
  //Convert from parameters
  var local_object = arg0_object;
  var date = getTimestamp(arg1_date_object);

  //Return statement
  return checkObjectHistory(local_object, date, function (local_history) {
    if (local_history.coords)
      return local_history.coords
  });
}

/*
  getHistoryFrame() - Returns the history frame of an entity.
  arg0_object: (Object) - The object being referenced.
  arg1_date_object: (Object, Date) - The date being referenced.

  Returns: (Object)
*/
function getHistoryFrame (arg0_object, arg1_date_object) {
  //Convert from parameters
  var local_object = arg0_object;
  var date = getTimestamp(arg1_date_object);

  //Declare local instance variable
  var history_frame = {
    coords: [],
    options: {}
  };
  var current_timestamp = timestampToInt(getTimestamp(date));

  //Check if options.history exists
  if (local_object.options)
    if (local_object.options.history) {
      var all_history_frames = Object.keys(local_object.options.history);

      //Iterate over all_history_frames
      for (var i = 0; i < all_history_frames.length; i++)
        if (timestampToInt(all_history_frames[i]) <= current_timestamp) {
          var local_history_frame = local_object.options.history[all_history_frames[i]];

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
    }

  //Return statement
  return history_frame;
}

/*
  getLastCoords() - Fetches the last valid .coords field from an object.
  arg0_object: (Object) - The object being referenced.
  arg1_history_frame: (Object) - The history frame object being referenced.
  arg2_options: (Object)
    different_coords: (Boolean) - Optional. Whether the coords are required to be different. False by default.

  Returns: (Array<Array<Number, Number>, ...>)
*/
function getLastCoords (arg0_object, arg1_history_frame, arg2_options) {
  //Convert from parameters
  var local_object = arg0_object;
  var history_frame = arg1_history_frame;
  var options = (arg2_options) ? arg2_options : {};

  //Declare local instance variables
  var last_history_coords = [];

  //Check if .options.history exists
  if (local_object.options)
    if (local_object.options.history) {
      var all_history_frames = Object.keys(local_object.options.history);
      var current_index = all_history_frames.indexOf(history_frame.id.toString());

      //Iterate backwards from current index
      for (var i = current_index; i >= 0; i--) {
        var local_history_entry = local_object.options.history[all_history_frames[i]];

        //Return statement
        if (local_history_entry.coords)
          if (options.different_coords) {
            if (JSON.stringify(local_history_entry.coords) != JSON.stringify(history_frame.coords))
              //Return statement
              return local_history_entry.coords;
          } else {
            if (local_history_entry.coords.length > 0)
              //Return statement
              return local_history_entry.coords;
          }
      }
    }
}

/*
  getLastIdenticalCoords() - Fetches the last identical coords prior to the current frame.
  arg0_object: (Object) - The object being referenced.
  arg1_history_frame: (Object) - The history frame object being referenced.

  Returns: (Array<Array<Number, Number>, ...>)
*/
function getLastIdenticalCoords (arg0_object, arg1_history_frame) {
  //Convert from parameters
  var local_object = arg0_object;
  var history_frame = arg1_history_frame;

  //Check if .options.history exists
  if (local_object.options)
    if (local_object.options.history) {
      var all_history_frames = Object.keys(local_object.options.history);
      var current_index = all_history_frames.indexOf(history_frame.id.toString());

      //Iterate backwards from current_index
      for (var i = current_index; i >= 0; i--)
        if (i != current_index) {
          var local_history_entry = local_object.options.history[all_history_frames[i]];

          if (JSON.stringify(local_history_entry.coords) == JSON.stringify(history_frame.coords))
            //Return statement
            return local_history_entry.coords;
        }
    }
}

/*
  getObjectHistory() - Returns a history frame for the specified date.
  arg0_object: (Object) - The object being referenced.
  arg1_date_object: (Object, Date) - The date being referenced.
  arg2_options: (Object)
    return_key: (Boolean) - Optional. Whether to return the key instead of the object. False by default.

  Returns: (Object)
*/
function getObjectHistory (arg0_object, arg1_date_object, arg2_options) {
  //Convert from parameters
  var local_object = arg0_object;
  var arg1_date_object = arg1_date_object;
  var options = (arg2_options) ? arg2_options : {};

  //Declare local instance variables
  var entry_timestamp = getTimestamp(arg1_date_object);

  //Check that .options.history actually exists
  if (local_object.options)
    if (local_object.options.history) {
      var all_history_frames = Object.keys(local_object.options.history);
      var current_entry = undefined;

      //Iterate over all_history_frames
      for (var i = 0; i < all_history_frames.length; i++)
        if (timestampToInt(entry_timestamp) >= timestampToInt(all_history_frames[i]))
          current_entry = (!options.return_key) ? local_object.options.history[all_history_frames[i]] : all_history_frames[i];
    }

  //Return statement
  return current_entry;
}

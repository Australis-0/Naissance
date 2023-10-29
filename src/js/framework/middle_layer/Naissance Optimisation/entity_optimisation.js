//Internals functions - Should not actually be used by end dev
{
  function isSameFrame (arg0_history_frame, arg1_history_frame) {
    //Convert from parameters
    var history_frame = arg0_history_frame;
    var ot_history_frame = arg1_history_frame;

    //Return statement
    return (
      JSON.stringify(history_frame.coords) == JSON.stringify(ot_history_frame.coords) &&
      JSON.stringify(history_frame.options) && JSON.stringify(ot_history_frame.options));
  }
}

//Entity keyframe optimisation
{
  //Removes duplicate keyframes
  function cleanKeyframes (arg0_entity_id, arg1_tolerance) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var tolerance = getTimestamp(arg1_tolerance);

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    if (entity_obj)
      if (entity_obj.options.history) {
        var all_history_entries = Object.keys(entity_obj.options.history);

        for (var i = all_history_entries.length - 1; i >= 0; i--)
          if (parseInt(all_history_entries[i]) >= (getTimestamp(window.date) - tolerance)) {
            var empty_options = false;
            var local_history_entry = entity_obj.options.history[all_history_entries[i]];
            var local_last_coords = getLastCoords(entity_obj, local_history_entry, {
              different_coords: true
            });
            var remove_frame = false;

            //Remove .coords if last coords are the same
            if (JSON.stringify(local_last_coords.coords) == JSON.stringify(local_history_entry.coords))
              delete local_history_entry.coords;

            //Remove frame if same .coords and options is empty
            if (local_history_entry.options)
              if (Object.keys(local_history_entry.options).length == 0) {
                empty_options = true;
                delete local_history_entry.options;
              }

            if (!local_history_entry.coords) {
              remove_frame = empty_options;
            } else {
              if (!local_history_entry.options)
                remove_frame = true;
            }

            //Remove frame if needed
            if (remove_frame)
              delete entity_obj.options.history[all_history_entries[i]];
          }

        //Repopulate entity bio; refresh UI
        populateEntityBio(entity_id);
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
        var current_history_entry = getPolityHistory(entity_obj, window.date);

        current_history_entry.coords = convertToNaissance(simplified_coords);
      }

      //Refresh entity_obj
      entity_obj.remove();
      entity_obj.addTo(map);
    }
  }
}

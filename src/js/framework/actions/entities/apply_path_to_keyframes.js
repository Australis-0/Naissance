//Initialise functions
{
  function applyPathToKeyframes (arg0_entity_id, arg1_keyframes) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var keyframes = getList(arg1_keyframes);

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    if (entity_obj) {
      var current_history_entry = getLastHistoryFrame(entity_id, main.date);

      //Make sure keyframes is defined
      if (!keyframes)
        keyframes = (entity_obj.options.selected_keyframes) ? entity_obj.options.selected_keyframes : [];
      //Iterate over all keyframes
      for (var i = 0; i < keyframes.length; i++) {
        var local_timestamp = getTimestamp(keyframes[i]);

        var local_history_entry = entity_obj.options.history[local_timestamp];
        local_history_entry.coords = current_history_entry.coords;
      }
    }

    //Repopulate entity bio; refresh UI
    printEntityBio(entity_id);
  }
}

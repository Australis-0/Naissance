//Entity action functions
{
  //Keyframe actions
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

      populateEntityBio(entity_id);
    }

    function editKeyframe (arg0_entity_id, arg1_timestamp) {
      //Convert from parameters
      var entity_id = arg0_entity_id;
      var timestamp = arg1_timestamp;

      //Close entity UI, call editEntity()
      closeEntityUI();
      main.date = parseTimestamp(timestamp);
      loadDate();
      editEntity(entity_id);
    }
  }
}

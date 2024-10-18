//Declare function
{
  function initOptimisation () {
    //BRUSH ACTIONS
    //Set .flattened_brush_actions
    config.flattened_brush_actions = dumbFlattenObject(config.brush_actions);

    config.alL_brush_actions = getAllBrushActions();
    config.all_brush_actions_keys = getAllBrushActions({ return_keys: true });
    config.brush_actions_lowest_order = getBrushActionsLowestOrder();

    //ENTITY ACTIONS
    //Set .flattened_entity_actions
    config.flattened_entity_actions = dumbFlattenObject(config.entity_actions);

    config.all_entity_actions = getAllEntityActions();
    config.all_entity_actions_keys = getAllEntityActions({ return_keys: true });
    config.entity_actions_lowest_order = getEntityActionsLowestOrder();

    //ENTITY KEYFRAMES
    //Set .all_entity_keyframes; .all_entity_keyframe_objects
    config.flattened_entity_keyframes = dumbFlattenObject(config.entity_keyframes);

    config.all_entity_keyframes = getAllEntityKeyframes();
    config.all_entity_keyframe_keys = getAllEntityKeyframes({ return_keys: true });
    config.entity_keyframes_lowest_order = getEntityKeyframesLowestOrder();

    //Process entity_keyframes
    {
      //Iterate over all_entity_keyframe_categories
      var all_entity_keyframe_categories = Object.keys(config.entity_keyframes);

      for (var i = 0; i < all_entity_keyframe_categories.length; i++) {
        var local_entity_keyframe_category = config.entity_keyframes[all_entity_keyframe_categories[i]];

        //Iterate over all_local_entity_keyframes; set .id
        var all_local_entity_keyframes = Object.keys(local_entity_keyframe_category);

        for (var x = 0; x < all_local_entity_keyframes.length; x++) {
          var local_keyframe = config.flattened_entity_keyframes[all_local_entity_keyframes[x]];

          //Set essential metadata fields
          if (!local_keyframe.id) local_keyframe.id = all_local_entity_keyframes[x];
          local_keyframe.key = all_local_entity_keyframes[x];
        }
      }
    }
  }
}

//Declare Mask framework functions
{
  /*
    addGroupMask() - Sets an entire group to have a mask according to mode

    mode: "add"/"clear"/"subtract",
      - "add" allows the group to subtract from current selection,
      - "clear" removes all group masks from current selection,
      - "subtract" allows the current selection to subtract from all entities in group
    options: {
      do_not_override_entity_masks: true/false - Whether to override entity masks. [REVISIT] - To be implemented in future
    }
  */
  function addGroupMask (arg0_group_id, arg1_mode, arg2_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var mode = (arg1_mode) ? arg1_mode : "add";
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var group_obj = getGroup(group_id);

    var group_el = document.querySelector(`#hierarchy .group[id="${group_id}"]`);
    var group_el_class;

    if (group_el)
      group_el_class = group_el.getAttribute("class");

    removeGroupMask(group_obj.id, options);

    //Mode handling
    if (mode == "add") {
      //Set group_el class
      if (group_el_class) {
        //Edit class display
        var new_class = removeClasses(group_el, reserved.mask_classes);
        group_el.setAttribute("class", `${new_class} mask-add`);

        //Get all selected entities and add to window.brush.mask_add
        var all_selected_entities = getGroupEntities(group_obj.id);

        brush.mask_add = appendArrays(brush.mask_add, all_selected_entities);
        group_obj.mask = "add";
      }
    } else if (mode == "intersect_add") {
      //Set group_el class
      if (group_el_class) {
        //Edit class display
        var new_class = removeClasses(group_el, reserved.mask_classes);
        group_el.setAttribute("class", `${new_class} mask-intersect_add`);

        //Get all selected entities and add to window.brush.mask_add
        var all_selected_entities = getGroupEntities(group_obj.id);

        brush.mask_intersect_add = appendArrays(brush.mask_intersect_add, all_selected_entities);
        group_obj.mask = "intersect_add";
      }
    } else if (mode == "intersect_overlay") {
      //Set group_el class
      if (group_el_class) {
        //Edit class display
        var new_class = removeClasses(group_el, reserved.mask_classes);
        group_el.setAttribute("class", `${new_class} mask-intersect_overlay`);

        //Get all selected entities and add to window.brush.mask_add
        var all_selected_entities = getGroupEntities(group_obj.id);

        brush.mask_intersect_overlay = appendArrays(brush.mask_intersect_overlay, all_selected_entities);
        group_obj.mask = "intersect_overlay";
      }
    } else if (mode == "subtract") {
      //Set group_el class
      if (group_el_class) {
        var new_class = removeClasses(group_el, reserved.mask_classes);
        group_el.setAttribute("class", `${new_class} mask-subtract`);

        //Get all selected entities and add to window.brush.mask_subtract
        var all_selected_entities = getGroupEntities(group_obj.id);

        brush.mask_subtract = appendArrays(brush.mask_subtract, all_selected_entities);
        group_obj.mask = "subtract";
      }
    }
  }

  function removeEntityMask (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    //Initialise local instance variables
    entity_id = entity_obj.options.className;

    //Iterate over all mask types
    for (var i = 0; i < reserved.mask_types.length; i++) {
      var local_mask = window.brush[`mask_${reserved.mask_types[i]}`];

      //Remove entity_id from mask
      for (var x = local_mask.length - 1; x >= 0; x--) {
        var local_entity = local_mask[x];

        if (local_entity.options.className == entity_id)
          local_mask.splice(x, 1);
      }
    }

  }

  /*
    removeGroupMask() - Sets an entire group to no longer have a mask

    options: {
      do_not_override_entity_masks: true/false - Whether to override entity masks. [REVISIT] - To be implemented in future
    }
  */
  function removeGroupMask (arg0_group_id, arg1_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var group_obj = getGroup(group_id);

    var group_el = document.querySelector(`#hierarchy .group[id="${group_id}"]`);

    //Edit class display
    if (group_el) {
      var all_selected_entity_keys = getGroupEntities(group_obj.id, { return_keys: true });
      var new_class = removeClasses(group_el, reserved.mask_classes);

      //Get all selected_entities and remove from all masks
      for (var i = 0; i < reserved.mask_types.length; i++) {
        var local_mask = window.brush[`mask_${reserved.mask_types[i]}`];

        //Remove all_selected_entity_keys from mask
        for (var x = local_mask.length - 1; x >= 0; x--) {
          var local_entity = local_mask[x];
          var local_entity_id = local_entity.options.className;

          if (all_selected_entity_keys.includes(local_entity_id))
            local_mask.splice(x, 1);
        }
      }

      delete group_obj.mask;
    }
  }
}

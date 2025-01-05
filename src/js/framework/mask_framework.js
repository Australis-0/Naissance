//Declare Mask framework functions
{
  /*
    addGroupMask() - Sets an entire group to have a mask according to mode.
    arg0_group_id: (String)
    arg1_mode: (String) - "add"/"clear"/"subtract",
      - "add" allows the group to subtract from current selection,
      - "clear" removes all group masks from current selection,
      - "subtract" allows the current selection to subtract from all entities in group
    arg2_options: (Object)
      do_not_override_entity_masks: (Boolean) - Whether to override entity masks. [REVISIT] - To be implemented in future
  */
  function addGroupMask (arg0_group_id, arg1_mode, arg2_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var mode = (arg1_mode) ? arg1_mode : "add";
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var brush_obj = main.brush;
    var group_obj = main.hierarchies.hierarchy.groups[group_id];

    var group_el = document.querySelector(`#hierarchy .group[data-id="${group_id}"]`);
    var group_el_class;

    if (group_el) {
      group_el_class = group_el.getAttribute("class");
      window.temp_mask_el = group_el;
    }

    if (group_obj) {
      removeGroupMask(group_obj.id, options);

      //Mode handling
      if (["add", "intersect_add", "intersect_overlay", "subtract"].includes(mode))
        if (group_el_class) {
          var all_selected_entities = getGroupEntities("hierarchy", group_obj.id);

          //Get all selected entities and add to brush_obj.masks[mode]
          brush_obj.masks[mode] = appendArrays(brush_obj.masks[mode], all_selected_entities);
          group_obj.mask = mode;
        }
    }
  }

  function clearBrushInMasks () {
    //Declare local instance variables
    var brush_obj = main.brush;

    //Iterate over all config.mask_types
    for (var i = 0; i < config.mask_types.length; i++) {
      var local_mask = brush_obj.masks[config.mask_types[i]];

      //Remove all .selection from masks
      for (var x = local_mask.length - 1; x >= 0; x--) {
        var local_entity = local_mask[x];

        if (local_entity.selection) {
          local_mask.splice(x, 1);
        } else {
          var is_hidden = isEntityHidden(local_entity, main.date);

          if (is_hidden)
            local_mask.splice(x, 1);
        }
      }
    }
  }

  /*
    processGeometryMask() - Processes a given geometry mask.
    arg0_geometry: (Variable) - The geometry to input.
    arg2_options: (Object)
      mask_type: (String) - The mask type to input.
  */
  function processGeometryMask (arg0_geometry, arg1_scope, arg2_options) {
    //Convert from parameters
    var geometry = arg0_geometry;
    var scope = (arg1_scope) ? arg1_scope : {};
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);

    //Iterate over all_scope_keys
    for (var i = 0; i < all_scope_keys.length; i++) {
      var local_value = getList(scope[all_scope_keys[i]]);

      if (all_scope_keys[i] == "remove_brush_coords_from_selected_polities") {
        var mask_geometries = main.brush.masks[options.mask_type];

        for (var x = 0; x < mask_geometries.length; x++) {
          try {
            var local_coords = getEntityCoords(mask_geometries[x], main.date);
            var local_difference = difference(local_coords, main.brush.current_path);

            if (local_difference) {
              createHistoryFrame(mask_geometries[x].options.className, main.date, {}, local_difference);
            } else {
              hideEntity(mask_geometries[x].options.className, main.date);
            }
          } catch (e) {
            console.log(e);
          }
        }
      } else if (all_scope_keys[i] == "remove_brush_coords_outside_selected_polities") {
        var mask_geometries = main.brush.masks[options.mask_type];
        var mask_union;

        for (var x = 0; x < mask_geometries.length; x++)
          try {
            var local_coords = getEntityCoords(mask_geometries[x], main.date);

            mask_union = (x == 0) ?
              local_coords : union(mask_union, local_coords);
          } catch (e) {
            console.log(e);
          }

        if (mask_union && main.brush.current_path)
          geometry = intersection(main.brush.current_path, mask_union);
      } else if (all_scope_keys[i] == "remove_selected_polities_from_brush_coords") {
        var mask_geometries = main.brush.masks[options.mask_type];
        var mask_union;

        for (var x = 0; x < mask_geometries.length; x++)
          try {
            var local_coords = getEntityCoords(mask_geometries[x], main.date);

            mask_union = (x == 0) ?
              local_coords : union(mask_union, local_coords);
          } catch (e) {
            console.log(e);
          }

        if (mask_union && main.brush.current_path)
          geometry = difference(main.brush.current_path, mask_union);
      }
    }

    //Return statement
    return geometry;
  }

  /*
    processGeometryMasks() - Parses all masks currently in config.mask_types and applies each of them to the input geometry.
    arg0_geometry: (Variable) - The geometry to input.

    Returns: (Object, Maptalks)
  */
  function processGeometryMasks (arg0_geometry) {
    //Convert from parameters
    var geometry = arg0_geometry;

    //Declare local instance variables
    var all_mask_types_keys = Object.keys(config.mask_types);

    //Iterate over all_mask_types_keys and parse each effect
    for (var i = 0; i < all_mask_types_keys.length; i++) {
      var local_value = config.mask_types[all_mask_types_keys[i]];

      if (local_value.effect)
        if (main.brush.masks[all_mask_types_keys[i]])
          if (main.brush.masks[all_mask_types_keys[i]].length > 0)
            geometry = processGeometryMask(geometry, local_value.effect, {
              mask_type: all_mask_types_keys[i]
            });
    }

    //Return statement
    return geometry;
  }

  function removeEntityMask (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var brush_obj = main.brush;
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    //Initialise local instance variables
    entity_id = entity_obj.options.className;

    //Iterate over all mask types
    for (var i = 0; i < config.mask_types.length; i++) {
      var local_mask = brush_obj.masks[config.mask_types[i]];

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
    arg0_group_id: (String) - The group ID to reference in the current hierarchy.
    arg1_options: (Object)
      do_not_override_entity_masks: (Boolean) - Whether to override entity masks. [REVISIT] - To be implemented in future
  */
  function removeGroupMask (arg0_group_id, arg1_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var brush_obj = main.brush;
    var group_el = document.querySelector(`#hierarchy .group[data-id="${group_id}"]`);
    var group_obj = getGroup("hierarchy", group_id);

    //Edit class display
    if (group_el) {
      var all_selected_entity_keys = getGroupEntities("hierarchy", group_obj.id, { return_keys: true });
      var new_class = removeClasses(group_el, config.mask_classes);

      //Strip classes
      group_el.setAttribute("class", new_class);

      //Get all selected_entities and remove from all masks
      for (var i = 0; i < config.mask_types.length; i++) {
        var local_mask = brush_obj.masks[config.mask_types[i]];

        //Remove all_selected_entity_keys from mask
        for (var x = local_mask.length - 1; x >= 0; x--) {
          var local_entity = local_mask[x];
          var local_entity_id = local_entity.options.className;

          if (all_selected_entity_keys.includes(local_entity_id))
            local_mask.splice(x, 1);
        }
      }

      delete group_obj.mask;

      //Reload entity editing
      if (brush_obj.current_selection) {
        var selected_entity_id;

        //Finish entity; initialise selected_entity_id
        if (brush_obj.current_selection.options)
          if (brush_obj.current_selection.options.className)
            selected_entity_id = brush_obj.current_selection.options.className;
        if (!selected_entity_id) {
          selected_entity_id = finishEntity();
        } else {
          finishEntity();
        }

        editEntity(selected_entity_id);
      }
    }
  }
}

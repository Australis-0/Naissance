//Declare functions
{
  function addToBrush (arg0_polygon, arg1_do_not_add_to_undo_redo) {
    //Convert from parameters
    var polygon = arg0_polygon;
    var do_not_add_to_undo_redo = arg1_do_not_add_to_undo_redo;

    //Declare local instance variables
    var brush_obj = main.brush;

    try {
      //1. Initialise brush.current_path if not defined; process geometry masks
      polygon = processBrush(polygon);

      //2. Make sure intersection_polygon is defined for delta_polygon use
      var intersection_polygon;
      try { intersection_polygon = intersection(brush_obj.current_path, polygon); } catch (e) {}

      //3. Mark brush change and union with polygon
      brush_obj.brush_change = true;

      //4. Add to actions
      var delta_polygon;
      if (polygon)
        try { delta_polygon = difference(polygon, intersection_polygon); } catch (e) {}

      if (!do_not_add_to_undo_redo)
        performAction({
          action_id: "add_to_brush",
          redo_function: "addToBrush",
          redo_function_parameters: [polygon, true],
          undo_function: "removeFromBrush",
          undo_function_parameters: [delta_polygon, true]
        });
    } catch (e) {}

    //Return statement
    return polygon;
  }

  function clearBrush () {
    //Declare local instance variables
    var brush_obj = main.brush;

    if (brush_obj.current_selection) {
      if (brush_obj.current_selection.options.className)
        for (var i = 0; i < config.mask_types.length; i++) {
          var local_key = config.mask_types[i];

          brush_obj.masks[local_key] = reloadEntityInArray(brush_obj.masks[local_key], brush_obj.current_selection.options.className);
        }

      brush_obj.current_selection.remove();
      delete brush_obj.current_selection;
    }

    delete brush_obj.current_path;
    delete brush_obj.editing_entity;
    delete brush_obj.entity_options;
  }

  function removeFromBrush (arg0_polygon, arg1_do_not_add_to_undo_redo) {
    //Convert from parameters
    var polygon = arg0_polygon;
    var do_not_add_to_undo_redo = arg1_do_not_add_to_undo_redo;

    //Declare local instance variables
    var brush_obj = main.brush;

    try {
      //1. Set delta_polygon if possible
      var delta_polygon;
      try { delta_polygon = intersection(brush.current_path, polygon); } catch (e) {}

      brush_obj.brush_change = true;
      brush_obj.current_path = difference(brush_obj.current_path, polygon);
      refreshBrush();

      //2. Add to actions
      if (!do_not_add_to_undo_redo)
        performAction({
          action_id: "remove_from_brush",
          redo_function: "removeFromBrush",
          redo_function_parameters: [polygon, true],
          undo_function: "addToBrush",
          undo_function_parameters: [delta_polygon, true]
        });
    } catch (e) {
      console.log(e);
    }
  }

  function setBrushAutoSimplify (arg0_auto_simplify) {
    //Convert from parameters
    var auto_simplify = arg0_auto_simplify;

    //Declare local instance variables
    //console.log(auto_simplify);
    var brush_obj = main.brush;

    //Set actual brush_obj.auto_simplify_when_editing
    if (auto_simplify) {
      brush_obj.auto_simplify_when_editing = true;
    } else {
      delete brush_obj.auto_simplify_when_editing;
    }
    delete global.simplify_auto_simplify_when_editing;
  }

  function setBrushOnlySimplifyBrush (arg0_only_simplify_brush) {
    //Convert from parameters
    var only_simplify_brush = arg0_only_simplify_brush;

    //Declare local instance variables
    var brush_obj = main.brush;

    //Set actual brush_obj.only_simplify_brush
    if (only_simplify_brush) {
      brush_obj.only_simplify_brush = true;
    } else {
      delete brush_obj.only_simplify_brush;
    }
  }

  function setBrushSimplifyTolerance (arg0_tolerance) {
    //Convert from parameters
    var tolerance = arg0_tolerance;

    //Declare local instance variables
    var all_simplify_tolerance_range_els = document.querySelectorAll(`*:has(> [global_key="BRUSH_OBJ.simplify_tolerance"]`);
    var brush_obj = main.brush;

    //Iterate over all_simplify_tolerance_range_els
    for (var i = 0; i < all_simplify_tolerance_range_els.length; i++) {
      //Change range_el value first
      var local_range_el = all_simplify_tolerance_range_els[i].querySelector(`input[type="range"]`);
      local_range_el.value = tolerance;

      //Iterate over all_local_value_els and substitute them with the correct value
      var all_local_value_els = all_simplify_tolerance_range_els[i].querySelectorAll(`span[data-key="VALUE"]`);
      for (var x = 0; x < all_local_value_els.length; x++)
        all_local_value_els[x].innerHTML = tolerance;
    }

    //Set actual brush_obj.simplify_tolerance
    brush_obj.simplify_tolerance = tolerance;
  }
}

//Declare functions
{
  function clearBrush () {
    //Declare local instance variables
    var brush_obj = main.brush;

    //Clear brush; reload brush in masks
    clearBrushInMasks();

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

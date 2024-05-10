//Declare functions
{
  function clearBrush () {
    //Declare local instance variables
    var brush_obj = getBrush();

    //Clear brush; reload brush in masks
    clearBrushInMasks();

    if (main.brush.current_selection) {
      if (main.brush.current_selection.options.className)
        for (var i = 0; i < reserved.mask_types.length; i++) {
          var local_key = reserved.mask_types[i];

          brush_obj.masks[local_key] = reloadEntityInArray(brush_obj.masks[local_key], main.brush.current_selection.options.className);
        }

      main.brush.current_selection.remove();
      delete main.brush.current_selection;
    }

    delete main.brush.current_path;
    delete main.brush.editing_entity;
  }

  /*
    getBrush() - Returns the current brush object of the window

    Returns: {
      radius: 50000, - The current radius of the brush
      simplify_tolerance: 10 - The current simplify tolerance. 0 if disabled
    }
  */
  function getBrush () {
    //Declare local instance variables
    var brush_obj = main.brush;

    //Return statement
    return brush_obj;
  }
}

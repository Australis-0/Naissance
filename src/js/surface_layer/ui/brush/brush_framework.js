//Declare functions
{
  function clearBrush () {
    //Declare local instance variables
    var brush_obj = getBrush();

    //Clear brush; reload brush in masks
    clearBrushInMasks();

    if (window.selection) {
      if (window.selection.options.className)
        for (var i = 0; i < reserved.mask_types.length; i++) {
          var local_key = `mask_${reserved.mask_types[i]}`;

          brush_obj[local_key] = reloadEntityInArray(brush_obj[local_key], window.selection.options.className);
        }

      selection.remove();
      delete window.selection;
    }

    delete window.current_union;
    delete window.editing_entity;
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
    var brush_obj = window.brush;

    //Set extraneous brush options
    brush_obj.simplify_tolerance = window.simplify_tolerance;

    //Return statement
    return brush_obj;
  }
}

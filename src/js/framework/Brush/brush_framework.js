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
  }
}

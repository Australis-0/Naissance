//Declare functions
{
  function clearBrush () {
    if (window.selection)
      selection.remove();

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

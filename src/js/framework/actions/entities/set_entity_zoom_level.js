//Initialise functions
{
  /*
    setEntityMaximumZoomLevel() - Sets the entity's maximum zoom level.
    arg0_entity_id: (String) - The entity ID to input.
    arg1_maximum_zoom_level: (Number) - The maximum zoom level required for the entity to be visible.
    arg2_options: (Object)
      date: (Object, Date) - Optional. The current date by default.
      reload_entity: (Boolean) - Optional. Whether to reload the onmap entity. False by default.
  */
  function setEntityMaximumZoomLevel (arg0_entity_id, arg1_maximum_zoom_level, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var maximum_zoom_level = (arg1_maximum_zoom_level) ? parseInt(arg1_maximum_zoom_level) : 0;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.date) options.date = main.date;

    //Declare local instance variables
    var current_history = getHistoryFrame(entity_id, options.date);
    var entity_obj = getEntity(entity_id);

    if (returnSafeNumber(current_history.options.maximum_zoom_level) != maximum_zoom_level) {
      createHistoryFrame(entity_id, options.date, { maximum_zoom_level: maximum_zoom_level });

      if (options.reload_entity) updateEntityVisibility(entity_id);
    }
  }

  /*
    setEntityMinimumZoomLevel() - Sets the entity's minimum zoom level.
    arg0_entity_id: (String) - The entity ID to input.
    arg1_minimum_zoom_level: (Number) - The minimum zoom level required for the entity to be visible.
    arg2_options: (Object)
      date: (Object, Date) - Optional. The current date by default.
      reload_entity: (Boolean) - Optional. Whether to reload the onmap entity. False by default.
  */
  function setEntityMinimumZoomLevel (arg0_entity_id, arg1_minimum_zoom_level, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var minimum_zoom_level = (arg1_minimum_zoom_level) ? parseInt(arg1_minimum_zoom_level) : 0;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.date) options.date = main.date;

    //Declare local instance variables
    var current_history = getHistoryFrame(entity_id, options.date);
    var entity_obj = getEntity(entity_id);

    if (returnSafeNumber(current_history.options.minimum_zoom_level) != minimum_zoom_level) {
      createHistoryFrame(entity_id, options.date, { minimum_zoom_level: minimum_zoom_level });

      if (options.reload_entity) updateEntityVisibility(entity_id);
    }
  }
}

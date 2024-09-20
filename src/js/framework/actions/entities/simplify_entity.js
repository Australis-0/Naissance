//Initialise functions
{
  function simplifyEntity (arg0_entity_id, arg1_tolerance) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var tolerance = arg1_tolerance;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id

    if (entity_obj) {
      var simplified_coords = simplify(entity_obj._latlngs, tolerance);
      entity_obj._latlngs = simplified_coords;

      //Set history entry to reflect actual_coords
      if (entity_obj.options.history) {
        var current_history_entry = getPolityHistory(entity_obj, main.date);

        current_history_entry.coords = convertToNaissance(simplified_coords);
      }

      //Refresh entity_obj
      entity_obj.remove();
      entity_obj.addTo(map);
    }
  }
}

//Polity handling functions - Functions similar to class methods
{
  function getPolityArea (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = arg1_date;

    //Declare local instance variables
    var entity_area = 0;
    var entity_obj = getEntity(entity_id);

    //Check to make sure entity_obj exists
    if (entity_obj) {
      var is_extinct = isPolityHidden(entity_id, date);
      var last_coords = getEntityCoords(entity_id, date);

      if (last_coords)
        try {
          var local_coordinates = getTurfObject(last_coords);

          entity_area = (!is_extinct) ? turf.area(local_coordinates) : 0;
        } catch (e) {
          console.log(e);
          entity_area = 0;
        }
    }

    //Return statement
    return entity_area;
  }

  function isPolityHidden (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = arg1_date;

    //Return statement
    return entityHasProperty(entity_id, date, function (local_history) {
      var is_extinct;

      if (local_history.options)
        if (local_history.options.extinct) {
          is_extinct = local_history.options.extinct;
        } else if (local_history.options.extinct == false) {
          is_extinct = false;
        }

      return is_extinct;
    });
  }
}

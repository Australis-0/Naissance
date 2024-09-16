//Global Date Strings
var date_error_field = document.getElementById("date-error");
var day_field = document.getElementById("day-input");
var month_field = document.getElementById("month-input");
var year_field = document.getElementById("year-input");
var year_type_field = document.getElementById("year-type");

var hour_field = document.getElementById("hour-input");
var minute_field = document.getElementById("minute-input");

window.date_fields = [day_field, month_field, year_field, hour_field, minute_field];

//Date load functions
{
  function loadDate (arg0_old_date) {
    //Convert from parameters
    var old_date = arg0_old_date;

    //Declare local instance variables
    var brush_obj = main.brush;
    var render_order = getHierarchyRenderingOrder();

    //Clear map first before rendering entities
    clearMap();

    //Iterate over all entities and render them
    for (var i = 0; i < main.entities.length; i++) {
      var local_entity = main.entities[i];
      var local_entity_id = local_entity.options.className;
      var local_history = getPolityHistory(local_entity_id, main.date);

      //Reload object; add to map
      if (local_history) {
        //Update UIs for each open popup
        var local_popup = document.querySelector(`.leaflet-popup[class~="${local_entity_id}"]`);

        if (local_popup) {
          var name_field = local_popup.querySelector(`input#polity-name`);

          name_field.value = getEntityName(local_entity_id);
        }

        //Run through each options type
        if (local_entity.options.type == "polity") {
          //Make sure polity is not extinct
          if (!isEntityHidden(local_entity_id, main.date)) {
            var local_history_frame = getHistoryFrame(local_entity, main.date);
            var local_options = JSON.parse(JSON.stringify(local_entity.options));

            //Overwrite local_options with local_history_options
            var all_local_history_options = Object.keys(local_history_frame.options);

            for (var x = 0; x < all_local_history_options.length; x++)
              local_options[all_local_history_options[x]] = local_history_frame.options[all_local_history_options[x]];

            main.entities[i] = L.polygon(local_history_frame.coords, local_options).addTo(map);
            main.entities[i].on("click", function (e) {
              printEntityContextMenu(e.target.options.className, { coords: e.latlng, is_being_edited: false, pin: true });
            });

            //If this is the current selected polity, re-add cursor
            if (brush_obj.editing_entity == local_entity_id)
              clearBrush();
          }
        }
      }
    }

    //Update Left Sidebar
    autoFillDate();
    refreshHierarchy();
  }
}

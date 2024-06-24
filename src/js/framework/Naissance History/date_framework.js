//Global Date Strings
window.bc_leap_years = [
  -45, -42, -39, -36, -33, -30, -27, -24, -21, -18, -15, -12, -9
];
window.days_in_months = [
  31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 30, 31
];
window.lowercase_months = [
  "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"
];
window.months = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

var date_error_field = document.getElementById("date-error");
var day_field = document.getElementById("day-input");
var month_field = document.getElementById("month-input");
var year_field = document.getElementById("year-input");
var year_type_field = document.getElementById("year-type");

var hour_field = document.getElementById("hour-input");
var minute_field = document.getElementById("minute-input");

window.date_fields = [day_field, month_field, year_field, hour_field, minute_field];

//Date calculations
{
  function daysInMonths (arg0_date) {
    //Convert from parameters
    var date = arg0_date;

    //Declare local variables
    var days = 0;

    for (var i = 0; i < date.month - 1; i++)
      days += days_in_months[i];
    if (isLeapYear(date.year) && date.month >= 2) days++;

    //Return statement
    return days;
  }

  //getTimestamp() - Returns the amount of minutes in a date
  function getTimestamp (arg0_date) {
    //Convert from parameters
    var date = arg0_date;

    //Guard clause
    if (typeof date == "string") {
      if (date.startsWith("t")) return date;
      date = parseInt(date);
    }
    if (!isNaN(parseInt(date))) return date;

    //Declare local instance variables
    var is_leap_year = isLeapYear(date.year);
    var leap_years = leapYearsBefore(date.year);
    var year_minutes = (leap_years*366 + (date.year - leap_years)*365)*24*60;

    var timestamp_number = Math.floor(returnSafeNumber(year_minutes) +
      returnSafeNumber(daysInMonths(date)*24*60) +
      returnSafeNumber(date.day*24*60) +
      returnSafeNumber(date.hour*60) +
      returnSafeNumber(date.minute));
    timestamp_number = alphabetiseNumber(timestamp_number);

    //Return statement
    return `${(timestamp_number >= 0) ? "tz" : "t"}_${timestamp_number}`;
  }

  function isLeapYear (arg0_year) {
    //Convert from parameters
    var year = parseInt(arg0_year);

  	//Return statement
    return (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0) && year != 4);
  }

  function leapYearsBefore (arg0_year) {
    //Convert from parameters
    var year = arg0_year--;

    //Return statement
    return (year/4) - (year/100) + (year/400) - 1; //4AD was not a leap year
  }

  function leapYearsBetween (arg0_start_year, arg1_end_year) {
    //Convert from parameters
    var start_year = arg0_start_year;
    var end_year = arg1_end_year;

    //Return statement
    return leapYearsBefore(end_year) - leapYearsBefore(start_year + 1);
  }

  function monthsFromDays (arg0_date) {
    //Convert from parameters
    var date = arg0_date;

    //Declare local variables
    var local_days_in_months = JSON.parse(JSON.stringify(days_in_months));
    var months = 0;

    //Leap year handling
    if (isLeapYear(date.year)) local_days_in_months[1] = 29;

    //Count number of months
    for (var i = 0; i < local_days_in_months.length; i++) {
      date.day -= local_days_in_months[i];

      if (date.day >= 0) months++;
    }

    //Return statement
    return months + 1;
  }

  function parseTimestamp (arg0_timestamp) {
    //Convert from parameters
    var timestamp = arg0_timestamp;

    //Guard clause
    if (typeof timestamp == "object")
      return timestamp;
    if (typeof timestamp == "string") {
      timestamp = timestamp.toString().replace("t_", "").replace("tz_", "");
      timestamp = parseInt(numeriseAlphabet(timestamp));
    }

    //Declare local instance variables
    var local_date = {};

    //Guard clause
    if (typeof timestamp == "object")
      return timestamp;

    //Calculate years


    local_date.year = Math.floor(timestamp/(365.25*24*60));
    timestamp -= timestampToInt(getTimestamp({ year: local_date.year, month: 0, day: 0, hour: 0, minute: 0 }));

    var leap_years = leapYearsBefore(local_date.year);

    //Calculate months
    var number_of_days = timestamp/(24*60);

    local_date.month = monthsFromDays({ year: local_date.year, day: number_of_days });
    timestamp -= daysInMonths({ year: local_date.year, month: local_date.month })*24*60;

    //Calculate months
    if (local_date.month > 12) {
      local_date.year++;
      local_date.month = 1;
    }

    //Calculate days
    local_date.day = Math.floor(timestamp/(24*60));
    timestamp -= local_date.day*24*60;

    //Calculate hours
    local_date.hour = Math.floor(timestamp/60);
    timestamp -= local_date.hour*60;

    //Remainder as minutes
    local_date.minute = timestamp;

    //Return statement
    return local_date;
  }

  function timestampToInt (arg0_timestamp) {
    //Convert from parameters
    var timestamp = arg0_timestamp;

    //Return statement
    return parseInt(
      numeriseAlphabet(timestamp.toString().replace("t_", "").replace("tz_", ""))
    );
  }
}

//Date load functions
{
  function loadDate (arg0_old_date) {
    //Convert from parameters
    var old_date = arg0_old_date;

    //Declare local instance variables
    var brush_obj = main.brush;

    //Iterate over all entities in all layers and update their history
    for (var i = 0; i < main.all_layers.length; i++) {
      //Init layer first
      initHierarchyLayer("hierarchy", main.all_layers[i]);

      var local_layer = main.layers[main.all_layers[i]];
      var local_render_order = getLayerRenderingOrder(main.all_layers[i]);

      for (var x = 0; x < local_render_order.length; x++) {
        var entity_key = getEntity(local_render_order[x], { return_key: true });

        if (entity_key) {
          var local_entity = main.layers[entity_key[0]][entity_key[1]];
          var local_entity_id = local_entity.options.className;
          var local_history = getPolityHistory(local_entity_id, main.date, { layer: main.all_layers[i] });

          //Reload object; add to map
          local_entity.remove();

          if (local_history) {
            //Update UIs for each open popup
            var local_popup = document.querySelector(`.leaflet-popup[class~="${local_entity_id}"]`);

            if (local_popup) {
              var name_field = local_popup.querySelector(`input#polity-name`);

              name_field.value = getEntityName(local_entity_id);
            }

            //Run through each options type
            if (local_entity.options.type == "polity")
              //Make sure polity is not extinct
              if (!isPolityHidden(local_entity_id, main.date)) {
                //Deprecating this makes Naissance crash for some reason
                var local_history_frame = getHistoryFrame(local_entity, main.date);
                var local_options = JSON.parse(JSON.stringify(local_entity.options));

                //Overwrite local_options with local_history_options
                var all_local_history_options = Object.keys(local_history_frame.options);

                for (var y = 0; y < all_local_history_options.length; y++)
                  local_options[all_local_history_options[y]] = local_history_frame.options[all_local_history_options[y]];

                local_layer[entity_key[1]] = L.polygon(local_history_frame.coords, local_options).addTo(map);
                local_layer[entity_key[1]].on("click", function (e) {
                  entityUI(e, false, true);
                });

                //This is the current selected polity, re-add cursor
                if (brush_obj.editing_entity == local_entity.options.className)
                  clearBrush();
              }
          }
        }
      }
    }

    autoFillDate();
    refreshSidebar();
  }
}

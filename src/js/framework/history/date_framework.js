//Global Date Strings
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
}

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

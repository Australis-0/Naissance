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

function autoFillDate () {
  console.log(date);

  year_field.value = Math.abs(date.year);
  month_field.value = months[date.month - 1];
  day_field.value = ordinalise(date.day);

  hour_field.value = (date.hour < 10) ? "0" + date.hour : date.hour;
  minute_field.value = (date.minute < 10) ? "0" + date.minute : date.minute;
}

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
  if (!isNaN(parseInt(date))) return date;

  //Declare local instance variables
  var is_leap_year = isLeapYear(date.year);
  var leap_years = leapYearsBefore(date.year);
  var year_minutes = (leap_years*366 + (date.year - leap_years)*365)*24*60;

  //Return statement
  return Math.floor(returnSafeNumber(year_minutes) +
    returnSafeNumber(daysInMonths(date)*24*60) +
    returnSafeNumber(date.day*24*60) +
    returnSafeNumber(date.hour*60) +
    returnSafeNumber(date.minute));
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

function loadDate (arg0_old_date) {
  //Convert from parameters
  var old_date = arg0_old_date;

  //Iterate over all entities in all layers and update their history
  for (var i = 0; i < layers.length; i++) {
    var local_layer = window[`${layers[i]}_layer`];

    for (var x = 0; x < local_layer.length; x++) {
      var do_not_reload = false;
      var local_history = getPolityHistory(local_layer[x].options.className, date, { layer: layers[i] });

      //Check against old date
      if (old_date) {
        var local_old_history = getPolityHistory(local_layer[x].options.className, old_date, { layer: layers[i] });

        if (local_old_history && local_history)
          if (local_old_history.id == local_history.id)
            do_not_reload = true;
      }

      //Check if the object should be reloaded
      if (!do_not_reload) {
        //Reload object; add to map
        local_layer[x].remove();

        if (local_history)
          if (local_layer[x].options.type == "polity")
            //Make sure polity is not extinct
            if (!local_history.options.extinct) {
              var local_options = JSON.parse(JSON.stringify(local_layer[x].options));

              //Overwrite local_options with local_history_options
              var all_local_history_options = Object.keys(local_history.options);

              for (var y = 0; y < all_local_history_options.length; y++)
                local_options[all_local_history_options[y]] = local_history.options[all_local_history_options[y]];

              local_layer[x] = L.polygon(local_history.coords, local_options).addTo(map);
              local_layer[x].on("click", function (e) {
                entityUI(e, false, true);
              });

              //Check for current_union
              if (window.polity_options)
                if (polity_options.className == local_layer[x].options.className) {
                  current_entity._layers = {};
                  local_layer[x].addTo(current_entity);
                  current_union.addTo(current_entity);

                  entity_cache = [local_layer[x]];
                  current_union = unify(current_entity.getLayers());
                }
            }
      }
    }
  }

  autoFillDate();
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
  var timestamp = parseInt(arg0_timestamp);

  //Declare local instance variables
  var local_date = {};

  //Calculate years
  var leap_years = leapYearsBefore(local_date.year);

  local_date.year = Math.floor(timestamp/(365.2425*24*60));
  timestamp -= getTimestamp({ year: local_date.year, month: 0, day: 0, hour: 0, minute: 0 });

  //Calculate months
  var number_of_days = timestamp/(24*60);

  local_date.month = monthsFromDays({ year: local_date.year, day: number_of_days });
  timestamp -= daysInMonths({ year: local_date.year, month: local_date.month })*24*60;

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

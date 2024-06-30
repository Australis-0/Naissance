/*
  daysInMonths() - Fetches the number of days already passed since the beginning of the year.
  arg0_date_object: (Object, Date) - The date object/timestamp to pass to the function.

  Returns: (Number)
*/
function daysInMonths (arg0_date_object) {
  //Convert from parameters
  var date = parseTimestamp(arg0_date_object);

  //Declare local instance variables
  var days = 0;

  //Iterate over elapsed months
  for (var i = 0; i < date.month - 1; i++)
    days += days_in_months[i];
  if (isLeapYear(date.year) && date.month >= 2) days++;

  //Return statement
  return days;
}

/*
  getDateString() - Returns a formatted string from a date object.
  arg0_date_object: (Object, Date) - The date object to pass to the function.
  Returns: (String)
*/
function getDateString (arg0_date_object) { //[WIP] - Finish function body

}

/*
  getStandardYear() - Returns the standard numeric Gregorian year from a date object/timestamp.
  arg0_date_object: (Object, Date) - The date object/timestamp to pass to the function.
*/
function getStandardYear (arg0_date_object) { //[WIP] - Finish function body

}

/*
  getTimestamp() - Returns the amount of minutes in a date.
  arg0_date_object: (Object, Date) - The date object/timestamp to pass to the function.

  Returns: (String)
*/
function getTimestamp (arg0_date_object) {
  var date = parseTimestamp(arg0_date_object);

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

//initDateFramework() - Called to initialise date variables in the global scope
function initDateFramework () {
  //Initialise global date strings
  global.bc_leap_years = [
    -45, -42, -39, -36, -33, -30, -27, -24, -21, -18, -15, -12, -9
  ];
  global.days_in_months = [
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 30, 31
  ];
  global.lowercase_months = [
    "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"
  ];
  global.months = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ];
}

/*
  isLeapYear() - Whether the specified year is a leap year.
  arg0_year: (Number) - The year to check for.
  arg1_hanseceltican_standard: (Boolean) - Optional. Whether to account for Roman-errored leap years. False by default.

  Returns: (Boolean)
*/
function isLeapYear (arg0_year, arg1_hanseceltican_standard) {
  //Convert from parameters
  var year = parseInt(arg0_year);
  var hanseceltican_standard = arg1_hanseceltican_standard;

  //BC guard clause
  if (global.bc_leap_years && hanseceltican_standard)
    if (global.bc_leap_years.indexOf(year) != -1)
      return true;

  //Return statement
  return (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0) && year != 4);
}

/*
  leapYearsBefore() - Fetches the number of leap years before a given year.
  arg0_year: (Number) - The year to check for.

  Returns: (Number)
*/
function leapYearsBefore (arg0_year) {
  //Convert from parameters
  var year = arg0_year--;

  //Return statement
  return (year/4) - (year/100) + (year/400) - 1; //4AD was not a leap year
}

/*
  leapYearsBetween() - Fetches the number of leap years between two years.
  arg0_start_year: (Number) - The beginning year.
  arg1_end_year: (Number) - The ending year.

  Returns: (Number)
*/
function leapYearsBetween (arg0_start_year, arg1_end_year) {
  //Convert from parameters
  var start_year = arg0_start_year;
  var end_year = arg1_end_year;

  //Return statement
  return leapYearsBefore(end_year) - leapYearsBefore(start_year + 1);
}

/*
  monthsFromDays() - Fetches the number of months from days, within the context of a date object.
  arg0_date_object: (Object, Date) - The date object/timestamp to pass to the function.

  Returns: (Number)
*/
function monthsFromDays (arg0_date_object) {
  //Convert from parameters
  var date = parseTimestamp(arg0_date_object);

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

/*
  parseTimestamp() - Parses a timestamp into a date object.
  arg0_timestamp: (String) - The timestamp to parse.

  Returns: (Object, Date)
*/
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

/*
  parseYears() - Returns days/months/years as an object depending on the year amount.
  arg0_number: (Number) - The decimal number of years elapsed.
  arg1_current_year: (Number) - Optional. The current year. Undefined by default.

  Returns: (Object)
    hour: (Number)
    day: (Number)
    month: (Number)
    year: (Number)
*/
function parseYears (arg0_number, arg1_current_year) {
  //Convert from parameters
  var years_elapsed = arg0_number;
  var current_year = arg1_current_year;

  //Declare local instance variables
  var is_leap_year = (current_year) ? isLeapYear(current_year) : false;
  var time_elapsed = {
    hour: 0,
    day: 0,
    month: 0,
    year: 0
  };

  var days_in_months = (!is_leap_year) ?
    [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] :
    [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  //Take care of the year field first
  time_elapsed.year = Math.floor(years_elapsed);
  years_elapsed -= Math.floor(years_elapsed);

  //How many days has it been?
  time_elapsed.day = Math.floor(
    years_elapsed*((!is_leap_year) ? 365 : 366)
  );
  years_elapsed -= time_elapsed.day/((!is_leap_year) ? 365 : 366);

  //How many months has it been?
  for (var i = 0; i < days_in_months.length; i++)
    if (time_elapsed.day >= days_in_months[i]) {
      time_elapsed.day -= days_in_months[i];
      time_elapsed.month++;
    }

  //How many hours has it been?
  time_elapsed.hour = years_elapsed*((!is_leap_year) ? 365*24 : 366*24);

  //Return statement
  time_elapsed.days_in_months = days_in_months;

  //Return statement
  return time_elapsed;
}

/*
  timestampToInt() - Converts a timestamp to its integer position [in minutes from AD1], assuming the Hanseceltican standard.
  arg0_timestamp: (String) - The string of the timestamp to parse to an int.

  Returns: (Number)
*/
function timestampToInt (arg0_timestamp) {
  //Convert from parameters
  var timestamp = arg0_timestamp;

  //Return statement
  return parseInt(
    numeriseAlphabet(timestamp.toString().replace("t_", "").replace("tz_", ""))
  );
}

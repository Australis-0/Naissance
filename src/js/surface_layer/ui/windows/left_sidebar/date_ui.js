//Date UI functions
{
  function autoFillDate () {
    year_field.value = Math.abs(date.year);
    month_field.value = months[date.month - 1];
    day_field.value = ordinalise(date.day);

    hour_field.value = (date.hour < 10) ? "0" + date.hour : date.hour;
    minute_field.value = (date.minute < 10) ? "0" + date.minute : date.minute;
  }

  function getDateFromFields (arg0_year_element, arg1_month_element, arg2_day_element, arg3_hour_element, arg4_minute_element, arg5_year_type_element) {
    //Convert from parameters
    var year_el = document.getElementById(arg0_year_element);
    var month_el = document.getElementById(arg1_month_element);
    var day_el = document.getElementById(arg2_day_element);
    var hour_el = document.getElementById(arg3_hour_element);
    var minute_el = document.getElementById(arg4_minute_element);
    var year_type_el = document.getElementById(arg5_year_type_element);

    //Declare local instance variables
    var new_date = JSON.parse(JSON.stringify(date));

    //Check if year is valid
    if (!isNaN(year_el.value))
      if (year_el.value > 0) {
        new_date.year = (year_type_el.value == "AD") ?
          parseInt(year_el.value) :
          parseInt(year_el.value)*-1;
      } else if (year_field.value == 0) {
        //Assume this means AD 1
        year_el.value = 1;
        year_field.value = 1;
      } else {
        new_date.year = year_el.value;
        year_type_el.value = (year_type_el.value == "AD") ? "BC" : "AD";
      }

    //Set month; day; hour; minute
    new_date.month = parseInt(month_el.value);
    new_date.day = parseInt(day_el.value);

    var hour_value = returnSafeNumber(parseInt(hour_el.value));
    var minute_value = returnSafeNumber(parseInt(minute_el.value));

    //Set min, max bounds
    if (hour_value < 0) hour_value = 0;
    if (hour_value > 23) hour_value = 23;
    if (minute_value < 0) minute_value = 0;
    if (minute_value > 59) minute_value = 59;

    //New Year's exception (change to 00:01 if date is January 1)
    if (new_date.month == 1 && new_date.day == 1)
      if (hour_value == 0 && minute_value == 0)
        minute_value = 1;

    new_date.hour = hour_value;
    new_date.minute = minute_value;

    month_el.value = new_date.month;
    day_el.value = new_date.day;
    hour_el.value = `${(new_date.hour < 10) ? "0" : ""}${new_date.hour}`;
    minute_el.value = `${(new_date.minute < 10) ? "0" : ""}${new_date.minute}`;

    return new_date;
  }

  function getDateRangeFromFields (arg0_year_element, arg1_month_element, arg2_day_element, arg3_hour_element, arg4_minute_element) {
    //Convert from parameters
    var year_el = document.getElementById(arg0_year_element);
    var month_el = document.getElementById(arg1_month_element);
    var day_el = document.getElementById(arg2_day_element);
    var hour_el = document.getElementById(arg3_hour_element);
    var minute_el = document.getElementById(arg4_minute_element);

    //Declare local instance variables
    var local_date = {
      year: parseInt(year_el.value),
      month: parseInt(month_el.value),
      day: parseInt(month_el.value),

      hour: parseInt(month_el.value),
      minute: parseInt(month_el.value)
    };

    //Return statement
    return parseTimestamp(getTimestamp(local_date)); //Flatten date
  }

  function generateDateFields (arg0_element, arg1_prefix, arg2_date) {
    //Convert from parameters
    var container_el = document.getElementById(arg0_element);
    var prefix = arg1_prefix;
    var date = arg2_date;

    //Declare local instance variables
    var local_html = `
      <center>
        <select id = "${prefix}-day" class = "day-input"></select>
        <select id = "${prefix}-month" class = "month-input"></select>
        <input id = "${prefix}-year" class = "year-input" type = "number">
      </center>
      <center>
        <input id = "${prefix}-hour" class = "hour-input" type = "number" min = "0" max = "23"> :
        <input id = "${prefix}-minute" class = "minute-input" type = "number" min = "0" max = "59">

        <select id = "${prefix}-year-type"></select>
      </center>
    `;

    //Set innerHTML and call populateDateFields()
    try {
      container_el.innerHTML = local_html;

      populateDateFields(`${prefix}-year`, `${prefix}-month`, `${prefix}-day`, `${prefix}-hour`, `${prefix}-minute`, `${prefix}-year-type`, date);
    } catch (e) {
      console.log(e);
    }
  }

  function generateDateRangeFields (arg0_element, arg1_prefix, arg2_date) {
    //Convert from parameters
    var container_el = document.getElementById(arg0_element);
    var prefix = arg1_prefix;
    var date = arg2_date;

    //Declare local instance variables
    var local_html = `
      <table class = "date-range-fields">
        <tr>
          <td>Years</td>
          <td>|&nbsp;&nbsp;<input id = "${prefix}-years" class = "date-range-input" type = "number" placeholder = "0"></td>
        </tr>
        <tr>
          <td>Months</td>
          <td>|&nbsp;&nbsp;<input id = "${prefix}-months" class = "date-range-input" type = "number" placeholder = "0"></td>
        </tr>
        <tr>
          <td>Days</td>
          <td>|&nbsp;&nbsp;<input id = "${prefix}-days" class = "date-range-input" type = "number" placeholder = "0"></td>
        </tr>
        <tr>
          <td>Hours</td>
          <td>|&nbsp;&nbsp;<input id = "${prefix}-hours" class = "date-range-input" type = "number" placeholder = "0"></td>
        </tr>
        <tr>
          <td>Minutes</td>
          <td>|&nbsp;&nbsp;<input = "${prefix}-hours" class = "date-range-input" type = "number" placeholder = "0"></td>
        </tr>
      </table>
    `;

    //Set innerHTML and call populateDateRangeFields()
    try {
      container_el.innerHTML = local_html;

      populateDateRangeFields(`${prefix}-years`, `${prefix}-months`, `${prefix}-days`, `${prefix}-months`, `${prefix}-minute`, date);
    } catch {}
  }

  function populateDateFields (arg0_year_element, arg1_month_element, arg2_day_element, arg3_hour_element, arg4_minute_element, arg5_year_type_element, arg6_date) {
    //Convert from parameters
    var year_el = document.getElementById(arg0_year_element);
    var month_el = document.getElementById(arg1_month_element);
    var day_el = document.getElementById(arg2_day_element);
    var hour_el = document.getElementById(arg3_hour_element);
    var minute_el = document.getElementById(arg4_minute_element);
    var year_type_el = document.getElementById(arg5_year_type_element);
    var date = (arg6_date) ? arg6_date : window.date; //Feed in a custom date to populate with

    //Declare local instance variables
    var days_html = [];
    var days_in_month = JSON.parse(JSON.stringify(days_in_months[date.month - 1]));
    var hours_html = [];
    var is_leap_year = isLeapYear(date.year);
    var minutes_html = [];
    var months_html = [];
    var year_type_html = `<option value = "AD">AD</option><option value = "BC">BC</option>`;

    //Populate fields
    if (is_leap_year && date.month == 2)
      days_in_month++;

    for (var i = 0; i < days_in_month; i++)
      days_html.push(`<option value = "${i + 1}">${ordinalise(i + 1)}</option>`);
    for (var i = 0; i < months.length; i++)
      months_html.push(`<option value = "${i + 1}">${months[i]}</option>`);

    //Set all the innerHTMLs for month_el, day_el, hour_el, minute_el, year_el, year_type_el
    month_el.innerHTML = months_html.join("");
    day_el.innerHTML = days_html.join("");
    year_type_el.innerHTML = year_type_html;

    //Adjust days if year_el; month_el are changed. Add leading zeroes to hour_el; minute_el if changed
    year_el.onchange = function () {
      var local_year = parseInt(this.value);

      if (isLeapYear(local_year) && parseInt(month_el.value) == 2) {
        days_html = [];

        for (var i = 0; i < 29; i++)
          days_html.push(`<option value = "${i + 1}">${ordinalise(i + 1)}</option>`);
      }

      //Set innerHTML
      day_el.innerHTML = days_html.join("");
    };
    month_el.onchange = function () {
      var index = this.selectedIndex;
      var local_month = parseInt(this.children[index].value);

      days_in_month = JSON.parse(JSON.stringify(days_in_months[local_month - 1]));

      //Leap year handling
      if (isLeapYear(year_el.value) && local_month == 2) days_in_month++;

      days_html = [];
      for (var i = 0; i < days_in_month; i++)
        days_html.push(`<option value = "${i + 1}">${ordinalise(i + 1)}</option>`);

      //Set innerHTML
      var current_day_value = JSON.parse(JSON.stringify(day_el.value));
      day_el.innerHTML = days_html.join("");

      //Make sure day field is valid but don't suddenly change it
      day_el.value = (current_day_value <= days_in_month) ? current_day_value : days_in_month;
    };

    //Force leading zeroes for hours and minutes, make sure inputs are valid
    hour_el.onchange = function () {
      this.value = Math.max(Math.min(this.value, 23), 0);
      if (this.value < 10)
        this.value = "0" + parseInt(this.value);
    };
    minute_el.onchange = function () {
      this.value = Math.max(Math.min(this.value, 59), 0);
      if (this.value < 10)
        this.value = "0" + parseInt(this.value);
    };

    //Set values according to current date
    day_el.value = date.day;
    hour_el.value = `${(date.hour < 10) ? "0" : ""}${date.hour}`;
    minute_el.value = `${(date.minute < 10) ? "0" : ""}${date.minute}`;
    month_el.value = date.month;
    year_el.value = date.year; //[WIP] - BC handling
    year_type_el.value = (date.year >= 0) ? "AD" : "BC";
  }

  function populateDateRangeFields (arg0_year_element, arg1_month_element, arg2_day_element, arg3_hour_element, arg4_minute_element, arg5_date) {
    //Convert from parameters
    var year_el = document.getElementById(arg0_year_element);
    var month_el = document.getElementById(arg1_month_element);
    var day_el = document.getElementById(arg2_day_element);
    var hour_el = document.getElementById(arg3_hour_element);
    var minute_el = document.getElementById(arg4_minute_element);
    var date = (arg5_date) ? arg5_date : window.date; //Feed in a custom date to populate with

    //Set all the innerHTMLs for year_el, month_el, day_el, minute_el, based on date
    year_el.value = (date.year) ? date.year : 0;
    month_el.value = (date.month) ? date.month : 0;
    day_el.value = (date.day) ? date.day : 0;
    minute_el.value = (date.minute) ? date.minute : 0;

    //Add event listeners
    year_el.onchange = function () {
      this.value = Math.abs(year_el);
    };
    month_el.onchange = function () {
      this.value = Math.abs(month_el);
    };
    day_el.onchange = function () {
      this.value = Math.abs(day_el);
    };
    hour_el.onchange = function () {
      this.value = Math.abs(hour_el);
    };
    minute_el.onchange = function () {
      this.value = Math.abs(minute_el);
    };
  }

  function printDate (arg0_date) {
    //Convert from parameters
    var date = arg0_date;

    //Return statement
    return `${date.year}.${(date.month < 10) ? "0" : ""}${date.month}.${(date.day < 10) ? "0" : ""}${date.day} ${(date.hour < 10) ? "0" : ""}${date.hour}:${(date.minute < 10) ? "0" : ""}${date.minute}`;
  }

  function printDateError (arg0_string) {
    //Convert from parameters
    var error_string = arg0_string;

    //Print error
    date_error_field.innerHTML += `[WARN] &nbsp; ${error_string}`;

    setTimeout(function(){
      date_error_field.innerHTML = date_error_field.innerHTML.replace(`[WARN] &nbsp; ${error_string}`, "");
    }, 10000);
  }

  function readDate () {
    //Declare local instance variables
    var new_date = JSON.parse(JSON.stringify(date));

    //Check if year is valid
    if (!isNaN(year_field.value)) {
      if (year_field.value > 0) {
        new_date.year = (year_type_field.value == "AD") ?
          parseInt(year_field.value) :
          parseInt(year_field.value)*-1;
      } else if (year_field.value == 0) {
        printDateError("There is no year 0!");
      } else {
        new_date.year = year_field.value;
        year_type_field.value = (year_type_field.value == "AD") ? "BC" : "AD";
      }
    } else {
      printDateError(`Inputted year must be a number!`);
    }

    //Check if month is valid
    if (!isNaN(month_field.value)) {
      var new_month = parseInt(month_field.value);

      if (new_month)
        new_date.month = new_month;
      else
        printDateError(`There is no ${ordinalise(month_field.value)} month of the year!`);
    } else {
      var new_month = -1;

      for (var i = 0; i < lowercase_months.length; i++)
        if (lowercase_months[i].includes(month_field.value.toLowerCase()))
          new_month = i + 1;

      if (new_month != -1) {
        new_date.month = new_month;
      } else
        printDateError(`You must input a valid month!`);
    }

    //Check if day is valid
    var day_input = deordinalise(day_field.value);

    if (!isNaN(day_input)) {
      //Check if date exists
      if (day_input > 0 && day_input <= days_in_months[new_date.month - 1]) {
        new_date.day = day_input;
      } else {
        if (new_date.month == 2 && (isLeapYear(new_date.year) && day_input == 29))
          new_date.day = 29;
        else
          printDateError(`${months[new_date.month - 1]} doesn't have this day!`);
      }
    } else
      printDateError(`You must input a valid day!`);

    //Check if hour is valid
    if (hour_field.value >= 0 && hour_field.value < 24)
      new_date.hour = hour_field.value
    else
      printDateError(`There are only 24 hours in a day!`);

    //Check if minute is valid
    if (minute_field.value >= 0 && minute_field.value < 60)
      new_date.minute = minute_field.value
    else
      printDateError(`There are only 60 minutes in an hour!`);

    //Numericise all dates
    var all_fields = Object.keys(new_date);

    for (var i = 0; i < all_fields.length; i++)
      new_date[all_fields[i]] = parseInt(new_date[all_fields[i]]);

    //Set date
    var old_date = JSON.parse(JSON.stringify(date));
    date = new_date;

    autoFillDate();
    loadDate(old_date);
  }

  function returnDateFromFields (arg0_prefix) {
    //Convert from parameters
    var prefix = arg0_prefix;

    //Return statement
    return getDateFromFields(`${prefix}-year`, `${prefix}-month`, `${prefix}-day`, `${prefix}-hour`, `${prefix}-minute`, `${prefix}-year-type`);
  }

  function returnDateRangeFromFields (arg0_prefix) {
    //Convert from parameters
    var prefix = arg0_prefix;

    //Return statement
    return getDateRangeFromFields(`${prefix}-years`, `${prefix}-months`, `${prefix}-days`, `${prefix}-months`, `${prefix}-days`);
  }
}

//Initialise date functions
{
  function initDate () {
    //Populate UI
    autoFillDate();

    //Keypress functions
    for (var i = 0; i < date_fields.length; i++)
      date_fields[i].addEventListener("keyup", function (e) {
        if (e.key == "Enter") readDate();
      });
  }
}

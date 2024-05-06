/*
  split() - Splits a string in two based on a character index.
  arg0_input_string: (String) - The string to pass to the function.
  arg1_index: (Number) - Optional. The index to split the string on. 0 by default.

  Returns: (Array<String, String>)
*/
function split (arg0_input_string, arg1_index) {
  //Convert from parameters
  var string = arg0_input_string;
  var length = returnSafeNumber(arg1_length, 200);

  //Return statement
  return [string.slice(0, index), string.slice(index)];
}

/*
  splitMarkdownString() - Splits a string according to Markdown, preserving lists, with \n as breakpoints
  arg0_input_string: (String) - The input string to pass to the function.
  arg1_options: (Object)
    maximum_characters: (Number) - Optional. The maximum characters per page. 1024 by default.
    maximum_lines: (Number) - Optional. The maximum lines per page. Undefined by default.
    split_bullet_points: (Boolean) - Optional. Whether to try and keep boolean points together. False by default

  Returns: (Array<String, ...>)
*/
function splitMarkdownString (arg0_input_string, arg1_options) {
  //Convert from parameters
  var input_string = arg0_input_string;
  var options = (arg1_options) ? arg1_options : {};

  //Declare local instance variables
  var all_strings = [];
  var array_string = (!Array.isArray(input_string)) ? getList(input_string.split("\n")) : input_string;

  //Error trapping
  try {
    //Join all bullet point blocks together
    var new_array_string = [];

    if (!options.split_bullet_points) {
      var local_joined_string = [];
      var local_starting_element = -1;

      for (var i = 0; i < array_string.length; i++) {
        var next_element_length = 0;

        if (array_string[i + 1])
          next_element_length = array_string[i].length;

        if (array_string[i].startsWith("- ") ||
          (local_joined_string.join("\n").length + next_element_length > Math.ceil(options.maximum_characters/1.5)) ||
          i == array_string.length - 1
        ) {
          if (i == array_string.length - 1)
            local_joined_string.push(array_string[i]);

          //Set local_joined_string
          new_array_string.push(local_joined_string.join("\n"));
          local_indices_to_remove = [];

          //1st bullet point, mark as local_starting_element
          local_joined_string = [];
          local_starting_element = i;
        }

        local_joined_string.push(array_string[i]);
      }
    }

    array_string = new_array_string;

    if (!options.maximum_lines) {
      //Split text based on characters
      for (var i = 0; i < array_string.length; i++) {
        var added_line = false;
        var bullets = "";
        var hit_maximum = false;
        var nesting = getNesting(array_string[i]);

        if (
          local_array_string.join("\n").length + array_string[i].length <= maximum_characters_per_array
        ) {
          local_array_string.push(array_string[i]);
          added_line = true;
        } else {
          hit_maximum = true;
        }

        //Adjust bullet points if off
        if (nesting == 1)
          bullets = "- "
        if (nesting >= 1) {
          for (var x = 0; x < nesting; x++)
            bullets += " - ";

          array_string[i] = array_string[i].split(" - ");

          if (array_string[i].length > 1)
            array_string[i].shift();

          array_string[i] = `${bullets} ${array_string[i].join(" - ")}`;
        }

        if (i != 0 || array_string.length == 1)
          if (
            (i == array_string.length - 1 &&

            //Check to see that string is not empty
            local_array_string.join("\n").length > 0) ||
            hit_maximum
          ) {
            //Push to all_strings
            all_strings.push(local_array_string.join("\n"));
            local_array_string = [];

            //Maximum safeguard to prevent max call stack size
            if (hit_maximum)
              i--; //Potentially leads to a fatal crash
          }
      }
    } else {
      //Split embeds based on lines
      for (var i = 0; i < array_string.length; i++) {
        local_array_string.push(array_string[i]);

        if (i != 0 || array_string.length == 1)
          if (i % options.maximum_lines == 0 || i == array_string.length - 1) {
            //Push to all_strings
            all_strings.push(local_array_string.join("\n"));
            local_array_string = [];
          }
      }
    }

    //Return statement
    return all_strings;
  } catch {}
}

/*
  splitString() - Splits a string equally by character count.
  arg0_input_string: (String) - The string to pass to the function.
  arg1_length: (Number) - Optional. The number of characters to allow per page. 200 by default.

  Returns: (Array<String, ...>)
*/
function splitString (arg0_input_string, arg1_length) {
  //Convert from parameters
  var string = arg0_input_string;
  var length = returnSafeNumber(arg1_length, 200);

  //Declare local instance variables
  var current_string = "";
  var string_array = [];

  //Process string
  for (var i = 0; i < string.length; i++) {
    current_string += string[i];

    if ((i % length == 0 || i == string.length - 1) && i != 0) {
      string_array.push(current_string);
      current_string = "";
    }
  }

  //Return statement
  return string_array;
}

/*
  truncateString() - Truncates a string after a given max. character len.
  arg0_input_string: (String) - The string to pass to the function.
  arg1_length: (Number) - Optional. The number of max characters to display. 80 by default.
  arg2_do_not_show_dots: (Boolean) - Optional. Whether to show dots at the end. False by default.

  Returns: (String)
*/
function truncateString (arg0_input_string, arg1_length, arg2_do_not_show_dots) {
  //Convert from parameters
  var string = arg0_input_string;
  var number = (arg1_length) ? arg1_length : 80;
  var do_not_show_dots = arg2_do_not_show_dots;

  //Return statement
  if (string.length > number) {
    var substring = string.substring(0, number);

    return (!do_not_show_dots) ? substring + " ..." : substring;
  } else {
    return string;
  }
}

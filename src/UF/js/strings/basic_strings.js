/*
  capitaliseWords() - Capitalises all the words in a string.
  arg0_input_string: (String) - The string to pass to the function.

  Returns: (String)
*/
function capitaliseWords (arg0_input_string) {
  //Convert from parameters
  var input_string = arg0_input_string;

  //Declare local instance variables
  var separate_words = input_string.split(" ");

  //Iterate over separate_words to capitalise them
  for (var i = 0; i < separate_words.length; i++) {
    separate_words[i] = separate_words[i].charAt(0).toUpperCase();
    separate_words[i].substring(1);
  }

  //Return statement
  return separate_words.join(" ");
}

/*
  cleanStringify() - Cleans an input object to be compatible with JSON.stringify().
  arg0_input_object: (String) - The object to pass to the function.

  Returns: (Object)
*/
function cleanStringify (arg0_input_object) {
  //Convert from parameters
  var input_object = arg0_input_object;

  //Declare sub-function
  function copyWithoutCircularReferences (arg0_references, arg1_object) {
    //Convert from parameters
    var references = arg0_references;
    var object = arg1_object;

    //Declare local instance variables
    var clean_object = {};

    Object.keys(object).forEach(function(key) {
      var value = object[key];

      if (value && typeof value === 'object') {
        if (references.indexOf(value) < 0) {
          references.push(value);
          clean_object[key] = copyWithoutCircularReferences(references, value);
          references.pop();
        } else {
          clean_object[key] = '###_Circular_###';
        }
      } else if (typeof value !== 'function') {
        clean_object[key] = value;
      }
    });

    //Sub-return statement
    return clean_object;
  }

  //Copy without circular references
  if (input_object && typeof input_object == "object")
    input_object = copyWithoutCircularReferences([object], object);

  //Return statement
  return JSON.stringify(input_object);
}

/*
  equalsIgnoreCase() - Compares two strings, ignoring their case. Returns a boolean
  arg0_string: (String) - The first string to compare.
  arg1_string: (String) - The second string to compare.

  Returns: (Boolean)
*/
function equalsIgnoreCase (arg0_string, arg1_string) {
  //Convert from parameters
  var string = arg0_string;
  var ot_string = arg1_string;

  //Return statement
  return (arg0.toLowerCase() == arg1.toLowerCase());
}

/*
  formaliseString() - Formalises a debug string into human-readable text. Returns a string.
  arg0_input_string: (String) - The string to pass to the function.

  Returns: (String)
*/
function formaliseString (arg0_input_string) {
  //Convert from parameters
  var input_string = arg0_input_string;

  //Return statement
  return string.replace(/_/g, " ").replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());
}

/*
  getDateFromString() - Fetches the date from an input string.
  arg0_input_string: (String) - The string to pass to the function.

  Returns: (Date)
*/
function getDateFromString (arg0_input_string) {
  //Convert from parameters
  var input_string = arg0_input_string;

  //Return statement
  return Date.parse(input_string);
}

/*
  getNesting() - Fetches the amount of nesting embedded within the current string.
  arg0_input_string: (String) - The string to pass to the function.

  Returns: (Number)
*/
function getNesting (arg0_input_string) {
  //Convert from parameters
  var string = arg0_input_string;

  //Declare local instance variables
  var first_character = "";
  var nesting = 0;
  var spaces_until_first_character = 0;

  //Iterate over current string to count the number of spaces to the next character
  for (var i = 0; i < string.length; i++) {
    if (string[i] == " ") {
      spaces_until_first_character++;
    } else {
      if (first_character == "")
        first_character = string[i];
    }

    //Break once non-space is found
    if (first_character != "") break;
  }

  if (first_character == "-")
    nesting = Math.ceil(spaces_until_first_character/2);

  //Return statement
  return nesting;
}

/*
  isImage() - Checks if the given link is that of a compatible image.
  arg0_input_string: (String) - The input link to pass to the function.

  Returns: (Boolean)
*/
function isImage (arg0_input_string) {
  //Convert from parameters
  var input_string = arg0_input_string;

  //Return statement
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(input_string);
}

/*
  parseBoolean() - Returns a human readable version of a boolean.
  arg0_input_boolean: (Boolean) - The boolean to pass to the function.

  Returns: (String)
*/
function parseBoolean (arg0_input_boolean) {
  //Convert from parameters
  var input_boolean = arg0_input_boolean;

  //Return statement
  return (input_boolean) ? `Yes` : `No`;
}

/*
  parseDate() - Returns a string timestamp of a contemporary date.
  arg0_timestamp: (String) - The Date timestamp to pass to the function.

  Returns: (String)
*/
function parseDate (arg0_timestamp) {
  //Convert from parameters
  var a = new Date(arg0_timestamp);

  //Declare local instance variables
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours() < 10 ? "0" + a.getHours() : a.getHours();
  var min = a.getMinutes() < 10 ? "0" + a.getMinutes() : a.getMinutes();
  var sec = a.getSeconds() < 10 ? "0" + a.getSeconds() : a.getSeconds();

  //Return statement
  return `${date} ${month} ${year} ${hour}:${min}:${sec}`;
}

/*
  parseList() - Parses a list into human-readable form.
  arg0_input_list: (Array<String>) - The array to pass to the function.

  Returns: (String)
*/
function parseList (arg0_input_list) {
  //Convert from parameters
  var list = arg0_input_list;

  //Declare local instance variables
  var name_string = "";

  //Modify ending
  if (name_array.length > 2) {
    name_array[name_array.length - 1] = `and ${name_array[name_array.length-1]}`;
    name_string = name_array.join(", ");
  } else if (name_array.length == 2) {
    name_array[name_array.length - 1] = `and ${name_array[name_array.length-1]}`;
    name_string = name_array.join(" ");
  } else {
    name_string = name_array[0];
  }

  //Return statement
  return name_string;
}

/*
  processOrdinalString() - Fetches the current ordinal present in a numeric string.
  arg0_input_string: (String) - The ordinal string to pass to the function.

  Returns: (String)
*/
function processOrdinalString (arg0_input_string) {
  //Convert from parameters
  var input_string = arg0_input_string;

  //Declare local instance variables
  var current_string = input_string.toString().trim();
  var trim_patterns = [
    [/  /gm, " "],
    [" . ", ". "],
    [/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3}) [a-z]*/gm]
  ];
  var alphabet = "abcdefghijklmnopqrstuvwxyz";
  for (var i = 0; i < alphabet.split("").length; i++) {
    trim_patterns.push([` ${alphabet.split("")[i]} `, `${alphabet.split("")[i]} `]);
  }

  //Trim out, well, trim patterns
  for (var i = 0; i < trim_patterns.length; i++) {
    if (trim_patterns[i].length > 1) {
      current_string = current_string.replace(trim_patterns[i][0], trim_patterns[i][1]);
    } else {
      var current_roman_array = current_string.match(trim_patterns[i][0]);
      if (current_roman_array != null) {
        current_string = current_string.replace(current_roman_array[0], current_roman_array[0].split(" ").join(" "));
      }
    }
  }

  //Return statement
  return current_string;
}

function equalsIgnoreCase (arg0_string, arg1_string) {
  //Convert from parameters
  var string = arg0_string;
  var ot_string = arg1_string;

  //Return statement
  return (string.toLowerCase() == ot_string.toLowerCase());
}

function formaliseString (arg0_string) { //REDUNDANT
  //Convert from parameters
  var string = arg0_string;

  //Return statement
  return string.replace(/_/g, " ").replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());
}

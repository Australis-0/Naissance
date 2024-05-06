/*
  stripMarkdown() - Strips markdown from a string.
  arg0_input_string: (String) - The string to pass to the function.

  Returns: (String)
*/
function stripMarkdown (arg0_input_string) {
  //Convert from parameters
  var input_string = arg0_input_string;

  //Declare local instance variables
  var processed_string = input_string.toString();

  //Return statement
  return processed_string.replace(/(__)|(\*\*)/gm, "");
}

/*
  stripNonNumerics() - Strips all non-numeric characters (0-9) from a string.
  arg0_input_string: (String) - The string to pass to the function.
  
  Returns: (String)
*/
function stripNonNumerics (arg0_input_string) {
  //Convert from parameters
  var input_string = arg0_input_string;

  //Return statement
  return input_string.toString().replace(/(__)|(\*\*)/gm, "");
}

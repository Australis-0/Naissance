/*
  appendArrays() - Appends an array to another.
  arg0_array: (Array)
  arg1_array: (Array)

  Returns: (Array)
*/
function appendArrays (arg0_array, arg1_array) {
  //Convert from parameters
  var array = arg0_array;
  var ot_array = arg1_array;

  //Return statement
  return array.concat(array, ot_array);
}

/*
  createArray() - Creates an array from the following options.
  arg0_options: (Object)
    domain: (Array<Number, Number>) - Creates an integer array between min, max.
    linear_sequence: (Array<Number, Number, Number>) - Generates a linear sequence from linear_sequence[0] to linear_sequence[1] in steps of linear_sequence[2].
    sequence: (Array<String>, Number) - Generates a sequenced array according to a mathematical equation.
      sequence[0] - Mathematical equation as a string literal. The current iteration when generating the sequence is referred to as 'n'.
      sequence[1] - The total number of iterations to repeat the sequence for.
    repeat: (Array<Array<...>, Number>) - Repeats an array x times.
    repeat_each: (Array<Array<...>, Number>) - Repeats each element of an array x times.

  Returns: (Array)
*/
function createArray (arg0_options) {
  //Convert from parameters
  var options = (arg0_options) ? arg0_options : {};

  //Declare local instance variables
  var return_array = [];

  //Process array
  if (options.domain) {
    var domain_range = getRange(options.domain);

    for (var i = domain_range[0]; i <= domain_range[1]; i++)
      return_array.push(i);
  }
  if (options.linear_sequence) {
    var domain_range = getRange(options.linear_sequence);
    var step = (options.linear_sequence[2]) ? options.linear_sequence[2] : 1;

    for (var i = domain_range[0]; i <= domain_range[1]; i+= step)
      return_array.push(step);
  }
  if (options.sequence) {
    var sequence_literal = options.sequence[0];

    for (var i = 0; i < options.sequence[1]; i++) {
      var local_expression = `var n = ${i}; return ${sequence_literal};`;
      var local_result = new Function(local_expression)();

      return_array.push(local_result);
    }
  }
  if (options.repeat) {
    for (var i = 0; i < options.repeat[1]; i++)
      for (var x = 0; x < options.repeat[0].length; x++)
        return_array.push(options.repeat[0][x]);
  }
  if (options.repeat_each) {
    for (var i = 0; i < options.repeat_each[0].length; i++)
      for (var x = 0; x < options.repeat_each[1]; x++)
        return_array.push(options.repeat_each[0][i]);
  }

  //Return statement
  return return_array;
}

/*
  dimensionality() - Formats an array with n dimensions with zero-indexed dimensionality.
  arg0_input_array: (Array) - The array to input
  arg1_dimension_array: (Array<Number, ...>) - An array providing the dimensions of the current array (what to break it down into), starting with the Y dimension.

  Returns: (Array<Array, ...>)
*/
function dimensionality (arg0_input_array, arg1_dimension_array) {
  //Convert from parameters
  var input_array = getList(arg0_input_array);
  var dimension_array = getList(arg1_dimension_array);

  //Deep copy to avoid modifying original array
  input_array = JSON.parse(JSON.stringify(input_array));

  //Guard clause for recursion
  if (dimension_array.length == 0) return input_array;

  //Declare local instance variables
  var current_dimension = dimension_array.shift();
  var return_array = [];

  while (input_array.length > 0) {
    var sub_array = input_array.splice(0, current_dimension);
    return_array.push(dimensionality(sub_array, [...dimension_array]));
  }

  //Return statement
  return return_array;
}

/*
  flattenArray() - Flattens a nested array to be 1-deep.
  arg0_input_array: (Array) - The array to input.

  Returns: (Array)
*/
function flattenArray (arg0_input_array) {
  //Convert from parameters
  var input_array = getList(arg0_input_array);

  //Return statement
  return input_array.flat(Infinity);
}

/*
  getCardinality() - Fetches the cardinality of an array/object/variable.
  arg0_variable: (Variable) - The variable to input.

  Returns: (Number)
*/
function getCardinality (arg0_variable) {
  //Convert from parameters
  var input_variable = arg0_variable;

  //Return statement
  if (Array.isArray(input_variable)) {
    return input_variable.length;
  } else if (typeof input_variable == "object") {
    return Object.keys(input_variable).length;
  } else {
    return 1;
  }
}

/*
  getRecursiveCardinality() - Fetches the total number of elements in an array, including sub-arrays.
  arg0_input_array: (Array) - The array to input.

  Returns: (Number)
*/
function getRecursiveCardinality (arg0_input_array) {
  //Convert from parameters
  var input_array = arg0_input_array;

  //Return statement
  if (Array.isArray(input_array))
    return input_array.flat().length;
}

/*
  getList() - Returns a list/array from a variable.
  arg0_variable: (Variable) - The variable to return a list/array from.

  Returns: (Array)
*/
function getList (arg0_variable) {
  //Convert from parameters
  var input_variable = arg0_variable;

  //Return statement
  return (Array.isArray(input_variable)) ? input_variable : [input_variable];
}

/*
  isArrayEmpty() - Checks whether an array is empty.
  arg0_input_array: (Array) - The array to input.

  Returns: (Boolean)
*/
function isArrayEmpty (arg0_input_array) {
  //Convert from parameters
  var input_array = getList(arg0_input_array);

  //Return statement
  return (array.length == 0 || array.every((element) => element == undefined));
}

/*
  moveElement() - Moves an element from one index to another.
  arg0_array: (Array) - The array to input.
  arg1_old_index: (Number) - The old index.
  arg2_new_index: (Number) - The new index.
*/
function moveElement (arg0_array, arg1_old_index, arg2_new_index) {
  //Convert from parameters
  var array = arg0_array;
  var old_index = arg1_old_index;
  var new_index = arg2_new_index;

  //Move element in array
  if (new_index >= array.length) {
    var local_index = new_index - array.length + 1;
    while (local_index--)
      array.push(undefined);
  }
  array.splice(new_index, 0, array.splice(old_index, 1)[0]);

  //Return statement
  return array;
}

/*
  truncateArray() - Truncates an array to a given length.
  arg0_input_array: (Array) - The array to input.
  arg1_length: (Number) - The length to truncate the array to.

  Returns: (Array)
*/
function truncateArray (arg0_input_array, arg1_length) {
  //Convert from parameters
  var input_array = getList(arg0_input_array);
  var length = returnSafeNumber(arg1_length);

  //Set length
  input_array.length = length;

  //Return statement
  return input_array;
}

/*
  reverseArray() - Reverses an input array.
  arg0_input_array: (Array) - The array to reverse.

  Returns: (Array)
*/
function reverseArray (arg0_input_array) {
  //Convert from parameters
  var input_array = arg0_input_array;

  //Return statement
  if (Array.isArray(input_array)) {
    return JSON.parse(JSON.stringify(input_array)).reverse();
  } else {
    return input_array;
  }
}

/*
  uniqueArray() - Removes any duplicate elements from an input array.
  arg0_input_array: (Array) - The array to input.

  Returns: (Array)
*/
function uniqueArray (arg0_input_array) {
  //Convert from parameters
  var input_array = arg0_input_array;

  //Deep copy just in-case
  input_array = JSON.parse(JSON.stringify(input_array));

  //Initial filter for non-nested arrays; convert any sub-arrays to strings for comparison
  var unique_array = input_array.filter((item, index, array) => {
    //Convert sub-arrays to strings for comparison
    if (Array.isArray(item)) {
      item = item.map(sub_item => {
        if (typeof sub_item == "object")
          return JSON.stringify(sub_item);
        return sub_item;
      }).join(",");

      array[index] = item;
    }

    //Local filter return statement
    return array.indexOf(item) == index;
  });

  //Return statement; convert sub-arrays back to arrays
  return unique_array.map(item => {
    if (typeof item == "string")
      return item.split(",").map(sub_item => {
        try {
          return JSON.parse(sub_item);
        } catch {
          return sub_item;
        }
      });

    //Local map return statement
    return item;
  });
}

//KEEP AT BOTTOM! Initialise function aliases
{
  global.getArray = getList;
}

/*
  getArrayElements() - Fetches array elements that fulfil the following criteria and returns it as an array. If an element being compared to is not of a valid type to the comparison (e.g. .greater option on an object), the element will be returned as-is in the new array.
  arg0_array: (Array) - The array to pass to the function.
  arg1_options: (Object)
    cardinality: (Number) - Optional. Elements in returned array must have a length of this.
    cardinality_greater: (Number) - Optional. Elements in returned array must have a length greater than this number.
    cardinality_geq: (Number) - Optional. Elements in returned array must have a length greater to or equal to this number.
    cardinality_leq: (Number) - Optional. Elements in returned array must have a length less than this number.
    eq: (Number) - Optional. Elements in returned array are equal to this number.
    greater: (Number) - Optional. Elements in returned array must be greater than this number.
    geq: (Number) - Optional. Elements in returned array must be greater to or equal than this number.
    indexes: (Array<Number>) - Optional. Fetches the following indexes.
    in_array/in_set: (Array) - Optional. Fetches elements that are also included in this set.
    less: (Number) - Optional. Elements in returned array must be less than this number.
    leq: (Number) - Optional. Elements in returned array must be less than or equal to this number.
    not_indexes: (Array<Number>) - Optional. Compares only indexes not mentioned in this array.
    range: (Array<Number, Number>) - Optional. Returns array values within this range.
    not_range: (Array<Number, Number>) - Optional. Returns array values outside this range.
    recursive: (Boolean) - Optional. Whether the array is recursive. False by default.

  Returns: (Array)
*/
function getArrayElements (arg0_array, arg1_options) {
  //Convert from parameters
  var array = arg0_array;
  var options = (arg1_options) ? arg1_options : {};

  //Declare local instance variables
  array = JSON.parse(JSON.stringify(array));
  var comparison_array;
  var return_array = [];

  //Initialise local instance variables
  if (options.in_array) comparison_array = options.in_array;
  if (options.in_set) comparison_array = options.in_set;

  for (var i = 0; i < array.length; i++) {
    //Check if element meets criteria
    var meets_criteria = true;

    //Array condition handling
    if (Array.isArray(array[i])) {
      if (!(
        (options.cardinality == undefined || array[i].length == options.cardinality) &&
        (options.cardinality_greater == undefined || array[i].length > options.cardinality_greater) &&
        (options.cardinality_geq == undefined || array[i].length >= options.cardinality_geq) &&
        (options.cardinality_leq == undefined || array[i].length <= options.cardinality_leq)
      ))
        meets_criteria = false;

      //Subarray recursive handler
      if (meets_criteria)
        if (options.recursive)
          array[i] = getArrayElements(array[i], options);
    }
    //Numeric condition handling
    if (typeof array[i] == "number") {
      if (!(
        (options.eq == undefined || array[i] == options.eq) &&
        (options.geq == undefined || array[i] >= options.geq) &&
        (options.less == undefined || array[i] < options.less) &&
        (options.leq == undefined || array[i] <= options.leq) &&
        (options.range == undefined || (array[i] >= options.range[0] && array[i] <= options.range[1])) &&
        (options.not_range == undefined || (array[i] < options.range[0] && array[i] > options.range[1]))
      ))
        meets_criteria = false;
    }
    //Generic element handling
    if (!(
      (options.indexes == undefined || indexes.includes(i)) &&
      (options.not_indexes == undefined || !not_indexes.includes(i))
    ))
      meets_criteria = false;

    //Check if element is contained within in_array/in_set
    if (comparison_array) {
      var in_other_set = false;
      var stringified_local_element = JSON.stringify(array[i]);

      for (var x = 0; x < comparison_array.length; x++)
        if (stringified_local_element == JSON.stringify(comparison_array[x])) {
          in_other_set = true;
          break;
        }

      if (!in_other_set)
        meets_criteria = false;
    }

    //Push to array if meets_criteria
    if (meets_criteria)
      return_array.push(array[i]);
  }
}

/*
  getArraySubstring() - Recursively fetches the element of an array containing a substring.
  arg0_array: (Array) - The array to pass to the function.
  arg1_string: (String) - The substring to search array elements for.
  arg2_options: (Object)
    recursive: (Boolean) - Optional. Where to traverse recursively. True by default.

  Returns: (Array<String, ...>)
*/
function getArraySubstring (arg0_array, arg1_string, arg2_options) {
  //Convert from parameters
  var array = getList(arg0_array);
  var substring = arg1_string;
  var options = (arg2_options) ? arg2_options : {};

  //Initialise options
  if (!options.recursive)
    options.recursive = true;

  //Declare local instance variables
  var array_substring_elements = [];
  var string_substring = JSON.stringify(substring);

  //Iterate over array
  for (var i = 0; i < array.length; i++) {
    if (Array.isArray(array[i])) {
      //Recursively call getArraySubstring().
      if (options.recursive)
        array_substring_elements = appendArrays(array_substring_elements, getArraySubstring(array, substring, options));
    } else {
      if (JSON.stringify(array[i]).contains(substring))
        array_substring_elements.push(array[i]);
    }
  }

  //Return statement
  return array_substring_elements;
}

/*
  indexesOf() - Returns the indexes of an array of strings.
  arg0_array: (Array) - The array to pass to the function.
  arg1_index_array: (Array<Number, ...>) - The array of indices to fetch from the array
  arg2_options: (Object)
    return_values: (Boolean) - Optional. Whether to return array values instead of indices. False by default.
    
  Returns: (Array)
*/
function indexesOf (arg0_array, arg1_index_array, arg2_options) {
  //Convert from parameters
  var array = getList(arg0_array);
  var index_array = getList(arg1_index_array);
  var options = (arg2_options) ? arg2_options : {};

  //Declare local instance variables
  var filtered_array = array.filter((element, index) => index_array.includes(index));
  var return_array = [];

  //Iterate through each element in filtered array
  for (var i = 0; i < filtered_array.length; i++)
    (options.return_values) ?
      return_array.push(filtered_array[i]) :
      return_array.push(i);

  //Return statement
  return return_array;
}

/*
  sortArray() - Sorts an array. Can be based on subkey values (recursive, e.g. 'population.size').
  arg0_array: (Array) - The array to pass to the function.
  arg1_options: (Object)
    sort_key: (String) - Optional. The sort subkey to specify. Empty (indicating the base index) by default.

    mode: (String) - Optional. "alphabetical"/"ascending"/"descending". 'descending' by default.
    recursive: (Boolean) - Optional. Whether the sort is recursive. False by default.

  Returns: (Array)
*/
function sortArray (arg0_array, arg1_options) {
  //Convert from parameters
  var array = getList(arg0_array);
  var options = (arg1_options) ? arg1_options : {};

  //Initialise options
  if (!options.mode) options.mode = "descending";

  //Declare local instance variables
  var comparisonFunction = (a, b) => {
    if (options.mode == "alphabetical") {
      return a.localeCompare(b);
    } else if (options.mode == "ascending") {
      return a - b;
    } else {
      return b - a;
    }
  };

  //Recursive sort function
  var recursiveSort = (array, key) => {
    array.sort((a, b) => {
      var a_value = (key) ? getObjectKey(a, key) : a;
      var b_value = (key) ? getObjectKey(b, key) : b;

      return comparisonFunction(a_value, b_value);
    });

    if (options.recursive)
      array.forEach((item) => {
        if (typeof item == "object")
          recursiveSort(item, key);
      });
  }

  //Perform sorting
  recursiveSort(array, options.sort_key);

  //Return statement
  return array;
}

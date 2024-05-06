/*
  createObjectSearch() - Creates a function to search an object regularly using a substring. Similar to createSmartSearch(), but creates a 'relevancy index' for each potential entry and affixes them to a return object.

  arg0_options: (Object)
    exclude_zero_relevance: (Boolean) - Optional. Whether to exclude entries with zero or less relevance from the end result. True by default.
    function_name: (String) - The function name to define this search as in the global namespace.
    priority_compounding: (String) - Optional. Either 'linear'/'multiplicative'. 'multiplicative' by default.
    priority_order: (Array<String, ...>) - The order in which to search, both soft/hard. First is most important, last is least important. 'key' defines base key. Note that these values compound on top of each other.

  Returns: (Function)
*/
function createObjectSearch (arg0_options) {
  //Convert from parameters
  var options = (arg0_options) ? arg0_options : {};

  //Initialise options
  if (options.exclude_zero_relevance != false) options.exclude_zero_relevance = true;
  if (!options.priority_compounding) options.priority_compounding = "multiplicative";
  if (!options.priority_order) options.priority_order = ["key"];

  //Declare local instance variables
  var function_expression = []; //Here 'object' is the variable to search for

  //Function expression syntax: (arg0_object, arg1_input)
  //Index all keys first
  function_expression.push(`
    //Convert from parameters
    var object = arg0_object;
    var input = arg1_input;

    //Declare local instance variables
    var all_object_keys = Object.keys(object);
    var lowercase_input = lowercase_input;
    var processed_object = {};

    //Guard clause for object
    if (typeof input == "object") return input;
  `);

  //Iterate over options.priority_order
  for (var i = 0; i < options.priority_order.length; i++) {
    var local_search = options.priority_order[i];

    //<key> handler
    if (local_search == "key") {
      //Check for substring relevancy
      function_expression.push(`
        for (var i = 0; i < all_object_keys.length; i++)
          if (all_object_keys[i].toLowerCase().indexOf(lowercase_input) != -1) {
            var local_relevancy = input.length/all_object_keys[i].length;
            var local_score = processed_object[all_object_keys[i]];

            if (!local_score) {
              processed_object[all_object_keys[i]] = {
                id: "${all_object_keys[i]}",
                value: ${local_relevancy}
              };
            } else {
              local_score.value = local_score.value ${(options.priority_compounding == "multiplicative") ? `*` : `+`} local_relevancy;
            }
          }
      `);
    } else {
      //Check for local value relevancy
      function_expression.push(`
        for (var i = 0; i < all_object_keys.length; i++) {
          var local_value = object[all_object_keys[i]];

          try {
            if (local_value.${local_search})
              if (local_value.${local_search}.toLowerCase().indexOf(lowercase_input) != -1) {
                var local_relevancy = input.length/local_value.${local_search}.length;
                var local_score = processed_object[all_object_keys[i]];

                if (!local_score) {
                  processed_object[all_object_keys[i]] = {
                    id: "${all_object_keys[i]}",
                    value: ${local_relevancy}
                  };
                } else {
                  local_score.value = local_score.value ${(options.priority_compounding == "multiplicative") ? `*` : `+`} local_relevancy;
                }
              }
          } catch {}
        }
      `);
    }
  }

  //Sort object
  function_expression.push(`
    processed_object = sortObject(processed_object);

    //Return statement
    return processed_object;
  `);

  //Declare function
  var equation_function = new Function("arg0_object", "arg1_input", function_expression.join(""));

  global[options.function_name] = equation_function;

  //Return statement
  return global[options.function_name];
}

/*
  createSmartSearch() - Defines a smart search function off of which various attributes are checked in a specific order, both soft and hard.

  arg0_options: (Object)
    function_name: (String) - The function name to define this search as in the global namespace.
    priority_order: (Array<String, ...>) - The order in which to search, both soft/hard. First is most important, last is least important. 'key' defines base key.

    hard_search: (Boolean) - Optional. True by default
    soft_search: (Boolean) - Optional. True by default

  Returns: (Function)
*/
function createSmartSearch (arg0_options) {
  //Convert options
  var options = (arg0_options) ? arg0_options : {};

  //Initialise options
  if (!options.priority_order) options.priority_order = ["key"];

  if (options.hard_search != false) options.hard_search = true;
  if (options.soft_search != false) options.soft_search = true;

  //Declare local instance variables
  var function_expression = []; //Here 'object' is the variable to search for

  //Function expression syntax: (arg0_object, arg1_input, arg2_options)
  //Index all keys first
  function_expression.push(`
    //Convert from parameters
    var object = arg0_object;
    var input = arg1_input;

    //Declare local instance variables
    var all_object_keys = Object.keys(object);
    var lowercase_input = lowercase_input;
    var variable_exists = [false, undefined]; //[<variable_exists>, <variable_value>];

    //Object/key guard clause
    if (typeof input == "object") return input;
    if (object[input]) return (!options.return_key) ? object[input] : input;
  `);

  //Iterate over options.priority_order
  for (var i = 0; i < options.priority_order.length; i++) {
    var local_search = options.priority_order[i];

    //Post 0-index encapsulation for priority
    if (i > 0)
      function_expression.push(`if (!variable_exists[0]) {`);

    //<key> handler
    if (local_search == "key") {
      //Soft search handler
      if (options.soft_search)
        function_expression.push(`
          for (var i = 0; i < all_object_keys.length; i++)
            if (all_object_keys[i].toLowerCase().indexOf(lowercase_input) != -1)
              variable_exists = [true, (!options.return_key) ? object[all_object_keys[i]] : all_object_keys[i]];
        `);

      //Hard search handler
      if (options.hard_search)
        function_expression.push(`
          for (var i = 0; i < all_object_keys.length; i++)
            if (all_object_keys[i].toLowerCase() == lowercase_input)
              variable_exists = [true, (!options.return_key) ? object[all_object_keys[i]] : all_object_keys[i]];
        `);
    } else {
      //Soft search handler
      if (options.soft_search)
        function_expression.push(`
          for (var i = 0; i < all_object_keys.length; i++) try {
            var local_value = object[all_object_keys[i]].${local_search};

            if (local_value.toLowerCase().indexOf(lowercase_input) != -1)
              variable_exists = [true, (!options.return_key) ? object[all_object_keys[i]] : all_object_keys[i]];
          } catch {}
        `);

      //Hard search handler
      if (options.hard_search)
        function_expression.push(`
          for (var i = 0; i < all_object_keys.length; i++) try {
            var local_value = object[all_object_keys[i]].${local_search};

            if (local_value.toLowerCase() == lowercase_input)
              variable_exists = [true, (!options.return_key) ? object[all_object_keys[i]] : all_object_keys[i]];
          } catch {}
        `);
    }

    //Post 0-index encapsulation for priority
    if (i > 0)
      function_expression.push(`}`);
  }

  //Append return statement
  function_expression.push(`return (variable_exists[0]) ? variable_exists[1] : undefined;`);

  //Declare function
  var equation_function = new Function("arg0_object", "arg1_input", "arg2_options", function_expression.join(""));

  global[options.function_name] = equation_function;

  //Return statement
  return global[options.function_name];
}

/*
  deleteSmartSearch() - Deletes a smart search function.

  arg0_name: (String) - The .function_name of the smart search to delete.
*/
function deleteSmartSearch (arg0_name) {
  //Convert from parameters
  var function_name = arg0_name;

  //Delete from global
  delete global[function_name];
}

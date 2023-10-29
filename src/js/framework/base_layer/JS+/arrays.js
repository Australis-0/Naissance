//HTML element functions
{
  function arrayHasElement (arg0_array, arg1_query_selector) {
    //Convert from parameters
    var array = arg0_array;
    var query_selector = arg1_query_selector;

    //Declare local instance variables
    var selected_elements = document.querySelectorAll(query_selector);

    if (selected_elements)
      for (var i = 0; i < array.length; i++)
        for (var x = 0; x < selected_elements.length; x++)
          if (array[i].outerHTML == selected_elements[x].outerHTML) return true;
  }

  function arrayHasElementAttribute (arg0_array, arg1_attribute_type, arg2_attribute_content) {
    //Convert from parameters
    var array = arg0_array;
    var attribute_type = arg1_attribute_type;
    var attribute_content = arg2_attribute_content;

    //Iterate over array
    if (array)
      for (var i = 0; i < array.length; i++)
        try {
          if (array[i].getAttribute(attribute_type) == attribute_content) return true;
        } catch {}
  }
}

//General-purpose array functions
{
  function findDuplicates (arg0_array) {
    //Convert from parameters
    var array = arg0_array;

    //Declare local instance variables
    var local_duplicates = (arr) => arr.filter((item, index) => arr.indexOf(item) != index)

    //Return statement
    return [... new Set(local_duplicates(array))];
  }

  function hasDuplicate (arg0_array, arg1_element) {
    //Convert from parameters
    var array = arg0_array;
    var element = arg1_element;

    //Declare local instance variables
    var element_count = 0;

    for (var i = 0; i < array.length; i++)
      if (element == array[i]) element_count++;

    //Return statement
    return (element_count > 0);
  }

  function getList (arg0_array) {
    //Convert from parameters
    var list = arg0_array;

    //Return statement
    return (Array.isArray(list)) ? list : [list];
  }

  function indexesOf (arg0_substring, arg1_string) {
  	//Convert from parameters
  	var substring = arg0_substring;
  	var string = arg1_string;

  	var a = [], i = -1;
  	while ((i = string.indexOf(substring, i+1)) >= 0) a.push(i);

  	//Return statement
  	return a;
  }

  function moveElement (arg0_array, arg1_old_index, arg2_new_index) {
    //Convert from parameters
    var array = arg0_array;
    var old_index = arg1_old_index;
    var new_index = arg2_new_index;

    //Move element in array
    if (new_index >= array.length) {
      var local_index = new_index - array.length + 1;
      while (k--)
        array.push(undefined);
    }
    array.splice(new_index, 0, array.splice(old_index, 1)[0]);

    //Return statement
    return array;
  }

  function randomElement (arg0_array) {
    //Convert from parameters
    var array = arg0_array;

    //Return statement
    return array[Math.floor(Math.random()*array.length)];
  }

  function removeElement (arg0_array, arg1_element) {
    //Convert from parameters
    var array = arg0_array;
    var element = arg1_element;

    //Declare local instance variables and splice element
    try {
      var local_index = array.indexOf(element);
      if (local_index != -1) array.splice(local_index, 1);
    } catch {}

    //Return statement
    return array;
  }

  function shuffleArray (arg0_array) {
    //Convert from parameters
    var array = arg0_array;

    //Declare local instance variables
    var shuffled_array = array;
    var current_index = array.length,
      temporary_value,
      random_index;

    //Shufle array (Fisher-Yates)
    while (0 != current_index) {
      random_index = Math.floor(Math.random()*current_index);
      current_index--;
      temporary_value = shuffled_array[current_index];
      shuffled_array[current_index] = shuffled_array[random_index];
      shuffled_array[random_index] = temporary_value;
    }

    //Return statement
    return shuffled_array;
  }

  function unique (arg0_array) {
    //Convert from parameters
    var a = arg0_array;

    //Declare local instance variables
  	var seen = {};
  	return a.filter(function(item) {
  		return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  	});
  }
}

//Objects framework
{
  function addObject (arg0_scope, arg1_amount, arg2_not_recursive) {
    //Convert from parameters
    var scope = JSON.parse(JSON.stringify(arg0_scope));
    var amount = arg1_amount;
    var not_recursive = arg2_not_recursive;

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);

    //Iterate over all_scope_keys
    for (var i = 0; i < all_scope_keys.length; i++) {
      var local_subobj = scope[all_scope_keys[i]];

      if (typeof local_subobj == "number")
        scope[all_scope_keys[i]] += amount;
      if (typeof local_subobj == "object")
        if (!not_recursive)
          scope[all_scope_keys[i]] = module.exports.addObject(local_subobj, amount, not_recursive);
    }

    //Return statement
    return scope;
  }

  function changeObjectRange (arg0_scope, arg1_key, arg2_min_max_argument, arg3_value) {
    //Convert from parameters
    var scope = arg0_scope;
    var key = arg1_key;
    var min_max_argument = arg2_min_max_argument;
    var value = Math.round(returnSafeNumber(arg3_value));

    //Add to scope
    if (scope[key]) {
      if (min_max_argument == "minimum") {
        scope[key][0] += value;
      } else if (min_max_argument == "maximum") {
        scope[key][1] += value;
      } else {
        scope[key][0] += value;
        scope[key][1] += value;
      }
    } else {
      if (min_max_argument == "minimum") {
        scope[key] = [value, 0];
      } else if (min_max_argument == "maximum") {
        scope[key] = [0, value];
      } else {
        scope[key] = [value, value];
      }
    }

    //Return statement
    return scope;
  }

  function divideObject (arg0_scope, arg1_amount, arg2_not_recursive, arg3_round) {
    //Convert from parameters
    var scope = JSON.parse(JSON.stringify(arg0_scope));
    var amount = arg1_amount;
    var not_recursive = arg2_not_recursive;
    var round = arg3_round;

    //Declare local instance variables
    var multiplier = 1/amount;

    //Return statement
    return module.exports.multiplyObject(scope, multiplier, not_recursive, round);
  }

  //flattenObject() - Moves all keys into the first nesting
  function flattenObject (arg0_scope) {
    //Convert from parameters
    var scope = JSON.parse(JSON.stringify(arg0_scope)); //Deep copy or bad things happen

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);

    //Iterate over all_scope_keys to move keys into current scope
    for (var i = 0; i < all_scope_keys.length; i++) {
      var flattened_subobj = {};
      var local_subobj = scope[all_scope_keys[i]];

      if (typeof local_subobj == "object") {
        flattened_subobj = module.exports.flattenObject(local_subobj);

        var all_flattened_keys = Object.keys(flattened_subobj);

        for (var x = 0; x < all_flattened_keys.length; x++)
          if (!scope[all_flattened_keys[x]]) {
            scope[all_flattened_keys[x]] = flattened_subobj[all_flattened_keys[x]];
          } else {
            scope[all_flattened_keys[x]] += flattened_subobj[all_flattened_keys[x]];
          }
      } else if (typeof local_subobj == "number") {
        if (!scope[all_scope_keys[i]]) {
          scope[all_scope_keys[i]] = local_subobj;
        } else {
          scope[all_scope_keys[i]] += local_subobj;
        }
      } else {
        scope[all_scope_keys[i]] = local_subobj;
      }
    }

    //Delete any remanent typeof object in the current scope
    all_scope_keys = Object.keys(scope);

    for (var i = 0; i < all_scope_keys.length; i++)
      if (typeof scope[all_scope_keys[i]] == "object")
        delete scope[all_scope_keys[i]];

    //Return statement
    return scope;
  }

  function getDepth (arg0_scope, arg1_depth) {
    //Convert from parameters
    var scope = arg0_scope;
    var depth = (arg1_depth) ? arg1_depth : 1;

    //Iterate over scope
    for (var key in scope) {
      if (!scope.hasOwnProperty(key)) continue;

      if (typeof scope[key] == "object") {
        var level = module.exports.getDepth(scope[key]) + 1;
        depth = Math.max(depth, level);
      }
    }

    //Return statement
    return depth;
  }

  function getObjectList (arg0_list) {
    //Convert from parameters
    var list = arg0_list;

    //Declare local instance variables
    if (list) {
      var all_list_keys = Object.keys(list);
      var object_array = [];

      //Append everything in object as object_array
      for (var i = 0; i < all_list_keys.length; i++)
        object_array.push(list[all_list_keys[i]]);

      //Return statement
      return object_array;
    } else {
      return [];
    }
  }

  function getObjectSum (arg0_scope) {
    //Convert from parameters
    var scope = arg0_scope;

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);
    var total_sum = 0;

    //Iterate over all_scope_keys
    for (var i = 0; i < all_scope_keys.length; i++)
      if (typeof scope[all_scope_keys[i]] == "number")
        total_sum += scope[all_scope_keys[i]];

    //Return statement
    return total_sum;
  }

  function getSubobject (arg0_scope, arg1_key, arg2_restrict_search) {
    //Convert from parameters
    var scope = arg0_scope;
    var key = arg1_key;
    var restrict_search = arg2_restrict_search;

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);

    //Process key
    if (!Array.isArray(key))
      key = getList(key.split("."));

    //Iterate over all_scope_keys
    for (var i = 0; i < all_scope_keys.length; i++) {
      var local_subobj = scope[all_scope_keys[i]];

      if (all_scope_keys[i] == key[key.length - 1]) {
        //Guard clause
        return local_subobj;
        break;
      } else if (typeof local_subobj == "object") {
        var explore_object = false;
        var new_key = JSON.parse(JSON.stringify(key));
        if (key.length > 1)
          restrict_search = true;

        if (restrict_search && all_scope_keys[i] == key[0]) {
          new_key.splice(0, 1);
          explore_object = true;
        }
        if (!restrict_search) explore_object = true;

        //Restrict search for certain arguments
        if (explore_object) {
          var has_subobj = module.exports.getSubobject(local_subobj, new_key, restrict_search);

          if (has_subobj) {
            //Return statement
            return has_subobj;
            break;
          }
        }
      }
    }
  }

  /*
    getSubobjectKeys() - Returns a list of subobject keys from the current scope
    options: {
      exclude_keys: [], - A list of keys to exclude
      include_objects: true/false, - Whether or not to include object keys
      only_objects: true/false - Whether to only include objects
    }
  */
  function getSubobjectKeys (arg0_scope, arg1_options) {
    //Convert from parameters
    var scope = arg0_scope;
    var options = (arg1_options) ? arg1_options : {};

    if (!options.exclude_keys) options.exclude_keys = [];

    //Declare local instance variables
    var all_keys = [];
    var all_scope_keys = Object.keys(scope);

    //Iterate over all_scope_keys
    for (var i = 0; i < all_scope_keys.length; i++) {
      var local_subobj = scope[all_scope_keys[i]];

      if (typeof local_subobj == "object") {
        //Push key itself first
        if (!options.exclude_keys.includes(all_scope_keys[i]))
          all_keys.push(all_scope_keys[i]);

        var all_subkeys = module.exports.getSubobjectKeys(local_subobj, options);

        if (options.include_objects || options.only_objects)
          if (!options.exclude_keys.includes(all_scope_keys[i]))
            all_keys.push(all_scope_keys[i]);

        for (var x = 0; x < all_subkeys.length; x++)
          if (!options.exclude_keys.includes(all_subkeys[x]))
            all_keys.push(all_subkeys[x]);
      } else {
        if (!options.only_objects)
          if (!options.exclude_keys.includes(all_scope_keys[i]))
            all_keys.push(all_scope_keys[i]);
      }
    }

    //Return statement
    return all_keys;
  }

  //mergeObjects() - Merges two objects together. mode: "normal"/"override". normal by default
  function mergeObjects (arg0_scope, arg1_scope, arg2_mode) {
    //Convert from parameters
    var merged_obj = JSON.parse(JSON.stringify(arg0_scope));
    var merge_obj = JSON.parse(JSON.stringify(arg1_scope));
    var mode = (arg2_mode) ? arg2_mode : "normal";

    //Declare local instance variables
    var all_merge_keys = Object.keys(merge_obj);

    //Iterate over all_merge_keys
    if (mode == "normal") {
      for (var i = 0; i < all_merge_keys.length; i++) {
        var current_value = merged_obj[all_merge_keys[i]];
        var local_value = merge_obj[all_merge_keys[i]];

        if (typeof local_value == "number") {
          if (merged_obj[all_merge_keys[i]]) {
            merged_obj[all_merge_keys[i]] = merged_obj[all_merge_keys[i]] + local_value; //Add numbers together
          } else {
            merged_obj[all_merge_keys[i]] = local_value;
          }
        } else if (typeof local_value == "object" && current_value && local_value) {
          merged_obj[all_merge_keys[i]] = module.exports.mergeObjects(current_value, local_value, mode); //Recursively merge objects if possible
        } else {
          merged_obj[all_merge_keys[i]] = local_value;
        }
      }
    } else if (mode == "override") {
      for (var i = 0; i < all_merge_keys.length; i++) {
        var current_value = merged_obj[all_merge_keys[i]];
        var local_override = false;
        var local_value = merge_obj[all_merge_keys[i]];

        if (current_value) {
          if (typeof local_value == "object" && !Array.isArray(local_value)) {
            //Recursively merge objects
            merged_obj[all_merge_keys[i]] = module.exports.mergeObjects(current_value, local_value, mode); //Recursively merge objects if possible
          } else {
            local_override = true;
          }
        } else {
          local_override = true;
        }

        if (local_override)
          merged_obj[all_merge_keys[i]] = local_value;
      }
    }

    //Return statement
    return merged_obj;
  }

  function multiplyObject (arg0_scope, arg1_amount, arg2_not_recursive, arg3_round) {
    //Convert from parameters
    var scope = JSON.parse(JSON.stringify(arg0_scope));
    var amount = arg1_amount;
    var not_recursive = arg2_not_recursive;
    var round = (arg3_round) ? arg3_round : "ceil";

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);

    //Iterate over all_scope_keys
    for (var i = 0; i < all_scope_keys.length; i++) {
      var local_subobj = scope[all_scope_keys[i]];

      if (typeof local_subobj == "number")
        scope[all_scope_keys[i]] = (!round) ? local_subobj*amount :
          Math[round](local_subobj*amount);
      if (typeof local_subobj == "object")
        if (!not_recursive)
          scope[all_scope_keys[i]] = module.exports.multiplyObject(local_subobj, amount, not_recursive, round);
    }

    //Return statement
    return scope;
  }

  function removeZeroes (arg0_scope) {
    //Convert from parameters
    var scope = JSON.parse(JSON.stringify(arg0_scope));

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);

    //Iterate over all_scope_keys
    for (var i = 0; i < all_scope_keys.length; i++) {
      var local_subobj = scope[all_scope_keys[i]];

      if (typeof local_subobj == "number")
        if (local_subobj == 0)
          delete scope[all_scope_keys[i]];
      if (typeof local_subobj == "object")
        scope[all_scope_keys[i]] = module.exports.removeZeroes(local_subobj);
    }

    //Return statement
    return scope;
  }

  function standardisePercentage (arg0_scope, arg1_total) {
    //Convert from parameters
    var scope = JSON.parse(JSON.stringify(arg0_scope));
    var total = arg1_total;

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);
    var scope_total = (total) ? total : 0;

    //Fetch scope_total
    if (!total)
      for (var i = 0; i < all_scope_keys.length; i++)
        scope_total += returnSafeNumber(scope[all_scope_keys[i]]);
    //Standardise to scope_total
    for (var i = 0; i < all_scope_keys.length; i++)
      scope[all_scope_keys[i]] = scope[all_scope_keys[i]]/scope_total;

    //Return statement
    return scope;
  }

  /*
    subtractObjects() - Recursively subtracts one object from another.
    options: {
      preserve_zeroes: true/false - Whether to preserve zeroes/negative values or not. False by default
    }
  */
  function subtractObjects (arg0_scope, arg1_scope, arg2_options) {
    //Convert from parameters
    var merged_obj = JSON.parse(JSON.stringify(arg0_scope));
    var merge_obj = JSON.parse(JSON.stringify(arg1_scope));
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var all_merge_keys = Object.keys(merge_obj);

    //Iterate over all_merge_keys
    for (var i = 0; i < all_merge_keys.length; i++) {
      var current_value = merged_obj[all_merge_keys[i]];
      var local_value = merge_obj[all_merge_keys[i]];

      if (typeof local_value == "number") {
        if (current_value && local_value)
          merged_obj[all_merge_keys[i]] = merged_obj[all_merge_keys[i]] - local_value; //Subtract numbers
      } else if (typeof local_value == "object" && current_value && local_value) {
        merged_obj[all_merge_keys[i]] = module.exports.subtractObjects(current_value, local_value, options); //Recursively subtract objects if possible
      } else {
        if (current_value && local_value)
          merged_obj[all_merge_keys[i]] = local_value;
      }

      if (!options.preserve_zeroes)
        if (merged_obj[all_merge_keys[i]] < 0)
          delete merged_obj[all_merge_keys[i]];
    }

    //Return statement
    return merged_obj;
  }

  function sortObject (arg0_object, arg1_mode) {
    //Convert from parameters
    var object = arg0_object;
    var mode = (arg1_mode) ? arg1_mode : "descending";

    //Declare local instance variables
    var new_object = {};

    if (mode.startsWith("numeric_")) {
      var all_object_keys = Object.entries(object);

      //Ascending/descending sort
      if (mode == "numeric_ascending")
        all_object_keys.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
      if (mode == "numeric_descending")
        all_object_keys.sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

      new_object = Object.fromEntries(all_object_keys);

      //Return statement
      return new_object;
    } else {
      //Return statement
      return Object.fromEntries(
        Object.entries(object).sort(([, a], [, b]) => (mode == "descending") ? b - a : a - b)
      );
    }
  }
}
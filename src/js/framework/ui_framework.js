//Declare functions
function closePopup () {
  map.closePopup();
}

//Only works for static elements
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

function closestPointInCircle (arg0_circle_x, arg1_circle_y, arg2_point_x, arg3_point_y, arg4_radius) {
  //Convert from parameters
  var cX = arg0_circle_x;
  var cY = arg1_circle_y;
  var pX = arg2_point_x;
  var pY = arg3_point_y;
  var r = arg4_radius;

  //Declare local instance variables
  var center_x = cX + r;
  var center_y = cY + r;
  var vX = pX - center_x;
  var vY = pY - center_y;

  var magV = Math.sqrt(vX*vX + vY*vY);
  var aX = center_x + vX/magV*r;
  var aY = center_y + vY/magV*r;

  //Return statement
  return [aX, aY];
}

function onRangeChange (arg0_range_el, arg1_listener) {
  //Convert from parameters
  var range_el = arg0_range_el;
  var listener = arg1_listener;

  //Declare local instance variables
  var n, c, m;

  range_el.addEventListener("input", function (e) {
    n = 1;
    c = e.target.value;

    if (c != m) listener(e);
    m = c;
  });
  range_el.addEventListener("change", function (e) {
    if (!n) listener(e);
  });
}

function pointIsInCircle (arg0_circle_x, arg1_circle_y, arg2_point_x, arg3_point_y, arg4_radius) {
  //Convert from parameters
  var a = arg0_circle_x;
  var b = arg1_circle_y;
  var x = arg2_point_x;
  var y = arg3_point_y;
  var r = arg4_radius;

  //Declare local instance variables
  var dist_points = (a - x) * (a - x) + (b - y) * (b - y);
  r *= r;

  //Return statement
  return (dist_points < r);
}

function updateSidebarHover () {
  //Declare local instance variables
  var all_hovers = document.querySelectorAll(`.hierarchy-elements-container div:hover`);
  var all_legacy_hovers = document.querySelectorAll(`.hover`);

  //Clear all elements with .hover class
  for (var i = 0; i < all_legacy_hovers.length; i++)
    all_legacy_hovers[i].setAttribute("class",
      all_legacy_hovers[i].getAttribute("class").replace(" hover", "")
    );

  //Set only last hover to be hovered
  if (all_hovers.length > 0) {
    var local_class = all_hovers[all_hovers.length - 1].getAttribute("class");

    (local_class) ?
      all_hovers[all_hovers.length - 1].setAttribute("class",
        local_class + " hover"
      ) :
      all_hovers[all_hovers.length - 1].setAttribute("class", " hover");
  }
}

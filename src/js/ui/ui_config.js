//Initialise config if it doesn't exist
if (!global.config) global.config = {};

global.config.ui = {
  map: "map",

  left_sidebar: "#left-sidebar",
  right_sidebar: "#right-sidebar",
  topbar: "#topbar",

  //Left sidebar
  hierarchy: "#hierarchy",
  hierarchy_container: "#hierarchy-container",
  date_fields: `#date-container input`,
    hour_el: `#date-container #hour-input`,
    minute_el: `#date-container #minute-input`,

    day_el: `#date-container #day-input`,
    month_el: `#date-container #month-input`,
    year_el: `#date-container #year-input`,
    year_type_el: `#date-container #year-type`

  //Right sidebar

  //Topbar
};


//Initialise helper functions
{
  function getUISelector (arg0_key, arg1_return_array) {
    //Convert from parameters
    var key = arg0_key;
    var return_array = arg1_return_array;

    //Return statement
    return (!return_array) ? document.querySelector(global.config.ui[key]) : document.querySelectorAll(global.config.ui[key]);
  }
}

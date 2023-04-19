//Import modules
window.fs = require("fs");

//Brush variables
window.brush = {
  radius: 10000
};
window.current_entity = new L.LayerGroup();
window.current_union;
window.cursor;
window.entity_cache = [];
window.polity_options;
window.polity_index = -1;
window.selected_layer = "polities";

//Date variables
var current_date = new Date();
window.date = {
  year: current_date.getFullYear(),
  month: current_date.getMonth() + 1,
  day: current_date.getDate(),
  hour: current_date.getHours(),
  minute: current_date.getMinutes()
};

/*
  Hierarchy group data structure:
  <group_name>: {
    name: "France",
    layer: true, //Either true/false

    subgroups: ["departments"],
    entities: ["1", ..]
  },
  <group_name>_departments: {
    name: "Departments",
    parent_group: "France", //Immediate parent

    entities: ["38179137582", "38179137583"] //Entity ID's
  }
*/

//Default brush options
window.auto_simplify_when_editing = true;

//Entity renderer
window.layers = ["polities"];
window.polities_groups = {};
window.polities_layer = [];

//Key events
window.keys = {};

//Mouse events
window.mouse_pressed = false;
window.right_mouse = false;

//UI
{
  //Entity UI
  window.actions_with_context_menu = ["apply-path", "hide-polity", "simplify-entity"];
  window.entity_options = {
    className: "current-union"
  };

  //Sidebar UI
  window.sidebar_selected_entities = [];
}

//Test scripts
setTimeout(function(){
  loadSave("england");
}, 100);

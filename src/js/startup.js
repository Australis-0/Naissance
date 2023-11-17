//Import modules
window.fs = require("fs");

//Brush variables
window.current_union;
window.cursor;
window.entity_cache = [];
window.polity_index = -1;
window.selected_layer = "polities";

//Brush settings
{
  window.brush = {
    //Basic options
    auto_simplify_when_editing: true,
    brush_change: false, //Is updated on brush change
    radius: 50000,

    //Masks
    brush_only_mask: false, //Whether the mask only apply to the current brush, and not the entire selection. False by default
    mask_add: [], //Mask override (Array<Object, Polity>)
    mask_subtract: [] //Overrides mask (Array<Object, Polity>)
  };
  window.polity_options;
  window.simplify_tolerance = getSimplifyTolerance(10); //To be folded in later
}

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

//Entity renderer
window.layers = ["polities"];
window.polities_groups = {};
window.polities_layer = [];

//Key events
window.keys = {};

//Mouse events
window.mouse_pressed = false;
window.right_mouse = false;

//Optimisation
window.reserved = {
  mask_classes: [],
  mask_types: ["add", "subtract"]
};

//Process optimisation
{
  //Masks
  for (var i = 0; i < reserved.mask_types.length; i++)
    reserved.mask_classes.push(` mask-${reserved.mask_types[i]}`);
}

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

//Initialise map, other UI elements after everything else
{
  var map = L.map("map").setView({
    inertia: true,
    lon: 0,
    lat: 0,
    minZoom: 3,
    maxZoom: 10,
    worldCopyJump: true //Makes sure the world map wraps around
  }).setView([51.505, -0.09], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  //Initialise Brush UI
  initBrush();
  initBrushUI();

  //Initialise Date handling
  initDate();

  //Initialise Sidebar handling
  initSidebar();

  //UI loop
  setInterval(function(){
    //Update bottom-right sidebar UI
    printBrush();
  }, 100);
}

//Test scripts
setTimeout(function(){
  loadSave("atlas");
}, 100);

//Initialise config if it doesn't exist
if (!global.config) global.config = {};

global.config.ui = {
  map: "map",

  left_sidebar: "#left-sidebar",
  right_sidebar: "#right-sidebar",
  topbar: "#topbar",

  //Left sidebar
  //Pages
  file_page: `#file-tab`,
  map_page: `#hierarchy-tab`,

  //Other selectors
  hierarchy: "#hierarchy",
  hierarchy_container: "#hierarchy-container",
  date_fields: `#date-container input`,
    hour_el: `#date-container #hour-input`,
    minute_el: `#date-container #minute-input`,

    day_el: `#date-container #day-input`,
    month_el: `#date-container #month-input`,
    year_el: `#date-container #year-input`,
    year_type_el: `#date-container #year-type`,
  left_sidebar_pages: `#left-sidebar [page="true"]`,

  //Right sidebar

  //Topbar
  topbar_tab_buttons: `#topbar > ul li`,
    file_button_el: `#topbar .file`,
    map_button_el: `#topbar .map`,

  //Map
  entity_bio_container: `#entity-ui-timeline-bio-container`,
  entity_timeline_graph_el: `#entity-ui-timeline-graph-container`,
  entity_timeline_header: `#entity-ui-timeline-data-header`,
  entity_top_bio_header: `.top-bio-header`,
  entity_ui_header: `#entity-ui-header`,

  entity_action_context_menu: `#entity-action-context-menu`, //Has suffix
  entity_keyframe_context_menu: `#entity-keyframe-context-menu`, //Has suffix
    entity_keyframe_context_menu_two: `#entity-keyframe-context-menu-two`, //Has suffix
      entity_keyframe_change_date_button: `#change-date-button`, //Has prefix
      entity_keyframe_date_input: `#date-input` //Has prefix
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

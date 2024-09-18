config.defines.common = {
  reserved_entity_actions: ["name", "scope_type"], //The types of keys that are reserved for config.entity_actions categories
  reserved_entity_keyframes: ["name", "scope_type"], //The types of keys that are reserved for config.entity_keyframes categories

  months_lowercase: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
  months_uppercase: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  selectors: {
    //Interface

    map: "map", //The query selector for the main map element.
    left_sidebar: `#left-sidebar`, //The query selector for the left sidebar container.
    right_sidebar: `#right-sidebar`, //The query selector for the right sidebar container.
    topbar: `#topbar`, //The query selector for the topbar container.

    //Interface - Left Sidebar

    hierarchy: `#hierarchy`, //The query selector for the actual hierarchy tab or supercontainer.
    hierarchy_container: `#hierarchy-container`, //The query selector for the actual hierarchy container.
    date_container: `#date-container`, //The query selector for the global date container to be populated automatically.
    date_fields: `#date-container input`, //The query selector on which to apply 'keyup' update interactivity.

    //Interface - Right Sidebar

    //Interface - Topbar
    topbar_tab_buttons: `#topbar > ul li`, //The query selector for all topbar tab buttons.
      file_button: `#topbar .file`, //The FILE button query selector.
      map_button: `#topbar .map`, //The MAP button query selector.

    //Map
    entity_ui: `.leaflet-popup`,
      //Entity UI - All of these are prefixed by {entity_selector}
      //Entity UI - 1st Row - Header
      entity_ui_header: `#entity-header`, //The query selector for the Entity UI header.

      //Entity UI - 2nd Row - Timeline/Data
      entity_timeline_graph: `#entity-ui-timeline-graph-container`, //The query selector for the Entity Timeline header
      entity_timeline_graph_canvas: `#entity-ui-timeline-graph`, //The query selector for the Entity Timeline graph canvas
      entity_timeline_header: `#entity-ui-timeline-data-header`, //The query selector for the Entity Timeline header.

      entity_bio_container: `#entity-ui-timeline-bio-container`, //The query selector containing the Entity Bio container.
      entity_bio_header: `.top-bio-header`, //The query selector for tyhe Entity Bio header.
      entity_bio_table: `#entity-ui-timeline-bio-table`, //The query selector containing the Entity Bio table with history frames.
        entity_bio_entries_dates: `table tbody tr td:first-child`, //The query selector containing all entity bio entry dates.
        entity_bio_entries: `table tbody tr td:not(:first-child) span`, //The query selector for all entity bio entries generated.

      entity_keyframe_context_menu_anchor: `#entity-keyframe-context-menu`,

      //Entity UI - 3rd Row - Customisation
      //Tabs
      fill_tab: `#fill`,
      other_tab: `#other`,
      stroke_tab: `#stroke`,
      underline_el: `.options-tab > hr`,

      other_container: `#other-container`,

        //Fill/Stroke
        //Colour wheel
        brightness_header: `#brightness-header`,
        brightness_range: `#colour-picker-brightness-range`,
        colour_brightness: `#colour-picker-brightness`,
        colour_cursor: `#colour-picker-cursor`,
        colour_options: `#entity-ui-customisation-options-container`,
        colour_picker: `#entity-ui-customisation-colour-picker-container`,
        colour_wheel: `#colour-picker`,
        entity_b: "#b",
        entity_g: "#g",
        entity_r: "#r",
        opacity_header: `#opacity-header`,
        opacity_range: `#colour-picker-opacity-range`,

      //Entity UI - 4th Row - Actions
      entity_actions_context_menu_anchor: `#entity-actions-context-menu`
  }
};

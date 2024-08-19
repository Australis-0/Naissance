//Initialise entity context menus
{
  /*
    printEntityContextMenu() - Prints an Entity context menu on the current map.
    arg0_entity_id: (String)
    arg1_options: (Object)
      coords: (Array<Number, Number>) - Optional. The coordinates to use for the popup instead of the default. Centroid of entity by default.
      is_being_edited: (Boolean) - Optional. Whether the entity is currently being edited. False by default.
      pin: (Boolean) - Optional. Whether the entity is currently pinned. False by default.
  */
  function printEntityContextMenu (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var brush_obj = main.brush;
    var coords_string;
    var data_graph_types = [{ id: "land_area", name: "Land Area" }];
    var data_select_ui = [];
    var entity_obj = getEntity(entity_id);
    var is_being_edited = (options.is_being_edited);
    var is_pinned = (options.pin);
    var local_popup = opened_interfaces[entity_id];
    var to_pin = !(is_pinned);

    //Fetch is_being_edited; pin status; coords_string
    if (brush_obj.editing_entity == entity_id) is_being_edited = true;
    if (options.coords)
      coords_string = (!Array.isArray(options.coords)) ? `[${[options.coords.lng, options.coords.lat]}]` : `[${options.coords.toString()}]`;

    //Format data_select_ui
    for (var i = 0; i < data_graph_types.length; i++)
      data_select_ui.push(`<option value = "${data_graph_types[i].id}">${data_graph_types[i].name}</option>`);

    //Format local_ui
    var local_actions_ui = (!is_being_edited) ?
      `<div id = "entity-ui-actions-container" class = "entity-ui-container">
        <table id = "entity-ui-button-container" class = "entity-button-container">
          <tr>
            <td>
              <img src = "gfx/interface/empty_icon.png" class = "medium button pencil-icon" id = "edit-entity" onclick = "editEntity('${entity_id}');" draggable = "false"><span>Edit Polity</span>
            </td>
            <td>
              <img src = "gfx/interface/simplify_icon.png" id = "simplify-entity" class = "medium button" draggable = "false" context = "true"><span>Simplify Path</span>
            </td>
          </tr>
          <tr>
            <td>
              <img src = "gfx/interface/hide_polity_icon.png" id = "hide-polity" class = "medium button" draggable = "false" context = "true"><span>Hide Polity</span>
            </td>
            <td>
              <img src = "gfx/interface/apply_path_icon.png" id = "apply-path" class = "medium button" draggable = "false" context = "true"><span>Apply Path</span>
            </td>
          </tr>
          <tr>
            <td></td>
            <td>
              <img src = "gfx/interface/clean_keyframes_icon.png" id = "clean-keyframes" class = "medium button" draggable = "false" context = "true"><span>Clean Keyframes</span>
            </td>
          </tr>
        </table>
      </div>` :
      `<div id = "entity-ui-actions-container" class = "entity-ui-container">
        <table id = "entity-ui-button-container" class = "entity-button-container">
          <tr>
            <td>
              <img src = "gfx/interface/empty_icon.png" id = "confirm-entity" class = "medium button checkmark-icon" onclick = "finishEntity(); closeEntityUI('${entity_id}')"><span>Finish Polity</span>
            </td>
          </tr>
        </table>
      </div>`;

    var local_ui = `
      <!-- Entity UI Header -->

      <div id = "entity-ui-header" class = "entity-ui-container">
        <div id = "entity-ui-header-container" class = "entity-ui-title">
          <input id = "polity-name" class = "${entity_id}" value = "{ENTITY_NAME}"></input>

          <img src = "gfx/interface/empty_icon.png" class = "button cross-icon" id = "close-popup" onclick = "closeEntityUI('${entity_id}');" draggable = "false">
          <img src = "gfx/interface/empty_icon.png" class = "button delete-icon" id = "delete-entity" onclick = "deleteEntity('${entity_id}');" draggable = "false">
          <img src = "gfx/interface/empty_icon.png" class = "button ${(!is_pinned) ? "pin-icon" : "reverse-pin-icon"}" id = "pin-popup" onclick = "printEntityContextMenu(${entity_id}, { coords: ${coords_string}, is_being_edited: ${options.is_being_edited}, pin: ${!options.pin} });" draggable = "false">
        </div>
      </div>

      <!-- Timeline/Data Section -->

      <div id = "entity-ui-timeline-data-header" class = "entity-ui-container small">
        <div class = "entity-ui-header-container entity-ui-subtitle">
          Timeline/Data

          <img src = "gfx/interface/empty_icon.png" class = "small button minimise-icon right-align" id = "timeline-minimise-btn-${entity_id}" onclick = "minimiseUI('timeline-minimise-btn-${entity_id}', 'timeline');">
        </div>
      </div>

      <div id = "entity-ui-timeline-graph-container-${entity_id}" class = "entity-ui-container timeline">
        <div id = "entity-ui-timeline-graph-subcontainer" class = "entity-ui-subcontainer">
          <select id = "entity-ui-timeline-graph-type" class = "entity-select">${data_select_ui.join("\n")}</select>
          <canvas id = "entity-ui-timeline-graph-${entity_id}" class = "entity-ui-graph"></canvas>

          <span id = "entity-ui-timeline-graph-y-axis" class = "entity-ui-graph-y-axis"></span>
          <span id = "entity-ui-timeline-graph-y-top-axis-label" class = "graph-label">100%</span>
          <span id = "entity-ui-timeline-graph-y-bottom-axis-label" class = "graph-label">0%</span>

          <div id = "entity-ui-timeline-graph-x-axis" class = "entity-ui-graph-x-axis">
            <span id = "entity-ui-timeline-graph-x-left-axis-label" class = "left-align graph-label">START</span>
            <span id = "entity-ui-timeline-graph-x-right-axis-label" class = "right-align graph-label">END</span>
          </div>
        </div>
      </div>

      <div id = "entity-ui-timeline-bio-container-${entity_id}" class = "entity-ui-container bio">
        <div id = "entity-ui-timeline-bio-subcontainer" class = "entity-ui-subcontainer">
          <table id = "entity-ui-timeline-bio-table-${entity_id}" class = "timeline-bio-table">
            <tr>
              <th>YEAR</th>
              <th></th>
            </tr>
          </table>
        </div>
      </div>

      <!-- Customisation Section -->

      <div id = "entity-ui-customisation-header" class = "entity-ui-container small">
        <div class = "entity-ui-header-container entity-ui-subtitle">
          Customisation

          <img src = "gfx/interface/empty_icon.png" class = "small button minimise-icon right-align" id = "customisation-minimise-btn-${entity_id}" onclick = "minimiseUI('customisation-minimise-btn-${entity_id}', 'customisation');">
        </div>
      </div>

      <div id = "customisation-top-parent-${entity_id}" class = "entity-ui-container customisation-top-parent">
        <div id = "entity-ui-customisation-colour-ui-container" class = "entity-ui-container colour-container">
          <div id = "entity-ui-customisation-colour-picker-container-${entity_id}" class = "colour-picker-container">
            <img id = "colour-picker-hue-${entity_id}" class = "colour-picker-hue" src = "gfx/interface/colour_wheel.png">
            <div id = "colour-picker-brightness-${entity_id}" class = "colour-picker-brightness"></div>

            <div id = "colour-picker-cursor-${entity_id}" class = "colour-picker-cursor"></div>

            <div id = "colour-picker-${entity_id}" class = "colour-picker-mask"></div>

            <!-- RGB inputs -->
            <div class = "rgb-inputs">
              R: <input type = "number" id = "${entity_id}-r" value = "255"><br>
              G: <input type = "number" id = "${entity_id}-g" value = "255"><br>
              B: <input type = "number" id = "${entity_id}-b" value = "255"><br>
            </div>

            <span class = "no-select">
              <span class = "brightness-range-container">
                <span id = "${entity_id}-brightness-header" class = "small-header">Brightness</span>
                <input type = "range" min = "0" max = "100" value = "100" id = "colour-picker-brightness-range-${entity_id}" class = "colour-picker-brightness-range">
              </span>

              <span class = "opacity-range-container">
                <span id = "${entity_id}-opacity-header" class = "small-header">Opacity</span>
                <input type = "range" min = "0" max = "100" value = "50" id = "colour-picker-opacity-range-${entity_id}" class = "colour-picker-opacity-range">
              </span>
            </span>
          </div>
        </div>

        <div id = "entity-ui-customisation-options-container-${entity_id}" class = "entity-ui-container options-container">
          <div class = "options-tab ${entity_id}">
            <span id = "${entity_id}-fill" class = "options-tab-header active">Fill</span>
            <span id = "${entity_id}-stroke" class = "options-tab-header">Stroke</span>
            <span id = "${entity_id}-other" class = "options-tab-header">Other</span>
            <hr>
          </div>

          <div id = "${entity_id}-other-container" class = "options-body">
            <b>Visibility Settings:</b><br><br>
            Minimum Zoom: <input id = "minimum-zoom-level-${entity_id}" class = "short-number-input" type = "number"><br>
            Maximum Zoom: <input id = "maximum-zoom-level-${entity_id}" class = "short-number-input" type = "number"><br>
          </div>
        </div>
      </div>

      <div id = "entity-ui-customisation-description-container-${entity_id}" class = "entity-ui-container">
      </div>

      <!-- Actions Section -->

      <div id = "entity-ui-actions-header" class = "entity-ui-container small">
        <div class = "entity-ui-header-container entity-ui-subtitle">
          Actions

          <img src = "gfx/interface/empty_icon.png" class = "small button minimise-icon right-align" id = "actions-minimise-btn-${entity_id}" onclick = "minimiseUI('actions-minimise-btn-${entity_id}', 'actions');">
        </div>
      </div>

      <!-- Actions Context Menu -->
      <div id = "entity-action-context-menu-${entity_id}" class = "actions-context-menu-container instant-display-none"></div>

      ${local_actions_ui}

      <!--  Bio Entry Context Menu -->

      <div id = "entity-keyframe-context-menu-${entity_id}" class = "bio-context-menu-container instant-display-none">
        <div id = "context-menu-adjust-time-button" class = "context-menu-button">
          <img src = "gfx/interface/clock_empty_icon.png" class = "icon small negative" draggable = "false"> Adjust Time
        </div>
        <div id = "context-menu-edit-keyframe-button" class = "context-menu-button">
          <img src = "gfx/interface/pencil_filled_icon.png" class = "icon small negative" draggable = "false"> Edit Keyframe
        </div>
        <div id = "context-menu-delete-keyframe-button" class = "context-menu-button delete">
          <img src = "gfx/interface/delete_filled_icon.png" class = "icon small negative" draggable = "false"> Delete
        </div>
      </div>

        <! -- Bio Entry Context Menu - Adjust Date Prompt -->
        <div id = "entity-keyframe-context-menu-two-${entity_id}" class = "bio-context-menu-date-container instant-display-none">
          <center>
            <select id = "context-date-menu-${entity_id}-day" class = "day-input"></select>
            <select id = "context-date-menu-${entity_id}-month" class = "month-input"></select>
            <input id = "context-date-menu-${entity_id}-year" class = "year-input" type = "number">
          </center>
          <center>
            <input id = "context-date-menu-${entity_id}-hour" class = "hour-input" type = "number" min = "0" max = "23"> :
            <input id = "context-date-menu-${entity_id}-minute" class = "minute-input" type = "number" min = "0" max = "59">

            <select id = "context-date-menu-${entity_id}-year-type"></select>
          </center>
          <button id = "change-date" class = "context-menu-button">Change Date</button>
        </div>
    `;

    //Declare element variables
    var bio_year_container = document.getElementById("entity-ui-timeline-bio-table");
    var reload_popup = false;

    //Only close existing UI and open a new popup if the popup is not already pinned
    if (local_popup) {
      if (!local_popup.options.is_pinned) reload_popup = true;

      //Also reload popup if pin argument is different to is_pinned
      if (is_pinned != local_popup.options.is_pinned) reload_popup = true;
    } else {
      //Popup for entity doesn't exist, so create a new one
      reload_popup = true;
    }
    if (is_pinned != undefined) reload_popup = true;

    //Reload the Leaflet popup if reload_popup is true
    if (reload_popup) {
      closeEntityUI(entity_id);

      //Bind popup
      var popup_options  = {
        id: "entity-ui-popup",
        class: entity_id,
        className: entity_id
      };

      //Create entity options to serve as flags
      if (entity_obj)
        if (!entity_obj.options.selected_keyframes) entity_obj.options.selected_keyframes = [];

      if (!is_pinned) popup_options.is_pinned = is_pinned;

      if (is_pinned) {
        popup_options.autoClose = false;
        popup_options.closeOnClick = false;
        popup_options.is_pinned = true;
      }

      //Set popup
      var last_history_coords = getEntityCoords(entity_id);
      var leaflet_centre_coords;

      //Fetch centroid for leaflet_centre_coords if options.coords is not available
      if (!options.coords) {
        var turf_polygon = getTurfObject(last_history_coords);
        var turf_polygon_centre = turf.center(turf_polygon).geometry.coordinates;

        leaflet_centre_coords = [turf_polygon_centre[1], turf_polygon_centre[0]]; //Convert from TURF LatLng to LngLat
      } else {
        leaflet_centre_coords = options.coords;
      }

      var popup = L.popup(popup_options).setLatLng(leaflet_centre_coords) //[WIP] - Get centre coordinates here of most recent entity_obj history frame to fix
        .setContent(parseLocalisation(local_ui, {
          scopes: {
            ENTITY_NAME: getEntityName(entity_id)
          }
        }))
        .openOn(map);

      opened_interfaces[entity_id] = popup;

      //Onclick events - Context menu interactions
      setTimeout(function(){
        var just_opened_apply_path = false;
        var popup_el = document.querySelector(`.leaflet-popup[class~='${entity_id}']`);

        if (popup_el)
          popup_el.onclick = function (e) {
          var context_menu_el = document.querySelector(`#entity-ui-context-menu-${entity_id}`);

          //Check if target is context menu
          {
            //Case 1 - Opening Action Context Menu Logic
            try {
              //Bio context menu
              if (e.composedPath()[0].getAttribute("class"))
                if (e.composedPath()[0].getAttribute("class").includes("bio-context-menu-icon"))
                  //Set context menu to be visible and teleport to selected element; close previously attached menus
                  printKeyframeContextMenu(entity_id, e.composedPath()[1]);

              //Actions
              if (e.composedPath()[0].getAttribute("id")) {
                if (e.composedPath()[0].id == "apply-path") {
                  openActionContextMenu(entity_id, "apply_path");

                  setTimeout(function(e){
                    e.target.setAttribute("toggle", "true");
                  }, 1, e);
                }
                if (e.composedPath()[0].id == "clean-keyframes")
                  openActionContextMenu(entity_id, "clean_keyframes");
                if (e.composedPath()[0].id == "hide-polity")
                  openActionContextMenu(entity_id, "hide");
                if (e.composedPath()[0].id == "simplify-entity")
                  openActionContextMenu(entity_id, "simplify");
              }
            } catch (e) {
              console.log(e);
            }

            //Case 2 - Context menu should be closed if the context menu itself or the button isn't a parent in the path
            try {
              if (
                !arrayHasQuerySelector(e.composedPath(), `${config.ui.entity_keyframe_context_menu}-${entity_id}`) &&
                !arrayHasQuerySelector(e.composedPath(), `${config.ui.entity_keyframe_context_menu_two}-${entity_id}`) &&
                !arrayHasElementAttribute(e.composedPath(), "class", `bio-context-menu-icon`)
              )
                closeKeyframeContextMenu(entity_id);

              //Logic handling for closing action context menu assuming keyframes aren't open
              if (
                !arrayHasElementAttribute(e.composedPath(), "id", `${config.ui.entity_action_context_menu}-${entity_id}`) &&
                !arrayHasElementAttribute(e.composedPath(), "context", "true") &&
                !window[`${entity_id}_keyframes_open`]
              )
                closeActionContextMenu(entity_id);
            } catch (e) {
              console.log(e);
            }

            //Case 3 - Logic handling for action button toggleables
            try {
              if (window[`${entity_id}_keyframes_open`])
                if (window[`${entity_id}_apply_path`])
                  if (
                    arrayHasElementAttribute(e.composedPath(), "id", "apply-path") &&
                    arrayHasElementAttribute(e.composedPath(), "toggle", "true")
                  ) {
                    closeActionContextMenu(entity_id);
                    closeApplyPath(entity_id);

                    setTimeout(function(e) {
                      e.target.setAttribute("toggle", "false");
                    }, 2, e);
                  }
            } catch (e) {
              console.log(e);
            }
          }
        };
      }, 250);
    }

    //Return statement
    return popup;
  }

  //Initialise Entity Keyframe context menus
  {
    function closeActionContextMenu (arg0_entity_id, arg1_instant) {
      //Convert from parameters
      var entity_id = arg0_entity_id;
      var instant = arg1_instant;

      //Declare local instance variables
      var actions_context_menu_el = document.querySelector(`${config.ui.entity_action_context_menu}-${entity_id}`);

      //Set to display-none
      if (!actions_context_menu_el.getAttribute("class").includes("display-none"))
        addClass(actions_context_menu_el, ` ${(instant) ? "instant-" : ""}display-none`);
    }

    function closeKeyframeContextMenu (arg0_entity_id, arg1_instant) {
      //Convert from parameters
      var entity_id = arg0_entity_id;
      var instant = arg1_instant;

      //Declare local instance variables
      var keyframe_context_menu_el = document.querySelector(`${config.ui.entity_keyframe_context_menu}-${entity_id}`);

      //Set to display-none
      if (!keyframe_context_menu_el.getAttribute("class").includes("display-none"))
        addClass(keyframe_context_menu_el, ` ${(instant) ? "instant-" : ""}display-none`);

      //Close attached menus
      closeKeyframeContextMenuTwo(entity_id);
    }

    function closeKeyframeContextMenuTwo (arg0_entity_id, arg1_instant) {
      //Convert from parameters
      var entity_id = arg0_entity_id;
      var instant = arg1_instant;

      //Declare local instance variables
      var keyframe_context_menu_two_el = document.querySelector(`${config.ui.entity_keyframe_context_menu_two}-${entity_id}`);

      //Set to display-none
      if (!keyframe_context_menu_two_el.getAttribute("class").includes("display-none"))
        addClass(keyframe_context_menu_two_el, ` ${(instant) ? "instant-" : ""}display-none`);
    }

    function printAdjustTimeContextMenu (arg0_entity_id, arg1_timestamp) {
      //Convert from parameters
      var entity_id = arg0_entity_id;
      var timestamp = arg1_timestamp;

      //Declare local instance variables
      var keyframe_context_menu_two_selector = `${config.ui.entity_keyframe_context_menu_two}-${entity_id}`;

      var keyframe_context_menu_el = document.querySelector(`${config.ui.entity_keyframe_context_menu}-${entity_id}`);
      var keyframe_context_menu_two_el = document.querySelector(`${keyframe_context_menu_two_selector}`);

      //Create local context menu
      var adjust_time_context_menu_ui = createContextMenu({
        anchor: `#entity-keyframe-context-menu-two-${entity_id}`, //Replace with #entity-keyframe-context-menu-two
        class: `entity-adjust-time-ui`,
        id: `entity-adjust-time-ui`,
        name: "Adjust Time:",

        date_input: {
          id: `date-input`,
          name: "Adjust Time:",
          type: "date",
          multiple_rows: true,

          x: 0,
          y: 0
        },
        change_date_button: {
          id: "change-date-button",
          name: "Change Date",
          type: "button",

          x: 0,
          y: 1
        }
      });

      //Populate date fields
      var date_input_prefix = `${config.ui.entity_keyframe_context_menu_two}-${entity_id} ${config.ui.entity_keyframe_date_input}`;
      populateDateFields(
        `${date_input_prefix} #year-input`,
        `${date_input_prefix} #month-input`,
        `${date_input_prefix} #day-input`,
        `${date_input_prefix} #hour-input`,
        `${date_input_prefix} #minute-input`,
        `${date_input_prefix} #year-type`,
        parseTimestamp(timestamp));

      //Set adjust_time_context_menu_ui to be visible
      keyframe_context_menu_el.after(keyframe_context_menu_two_el);
      //keyframe_context_menu_two_el = document.querySelector(`${keyframe_context_menu_two_selector}`);
      if (keyframe_context_menu_two_el.getAttribute("class").includes("display-none")) {
        removeClass(keyframe_context_menu_two_el, " instant-display-none");
        removeClass(keyframe_context_menu_two_el, " display-none");
      } else {
        addClass(keyframe_context_menu_two_el, " display-none");
      }

      //Button listeners
      var change_date_button = `${config.ui.entity_keyframe_context_menu_two}-${entity_id} ${config.ui.entity_keyframe_change_date_button}`;
      change_date_button.onclick = function () {
        var new_date = getDateFromFields(`${date_input_prefix}-year`, `${date_input_prefix}-month`, `${date_input_prefix}-day`, `${date_input_prefix}-hour`, `${date_input_prefix}-minute`, `${date_input_prefix}-year-type`);

        //Adjust polity history now
        adjustPolityHistory(entity_id, timestamp, new_date);
      };
    }

    function printKeyframeContextMenu (arg0_entity_id, arg1_parent_el) {
      //Convert from parameters
      var entity_id = arg0_entity_id;
      var parent_el = arg1_parent_el;

      //Declare local instance variables
      var keyframe_context_menu_selector = `${config.ui.entity_keyframe_context_menu}-${entity_id}`;
      var timestamp = parent_el.parentElement.getAttribute("timestamp");

      //Calculate top_string
      var bio_container_el = document.querySelector(`${config.ui.entity_bio_container}-${entity_id}`);
      var header_el = document.querySelector(`${config.ui.entity_ui_header}`);
      var keyframe_context_menu_el = document.querySelector(keyframe_context_menu_selector);
      var keyframe_context_menu_two_el = document.querySelector(`${config.ui.entity_keyframe_context_menu_two}-${entity_id}`);
      var timeline_graph_el = document.querySelector(`${config.ui.entity_timeline_graph_el}-${entity_id}`);
      var timeline_header_el = document.querySelector(`${config.ui.entity_timeline_header}`);
      var top_bio_header_el = document.querySelector(`${config.ui.entity_top_bio_header}`);

      var offset_top = parent_el.offsetTop - bio_container_el.scrollTop;
      var top_string = `calc(${header_el.offsetHeight}px + ${timeline_graph_el.offsetHeight}px + ${timeline_header_el.offsetHeight}px + ${top_bio_header_el.offsetHeight}px + ${offset_top}px + 0.5rem)`;

      //Create local context menu
      var keyframe_context_menu_ui = createContextMenu({
        anchor: keyframe_context_menu_selector,
        class: `entity-keyframe-ui`,
        id: `entity-keyframe-ui`,
        name: "Entity Keyframe:",

        adjust_time_button: {
          id: "adjust-time-button",
          name: "Adjust Time",
          type: "button",
          attributes: {
            timestamp: `${timestamp}`
          },

          x: 0,
          y: 0,

          onclick: `printAdjustTimeContextMenu('${entity_id}', '${timestamp}');`
        },
        edit_keyframe_button: {
          id: "edit-keyframe-button",
          name: "Edit Keyframe",
          type: "button",
          attributes: {
            timestamp: `${timestamp}`
          },

          x: 0,
          y: 1,

          onclick: `editKeyframe('${entity_id}', '${timestamp}');`
        },
        delete_keyframe_button: {
          id: "delete-keyframe-button",
          name: "Delete Keyframe",
          type: "button",
          attributes: {
            timestamp: `${timestamp}`
          },

          x: 0,
          y: 2,

          onclick: `deleteKeyframe('${entity_id}', '${timestamp}');`
        }
      });

      //Set keyframe_context_menu_el to be visible; hide previous attached menus
      keyframe_context_menu_el.style.top = top_string;
      keyframe_context_menu_two_el.style.top = top_string;

      parent_el.after(keyframe_context_menu_el);
      closeKeyframeContextMenuTwo(entity_id);
      removeClass(keyframe_context_menu_el, " instant-display-none");
      removeClass(keyframe_context_menu_el, " display-none");
    }
  }
}

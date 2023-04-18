global.opened_interfaces = {};
global.opened_popups = {};

//Declare UI functions
function adjustTime (arg0_entity_id, arg1_timestamp) { //[WIP] - Finish rest of function
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var timestamp = arg1_timestamp;

  //Declare local instance variables
  var change_date_btn_el = document.querySelector(`#context-date-menu-${entity_id} #change-date`);
  var context_menu_date_el = document.getElementById(`context-date-menu-${entity_id}`);
  var context_menu_el = document.getElementById(`entity-ui-context-menu-${entity_id}`);
  var history_entry = getPolityHistory(entity_id, timestamp);
  var prefix = `context-date-menu-${entity_id}`;

  //Populate date fields
  populateDateFields(`${prefix}-year`, `${prefix}-month`, `${prefix}-day`, `${prefix}-hour`, `${prefix}-minute`, `${prefix}-year-type`, parseTimestamp(timestamp));

  //Show date field and append to context menu
  context_menu_el.after(context_menu_date_el);

  (context_menu_date_el.getAttribute("class").includes("display-none")) ?
    context_menu_date_el.setAttribute("class",
      context_menu_date_el.getAttribute("class")
        .replace(" instant-display-none", "")
        .replace(" display-none", "")
    ) :
    context_menu_date_el.setAttribute("class",
    context_menu_date_el.getAttribute("class") + " display-none");

  //Button listeners
  change_date_btn_el.onclick = function () {
    var new_date = getDateFromFields(`${prefix}-year`, `${prefix}-month`, `${prefix}-day`, `${prefix}-hour`, `${prefix}-minute`, `${prefix}-year-type`);

    //Adjust polity history now
    adjustPolityHistory(entity_id, timestamp, new_date);
  };
}

function closeContextDateMenu (arg0_entity_id, arg1_instant) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var instant = arg1_instant;

  //Declare local instance variables
  var context_menu_date_el = document.getElementById(`context-date-menu-${entity_id}`);

  //Set to display-none
  if (!context_menu_date_el.getAttribute("class").includes("instant-display-none"))
    context_menu_date_el.setAttribute("class", context_menu_date_el.getAttribute("class") + ` ${(instant) ? "instant-" : ""}display-none`);
}

function closeActionContextMenu (arg0_entity_id, arg1_instant) { //[WIP] - Update when new menus are attached
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var instant = arg1_instant;

  //Declare local instance variables
  var actions_context_menu_el = document.querySelector(`#entity-ui-actions-menu-${entity_id}`);

  //Set to display-none
  if (!actions_context_menu_el.getAttribute("class").includes("display-none"))
    actions_context_menu_el.setAttribute("class", actions_context_menu_el.getAttribute("class") + ` ${(instant) ? "instant-" : ""}display-none`);

  //Close attached menus
}

function closeContextMenu (arg0_entity_id, arg1_instant) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var instant = arg1_instant;

  //Declare local instance variables
  var context_menu_el = document.getElementById(`entity-ui-context-menu-${entity_id}`);

  //Set to display-none
  if (!context_menu_el.getAttribute("class").includes("display-none"))
    context_menu_el.setAttribute("class", context_menu_el.getAttribute("class") + ` ${(instant) ? "instant-" : ""}display-none`);

  //Close attached menus
  closeContextDateMenu(entity_id);
}

function closeEntityUI (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var popup = opened_interfaces[entity_id];

  //Check to see if entity exists
  if (popup) {
    //Close popup
    popup.close();
    delete opened_interfaces[entity_id];
    delete opened_popups[entity_id];
  }
}

function deleteKeyframe (arg0_entity_id, arg1_timestamp) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var timestamp = arg1_timestamp;

  //Declare local instance variables
  var context_menu_el = document.getElementById(`entity-ui-context-menu-${entity_id}`);
  var popup_el = document.getElementById(`entity-ui-context-menu-${entity_id}`);

  //Delete keyframe; update bio
  deletePolityHistory(entity_id, timestamp);
}

function editKeyframe (arg0_entity_id, arg1_timestamp) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var timestamp = arg1_timestamp;

  //Declare local instance variables
  var context_menu_el = document.getElementById(`entity-ui-context-menu-${entity_id}`);
  var popup_el = document.getElementById(`entity-ui-context-menu-${entity_id}`);

  //Close entity UI, call editEntity()
  closeEntityUI();
  window.date = parseTimestamp(timestamp);
  loadDate();
  editEntity(entity_id);
}

function entityUI (e, arg0_is_being_edited, arg1_pin) {
  //Convert from parameters
  e = (typeof e == "object") ? e : opened_popups[e];
  var is_being_edited = arg0_is_being_edited;
  var pin = arg1_pin;

  //Declare local instance variables
  var data_graph_types = [{ id: "land_area", name: "Land Area" }];
  var data_select_ui = [];
  var entity_id = e.target.options.className;
  var is_pinned = pin;
  var local_popup = opened_interfaces[entity_id];
  var to_pin = !pin;

  //Fetch is_pinned
  if (local_popup)
    is_pinned = !local_popup.options.is_pinned;

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
            <img src = "gfx/interface/apply_path_icon.png" id = "apply-path" class = "medium button" draggable = "false"><span>Apply Path</span>
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <img src = "gfx/interface/clean_keyframes_icon.png" id = "clean-keyframes" class = "medium button" draggable = "false"><span>Clean Keyframes</span>
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
        <img src = "gfx/interface/empty_icon.png" class = "button ${(!is_pinned) ? "pin-icon" : "reverse-pin-icon"}" id = "pin-popup" onclick = "entityUI(${entity_id}, ${is_being_edited}, ${to_pin})" draggable = "false">
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
    <div id = "entity-ui-actions-menu-${entity_id}" class = "actions-context-menu-container instant-display-none">
    </div>

    ${local_actions_ui}

    <!--  Bio Entry Context Menu -->

    <div id = "entity-ui-context-menu-${entity_id}" class = "bio-context-menu-container instant-display-none">
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
      <div id = "context-date-menu-${entity_id}" class = "bio-context-menu-date-container instant-display-none">
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
    if (pin != local_popup.options.is_pinned) reload_popup = true;
  } else {
    //Popup for entity doesn't exist, so create a new one
    reload_popup = true;
  }
  if (pin != undefined) reload_popup = true;

  if (reload_popup) {
    closeEntityUI(entity_id);

    //Bind popup
    var popup_options = {
      id: "entity-ui-popup",
      class: entity_id,

      className: entity_id
    };

    if (!is_pinned) popup_options.is_pinned = pin;

    if (pin) {
      popup_options.autoClose = false;
      popup_options.closeOnClick = false;
      popup_options.is_pinned = true;
    }

    //Set popup
    var popup = L.popup(popup_options).setLatLng(e.latlng)
      .setContent(parseLocalisation(local_ui, {
        scopes: {
          ENTITY_NAME: getEntityName(entity_id)
        }
      }))
      .openOn(map);

    opened_interfaces[entity_id] = popup;
    opened_popups[entity_id] = e;

    //Onclick events - Context menu interactions
    setTimeout(function(){
      var popup_el = document.querySelector(`.leaflet-popup[class~='${entity_id}']`);

      if (popup_el)
        popup_el.onclick = function (e) {
          var context_menu_el = document.querySelector(`#entity-ui-context-menu-${entity_id}`);

          //Check if target is context menu
          try {
            //Bio context menu
            if (e.composedPath()[0].getAttribute("class"))
              if (e.composedPath()[0].getAttribute("class").includes("bio-context-menu-icon"))
                //Set context menu to be visible and teleport to selected element; close previously attached menus
                openContextMenu(entity_id, e.composedPath()[1]);

            //Actions
            if (e.composedPath()[0].getAttribute("id")) {
              if (e.composedPath()[0].id == "hide-polity")
                openActionContextMenu(entity_id, "hide");
              if (e.composedPath()[0].id == "simplify-entity")
                openActionContextMenu(entity_id, "simplify");
            }
          } catch (e) {
            console.log(e);
          }

          //Context menu should be closed if the context menu itself or the button isn't a parent in the path
          try {
            if (
              !arrayHasElementAttribute(e.composedPath(), "id", `entity-ui-context-menu-${entity_id}`) &&
              !arrayHasElementAttribute(e.composedPath(), "id", `context-date-menu-${entity_id}`) &&
              !arrayHasElementAttribute(e.composedPath(), "class", `bio-context-menu-icon`)
            )
              closeContextMenu(entity_id);

            if (
              !arrayHasElementAttribute(e.composedPath(), "id", `entity-ui-actions-menu-${entity_id}`) &&
              !arrayHasElementAttribute(e.composedPath(), "context", "true")
            )
              closeActionContextMenu(entity_id);
          } catch (e) {
            console.log(e);
          }
        };
    }, 250);
  }

  //Return statement
  return popup;
}

function hidePolity (arg0_entity_id, arg1_date, arg2_do_not_reload) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var date = arg1_date;
  var do_not_reload = arg2_do_not_reload;

  //Declare local instance variables
  var entity_obj = getEntity(entity_id);

  if (entity_obj) {
    createHistoryEntry(entity_id, date, {
      extinct: true
    });

    populateEntityBio(entity_id);
    populateTimelineGraph(entity_id);

    if (!do_not_reload)
      loadDate();
  }
}

function minimiseUI (arg0_element, arg1_tab) {
  //Convert from parameters
  var raw_element = arg0_element;
  var tab = arg1_tab;

  //Declare local instance variables
  var element = document.getElementById(arg0_element);
  var entity_id = raw_element.split("-");
    entity_id = entity_id[entity_id.length - 1];

  var actions_container = document.getElementById("entity-ui-actions-container");
  var collapsed_flag =`${entity_id}_${tab}_collapsed`;
  var customisation_container = document.getElementById(`customisation-top-parent-${entity_id}`);
  var description_container = document.getElementById(`entity-ui-customisation-description-container-${entity_id}`);
  var timeline_bio_container = document.getElementById(`entity-ui-timeline-bio-container-${entity_id}`);
  var timeline_graph_container = document.getElementById(`entity-ui-timeline-graph-container-${entity_id}`);

  //Collapse toggle
  if (!element.getAttribute("class").includes("reverse-minimise-icon")) {
    element.setAttribute("class", element.getAttribute("class").replace("minimise-icon", "reverse-minimise-icon"));

    //Check tab to collapse
    if (tab == "actions")
      actions_container.setAttribute("class", actions_container.getAttribute("class") + " hidden");
    if (tab == "customisation") {
      customisation_container.setAttribute("class", customisation_container.getAttribute("class") + " hidden");

      description_container.setAttribute("class", description_container.getAttribute("class") + " hidden");
    }
    if (tab == "timeline") {
      timeline_graph_container.setAttribute("class", timeline_graph_container.getAttribute("class") + " hidden");

      timeline_bio_container.setAttribute("class", timeline_bio_container.getAttribute("class") + " hidden");
    }

    //Set flag as tab collapsed
    window[collapsed_flag] = true;
  } else {
    element.setAttribute("class", element.getAttribute("class").replace("reverse-minimise-icon", "minimise-icon"));

    //Check tab to uncollapse
    if (tab == "actions")
      actions_container.setAttribute("class", actions_container.getAttribute("class").replace(/ hidden/g, ""));
    if (tab == "customisation") {
      customisation_container.setAttribute("class", customisation_container.getAttribute("class").replace(/ hidden/g, ""));

      description_container.setAttribute("class", description_container.getAttribute("class").replace(/ hidden/g, ""));
    }
    if (tab == "timeline") {
      timeline_graph_container.setAttribute("class", timeline_graph_container.getAttribute("class").replace(/ hidden/g, ""));

      timeline_bio_container.setAttribute("class", timeline_bio_container.getAttribute("class").replace(/ hidden/g, ""));
    }

    //Remove tab collapsed flag
    delete window[collapsed_flag];
  }
}

function openActionContextMenu (arg0_entity_id, arg1_mode) { //[WIP] - Finish rest of function
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var mode = arg1_mode;

  //Declare local instance variables
  var actions_context_menu_el = document.querySelector(`#entity-ui-actions-menu-${entity_id}`);
  var entity_obj = getEntity(entity_id);

  //Close previously attached menus

  //Set actions_context_menu_el to be visible
  actions_context_menu_el.setAttribute("class",
    actions_context_menu_el.getAttribute("class")
      .replace(" instant-display-none", "")
      .replace(" display-none", "")
  );

  //Set actions_context_menu_el content according to mode
  if (mode == "hide") {
    actions_context_menu_el.innerHTML = `
      <div class = "context-menu-subcontainer">
        <b>Hide/Unhide Polity:</b>
      </div>
      <div class = "context-menu-subcontainer">
        <center>
          <select id = "hidden-date-menu-${entity_id}-day" class = "day-input"></select>
          <select id = "hidden-date-menu-${entity_id}-month" class = "month-input"></select>
          <input id = "hidden-date-menu-${entity_id}-year" class = "year-input" type = "number">
        </center>
        <center>
          <input id = "hidden-date-menu-${entity_id}-hour" class = "hour-input" type = "number" min = "0" max = "23"> :
          <input id = "hidden-date-menu-${entity_id}-minute" class = "minute-input" type = "number" min = "0" max = "59">

          <select id = "hidden-date-menu-${entity_id}-year-type"></select>
        </center>
      </div>

      <div id = "hidden-mark-polity-as-hidden-${entity_id}" class = "context-menu-button">
        Mark Polity As Hidden
      </div>
      <div id = "hidden-mark-polity-as-visible-${entity_id}" class = "context-menu-button">
        Mark Polity As Visible
      </div>
    `;

    var prefix = `hidden-date-menu-${entity_id}`;

    //Populate only if not already defined in entity_obj.options
    (!entity_obj.options.ui_hide_polity_date) ?
      populateDateFields(`${prefix}-year`, `${prefix}-month`, `${prefix}-day`, `${prefix}-hour`, `${prefix}-minute`, `${prefix}-year-type`, window.date) :
      populateDateFields(`${prefix}-year`, `${prefix}-month`, `${prefix}-day`, `${prefix}-hour`, `${prefix}-minute`, `${prefix}-year-type`, parseTimestamp(entity_obj.options.ui_hide_polity_date));

    //Declare local instance variables
    var hide_polity_date_fields = [`${prefix}-year`, `${prefix}-month`, `${prefix}-day`, `${prefix}-hour`, `${prefix}-minute`, `${prefix}-year-type`];
    var mark_polity_as_hidden_el = document.getElementById(`hidden-mark-polity-as-hidden-${entity_id}`);
    var mark_polity_as_visible_el = document.getElementById(`hidden-mark-polity-as-visible-${entity_id}`);

    //Set listener events
    mark_polity_as_hidden_el.onclick = function (e) {
      var entered_date = getDateFromFields(`${prefix}-year`, `${prefix}-month`, `${prefix}-day`, `${prefix}-hour`, `${prefix}-minute`, `${prefix}-year-type`);

      hidePolity(entity_id, entered_date);
    };
    mark_polity_as_visible_el.onclick = function (e) {
      var entered_date = getDateFromFields(`${prefix}-year`, `${prefix}-month`, `${prefix}-day`, `${prefix}-hour`, `${prefix}-minute`, `${prefix}-year-type`);

      unhidePolity(entity_id, entered_date);
    };

    //Update entity_obj.options.ui_hide_polity_date
    for (var i = 0; i < hide_polity_date_fields.length; i++) {
      var local_el = document.getElementById(hide_polity_date_fields[i]);

      local_el.onchange = function (e) {
        var entered_date = getDateFromFields(`${prefix}-year`, `${prefix}-month`, `${prefix}-day`, `${prefix}-hour`, `${prefix}-minute`, `${prefix}-year-type`);

        entity_obj.options.ui_hide_polity_date = getTimestamp(entered_date);
        console.log(e);
      };
    }
  } else if (mode == "simplify") {
    actions_context_menu_el.innerHTML = `
      <div class = "context-menu-subcontainer">
        <b>Simplify Path:</b>
      </div>
      <div class = "context-menu-subcontainer">
        <input type = "checkbox" id = "simplify-apply-to-all-keyframes-${entity_id}"> <span>Apply to All Keyframes</span>
        <br>
        <input type = "checkbox" id = "simplify-auto-simplify-when-editing-${entity_id}" checked> <span>Auto-Simplify When Editing</span>
      </div>
      <div class = "context-menu-subcontainer">
        <span>Strength: </span> <input type = "range" id = "simplify-tolerance-${entity_id}" min = "0" max = "100" value = "10">
      </div>
      <div class = "context-menu-button confirm" id = "simplify-${entity_id}">
        <img src = "gfx/interface/checkmark_icon.png" class = "icon medium negative" draggable = "false"> <span>Confirm</span>
      </div>
    `;

    //Declare local instance variables
    var auto_simplify_when_editing_el = document.getElementById(`simplify-auto-simplify-when-editing-${entity_id}`);
    var simplify_all_keyframes_el = document.getElementById(`simplify-apply-to-all-keyframes-${entity_id}`);
    var simplify_tolerance_el = document.getElementById(`simplify-tolerance-${entity_id}`);

    //Set default if not already defined
    if (!window.auto_simplify_when_editing) window.auto_simplify_when_editing = true;
    if (!window.simplify_all_keyframes_el) window.simplify_all_keyframes_el = false;
    if (!window.simplify_tolerance) window.simplify_tolerance = 10;

    //Auto-populate based on global settings
    if (window.auto_simplify_when_editing)
      auto_simplify_when_editing_el.checked = true;
    if (window.simplify_all_keyframes_el)
      simplify_all_keyframes_el.checked = true;
    if (window.simplify_tolerance)
      simplify_tolerance_el.value = window.simplify_tolerance;

    //Set listener events
    auto_simplify_when_editing_el.onclick = function (e) {
      //Set global flag
      window.auto_simplify_when_editing = e.target.checked;
    };
    simplify_all_keyframes_el.onclick = function (e) {
      //Set global flag
      window.simplify_all_keyframes_el = e.target.checked;
    };
    document.getElementById(`simplify-${entity_id}`).onclick = function (e) {
      var simplify_value = parseInt(simplify_tolerance_el.value);

      //1 represents 0.001, 100 represents 0.1
      var simplify_tolerance = simplify_value/Math.pow(10, 3);

      (simplify_all_keyframes_el.checked) ?
        simplifyAllEntityKeyframes(entity_id, simplify_tolerance) :
        simplifyEntity(entity_id, simplify_tolerance);
    };

    onRangeChange(simplify_tolerance_el, function (e) {
      var simplify_value = parseInt(e.target.value);

      var simplify_tolerance = simplify_value/Math.pow(10, 3);

      //Set global flag
      window.simplify_tolerance = simplify_tolerance;
    });
  }
}

function openContextMenu (arg0_entity_id, arg1_parent_el) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var parent_el = arg1_parent_el;

  //Declare local instance variables
  var bio_container_el = document.querySelector(`#entity-ui-timeline-bio-container-${entity_id}`);
  var context_menu_el = document.querySelector(`#entity-ui-context-menu-${entity_id}`);
  var context_menu_date_el = document.querySelector(`#context-date-menu-${entity_id}`);
  var header_el = document.getElementById(`entity-ui-header`);
  var offset_top = parent_el.offsetTop - bio_container_el.scrollTop;
  var timeline_graph_el = document.getElementById(`entity-ui-timeline-graph-container-${entity_id}`);
  var timeline_header_el = document.getElementById(`entity-ui-timeline-data-header`);
  var top_bio_header_el = document.querySelector(`.top-bio-header`);

  //Move context_menu_el to parent_el; close previously attached menus
  parent_el.after(context_menu_el);
  closeContextDateMenu(entity_id);

  context_menu_el.setAttribute("class",
    context_menu_el.getAttribute("class")
      .replace(" instant-display-none", "")
      .replace(" display-none", "")
  );

  var top_string = `calc(${header_el.offsetHeight}px + ${timeline_graph_el.offsetHeight}px + ${timeline_header_el.offsetHeight}px + ${top_bio_header_el.offsetHeight}px + ${offset_top}px + 8px)`;

  context_menu_el.style.top = top_string;
  context_menu_date_el.style.top = top_string;

  //Add timestamp attribute for querySelectorAll(`.context-menu-button`)
  var all_context_menu_buttons = document.querySelectorAll(`#entity-ui-context-menu-${entity_id} .context-menu-button`);
  var local_timestamp = parent_el.parentElement.getAttribute("timestamp");

  //Populate context menu buttons
  for (var i = 0; i < all_context_menu_buttons.length; i++) {
    var local_id = all_context_menu_buttons[i].id;

    all_context_menu_buttons[i].setAttribute("timestamp", local_timestamp);

    if (local_id == "context-menu-adjust-time-button")
      all_context_menu_buttons[i].setAttribute("onclick", `adjustTime('${entity_id}', '${local_timestamp}');`);
    if (local_id == "context-menu-delete-keyframe-button")
      all_context_menu_buttons[i].setAttribute("onclick", `deleteKeyframe('${entity_id}', '${local_timestamp}');`);
    if (local_id == "context-menu-edit-keyframe-button")
      all_context_menu_buttons[i].setAttribute("onclick", `editKeyframe('${entity_id}', '${local_timestamp}');`);
  }
}

function populateEntityBio (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var bio_container_el = document.querySelector(`#entity-ui-timeline-bio-container-${entity_id}`);
  var bio_el = document.querySelector(`#entity-ui-timeline-bio-table-${entity_id}`);
  var bio_string = [];
  var context_menu_date_el = document.getElementById(`context-date-menu-${entity_id}`);
  var context_menu_el = document.getElementById(`entity-ui-context-menu-${entity_id}`);
  var entity_obj = getEntity(entity_id);
  var popup_el = document.querySelector(`.leaflet-popup[class~='${entity_id}']`);

  if (entity_obj) {
    var actual_timestamp;
    var all_histories = Object.keys(entity_obj.options.history);

    //Set actual_timestamp
    if (context_menu_el)
      if (context_menu_el.parentElement.getAttribute("timestamp"))
        actual_timestamp = parseInt(context_menu_el.parentElement.getAttribute("timestamp"));

    //Move context_menu_el back to popup_el; then repopulate bio
    popup_el.after(context_menu_el);
    popup_el.after(context_menu_date_el);
    closeContextMenu(entity_id, true); //Close context menu

    //Format bio_string; populate header
    bio_string.push(`<tr class = "no-select top-bio-header">
      <th class = "uppercase">Date</th>
      <th>
        <img class = "bio-add-keyframe-icon plus-icon" draggable = "false" src = "./gfx/interface/plus_icon.png">
      </th>
    </tr>`);
    bio_string.push(`<tr class = "no-select header-padding"><th></th><th></th></tr>`)

    //Iterate over all_history_entries
    for (var i = 0; i < all_histories.length; i++) {
      var last_history_entry = entity_obj.options.history[all_histories[i - 1]];
      var local_date = parseTimestamp(all_histories[i]);
      var local_entity_name = getEntityName(entity_id, local_date);
      var local_history = entity_obj.options.history[all_histories[i]];
      var local_options = local_history.options;
      var timestamp = ` timestamp = ${all_histories[i]}`;

      if (!last_history_entry) {
        var actual_entity_name = getEntityName(entity_id, all_histories[i]);

        //This is the first history entry. Mark it as such
        bio_string.push(`<tr${timestamp}><td>${printDate(local_date)}</td><td>${actual_entity_name} is founded.</td></tr>`);
      } else {
        var last_history_date = parseTimestamp(all_histories[i - 1]);

        //Compare land areas
        var current_land_area = getArea(entity_id, local_date);
        var old_land_area = getArea(entity_id, last_history_date);

        var land_percentage_change = (Math.round((1 - (old_land_area/current_land_area))*100*100)/100/100); //Round to hundreths place
        var land_percentage_change_string = "";

        //Colour/customisation handler
        {
          var customisation_changed = false;
          var entity_name_string = ``;
          var fill_colour_string = ``;
          var fill_opacity_string = ``;
          var stroke_colour_string = ``;
          var stroke_opacity_string = ``;

          if (local_options.entity_name) {
            var previous_entity_name = getPreviousEntityName(entity_id, all_histories[i]);

            if (previous_entity_name)
              if (previous_entity_name != local_options.entity_name)
                entity_name_string = `Name changed from ${previous_entity_name} to ${local_options.entity_name}. `;
          }
          if (local_options.fillColor)
            fill_colour_string = `Fill colour changed to <span class = "bio-box" style = "color: ${local_options.fillColor};">&#8718;</span>. `;
          if (local_options.fillOpacity)
            fill_opacity_string = `Fill opacity changed to ${printPercentage(local_options.fillOpacity)}. `;
          if (local_options.color)
            stroke_colour_string = `Stroke colour changed to <span class = "bio-box" style = "color: ${local_options.color};">&#8718;</span>. `;
          if (local_options.opacity)
            stroke_opacity_string = `Stroke opacity changed to ${printPercentage(local_options.opacity)}. `;

          if ((
            entity_name_string + fill_colour_string + fill_opacity_string + stroke_colour_string + stroke_opacity_string
          ).length > 0)
            customisation_changed = true;

          //Check if customisation_changed
          if (customisation_changed)
            bio_string.push(`<tr${timestamp}><td>${printDate(local_date)}</td><td><span>${entity_name_string}${fill_colour_string}${fill_opacity_string}${stroke_colour_string}${stroke_opacity_string}</span></td></tr>`); //[WIP] - Actually style
        }

        //Extinct/Hide polity handler
        {
          if (local_history.options.extinct)
            bio_string.push(`<tr${timestamp}><td>${printDate(local_date)}</td><td>${local_entity_name} is abolished.</td></tr>`);
          if (local_history.options.extinct == false)
            bio_string.push(`<tr${timestamp}><td>${printDate(local_date)}</td><td>${local_entity_name} is re-established.</td></tr>`);
        }

        //Land area handler
        {
          if (land_percentage_change < 0)
            land_percentage_change_string = `lost ${printPercentage(Math.abs(land_percentage_change), { display_float: true })} of her land.`;
          if (land_percentage_change > 0)
            land_percentage_change_string = `gained ${printPercentage(Math.abs(land_percentage_change), { display_float: true })} more land.`;

          if (land_percentage_change != 0)
            bio_string.push(`<tr${timestamp}><td>${printDate(local_date)}</td><td><span>${local_entity_name} ${land_percentage_change_string}</span></td></tr>`);
        }
      }
    }

    //Set bio_el to bio_string
    bio_el.innerHTML = bio_string.join("");

    //Append context menu button
    var all_table_entries = document.querySelectorAll(`#entity-ui-timeline-bio-table-${entity_id}.timeline-bio-table tr:not(.no-select) > td:last-child`);

    for (var i = 0; i < all_table_entries.length; i++) {
      var local_timestamp = all_table_entries[i].parentElement.getAttribute("timestamp");

      all_table_entries[i].innerHTML += `
        <img class = "bio-context-menu-icon" draggable = "false" timestamp = "${local_timestamp}" src = "./gfx/interface/context_menu_icon.png">
        <img class = "bio-jump-to-icon" draggable = "false" timestamp = "${local_timestamp}" src = "./gfx/interface/jump_to_icon.png">
      `;
    }

    //Move context_menu_el back to relevant element if available
    var new_history_entry_el = document.querySelector(`#entity-ui-timeline-bio-table-${entity_id} tr[timestamp="${actual_timestamp}"]`);

    if (new_history_entry_el) {
      new_history_entry_el.after(context_menu_el);
      new_history_entry_el.after(context_menu_date_el);
    }

    //Add jump to functionality
    var all_jump_to_btns = document.querySelectorAll(`img.bio-jump-to-icon`);

    for (var i = 0; i < all_jump_to_btns.length; i++)
      all_jump_to_btns[i].onclick = function (e) {
        var local_timestamp = parseInt(this.getAttribute("timestamp"));

        date = parseTimestamp(local_timestamp);
        loadDate();
      };
  } else {
    //Hide the Bio UI if entity_obj is not defined yet
    if (!bio_container_el.getAttribute("class").includes("display-none"))
      bio_container_el.setAttribute("class", bio_container_el.getAttribute("class") + " display-none");
  }
}

function populateEntityColourWheel (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var b_el = document.querySelector(`[id="${entity_id}-b"]`);
  var brightness_el = document.querySelector(`#colour-picker-brightness-range-${entity_id}`);
  var colour_brightness_el = document.querySelector(`#colour-picker-brightness-${entity_id}`);
  var colour_cursor_el = document.querySelector(`#colour-picker-cursor-${entity_id}`);
  var colour_picker_el = document.querySelector(`#entity-ui-customisation-colour-picker-container-${entity_id}`);
  var colour_wheel_el = document.querySelector(`#colour-picker-${entity_id}`);
  var g_el = document.querySelector(`[id="${entity_id}-g"]`);
  var opacity_el = document.querySelector(`#colour-picker-opacity-range-${entity_id}`);
  var r_el = document.querySelector(`[id="${entity_id}-r"]`);

  colour_wheel_el.onclick = function (e) {
    var bounding_rect = e.target.getBoundingClientRect();
    var coord_x = e.clientX - bounding_rect.left;
    var coord_y = e.clientY - bounding_rect.top;

    colour_cursor_el.style.left = `calc(${coord_x}px - 6px)`;
    colour_cursor_el.style.top = `calc(${coord_y}px - 6px)`;

    //Get r,g,b value of pixel
    html2canvas(colour_picker_el).then((canvas) => {
      var ctx = canvas.getContext("2d");

      var canvas_height = ctx.canvas.height;
      var canvas_width = ctx.canvas.width;

      var pixel = ctx.getImageData(coord_x, coord_y, 1, 1).data;

      colour_cursor_el.style.background = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      r_el.value = pixel[0];
      g_el.value = pixel[1];
      b_el.value = pixel[2];

      setEntityColour(entity_id);
    });
  };

  //Range change listeners
  onRangeChange(brightness_el, function (e) {
    var brightness_value = parseInt(brightness_el.value);

    //Set brightness opacity
    colour_brightness_el.style.opacity = `${1 - brightness_value*0.01}`;
    updateBrightnessOpacityHeaders(entity_id);
  });
  onRangeChange(opacity_el, function (e) {
    setEntityColour(entity_id);
    updateBrightnessOpacityHeaders(entity_id);
  });

  //RGB listeners
  r_el.onchange = function () {
    console.log("changed!");
    this.value = Math.max(Math.min(this.value, 255), 0);
    setEntityColourWheelCursor(entity_id, [r_el.value, g_el.value, b_el.value]);
  };
  g_el.onchange = function () {
    this.value = Math.max(Math.min(this.value, 255), 0);
    setEntityColourWheelCursor(entity_id, [r_el.value, g_el.value, b_el.value]);
  };
  b_el.onchange = function () {
    this.value = Math.max(Math.min(this.value, 255), 0);
    setEntityColourWheelCursor(entity_id, [r_el.value, g_el.value, b_el.value]);
  };
}

function populateEntityOptions (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var fill_el = document.getElementById(`${entity_id}-fill`);
  var other_el = document.getElementById(`${entity_id}-other`);
  var stroke_el = document.getElementById(`${entity_id}-stroke`);

  window[`${entity_id}_page`] = "fill"; //Set default page

  fill_el.onclick = function () {
    removeActiveFromEntityOptions(entity_id);
    fill_el.setAttribute("class", fill_el.getAttribute("class") + " active");
    switchEntityTab(entity_id, "fill");
  };
  stroke_el.onclick = function () {
    removeActiveFromEntityOptions(entity_id);
    stroke_el.setAttribute("class", stroke_el.getAttribute("class") + " active");
    switchEntityTab(entity_id, "stroke");
  };
  other_el.onclick = function () {
    removeActiveFromEntityOptions(entity_id);
    other_el.setAttribute("class", other_el.getAttribute("class") + " active");
    switchEntityTab(entity_id, "other");
  };
}

function populateEntityTooltips (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var entity_class = `[class~='${entity_id}']`;

  //Initialise tooltips - Header
  tippy(`${entity_class} #close-popup`, {
    content: "Close",
    arrow: false
  });
  tippy(`${entity_class} #delete-entity`, {
    content: "Delete Entity",
    arrow: false
  });
  tippy(`${entity_class} .pin-icon`, {
    content: "Pin Entity",
    arrow: false
  });
  tippy(`${entity_class} .reverse-pin-icon`, {
    content: "Unpin Entity",
    arrow: false
  });

  //Initialise tooltips - Bio
  tippy(`${entity_class} .bio-context-menu-icon`, {
    content: "Entry Options",
    arrow: false
  });
  tippy(`${entity_class} .bio-jump-to-icon`, {
    content: "Jump to Date",
    arrow: false
  });
}

//Kept for initialising entity UIs
function populateEntityUI (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variable
  var page = window[`${entity_id}_page`];
  var tabs = ["actions", "customisation", "timeline"];

  //Begin populating entity UI
  populateEntityBio(entity_id);
  populateEntityColourWheel(entity_id);
  populateEntityOptions(entity_id);
  populateTimelineGraph(entity_id);

  //Initialise tooltips
  setTimeout(function(){
    populateEntityTooltips(entity_id);
  }, 100);

  //Initialise page and colour
  if (entity_id)
    switchEntityTab(entity_id, (page) ? page : "fill");

  //Keep collapsed tabs
  for (var i = 0; i < tabs.length; i++)
    if (window[`${entity_id}_${tabs[i]}_collapsed`])
      minimiseUI(`${tabs[i]}-minimise-btn-${entity_id}`, tabs[i]);
}

function removeActiveFromEntityOptions (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var fill_el = document.getElementById(`${entity_id}-fill`);
  var other_el = document.getElementById(`${entity_id}-other`);
  var stroke_el = document.getElementById(`${entity_id}-stroke`);

  fill_el.setAttribute("class", fill_el.getAttribute("class").replace(" active", ""));
  other_el.setAttribute("class", fill_el.getAttribute("class").replace(" active", ""));
  stroke_el.setAttribute("class", fill_el.getAttribute("class").replace(" active", ""));
}

function setEntityColour (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var b_el = document.getElementById(`${entity_id}-b`);
  var g_el = document.getElementById(`${entity_id}-g`);
  var entity_obj = getEntity(entity_id);
  var opacity_el = document.querySelector(`#colour-picker-opacity-range-${entity_id}`);
  var r_el = document.getElementById(`${entity_id}-r`);

  var b = parseInt(b_el.value);
  var g = parseInt(g_el.value);
  var r = parseInt(r_el.value);

  var current_colour = RGBToHex(r, g, b);
  var current_history_entry = getPolityHistory(entity_id, date);
  var current_tab = window[`${entity_id}_page`];

  //Set entity fill colour
  if (current_tab == "fill") {
    createHistoryEntry(entity_id, date, {
      fillColor: current_colour,
      fillOpacity: opacity_el.value/100
    });
    entity_obj.setStyle({
      fillColor: current_colour,
      fillOpacity: opacity_el.value/100
    });
  }

  if (current_tab == "stroke") {
    createHistoryEntry(entity_id, date, {
      color: current_colour,
      opacity: opacity_el.value/100
    });
    entity_obj.setStyle({
      color: current_colour,
      opacity: opacity_el.value/100
    });
  }

  //Repopulate entity bio
  populateEntityBio(entity_id);
}

function setEntityColourWheelCursor (arg0_entity_id, arg1_colour, arg2_do_not_change) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var colour = arg1_colour;
  var do_not_change = arg2_do_not_change;

  //Declare local instance variables
  var brightness_el = document.querySelector(`#colour-picker-brightness-range-${entity_id}`);
  var colour_brightness_el = document.querySelector(`#colour-picker-brightness-${entity_id}`);
  var colour_cursor_el = document.querySelector(`#colour-picker-cursor-${entity_id}`);
  var colour_picker_el = document.querySelector(`#entity-ui-customisation-colour-picker-container-${entity_id}`);
  var max_brightness = 255;
  var options_el = document.querySelector(`#entity-ui-customisation-options-container-${entity_id}`);

  //Get closest r,g,b value in colour wheel and teleport cursor there
  colour_cursor_el.style.visibility = "hidden";

  //Adjust brightness_el to new maximum brightness
  max_brightness = Math.max(Math.max(colour[0], colour[1]), colour[2])/255;

  colour_brightness_el.style.opacity = `${1 - max_brightness}`;
  brightness_el.value = max_brightness*100;

  //Move colour_cursor_el
  html2canvas(colour_picker_el).then((canvas) => {
    var ctx = canvas.getContext("2d");

    var canvas_height = ctx.canvas.height;
    var canvas_width = ctx.canvas.width;

    var circle_radius = canvas_width/2;
    var image_data = ctx.getImageData(0, 0, canvas_width, canvas_height).data;

    //Iterate over all image_data; each pixel has 4 elements
    var closest_pixel = [10000000, 0, 0]; //[colour_distance, x, y];

    for (var i = 0; i < image_data.length; i+= 4) {
      var local_colour = [image_data[i], image_data[i + 1], image_data[i + 2]];

      if (local_colour.join(", ") != "255, 255, 255") {
        var distance_from_colour = deltaE(colour, local_colour);

        if (distance_from_colour < closest_pixel[0]) {
          //Calculate local_x, local_y
          var local_x = (i/4) % canvas_width;
          var local_y = Math.floor((i/4)/canvas_width);

          closest_pixel = [distance_from_colour, local_x, local_y, i];
        }
      }
    }

    colour_cursor_el.style.background = `rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`;

    //Check if closest_pixel[1], closest_pixel[2] are inside circle
    if (
      pointIsInCircle(0, 0, closest_pixel[1], closest_pixel[2], circle_radius)
    ) {
      colour_cursor_el.style.left = `calc(${closest_pixel[1]}px - 6px)`;
      colour_cursor_el.style.top = `calc(${closest_pixel[2]}px - 6px)`;
    } else {
      //If not, use closest point to edge of circle instead
      var bounding_rect = colour_picker_el.getBoundingClientRect();
      var cursor_coords = closestPointInCircle(0, 0, closest_pixel[1], closest_pixel[2], circle_radius);

      var actual_x = (cursor_coords[0])*(bounding_rect.width/canvas_width);
      var actual_y = (cursor_coords[1])*(bounding_rect.height/canvas_height);

      colour_cursor_el.style.left = `calc(${actual_x}px - 6px)`;
      colour_cursor_el.style.top = `calc(${actual_y}px - 6px)`;
    }

    colour_cursor_el.style.visibility = "visible";
  });

  //Set entity colour
  updateBrightnessOpacityHeaders(entity_id);

  if (!do_not_change)
    setEntityColour(entity_id);
}

function switchEntityTab (arg0_entity_id, arg1_tab) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var tab = arg1_tab;

  //Declare local instance variables
  var left_offset = 0.125; //In vw
  var tab_width = 3.25; //In vw
  var underline_el = document.querySelector(`.options-tab[class~='${entity_id}'] > hr`);

  var entity_obj = getEntity(entity_id);

  window[`${entity_id}_page`] = tab; //Set new page

  if (tab) {
    if (tab == "fill") {
      var fill_colour = hexToRGB(entity_obj.options.fillColor);
      updateEntityColour(entity_id, fill_colour, entity_obj.options.fillOpacity);

      underline_el.style.left = `${left_offset}vw`;
    }
    if (tab == "stroke") {
      var stroke_colour = hexToRGB(entity_obj.options.color);
      updateEntityColour(entity_id, stroke_colour, entity_obj.options.opacity);

      underline_el.style.left = `${left_offset*2 + tab_width*1}vw`;
    }
    if (tab == "other")
      underline_el.style.left = `${left_offset*3.5 + tab_width*2}vw`;
  }
}

function unhidePolity (arg0_entity_id, arg1_date, arg2_do_not_reload) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var date = arg1_date;
  var do_not_reload = arg2_do_not_reload;

  //Declare local instance variables
  var entity_obj = getEntity(entity_id);

  if (entity_obj) {
    createHistoryEntry(entity_id, date, {
      extinct: false
    });

    populateEntityBio(entity_id);
    populateTimelineGraph(entity_id);

    if (!do_not_reload)
      loadDate();
  }
}

function updateEntityColour (arg0_entity_id, arg1_colour, arg2_opacity) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var colour = arg1_colour;
  var opacity = arg2_opacity;

  //Declare local instance variables
  var b_el = document.getElementById(`${entity_id}-b`);
  var opacity_el = document.querySelector(`#colour-picker-opacity-range-${entity_id}`);
  var g_el = document.getElementById(`${entity_id}-g`);
  var r_el = document.getElementById(`${entity_id}-r`);

  //Update values
  if (colour) {
    if (colour[0]) r_el.value = colour[0];
    if (colour[1]) g_el.value = colour[1];
    if (colour[2]) b_el.value = colour[2];
    if (opacity)
      opacity_el.value = opacity*100;

    setEntityColourWheelCursor(entity_id, colour, true);
  } else {
    r_el.value = 255;
    g_el.value = 255;
    b_el.value = 255;

    setEntityColourWheelCursor(entity_id, [255, 255, 255], true);
  }
}

function updateBrightnessOpacityHeaders (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var brightness_el = document.getElementById(`colour-picker-brightness-range-${entity_id}`);
  var brightness_header_el = document.getElementById(`${entity_id}-brightness-header`);
  var opacity_el = document.getElementById(`colour-picker-opacity-range-${entity_id}`);
  var opacity_header_el = document.getElementById(`${entity_id}-opacity-header`);

  var brightness_value = parseInt(brightness_el.value);
  var opacity_value = parseInt(opacity_el.value);

  //Update values
  if (brightness_header_el)
    brightness_header_el.innerHTML = `Brightness | ${brightness_value/100}`;
  if (opacity_header_el)
    opacity_header_el.innerHTML = `Opacity | ${opacity_value/100}`;
}

//Field reaction
document.body.addEventListener("keyup", (e) => {
  var local_class = e.target.getAttribute("class");
  var local_id = e.target.id;
  var local_polity = getEntity(local_class);
  var input = e.target.value;

  if (local_id == "polity-name") {
    try {
      local_polity.options.entity_name = input;

      if (getPreviousEntityName(entity_id, date) != local_polity.options.entity_name) {
        createHistoryEntry(local_class, date, { entity_name: input });
      } else {
        var local_history = getPolityHistory(local_class, date);

        delete local_history.class_name;
      }

      //Repopulate bio
      populateEntityBio(local_class);
    } catch {}

    //current_union handler
    if (window.current_union)
      current_union.options.entity_name = input;
  }
});

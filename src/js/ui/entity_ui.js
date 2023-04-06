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
    context_menu_date_el.setAttribute("class", context_menu_date_el.getAttribute("class") + " display-none");

  //Button listeners
  change_date_btn_el.onclick = function () {
    var new_date = getDateFromFields(`${prefix}-year`, `${prefix}-month`, `${prefix}-day`, `${prefix}-hour`, `${prefix}-minute`, `${prefix}-year-type`);

    //Adjust polity history now
    adjustPolityHistory(entity_id, timestamp, new_date);
  };
}

function closeContextDateMenu (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var context_menu_date_el = document.getElementById(`context-date-menu-${entity_id}`);

  //Set to display-none
  if (!context_menu_date_el.getAttribute("class").includes("instant-display-none"))
    context_menu_date_el.setAttribute("class", context_menu_date_el.getAttribute("class") + " display-none");
}

function closeContextMenu (arg0_entity_id) {
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var context_menu_el = document.getElementById(`entity-ui-context-menu-${entity_id}`);

  //Set to display-none
  if (!context_menu_el.getAttribute("class").includes("instant-display-none"))
    context_menu_el.setAttribute("class", context_menu_el.getAttribute("class") + " display-none");

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

    <div id = "customisation-top-parent">
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
              <span class = "small-header">Brightness</span>
              <input type = "range" min = "0" max = "100" value = "100" id = "colour-picker-brightness-range-${entity_id}" class = "colour-picker-brightness-range">
            </span>

            <span class = "opacity-range-container">
              <span class = "small-header">Opacity</span>
              <input type = "range" min = "0" max = "100" value = "100" id = "colour-picker-opacity-range-${entity_id}" class = "colour-picker-opacity-range">
            </span>
          </span>
        </div>
      </div>

      <div id = "entity-ui-customisation-options-container-${entity_id}" class = "entity-ui-container options-container">
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
    var popup_el = document.querySelector(`.leaflet-popup[class~='${entity_id}']`);

    popup_el.onclick = function (e) {
      var context_menu_el = document.querySelector(`#entity-ui-context-menu-${entity_id}`);

      //Check if target is context menu
      try {
        if (e.path[0].getAttribute("class").includes("bio-context-menu-icon")) {
          //Set context menu to be visible and teleport to selected element; close previously attached menus
          e.path[1].after(context_menu_el);
          closeContextDateMenu(entity_id);

          context_menu_el.setAttribute("class",
            context_menu_el.getAttribute("class")
              .replace(" instant-display-none", "")
              .replace(" display-none", "")
          );

          //Add timestamp attribute for querySelectorAll(`.context-menu-button`)
          var all_context_menu_buttons = document.querySelectorAll(`#entity-ui-context-menu-${entity_id} .context-menu-button`);
          var local_timestamp = e.path[0].getAttribute("timestamp");

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
      } catch {}

      //Context menu should be closed if the context menu itself or the button isn't a parent in the path
      try {
        if (
          !arrayHasElementAttribute(e.path, "id", `entity-ui-context-menu-${entity_id}`) &&
          !arrayHasElementAttribute(e.path, "id", `context-date-menu-${entity_id}`) &&
          !arrayHasElementAttribute(e.path, "class", `bio-context-menu-icon`)
        )
          closeContextMenu(entity_id);
      } catch (e) {
        console.log(e);
      }
    };
  }

  //Return statement
  return popup;
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
  var timeline_bio_container = document.getElementById(`entity-ui-timeline-bio-container-${entity_id}`);
  var timeline_graph_container = document.getElementById(`entity-ui-timeline-graph-container-${entity_id}`);

  //Collapse toggle
  if (!element.getAttribute("class").includes("reverse-minimise-icon")) {
    element.setAttribute("class", element.getAttribute("class").replace("minimise-icon", "reverse-minimise-icon"));

    //Check tab to collapse
    if (tab == "actions")
      actions_container.setAttribute("class", actions_container.getAttribute("class") + " hidden");
    if (tab == "timeline") {
      timeline_graph_container.setAttribute("class", timeline_graph_container.getAttribute("class") + " hidden");

      timeline_bio_container.setAttribute("class", timeline_bio_container.getAttribute("class") + " hidden");
    }
  } else {
    element.setAttribute("class", element.getAttribute("class").replace("reverse-minimise-icon", "minimise-icon"));

    //Check tab to uncollapse
    if (tab == "actions")
      actions_container.setAttribute("class", actions_container.getAttribute("class").replace(" hidden", ""));
    if (tab == "timeline") {
      timeline_graph_container.setAttribute("class", timeline_graph_container.getAttribute("class").replace(" hidden", ""));

      timeline_bio_container.setAttribute("class", timeline_bio_container.getAttribute("class").replace(" hidden", ""));
    }
  }
}

function populateEntityBio (arg0_entity_id) { //[WIP] - Add jump to icon functionality
  //Convert from parameters
  var entity_id = arg0_entity_id;

  //Declare local instance variables
  var bio_container_el = document.querySelector(`#entity-ui-timeline-bio-container-${entity_id}`);
  var bio_el = document.querySelector(`#entity-ui-timeline-bio-table-${entity_id}`);
  var bio_string = [];
  var entity_obj = getEntity(entity_id);

  if (entity_obj) {
    var all_histories = Object.keys(entity_obj.options.history);

    //Format bio_string; populate header
    bio_string.push(`<tr class = "no-select">
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
      var local_history = entity_obj.options.history[all_histories[i]];
      var timestamp = ` timestamp = ${all_histories[i]}`;

      if (!last_history_entry) {
        //This is the first history entry. Mark it as such
        bio_string.push(`<tr${timestamp}><td>${printDate(local_date)}</td><td>${entity_obj.options.entity_name} is founded.</td></tr>`);
      } else {
        var last_history_date = parseTimestamp(all_histories[i - 1]);

        //Compare land areas
        var current_land_area = getArea(entity_id, local_date);
        var old_land_area = getArea(entity_id, last_history_date);

        var land_percentage_change = (Math.round((1 - (old_land_area/current_land_area))*100*100)/100/100); //Round to hundreths place
        var land_percentage_change_string = "";

        //Land area handler
        if (land_percentage_change < 0)
          land_percentage_change_string = `lost ${printPercentage(Math.abs(land_percentage_change), { display_float: true })} of her land.`;
        if (land_percentage_change > 0)
          land_percentage_change_string = `gained ${printPercentage(Math.abs(land_percentage_change), { display_float: true })} more land.`;

        if (land_percentage_change != 0)
          bio_string.push(`<tr${timestamp}><td>${printDate(local_date)}</td><td>${entity_obj.options.entity_name} ${land_percentage_change_string}</td></tr>`);
      }
    }

    //Set bio_el to bio_string
    bio_el.innerHTML = bio_string.join("");

    //Append context menu button
    var all_table_entries = document.querySelectorAll(`#entity-ui-timeline-bio-table-${entity_id}.timeline-bio-table tr:not(.no-select) > td:last-child`);

    for (var i = 0; i < all_table_entries.length; i++)
      all_table_entries[i].innerHTML += `
        <img class = "bio-context-menu-icon" draggable = "false" timestamp = "${all_histories[i]}" src = "./gfx/interface/context_menu_icon.png">
        <img class = "bio-jump-to-icon" draggable = "false" timestamp = "${all_histories[i]}" src = "./gfx/interface/jump_to_icon.png">
      `;
  } else {
    //Hide the Bio UI if entity_obj is not defined yet
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
    });
  };

  //Range change listeners
  onRangeChange(brightness_el, function (e) {
    var brightness_value = parseInt(brightness_el.value);

    //Set brightness opacity
    colour_brightness_el.style.opacity = `${1 - brightness_value*0.01}`;
  });

  //RGB listeners
  r_el.onchange = function () {
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

function setEntityColourWheelCursor (arg0_entity_id, arg1_colour) {
  //Convert from parameters
  var entity_id = arg0_entity_id;
  var colour = arg1_colour;

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
    } catch {}

    //current_union handler
    if (window.current_union)
      current_union.options.entity_name = input;
  }
});

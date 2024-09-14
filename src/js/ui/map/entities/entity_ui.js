//Declare Entity UI functions
{
  function closeEntityContextMenu (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_el = interfaces[entity_id];

    //Close entity_el
    if (entity_el) {
      entity_el._container.remove();
      delete interfaces[entity_id];
    }
  }

  /*
    getEntityElement() - Fetches the current entity UI element.
    arg0_entity_id: (String) - The entity ID for whose element to return.
    arg1_options: (Object)
      return_selector: (Boolean) - Optional. Whether to return the selector instead of the element. False by default.

    Returns: (HTMLElement/String)
  */
  function getEntityElement (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_selector = `${common_selectors.entity_ui}[class~="${entity_id}"]`;

    //Return statement
    return (!options.return_selector) ? document.querySelector(entity_selector) : entity_selector;
  }

  function populateEntityColourWheel (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);

    var b_el = entity_el.querySelector(common_selectors.entity_b);
    var brightness_el = entity_el.querySelector(common_selectors.brightness_range);
    var colour_brightness_el = entity_el.querySelector(common_selectors.colour_brightness);
    var colour_cursor_el = entity_el.querySelector(common_selectors.colour_cursor);
    var colour_picker_el = entity_el.querySelector(common_selectors.colour_picker);
    var colour_wheel_el = entity_el.querySelector(common_selectors.colour_wheel);
    var g_el = entity_el.querySelector(common_selectors.entity_g);
    var opacity_el = entity_el.querySelector(common_selectors.opacity_range);
    var r_el = entity_el.querySelector(common_selectors.entity_r);

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
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);

    var fill_el = entity_el.querySelector(common_selectors.fill_tab);
    var other_el = entity_el.querySelector(common_selectors.other_tab);
    var stroke_el = entity_el.querySelector(common_selectors.stroke_tab);

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

  function populateEntityUI (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variable
    var page = window[`${entity_id}_page`];
    var tabs = ["actions", "customisation", "timeline"];

    //Begin populating entity UI
    printEntityBio(entity_id);
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

  function printEntityBio (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);

    var bio_container_el = entity_el.querySelector(common_selectors.entity_bio_table);
    var bio_el = entity_el.querySelector(common_selectors.entity_bio_table);
    var bio_string = [];
    var context_menu_el = entity_el.querySelector(common_selectors.entity_keyframe_context_menu_anchor);
    var entity_obj = getEntity(entity_id);

    if (entity_obj) {
      var actual_timestamp;
      var all_histories = Object.keys(entity_obj.options.history);

      //Set actual_timestamp
      if (context_menu_el)
        if (context_menu_el.parentElement.getAttribute("timestamp"))
          actual_timestamp = convertTimestampToInt(context_menu_el.parentElement.getAttribute("timestamp"));
      closeEntityKeyframeContextMenus(entity_id); //Close previously open context menus

      //Format bio_string; populate header
      bio_string.push(`<tr class = "no-select top-bio-header">
        <th class = "uppercase">Date</th>
        <th>
          <img class = "bio-add-keyframe-icon plus-icon" draggable = "false" src = "./gfx/interface/plus_icon.png">
        </th>
      </tr>`);
      bio_string.push(`<tr class = "no-select header-padding"><th></th><th></th></tr>`);

      //Iterate over all_history_entries
      for (var i = 0; i < all_histories.length; i++) {
        var old_history_frame = getHistoryFrame(entity_obj, all_histories[i - 1]);
        var new_history_frame = getHistoryFrame(entity_obj, all_histories[i]);

        bio_string.push(getHistoryFrameLocalisation(entity_obj, old_history_frame, new_history_frame));
      }

      //Set bio_el to bio_string
      bio_el.innerHTML = bio_string.join("");

      //Append context menu button
      var all_table_entries = entity_el.querySelectorAll(`${common_selectors.entity_bio_table} tr:not(.no-select) > td:last-child`);

      for (var i = 0; i < all_table_entries.length; i++) {
        var local_timestamp = convertTimestampToInt(all_table_entries[i].parentElement.getAttribute("timestamp"));

        all_table_entries[i].innerHTML += `
          <img class = "bio-context-menu-icon" draggable = "false" timestamp = "${local_timestamp}" src = "./gfx/interface/context_menu_icon.png">
          <img class = "bio-jump-to-icon" draggable = "false" timestamp = "${local_timestamp}" src = "./gfx/interface/jump_to_icon.png"">
        `;
      }

      //Move context_menu_el back to relevant element if available
      var new_history_entry_el = entity_el.querySelector(`${common_selectors.entity_bio_table} tr[timestamp="${actual_timestamp}"]`);

      //Add keyframe context menul; jump to functionality
      var all_context_menu_btns = entity_el.querySelectorAll(`img.bio-context-menu-icon`);
      var all_jump_to_btns = entity_el.querySelectorAll(`img.bio-jump-to-icon`);

      for (var i = 0; i < all_context_menu_btns.length; i++)
        all_context_menu_btns[i].onclick = function (e) {
          printEntityKeyframeNavigationMenu(entity_id, this.parentElement);
        }
      for (var i = 0; i < all_jump_to_btns.length; i++)
        all_jump_to_btns[i].onclick = function (e) {
          var local_timestamp = parseInt(this.getAttribute("timestamp"));

          main.date = convertTimestampToDate(local_timestamp);
          loadDate();
        };
    } else {
      //Hide the Bio UI if entity_obj is not defined yet
      if (!bio_container_el.getAttribute("class").includes("display-none"))
        bio_container_el.setAttribute("class", bio_container_el.getAttribute("class") + " display-none");
    }
  }

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
    var common_selectors = config.defines.common.selectors;

    var brush_obj = main.brush;
    var coords_string;
    var common_selectors = config.defines.common.selectors;
    var entity_interface = interfaces[entity_id];
    var entity_obj = getEntity(entity_id);
    var is_being_edited = (options.is_being_edited);
    var is_pinned = (options.pin);
    var reload_popup = false;
    var to_pin = (!is_pinned);

    //Fetch is_being_edited; pin status, coords_string
    if (brush_obj.editing_entity == entity_id) is_being_edited = true;
    if (options.coords)
      coords_string = (!Array.isArray(options.coords)) ?
        [`${[options.coords.lng, options.coords.lat]}`] :
        [`${options.coords.toString()}`];

    //Check if reload_popup is true; only close existing UI and open a new popup if the popup is not already pinned
    if (entity_interface) {
      if (!entity_interface.options.is_pinned) reload_popup = true;

      //Also reload popup if pin argument is different to is_pinned
      if (is_pinned != entity_interface.options.is_pinned) reload_popup = true;
    } else {
      //Popup for entity doesn't exist, so create a new one
      reload_popup = true;
    }

    //Reload leaflet popup if reload_popup is true
    if (reload_popup) {
      closeEntityContextMenu(entity_id);

      //Bind popup
      var popup_options = {
        id: "entity-ui-popup",
        class: entity_id,
        className: entity_id
      };

      //Create entity options to serve as flags
      if (entity_obj)
      if (!entity_obj.options.selected_keyframes)
        entity_obj.options.selected_keyframes = [];
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

        leaflet_centre_coords = [turf_polygon_centre[1], turf_polygon_centre[0]]; //Convert from Turf LatLng to LngLat
      } else {
        leaflet_centre_coords = options.coords;
      }

      //Open popup
      var popup = L.popup(popup_options).setLatLng(leaflet_centre_coords)
        .setContent(`
          <!-- 1. Entity UI Header -->
          ${printEntityContextMenuHeaderSection(entity_id, options)}

          <!-- 2. Timeline/Data Section -->
          ${printEntityContextMenuHeader(entity_id, { id: "entity-timeline-data-header", name: "Timeline/Data"})}
          ${printEntityContextMenuTimelineDataSection(entity_id)}
          ${printEntityContextMenuBioSection(entity_id)}

          <!-- 3. Customisation -->
          ${printEntityContextMenuHeader(entity_id, { id: "entity-customisation-header", name: "Customisation"})}
          ${printEntityContextMenuCustomisationSection(entity_id)}

          <!-- 4. Actions UI -->
          ${printEntityContextMenuHeader(entity_id, { id: "entity-actions-header", name: "Actions" })}

          <!-- 5. Context Menu Anchors -->
          <div id = "entity-actions-context-menu"></div>
          <div id = "entity-keyframe-context-menu"></div>
        `).openOn(map);
      interfaces[entity_id] = popup;

      //Call createContextMenu() after the popup content is set
      setTimeout(function(){
        var entity_actions_el = getEntityActionsAnchorElement(entity_id)
        var entity_actions_ui = printEntityActionsNavigationMenu(entity_id, entity_actions_el);
      }, 1);
    }
  }

  function printEntityContextMenuBioSection (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Return statement
    return `<div id = "entity-ui-timeline-bio-container" class = "entity-ui-container bio">
      <div id = "entity-ui-timeline-bio-subcontainer" class = "entity-ui-subcontainer">
        <table id = "entity-ui-timeline-bio-table" class = "timeline-bio-table">
          <tr>
            <th>YEAR</th>
            <th></th>
          </tr>
        </table>
      </div>
    </div>`;
  }

  function printEntityContextMenuCustomisationSection (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Return statement
    return `<div id = "customisation-top-parent" class = "entity-ui-container customisation-top-parent">
      <div id = "entity-ui-customisation-colour-ui-container" class = "entity-ui-container colour-container">
        <div id = "entity-ui-customisation-colour-picker-container" class = "colour-picker-container">
          <img id = "colour-picker-hue" class = "colour-picker-hue" src = "gfx/interface/colour_wheel.png">
          <div id = "colour-picker-brightness" class = "colour-picker-brightness"></div>

          <div id = "colour-picker-cursor" class = "colour-picker-cursor"></div>

          <div id = "colour-picker" class = "colour-picker-mask"></div>

          <!-- RGB inputs -->
          <div class = "rgb-inputs">
            R: <input type = "number" id = "r" value = "255"><br>
            G: <input type = "number" id = "g" value = "255"><br>
            B: <input type = "number" id = "b" value = "255"><br>
          </div>

          <span class = "no-select">
            <span class = "brightness-range-container">
              <span id = "brightness-header" class = "small-header">Brightness</span>
              <input type = "range" min = "0" max = "100" value = "100" id = "colour-picker-brightness-range" class = "colour-picker-brightness-range">
            </span>

            <span class = "opacity-range-container">
              <span id = "opacity-header" class = "small-header">Opacity</span>
              <input type = "range" min = "0" max = "100" value = "50" id = "colour-picker-opacity-range" class = "colour-picker-opacity-range">
            </span>
          </span>
        </div>
      </div>

      <div id = "entity-ui-customisation-options-container" class = "entity-ui-container options-container">
        <div class = "options-tab">
          <span id = "fill" class = "options-tab-header active">Fill</span>
          <span id = "stroke" class = "options-tab-header">Stroke</span>
          <span id = "other" class = "options-tab-header">Other</span>
          <hr>
        </div>

        <div id = "other-container" class = "options-body">
          <b>Visibility Settings:</b><br><br>
          Minimum Zoom: <input id = "minimum-zoom-level" class = "short-number-input" type = "number"><br>
          Maximum Zoom: <input id = "maximum-zoom-level" class = "short-number-input" type = "number"><br>
        </div>
      </div>
    </div>

    <div id = "entity-ui-customisation-description-container" class = "entity-ui-container"></div>`;
  }

  /*
    printEntityContextMenuHeader() - Returns an entity context menu header innerHTML string.
    arg0_entity_id: (String) - The entity ID for which to print a header.
    arg1_options: (Object)
      id: (String) - The ID of the header.
      name: (String) - The name of the header.
  */
  function printEntityContextMenuHeader (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.id) options.id = "entity-header";
    if (!options.name) options.name = "";

    //Return statement
    return `<div id = "${options.id}" class = "entity-ui-container small">${options.name}</div>`;
  }

  /*
    printEntityContextMenuHeaderSection() - Returns innerHTML string for the entity context menu header section.
    arg0_entity_id: (String) - The entity ID for which to print 1. Header.
    arg1_options: (Object)
      coords: (Array<Number, Number>) - Optional. The coordinates to use for the popup instead of the default. Centroid of entity by default.
      is_being_edited: (Boolean) - Optional. Whether the entity is currently being edited. False by default.
      pin: (Boolean) - Optional. Whether the entity is currently pinned. False by default.
  */
  function printEntityContextMenuHeaderSection (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var brush_obj = main.brush;
    var entity_el = getEntityElement(entity_id);
    var entity_obj = getEntity(entity_id);
    var entity_name = getEntityName(entity_obj);
    var is_being_edited = (options.is_being_edited);
    var is_pinned = (options.pin);
    var coords_string;

    //Fetch is_being_edited; pin status, coords_string
    if (brush_obj.editing_entity == entity_id) is_being_edited = true;
    if (options.coords)
      coords_string = (!Array.isArray(options.coords)) ?
        [`${[options.coords.lng, options.coords.lat]}`] :
        [`${options.coords.toString()}`];

    //Return statement
    return `<div id = "entity-header" class = "entity-ui-container">
      <input id = "polity-name" class = "${entity_id}" value = "${entity_name}"></input>

      <img src = "gfx/interface/empty_icon.png" class = "button cross-icon" id = "close-popup" onclick = "closeEntityContextMenu('${entity_id}');" draggable = "false">
      <img src = "gfx/interface/empty_icon.png" class = "button delete-icon" id = "delete-entity" onclick = "deleteEntity('${entity_id}');" draggable = "false">
      <img src = "gfx/interface/empty_icon.png" class = "button ${(!is_pinned) ? "pin-icon" : "reverse-pin-icon"}" id = "pin-popup" onclick = "printEntityContextMenu(${entity_id}, { coords: ${coords_string}, is_being_edited: ${options.is_being_edited}, pin: ${!options.pin} });" draggable = "false">

      <div id = "polity-id">ID: ${entity_id}</div>
    </div>`;
  }

  function printEntityContextMenuTimelineDataSection (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var data_graph_types = [{ id: "land_area", name: "Land Area" }];
    var data_select_ui = [];

    //Format data_select_ui
    for (var i = 0; i < data_graph_types.length; i++)
      data_select_ui.push(`<option value = "${data_graph_types[i].id}">${data_graph_types[i].name}</option>`);

    //Return statement
    return `<div id = "entity-ui-timeline-graph-container" class = "entity-ui-container timeline">
      <div id = "entity-ui-timeline-graph-subcontainer" class = "entity-ui-subcontainer">
        <select id = "entity-ui-timeline-graph-type" class = "entity-select">${data_select_ui.join("\n")}</select>
        <canvas id = "entity-ui-timeline-graph" class = "entity-ui-graph"></canvas>

        <span id = "entity-ui-timeline-graph-y-axis" class = "entity-ui-graph-y-axis"></span>
        <span id = "entity-ui-timeline-graph-y-top-axis-label" class = "graph-label">100%</span>
        <span id = "entity-ui-timeline-graph-y-bottom-axis-label" class = "graph-label">0%</span>

        <div id = "entity-ui-timeline-graph-x-axis" class = "entity-ui-graph-x-axis">
          <span id = "entity-ui-timeline-graph-x-left-axis-label" class = "left-align graph-label">START</span>
          <span id = "entity-ui-timeline-graph-x-right-axis-label" class = "right-align graph-label">END</span>
        </div>
      </div>
    </div>`;
  }

  function setEntityColourWheelCursor (arg0_entity_id, arg1_colour, arg2_do_not_change) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var colour = arg1_colour;
    var do_not_change = arg2_do_not_change;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);

    var brightness_el = entity_el.querySelector(common_selectors.brightness_range);
    var colour_brightness_el = entity_el.querySelector(common_selectors.colour_brightness);
    var colour_cursor_el = entity_el.querySelector(common_selectors.colour_cursor);
    var colour_picker_el = entity_el.querySelector(common_selectors.colour_picker);
    var max_brightness = 255;
    var options_el = entity_el.querySelector(common_selectors.colour_options);

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

  function setEntityColour (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);

    var b_el = entity_el.querySelector(common_selectors.entity_b);
    var g_el = entity_el.querySelector(common_selectors.entity_g);
    var entity_obj = getEntity(entity_id);
    var opacity_el = entity_el.querySelector(common_selectors.opacity_range);
    var r_el = entity_el.querySelector(common_selectors.entity_r);

    var b = parseInt(b_el.value);
    var g = parseInt(g_el.value);
    var r = parseInt(r_el.value);

    var current_colour = RGBToHex(r, g, b);
    var current_history_entry = getPolityHistory(entity_id, main.date);
    var current_tab = window[`${entity_id}_page`];

    //Set entity fill colour
    if (current_tab == "fill") {
      createHistoryFrame(entity_id, main.date, {
        fillColor: current_colour,
        fillOpacity: opacity_el.value/100
      });
      entity_obj.setStyle({
        fillColor: current_colour,
        fillOpacity: opacity_el.value/100
      });
    }

    if (current_tab == "stroke") {
      createHistoryFrame(entity_id, main.date, {
        color: current_colour,
        opacity: opacity_el.value/100
      });
      entity_obj.setStyle({
        color: current_colour,
        opacity: opacity_el.value/100
      });
    }

    //Repopulate entity bio
    printEntityBio(entity_id);
  }

  function switchEntityTab (arg0_entity_id, arg1_tab) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var tab = arg1_tab;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);

    var options_el = entity_el.querySelector(common_selectors.other_container);
    var left_offset = 0.125; //In vw
    var tab_width = 3.25; //In vw
    var underline_el = entity_el.querySelector(common_selectors.underline_el);

    var entity_obj = getEntity(entity_id);

    window[`${entity_id}_page`] = tab; //Set new page

    if (tab) {
      if (tab == "fill") {
        //Switch tabs first
        options_el.setAttribute("class", "options-body hidden");
        underline_el.style.left = `${left_offset}vw`;

        var fill_colour = hexToRGB(entity_obj.options.fillColor);
        updateEntityColour(entity_id, fill_colour, entity_obj.options.fillOpacity);
      }
      if (tab == "stroke") {
        //Switch tabs first
        options_el.setAttribute("class", "options-body hidden");
        underline_el.style.left = `${left_offset*2 + tab_width*1}vw`;

        var stroke_colour = hexToRGB(entity_obj.options.color);
        updateEntityColour(entity_id, stroke_colour, entity_obj.options.opacity);
      }
      if (tab == "other") {
        //Declare local instance variables
        var maximum_zoom_level_el = document.getElementById(`maximum-zoom-level-${entity_id}`);
        var minimum_zoom_level_el = document.getElementById(`minimum-zoom-level-${entity_id}`);

        //Switch tabs first
        options_el.setAttribute("class", "options-body");
        underline_el.style.left = `${left_offset*3.5 + tab_width*2}vw`;

        //Populate default values
        var current_maximum_zoom_value = getEntityProperty(entity_obj, "maximum_zoom_level", main.date);
        var current_minimum_zoom_value = getEntityProperty(entity_obj, "minimum_zoom_level", main.date);

        if (current_maximum_zoom_value)
          maximum_zoom_level_el.value = current_maximum_zoom_value;
        if (current_minimum_zoom_value)
          minimum_zoom_level_el.value = current_minimum_zoom_value;

        //Add event listeners
        maximum_zoom_level_el.onchange = function (e) {
          var local_value = (e.target.value.length > 0) ? parseInt(e.target.value) : undefined;

          createHistoryFrame(entity_id, main.date, {
            maximum_zoom_level: local_value
          });
          printEntityBio(entity_id);

          //Fix value
          if (local_value)
            maximum_zoom_level_el.value = local_value;
        };
        minimum_zoom_level_el.onchange = function (e) {
          var local_value = (e.target.value.length > 0) ? parseInt(e.target.value) : undefined;

          createHistoryFrame(entity_id, main.date, {
            minimum_zoom_level: local_value
          });
          printEntityBio(entity_id);

          //Fix value
          if (local_value)
            minimum_zoom_level_el.value = local_value;
        };
      }
    }
  }

  function updateEntityColour (arg0_entity_id, arg1_colour, arg2_opacity) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var colour = arg1_colour;
    var opacity = arg2_opacity;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);

    var b_el = entity_el.querySelector(common_selectors.entity_b);
    var opacity_el = entity_el.querySelector(common_selectors.opacity_range);
    var g_el = entity_el.querySelector(common_selectors.entity_g);
    var r_el = entity_el.querySelector(common_selectors.entity_r);

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
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);

    var brightness_el = entity_el.querySelector(common_selectors.colour_brightness);
    var brightness_header_el = entity_el.querySelector(common_selectors.brightness_header);
    var opacity_el = entity_el.querySelector(common_selectors.opacity_range);
    var opacity_header_el = entity_el.querySelector(common_selectors.opacity_header);

    var brightness_value = parseInt(brightness_el.value);
    var opacity_value = parseInt(opacity_el.value);

    //Update values
    if (brightness_header_el)
      brightness_header_el.innerHTML = `Brightness | ${brightness_value/100}`;
    if (opacity_header_el)
      opacity_header_el.innerHTML = `Opacity | ${opacity_value/100}`;
  }
}

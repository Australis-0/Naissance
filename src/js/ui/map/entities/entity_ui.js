global.opened_interfaces = {};
global.opened_popups = {};

//Declare Entity UI functions - DEPRECATE AND REFERENCE.
{
  function applyPath (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var bio_container_el = document.querySelector(`#entity-ui-timeline-bio-container-${entity_id}`);
    var entity_obj = getEntity(entity_id);

    //Make sure bio_container_el exists in the first place
    if (bio_container_el) {
      var bio_entries = bio_container_el.querySelectorAll(`table tbody tr td:not(:first-child) span`);
      var bio_top_header_el = bio_container_el.querySelector(`.top-bio-header th:nth-child(2)`);

      //Set select all field at top header
      var select_all_el = document.createElement("span");

      select_all_el.innerHTML = `Select All: <input type = "checkbox" id = "select-all-${entity_id}">`;
      bio_top_header_el.prepend(select_all_el);

      //Add select_all_el event listener
      select_all_el.onclick = function (e) {
        var all_checkboxes = bio_container_el.querySelectorAll(`table tbody tr td:not(:first-child) span input[type="checkbox"]`);

        //Check all if select_all_el.checked is true, uncheck all if not
        entity_obj.options.selected_keyframes = [];

        for (var i = 0; i < all_checkboxes.length; i++)
          all_checkboxes[i].checked = e.target.checked;

        if (e.target.checked)
          for (var i = 0; i < all_checkboxes.length; i++)
            entity_obj.options.selected_keyframes.push(all_checkboxes[i].getAttribute("timestamp"));
      };

      //Iterate over each one and assign each a checkbox
      for (var i = 0; i < bio_entries.length; i++) {
        var local_checkbox_el = document.createElement("input");
        var local_parent_el = bio_entries[i].parentElement.parentElement;
        var local_timestamp = local_parent_el.getAttribute("timestamp");

        local_checkbox_el.setAttribute("type", "checkbox");
        local_checkbox_el.setAttribute("timestamp", local_timestamp);

        if (entity_obj.options.selected_keyframes.includes(local_timestamp))
          local_checkbox_el.checked = true;

        bio_entries[i].prepend(local_checkbox_el);

        //Add event listener
        local_checkbox_el.onclick = function (e) {
          var actual_timestamp = e.target.getAttribute("timestamp");

          if (e.target.checked) {
            if (!entity_obj.options.selected_keyframes.includes(actual_timestamp))
              entity_obj.options.selected_keyframes.push(actual_timestamp);
          } else {
            for (var i = 0; i < entity_obj.options.selected_keyframes.length; i++)
              if (entity_obj.options.selected_keyframes[i] == actual_timestamp)
                entity_obj.options.selected_keyframes.splice(i, 1);
          }
        };
      }

      //Set global flag
      window[`${entity_id}_apply_path`] = true;
      window[`${entity_id}_keyframes_open`] = true;
    }
  }

  function closeApplyPath (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var bio_container_el = document.querySelector(`#entity-ui-timeline-bio-container-${entity_id}`);
    var entity_obj = getEntity(entity_id);

    //Make sure bio_container_el exists in the first place
    if (bio_container_el) {
      var bio_entries = bio_container_el.querySelectorAll(`table tbody tr td:not(:first-child) span`);
      var bio_top_header_el = bio_container_el.querySelector(`.top-bio-header th:nth-child(2)`);

      //Remove select all field at top header
      try {
        bio_top_header_el.querySelector(`span:first-child`).remove();
      } catch {}

      //Iterate over each one and remove the checkbox
      for (var i = 0; i < bio_entries.length; i++) {
        var local_checkbox_el = bio_entries[i].querySelector(`input[type="checkbox"]`);

        if (local_checkbox_el)
          local_checkbox_el.remove();
      }

      //Clear global flag
      delete window[`${entity_id}_apply_path`];
      delete window[`${entity_id}_keyframes_open`];
    }
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

  function deleteKeyframe (arg0_entity_id, arg1_timestamp) { //[WIP] - Check whether deleting a keyframe actually updates the bio
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
    main.date = parseTimestamp(timestamp);
    loadDate();
    editEntity(entity_id);
  }

  function hidePolity (arg0_entity_id, arg1_date, arg2_do_not_reload) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = arg1_date;
    var do_not_reload = arg2_do_not_reload;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    if (entity_obj) {
      createHistoryFrame(entity_id, date, {
        extinct: true
      });

      try { populateEntityBio(entity_id); } catch {}
      try { populateTimelineGraph(entity_id); } catch {}

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
    var actions_context_menu_el = document.querySelector(`${config.ui.entity_action_context_menu}-${entity_id}`);
    var brush_obj = main.brush;
    var entity_obj = getEntity(entity_id);

    //Set actions_context_menu_el to be visible
    removeClass(actions_context_menu_el, " instant-display-none");
    removeClass(actions_context_menu_el, " display-none");

    //Set actions_context_menu_el content according to mode
    if (mode == "apply_path") {
      actions_context_menu_el.innerHTML = `
        <div class = "context-menu-subcontainer">
          <b>Apply Path:</b>
        </div>
        <div id = "apply-path-${entity_id}" class = "context-menu-button confirm">
          <img src = "gfx/interface/checkmark_icon.png" class = "icon medium negative" draggable = "false"> <span>Apply Path to Selected Keyframes</span>
        </div>
      `;

      //Declare local instance variables
      var apply_path_el = document.getElementById(`apply-path-${entity_id}`);

      //Set listener events
      apply_path_el.onclick = function (e) {
        applyPathToKeyframes(entity_id);
      };

      applyPath(entity_id);
    } else if (mode == "clean_keyframes") {
      actions_context_menu_el.innerHTML = `
        <div class = "context-menu-subcontainer">
          <b>Clean Keyframes:</b>
        </div>
        <div class = "context-menu-subcontainer">
          Delete duplicate keyframes within following threshold range.<br>
          <br>
          <span id = "clean-keyframes-date-threshold-container-${entity_id}"></span>
        </div>

        <div id = "clean-keyframes-${entity_id}" class = "context-menu-button confirm">
          <img src = "gfx/interface/checkmark_icon.png" class = "icon medium negative" draggable = "false"> <span>Confirm</span>
        </div>
      `;

      //Declare local instance variables
      var clean_keyframes_el = document.getElementById(`clean-keyframes-${entity_id}`);
      var prefix = `clean-keyframes-date-menu-${entity_id}`;
      var years_input = document.getElementById(`clean-keyframes-date-menu-${entity_id}-years`);

      //Populate only if not already defined in entity_obj.options
      if (entity_obj.options.history) {
        var all_history_entries = Object.keys(entity_obj.options.history);
        var first_history_entry = entity_obj.options.history[all_history_entries[0]];

        var time_difference = parseTimestamp(getTimestamp(main.date) - getTimestamp(first_history_entry.id));

        generateDateRangeFields(`clean-keyframes-date-threshold-container-${entity_id}`, prefix, time_difference);
      }

      //Add event listeners
      clean_keyframes_el.onclick = function (e) {
        var date_range = returnDateRangeFromFields(prefix);

        cleanKeyframes(entity_id, date_range);
      };
    } else if (mode == "hide") {
      //Close other menus first
      closeApplyPath(entity_id);

      actions_context_menu_el.innerHTML = `
        <div class = "context-menu-subcontainer">
          <b>Hide/Unhide Polity:</b>
        </div>
        <div id = "hidden-date-menu-container-${entity_id}" class = "context-menu-subcontainer"></div>

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
        generateDateFields(`hidden-date-menu-container-${entity_id}`, prefix) :
        generateDateFields(`hidden-date-menu-container-${entity_id}`, prefix, parseTimestamp(entity_obj.options.ui_hide_polity_date));

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
      //Close other menus first
      closeApplyPath(entity_id);

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
      if (!window.simplify_all_keyframes_el) window.simplify_all_keyframes_el = false;

      //Auto-populate based on global settings
      if (brush_obj.auto_simplify_when_editing)
        auto_simplify_when_editing_el.checked = true;
      if (window.simplify_all_keyframes_el)
        simplify_all_keyframes_el.checked = true;
      if (brush_obj.simplify_tolerance)
        simplify_tolerance_el.value = parseInt(brush_obj.simplify_tolerance*Math.pow(10, 3));

      //Set listener events
      auto_simplify_when_editing_el.onclick = function (e) {
        //Set global flag
        brush_obj.auto_simplify_when_editing = e.target.checked;
      };
      simplify_all_keyframes_el.onclick = function (e) {
        //Set global flag
        brush.simplify_all_keyframes_el = e.target.checked;
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
        //Set global flag
        brush_obj.simplify_tolerance = getSimplifyTolerance(e.target.value);
      });
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
          actual_timestamp = timestampToInt(context_menu_el.parentElement.getAttribute("timestamp"));

      //Move context_menu_el back to popup_el; then repopulate bio
      popup_el.after(context_menu_el);
      popup_el.after(context_menu_date_el);
      closeKeyframeContextMenu(entity_id, true); //Close context menu

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
      var all_table_entries = document.querySelectorAll(`#entity-ui-timeline-bio-table-${entity_id}.timeline-bio-table tr:not(.no-select) > td:last-child`);

      for (var i = 0; i < all_table_entries.length; i++) {
        var local_timestamp = timestampToInt(all_table_entries[i].parentElement.getAttribute("timestamp"));

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

          main.date = parseTimestamp(local_timestamp);
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
    var options_el = document.getElementById(`${entity_id}-other-container`);
    var left_offset = 0.125; //In vw
    var tab_width = 3.25; //In vw
    var underline_el = document.querySelector(`.options-tab[class~='${entity_id}'] > hr`);

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
          populateEntityBio(entity_id);

          //Fix value
          if (local_value)
            maximum_zoom_level_el.value = local_value;
        };
        minimum_zoom_level_el.onchange = function (e) {
          var local_value = (e.target.value.length > 0) ? parseInt(e.target.value) : undefined;

          createHistoryFrame(entity_id, main.date, {
            minimum_zoom_level: local_value
          });
          populateEntityBio(entity_id);

          //Fix value
          if (local_value)
            minimum_zoom_level_el.value = local_value;
        };
      }
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
      createHistoryFrame(entity_id, date, {
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
}

//Field reaction
document.body.addEventListener("keyup", (e) => {
  //Declare local instance variables
  var brush_obj = main.brush;
  var entity_name = e.target.value;
  var local_class = e.target.getAttribute("class");
  var local_id = e.target.id;

  var entity_obj = getEntity(local_class);

  if (local_id == "polity-name") {
    try {
      if (getEntityName(entity_obj, date) != entity_name) {
        renameEntity(entity_obj, entity_name, main.date);
      } else {
        var local_history = getPolityHistory(local_class, date);

        if (local_history)
          delete local_history.class_name;
      }

      //Repopulate bio
      populateEntityBio(local_class);
    } catch (e) {
      console.error(e);
    }

    //Selection handler
    if (brush_obj.current_selection)
      selection.options.entity_name = entity_name;
  }
});

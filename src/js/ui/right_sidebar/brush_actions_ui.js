//Initialise functions
{
  /*
    closeBrushActionContextMenu() - Closes brush actions context menus for a specific order.
    arg0_order: (Number) - The order which to target to remove.
  */
  function closeBrushActionContextMenu (arg0_order) {
    //Convert from parameters
    var order = (ar0_order) ? arg0_order : 1;

    //Declare local instance variables
    var brush_actions_anchor_el = getBrushActionsAnchorElement();

    //Fetch local brush action context menu and close it
    var brush_actions_el = brush_actions_anchor_el.querySelector(`[order="${order}"]`);
    brush_actions_el.remove();
    refreshBrushActionsContextMenus();
  }

  //closeBrushActionContextMenus() - Closes all brush actions context menus.
  function closeBrushActionContextMenus () {
    //Declare local instance variables
    var brush_actions_anchor_selector = getBrushActionsAnchorElement({ return_selector: true });
    var brush_actions_els = document.querySelectorAll(`${brush_actions_anchor_el} > .context-menu`);

    //Iterate over all brush_actions_els
    for (var i = 0; i < brush_actions_els.length; i++)
      brush_actions_els[i].remove();
  }

  //closeBrushActionContextMenu() - Closes the last opened context menus for the current brush.
  function closeBrushActionLastContextMenu () {
    //Declare local instance variables
    var brush_actions_anchor_el = getBrushActionsAnchorElement();
    var brush_open_orders = getBrushActionsOpenOrders();

    //Close last actions context menu
    closeBrushActionContextMenu(brush_open_orders[brush_open_orders.length - 1]);
  }

  /*
    getBrushActionsAnchorElement() - Fetches the brush actions HTMLElement or selector of the current brush's actions anchor element.
    arg0_options: (Object)
      return_selector: (Boolean) - Optional. Whether or not to return the selector instead of the HTMLElement. False by default.

    Returns: (HTMLElement/String)
  */
  function getBrushActionsAnchorElement (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;

    var brush_actions_anchor_el = document.querySelector(`${common_selectors.brush_actions_context_menu_anchor}`);

    //Return statement
    return (!options.return_selector) ?
      brush_actions_anchor_el :
      common_selectors.brush_actions_context_menu_anchor;
  }

  /*
    getBrushActionsOpenOrders() - Fetches all currently opened orders for brush actions context menus as an array.

    Returns: (Array<Number>)
  */
  function getBrushActionsOpenOrders () {
    //Declare local instance variables
    var brush_actions_anchor_selector = getBrushActionsAnchorElement({ return_selector: true });
    var brush_actions_els = document.querySelectorAll(`${brush_actions_anchor_selector} > .context-menu`);
    var unique_orders = [];

    //Iterate over all entity_actions_els
    for (var i = 0; i < entity_actions_els.length; i++) {
      var local_order = entity_actions_els[i].getAttribute("order");

      if (local_order != undefined) {
        local_order = parseInt(local_order);
        if (!unique_orders.includes(local_order))
          unique_orders.push(local_order);
      }
    }

    //Return statement
    return unique_orders;
  }

  /*
    getBrushActionsInputObject`() - Fetches the merged input object for the currently Brush UI's actions menus.

    Returns: (Object)
  */
  function getBrushActionsInputObject () {
    //Declare local instance variables
    var brush_actions_anchor_el = getBrushActionsAnchorElement();
    var inputs_obj = {};

    //Iterate over all_context_menu_els
    var all_context_menu_els = brush_actions_anchor_el.querySelectorAll(".context-menu");

    for (var i = 0; i < all_context_menu_els.length; i++)
      inputs_obj = dumbMergeObjects(inputs_obj, getInputsAsObject(all_context_menu_els[i]));

    //Return statement
    return inputs_obj;
  }

  /*
    printBrushActionsContextMenu() - Prints a brush actions context menu based on a BrushActions object.
    arg0_brush_action: (Object) - The brush action to be referenced from config.brush_actions.
    arg1_options: (Object)
      <key>: (Variable) -= The placeholder value to assign the given context menu.
  */
  function printBrushActionsContextMenu (arg0_brush_action, arg1_options) {
    //Convert from parameters
    var brush_action = arg0_brush_action;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var brush_action_obj = getBrushAction(brush_action);
    var common_defines = config.defines.common;
    var common_selectors = config.defines.common.selectors;

    //Initialise interfaces.brush if it doesn't exist
    if (!global.interfaces.brush) global.interfaces.brush = {
      id: "brush",
      options: {}
    };

    //Refresh brush action context menus first; then append the current context menu
    var context_menu_ui = {};

    //Parse given .interface from brush_action_obj if applicable
    if (brush_action_obj.interface) {
      var brush_actions_anchor_el = getBrushActionsAnchorElement();
      var brush_actions_anchor_selector = getBrushActionsAnchorElement({ return_selector: true });
      var brush_action_order = (brush_action_obj.order != undefined) ? brush_action_obj.order : 1;
      var lowest_order = config.brush_actions_lowest_order;

      //Delete given order if already extant
      if (brush_actions_anchor_el.querySelector(`[order="${brush_action_order}"]`))
        closeBrushActionContextMenu(brush_action_order);

      //Append dummy context menu div first for context_menu_ui to append to
      var context_menu_el = document.createElement("div");

      context_menu_el.setAttribute("class", "context-menu");
      context_menu_el.id = brush_action_obj.id;
      context_menu_el.setAttribute("order", brush_action_order);
      brush_actions_anchor_el.appendChild(context_menu_el);

      //Initialise context_menu_ui options
      context_menu_ui.anchor = `${brush_actions_anchor_selector} .context-menu#${brush_action_obj.id}`;
      if (brush_action_obj.class) context_menu_ui.class = brush_action_obj.class;
      if (brush_action_obj.name) context_menu_ui.name = brush_action_obj.name;
      if (brush_action_obj.maximum_height) context_menu_ui.maximum_height = brush_action_obj.maximum_height;
      if (brush_action_obj.maximum_width) context_menu_ui.maximum_width = brush_action_obj.maximum_width;

      //Initialise preliminary context menu first
      var new_interface = JSON.parse(JSON.stringify(brush_action_obj.interface));
      new_interface.anchor = context_menu_ui.anchor;

      var action_context_menu_ui = createContextMenu(new_interface);
      refreshBrushActionsContextMenus();

      //Iterate over all_interface_keys and parse them correctly
      var all_interface_keys = Object.keys(brush_action_obj.interface);

      for (let i = 0; i < all_interface_keys.length; i++) {
        let local_value = brush_action_obj.interface[all_interface_keys[i]];

        if (!Array.isArray(local_value) && typeof local_value == "object") {
          if (!local_value.id) local_value.id = all_interface_keys[i];
          let local_element = document.querySelector(`${context_menu_ui.anchor} #${local_value.id}`);

          //Type handlers; set placeholders and user_value where applicable
          {
            //Date
            if (local_value.type == "date")
              populateDateFields(local_element, convertTimestampToDate(options[local_value.placeholder]));
            if (local_value.type == "range") {
              var actual_number_in_range = calculateNumberInRange(
                [returnSafeNumber(local_value.attributes.min, 0), returnSafeNumber(local_value.attributes.max, 100)],
                local_value.placeholder,
                local_value.value_equation
              );
              var range_el = local_element.querySelector(`input[type="range"]`);

              range_el.value = actual_number_in_range;
            }
          }

          //Parse .effect to onclick event handlers
          if (local_value.effect)
            local_element.onclick = function (e) {
              var local_input = getInput(this);

              //Fetch local_actual_value based on local_value.value_equation
              var local_actual_value = (local_value.value_equation) ?
                parseVariableString(local_value.value_equation, { VALUE: parseFloat(local_input) }) : parseFloat(local_input);

              if (local_value.value_equation)
                fillInput({
                  element: this,
                  type: local_value.type,
                  placeholder: local_actual_value
                });
              parseBrushEffect(local_value.effect, { timestamp: convertTimestampToInt(getTimestamp(main.date)), ui_type: "brush_actions" });

              //Range post-handler
              if (local_value.type == "range") {
                var range_el = this.querySelector(`input[type="range"]`);
                range_el.value = parseFloat(local_input);
              }
            };
        }
      }
    }
  }

  /*
    printBrushActionsNavigationmenu() - Prints the brush actions navigation menu - in this case, visible by default.
    arg0_parent_el: (HTMLElement) - The HTMLElement to assign the navigation menu to.

    Returns: (HTMLElement)
  */
  function printBrushActionsNavigationMenu (arg0_parent_el) { //[WIP] - Finish function body
    //Convert from parameters
    var parent_el = arg0_parent_el;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var current_timestamp = getTimestamp(main.date);
    var reserved_brush_actions = config.defines.common.reserved_brush_actions;

    var brush_actions_anchor_el = getBrushActionsAnchorElement();
    var brush_actions_anchor_selector = getBrushActionsAnchorElement({ return_selector: true });
    var brush_actions_navigation_obj = getBrushActionsNavigationObject();

    //Format Brush Actions navigation UI into valid context menu object
    var all_brush_actions = Object.keys(brush_actions_navigation_obj);
    var formatted_navigation_obj = {
      anchor: `${brush_actions_anchor_selector}`,
      class: "brush-context-menu actions-menu"
    };
    var limits_fulfilled = {};

    //Iterate over all_brush_actions
    for (var i = 0; i < all_brush_actions.length; i++) {
      var limit_fulfilled = true;
      var local_action = brush_actions_navigation_obj[all_brush_actions[i]];

      //Make sure that local_action is actually a valid UI element
      if (!Array.isArray(local_action) && !reserved_brush_actions.includes(all_brush_actions[i])) {
        //Check if .limit is fulfilled
        if (local_action.limit)
          limit_fulfilled = parseBrushLimit(local_action.limit, {
            timestamp: current_timestamp,
            ui_type: "brush_actions"
          });

        if (limit_fulfilled) {
          //Define default parameters for element
          formatted_navigation_obj[all_brush_actions[i]] = {
            id: all_brush_actions[i],
            type: "button"
          };
          var local_context_obj = formatted_navigation_obj[all_brush_actions[i]];

          //Add element if limit_fulfilled
          local_context_obj = dumbMergeObjects(local_context_obj, local_action);
          limits_fulfilled[all_brush_actions[i]] = limit_fulfilled;
        }
      }
    }

    //formatted_navigation_obj now contains the correct createContextMenu() options; assign to #brush-buttons-container
    formatted_navigation_obj.class = `brush-context-menu actions-menu`;
    var context_menu_el = createContextMenu(formatted_navigation_obj);

    //Iterate over all_brush_actions
    for (var i = 0; i < all_brush_actions.length; i++) {
      let local_value = brush_actions_navigation_obj[all_brush_actions[i]];

      //Make sure limits are fulfilled first before parsing effect onclick
      if (limits_fulfilled[all_brush_actions[i]])
        if (local_value.effect) {
          let button_el = context_menu_el.querySelector(`div[type="button"][id="${all_brush_actions[i]}"]`);

          button_el.onclick = function (e) {
            parseBrushEffect(local_value.effect, { timestamp: current_timestamp, ui_type: "brush_actions" });
            console.log(`Parse brush effect:`, local_value.effect, { timestamp: current_timestamp, ui_type: "brush_actions" });
          };
        }
    }

    //Return statement
    return (context_menu_el) ? context_menu_el : undefined;
  }

  /*
    refreshBrushActionsContextMenus() - Refreshes brush actions context menu widths.

    Returns: (Number)
  */
  function refreshBrushActionsContextMenus () {
    //Declare local instance variables
    var brush_actions_anchor_el = getBrushActionsAnchorElement();
    var brush_actions_anchor_selector = getBrushActionsAnchorElement({ return_selector: true });
    var brush_actions_context_menus = brush_actions_anchor_el.querySelectorAll(`${brush_actions_anchor_selector} > .context-menu`);
    var brush_actions_context_width = 0; //Measured in px
    var common_selectors = config.defines.common.selectors;
    var timestamp = getTimestamp(main.date);

    //Iterate over brush_actions_context_menus; fetch current brush actions context menu width. Set current width
    brush_actions_context_menus = sortElements(brush_actions_context_menus, { attribute: "order" });
    for (var i = 0; i < brush_actions_context_menus.length; i++) {
      //Set current position; track brush_actions_context_width
      if (!brush_actions_context_menus[i].getAttribute("class").includes("actions-menu"))
        brush_actions_context_menus[i].style.left = `${brush_actions_context_width}px`;
      brush_actions_context_width += brush_actions_context_menus[i].offsetWidth + 8;
    }

    //Update context menu inputs
    refreshBrushActionsContextMenuInputs();

    //Return statement
    return brush_actions_context_width;
  }

  //refreshBrushActionsContextMenuInputs() - Refreshes all brush actions context menu inputs.
  function refreshBrushActionsContextMenuInputs () {
    //Declare local instance variables
    var brush_actions_anchor_el = getBrushActionsAnchorElement();
    var brush_actions_anchor_selector = getBrushActionsAnchorElement({ return_selector: true });
    var brush_actions_context_menus = brush_actions_anchor_el.querySelectorAll(`${brush_actions_anchor_selector} > .context-menu`);
    var common_selectors = config.defines.common.selectors;
    var timestamp = getTimestamp(main.date);

    //Placeholder handlers
    //Iterate over all brush_actions_context_menus; fetch their IDs and update their inputs based on placeholders
    for (var i = 0; i < brush_actions_context_menus.length; i++) {
      var brush_actions_obj = config.flattened_brush_actions[brush_actions_context_menus[i].id];
      var input_obj = getInputsAsObject(brush_actions_context_menus[i]);

      if (brush_actions_obj)
        if (brush_actions_obj.interface) {
          var all_interface_keys = Object.keys(brush_actions_obj.interface);

          //Iterate over all_interface_keys to fill out inputs if placeholder exists
          for (var x = 0; x < all_interface_keys.length; x++) {
            var local_value = brush_actions_obj.interface[all_interface_keys[x]];

            //make sure local_value.placeholder is a valid field before filling it in
            var local_input_el = brush_actions_context_menus[i].querySelector(`#${local_value.id}`);
            if (local_value.placeholder)
              fillInput({
                element: local_input_el,
                type: local_input_el.getAttribute("type"),
                placeholder: (input_obj[local_value.placeholder]) ? input_obj[local_value.placeholder] : local_value.placeholder
              });
          }
        }
    }
  }
}

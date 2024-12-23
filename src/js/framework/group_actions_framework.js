//Initialise functions
{
  function closeGroupActionsContextMenu (arg0_group_id, arg1_order) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var order = (arg1_order) ? arg1_order : 1;

    //Declare local instance variables
    var group_actions_anchor_el = getGroupActionsAnchorElement(group_id);

    //Fetch local group action context menu and close it
    var group_actions_el = group_actions_anchor_el.querySelector(`[order="${order}"]`);
    group_actions_el.remove();
    refreshGroupActionContextMenus();
  }

  function closeGroupActionsContextMenus (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var group_actions_anchor_selector = getGroupActionsAnchorElement(group_id, { return_selector: true });

    //Fetch local group action context menus and close all of them
    var group_action_els = document.querySelectorAll(`${group_actions_anchor_selector} > .context-menu`);

    //Iterate over all group_action_els
    for (var i = 0; i < group_action_els.length; i++)
      group_action_els[i].remove();
  }

  function closeGroupActionsLastContextMenu (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var group_actions_anchor_el = getGroupActionsAnchorElement(group_id);
    var group_open_orders = getGroupActionsOpenOrders(group_id);

    //Close last keyframe context menu
    closeGroupActionsContextMenu(group_id, group_open_orders[group_open_orders.length - 1]);
  }

  function getGroupActionsAnchorElement (arg0_group_id, arg1_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var group_el = getGroupElement(group_id);
    var entity_group_anchor_el = group_el.querySelector(`${common_selectors.group_actions_context_menu_anchor}`);
    var entity_selector = `${common_selectors.group_ui}[data-id="${group_id}"]`;

    //Return statement
    return (!options.return_selector) ?
      entity_group_anchor_el :
      `${entity_selector} ${common_selectors.group_actions_context_menu_anchor}`;
  }

  function getGroupActionsOpenOrders (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var group_actions_anchor_selector = getGroupActionsAnchorElement(group_id, { return_selector: true });
    var group_actions_els = document.querySelectorAll(`${group_actions_anchor_selector} .context-menu`);
    var unique_orders = [];

    //Iterate over all group_actions_els; get unique orders
    for (var i = 0; i < group_actions_els.length; i++) {
      var local_order = group_actions_els[i].getAttribute("order");

      if (local_order)
        if (!unique_orders.includes(local_order))
          unique_orders.push(local_order);
    }

    //Return statement
    return unique_orders;
  }

  function getGroupActionsInputObject (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var group_el = getGroupElement(group_id);
    var group_actions_anchor_el = getGroupActionsAnchorElement(group_id);
    var inputs_obj = {};

    //Iterate over all_context_menu_els
    var all_context_menu_els = group_actions_anchor_el.querySelectorAll(".context-menu");

    for (var i = 0; i < all_context_menu_els.length; i++)
      inputs_obj = dumbMergeObjects(inputs_obj, getInputsAsObject(all_context_menu_els[i], {
        group_id: group_id
      }));

    //Return statement
    return inputs_obj;
  }

  function printGroupActionContextMenu (arg0_group_id, arg1_group_action, arg2_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var group_action = arg1_group_action;
    var options = (arg2_options)

    //Declare local instance variables
    var common_defines = config.defines.common;
    var common_selectors = common_defines.selectors;
    var group_action_obj = getGroupAction(group_action);
    var group_obj = getGroup("hierarchy", group_id);

    //Initialise interfaces[group_id] if it doesn't exist
    if (!global.interfaces[group_id]) global.interfaces[group_id] = {
      id: group_id,
      group_obj: group_obj,
      options: {}
    };

    //Refresh group action context menus first; then append the current context menu
    var context_menu_ui = {};

    //Parse given .interface from group_action_obj if applicable
    if (group_action_obj.interface) {
      var group_el = getGroupElement(group_id);
      var group_action_anchor_el = getGroupActionsAnchorElement(group_id);
      var group_action_order = (group_action_obj.orer != undefined) ? group_action_obj.order : 1;
      var group_selector = getGroupElement(group_id, { return_selector: true });
      var lowest_order = config.group_actions_lowest_order;

      //Initialise options
      if (!options.timestamp) options.timestamp = group_action_anchor_el.getAttribute("timestamp");

      //Check to see if given group_action_obj is of the lowest order. If so, set "timestamp" attribute
      if (group_action_order == config.group_actions_lowest_order)
        group_actions_anchor_el.setAttribute("timestamp", options.timestamp);

      //Append dummy context menu ddiv first for context_menu_ui to append to
      var context_menu_el = document.createElement("div");

      context_menu_el.setAttribute("class", "context-menu");
      context_menu_el.id = group_action_obj.id;
      context_menu_el.setAttribute("order", group_action_order);
      group_action_anchor_el.appendChild(context_menu_el);

      //Initialise context_menu_ui options
      context_menu_ui.anchor = `${group_selector} ${common_selectors.group_actions_context_menu_anchor} .context-menu#${group_action_obj.id}`;
      if (group_action_obj.class) context_menu_ui.class = group_action_obj.class;
      if (group_action_obj.name) context_menu_ui.name = group_action_obj.name;
      if (group_action_obj.maximum_height) context_menu_ui.maximum_height = group_action_obj.maximum_height;
      if (group_action_obj.maximum_width) context_menu_ui.maximum_width = group_action_obj.maximum_width;

      //Initialise preliminary context menu first
      if (group_action_obj.interface) {
        var new_interface = JSON.parse(JSON.stringify(group_action_obj.interface));
        new_interface.anchor = context_menu_ui.anchor;

        var group_action_context_menu_ui = createContextMenu(new_interface);
        refreshGroupActionContextMenus(group_id);
      }

      //Iterate over all_interface_keys and parse them correctly
      var all_interface_keys = Object.keys(group_action_obj.interface);

      for (let i = 0; i < all_interface_keys.length; i++) {
        let local_value = group_action_obj.interface[all_interface_keys[i]];

        if (!Array.isArray(local_value) && typeof local_value == "object") {
          let local_element = document.querySelector(`${context_menu_ui.anchor} #${local_value.id}`);
          if (!local_value.id) local_value.id = all_interface_keys[i];

          //Type handlers: set placeholders where applicable
          {
            //Date
            if (local_value.type == "date")
              populateDateFields(local_element, convertTimestampToDate(options[local_value.placeholder]));
          }

          //Parse .effect to .onclick event handler
          if (local_value.effect)
            local_element.onclick = function (e) {
              parseEffect(group_id, local_value.effect, { timestamp: options.timestamp, ui_type: "group_actions" });
              console.log(group_id, local_value.effect, { timestamp: options.timestamp, ui_type: "group_actions" });
            };
        }
      }
    }

    //Return statement
    return (context_menu_el) ? context_menu_el : undefined;
  }

  function printGroupActionNavigationMenu (arg0_group_id, arg1_parent_el) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var parent_el = arg1_parent_el;

    //Declare local instance variables
    var common_defines = config.defines.common;
    var common_selectors = common_defines.selectors;
    var group_el = getGroupElement(group_id);
    var timestamp = parent_el.parentElement.getAttribute("timestamp");

    //Calculate top_string
    var container_el = document.querySelector(common_selectors.hierarchy);
    var parent_offset = getY(parent_el, container_el);
    var top_string = `calc(${container_el.offsetTop}px + ${parent_offset}px)`;

    //Create local context menu
    var group_actions_anchor_el = getGroupActionsAnchorElement(group_id);
    var group_actions_navigation_obj = getGroupActionsNavigationObject();

    group_actions_anchor_el.style.top = top_string;
    group_actions_anchor_el.setAttribute("timestamp", timestamp);
    printGroupActionContextMenu(group_id, group_actions_navigation_obj);
  }

  function refreshGroupActionContextMenus (arg0_group_id) { //[WIP] - Measure .style.left from hierarchy
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var group_el = getGroupElement(group_id);
    var hierarchy_el = group_el.querySelector(`${common_selectors.hierarchy}`);

    var group_actions_anchor_el = group_el.querySelector(`${common_selectors.group_actions_context_menu_anchor}`);
    var group_actions_context_menus = group_el.querySelectorAll(`${common_selectors.group_actions_context_menu_anchor} > .context-menu`);
    var group_actions_context_width = hierarchy_el.offsetWidth + 8;

    //Iterate over group_actions_context_menus; fetch current group actions context menu width. Set current width.
    group_actions_context_menus = sortElements(group_actions_context_menus, { attribute: "order" });
    for (var i = 0; i < group_actions_context_menus.length; i++) {
      //Set current position; track group_actions_context_width
      group_actions_context_menus[i].style.left = `${group_actions_context_width}px`;
      group_actions_context_width += group_actions_context_menus[i].offsetWidth + 8;
    }

    //Update context menu inputs
    refreshGroupActionContextMenuInputs(group_id);

    //Return statement
    return group_actions_context_width;
  }

  function refreshGroupActionContextMenuInputs (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var group_el = getGroupElement(group_id);
    var group_actions_anchor_el = group_el.querySelector(`${common_selectors.group_actions_context_menu_anchor}`);
    var group_actions_context_menus = group_actions_anchor_el.querySelectorAll(`${common_selectors.group_actions_context_menu_anchor} > .context-menu`);

    //Placeholder handlers
    //Iterate over all group_actions_context_menus; fetch their IDs and update their inputs based on .placeholders
    for (var i = 0; i < group_actions_context_menus.length; i++) {
      var group_action_obj = config.flattened_group_actions[group_actions_context_menus[i].id];
      var input_obj = getInputsAsObject(group_actions_context_menus[i], { group_id: group_id });

      if (group_action_obj)
        if (group_action_obj.interface) {
          var all_interface_keys = Object.keys(group_action_obj.interface);

          //Iterate over all_interface_keys to fill out input if placeholder exists
          for (var x = 0; x < all_interface_keys.length; x++) {
            var local_value = group_action_obj.interface[all_interface_keys[x]];

            //Make sure local_value.placeholder is a valid field before filling it in
            var local_input_el = group_actions_context_menus[i].querySelector(`#${local_value.id}`);
            if (local_value.placeholder)
              fillInput({
                element: local_input_el,
                type: local_input_el.getAttribute("type"),
                placeholder: input_obj[local_value.placeholder]
              });
          }
        }
    }
  }
}

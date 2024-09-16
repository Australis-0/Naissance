//Initialise functions
{
  /*
    closeEntityActionContextMenu() - Closes entity actions context menus for a specific order.
    arg0_entity_id: (String) - The entity ID for which to close a menu.
    arg1_order: (Number) - The order which to target to remove.
  */
  function closeEntityActionContextMenu (arg0_entity_id, arg1_order) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var order = (arg1_order) ? arg1_order : 1;

    //Declare local instance variables
    var entity_actions_anchor_el = getEntityActionsAnchorElement(entity_id);

    //Fetch local entity keyframe context menu and close it
    var entity_actions_el = entity_actions_anchor_el.querySelector(`[order="${order}"]`);
    entity_actions_el.remove();
    refreshEntityActionsContextMenus(entity_id);
  }

  /*
    closeEntityKeyframeContextMenu() - Closes all entity keyframe context menus.
    arg0_entity_id: (String) - The entity ID for which to close all menus.
  */
  function closeEntityActionContextMenus (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_actions_anchor_selector = getEntityActionsAnchorElement(entity_id, { return_selector: true });

    //Fetch local entity actions context menus and close all of them
    var entity_actions_els = document.querySelectorAll(`${entity_actions_anchor_el} > .context-menu`);

    //Iterate over all entity_actions_els
    for (var i = 0; i < entity_actions_els.length; i++)
      entity_actions_els[i].remove();
  }

  /*
    closeEntityActionLastContextMenu() - Closes the last opened keyframe context menu for an entity.
    arg0_entity_id: (String) - The entity ID for which to close the last opened menu.
  */
  function closeEntityActionLastContextMenu (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_actions_anchor_el = getEntityActionsAnchorElement(entity_id);
    var entity_open_orders = getEntityActionsOpenOrders(entity_id);

    //Close late actions context menu
    closeEntityActionContextMenu(entity_id, entity_open_orders[entity_open_orders.length - 1]);
  }

  /*
    getEntityActionsAnchorElement() - Fetches the Entity actions HTMLElement or selector of a given entity's entity actions anchor element.
    arg0_entity_id: (String) - The entity ID for which to fetch the selector for.
    arg1_options: (Object)
      return_selector: (Boolean) - Optional. Whether or not to return the selector instead of the HTMLElement. False by default.
  */
  function getEntityActionsAnchorElement (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);

    var entity_actions_anchor_el = entity_el.querySelector(`${common_selectors.entity_actions_context_menu_anchor}`);
    var entity_selector = `${common_selectors.entity_ui}[class*=" ${entity_id}"]`;

    //Return statement
    return (!options.return_selector) ?
      entity_actions_anchor_el :
      `${entity_selector} ${common_selectors.entity_actions_context_menu_anchor}`;
  }

  /*
    getEntityActionsOpenOrders() - Fetches all currently opened orders for entity actions context menus as an array.
    arg0_entity_id: (String) - The entity ID for which to fetch currently opened orders.

    Returns: (Array<Number>)
  */
  function getEntityActionsOpenOrders (arg0_entity_id) {

  }

  /*
    getEntityActionsInputObject() - Fetches the merged input object for a given Entity UI's action menu.
    arg0_entity_id: (String) - The entity ID for which to return the input object for.

    Returns: (Object)
  */
  function getEntityActionsInputObject (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_actions_anchor_el = getEntityActionsAnchorElement(entity_id);
    var entity_el = getEntityElement(entity_id);
    var inputs_obj = {};

    //Iterate over all_context_menu_els
    var all_context_menu_els = entity_actions_anchor_el.querySelectorAll(".context-menu");

    for (var i = 0; i < all_context_menu_els.length; i++)
      inputs_obj = dumbMergeObjects(inputs_obj, getInputsAsObject(all_context_menu_els[i], {
        entity_id: entity_id
      }));

    //Return statement
    return inputs_obj;
  }

  //[WIP] - DEPRECATE THIS FUNCTION
  function printEntityActions (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_selector = getEntityElement(entity_id, { return_selector: true });

    //Set local context menu and functionality
    var entity_actions_ui = createContextMenu({
      anchor: `${entity_selector} ${common_selectors.entity_actions_context_menu_anchor}`,
      class: "entity-context-menu actions-menu",

      edit_entity_button: {
        id: "edit-entity-button",
        name: "Edit Polity",
        type: "button",
        icon: "gfx/interface/pencil_filled_icon.png",
        onclick: `editEntity('${entity_id}');`,
        x: 0,
        y: 0,
      },
      simplify_path_button: {
        id: "simplify-entity-button",
        name: "Simplify Path",
        type: "button",
        icon: "gfx/interface/simplify_icon.png",
        context: true,
        x: 1,
        y: 0,
      },
      hide_polity_button: {
        id: "hide-polity-button",
        name: "Hide Polity",
        type: "button",
        icon: "gfx/interface/hide_polity_icon.png",
        context: true,
        x: 0,
        y: 1,
      },
      apply_path_button: {
        id: "apply-path-button",
        name: "Apply Path",
        type: "button",
        icon: "gfx/interface/apply_path_icon.png",
        context: true,
        x: 1,
        y: 1,
      },
      clean_keyframes_button: {
        id: "clean-keyframes-button",
        name: "Clean Keyframes",
        type: "button",
        icon: "gfx/interface/clean_keyframes_icon.png",
        context: true,
        x: 1,
        y: 2,
      }
    });
  }

  /*
    printEntityActionsContextMenu() - Prints an entity actions context menu based on an EntityActions object.
    arg0_entity_id: (String) - The entity ID for which to print the context menu for.
    arg1_options: (Object)
      <key>: (Variable) - The placeholder value to assign to the given context menu.
  */
  function printEntityActionsContextMenu (arg0_entity_id, arg1_options) {

  }

  /*
    printEntityActionsNavigationMenu() - Prints the entity actions navigation menu - in this case, visible by default.
    arg0_entity_id: (String) - The entity ID for which to display the navigation menu for.
    arg1_parent_el: (HTMLElement) - The HTMLElement to assign the navigation menu to.

    Returns: (HTMLElement)
  */
  function printEntityActionsNavigationMenu (arg0_entity_id, arg1_parent_el) { //[WIP] - Finish function body.
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var parent_el = arg1_parent_el;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var current_timestamp = getTimestamp(main.date);
    var entity_el = getEntityElement(entity_id);
    var entity_selector = getEntityElement(entity_id, { return_selector: true });
    var reserved_entity_actions = config.defines.common.reserved_entity_actions;

    var entity_actions_anchor_el = getEntityActionsAnchorElement(entity_id);
    var entity_actions_navigation_obj = getEntityActionsNavigationObject(entity_id);

    //Format Entity Actions navigation UI into valid context menu object
    var all_entity_actions = Object.keys(entity_actions_navigation_obj);
    var formatted_navigation_obj = {
      anchor: `${entity_selector} ${common_selectors.entity_actions_context_menu_anchor}`,
      class: "entity-context-menu actions-menu"
    };
    var limits_fulfilled = {};

    //Iterate over all_entity_actions
    for (var i = 0; i < all_entity_actions.length; i++) {
      var limit_fulfilled = true;
      var local_action = entity_actions_navigation_obj[all_entity_actions[i]];

      //Make sure that local_action is actually a valid UI element
      if (!Array.isArray(local_action) && !reserved_entity_actions.includes(all_entity_actions[i])) {
        //Check if .limit is fulfilled
        if (local_action.limit)
          limit_fulfilled = parseEntityLimit(entity_id, local_action.limit, {
            //[WIP] - Make sure to add .options for inputs
            timestamp: current_timestamp,
            ui_type: "entity_actions"
          });

        if (limit_fulfilled) {
          //Define default parameters for element
          formatted_navigation_obj[all_entity_actions[i]] = {
            id: all_entity_actions[i],
            type: "button"
          };
          var local_context_obj = formatted_navigation_obj[all_entity_actions[i]];

          //Add element if limit_fulfilled
          local_context_obj = dumbMergeObjects(local_context_obj, local_action);
          limits_fulfilled[all_entity_actions[i]] = limit_fulfilled;
        }
      }
    }

    //formatted_navigation_obj now contains the correct createContextMenu() options; assign to #entity-actions-context-menu
    formatted_navigation_obj.anchor = `${entity_selector} ${common_selectors.entity_actions_context_menu_anchor}`;
    formatted_navigation_obj.class = "entity-context-menu actions-menu";
    var context_menu_el = createContextMenu(formatted_navigation_obj);

    //Iterate over all_entity_actions
    for (var i = 0; i < all_entity_actions.length; i++) {
      let local_value = entity_actions_navigation_obj[all_entity_actions[i]];

      //Make sure limits are fulfilled first before parsing effect onclick
      if (limits_fulfilled[all_entity_actions[i]])
        if (local_value.effect) {
          let button_el = context_menu_el.querySelector(`div[type="button"][id="${all_entity_actions[i]}"]`);

          button_el.onclick = function (e) {
            parseEntityEffect(entity_id, local_value.effect, { timestamp: current_timestamp, ui_type: "entity_actions" });
            console.log(`Parse entity effect:`, entity_id, local_value.effect, { timestamp: current_timestamp, ui_type: "entity_actions" });
          };
        }
    }

    //Return statement
    return (context_menu_el) ? context_menu_el : undefined;
  }

  /*
    refreshEntityActionsContextMenus() - Refreshes entity actions context menuw idths.
    arg0_entity_id: (String) - The entity ID to refresh entity actions context menus for.

    Returns: (Number)
  */
  function refreshEntityActionsContextMenus (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_actions_anchor_el = getEntityActionsAnchorElement(entity_id);
    var entity_actions_context_menus = entity_actions_anchor_el.querySelectorAll(`${common_selectors.entity_actions_context_menu_anchor} > .context-menu`);
    var entity_actions_context_width = entity_actions_anchor_el.offsetWidth + 8; //Measured in px
    var entity_el = getEntityElement(entity_id);
    var entity_header_el = entity_el.querySelector(common_selectors.entity_ui_header);
    var timestamp = getTimestamp(main.date);

    //Iterate over entity_actions_context_menus; fetch current entity actions context menu width. Set current width
    entity_actions_context_menus = sortElements(entity_actions_context_menus, { attribute: "order" });
    for (var i = 0; i < entity_actions_context_menus.length; i++) {
      //Set current position; track entity_actions_context_width
      entity_actions_context_menus[i].style.left = `${entity_actions_context_width}px`;
      entity_actions_context_width += entity_actions_context_menus[i].offsetWidth + 8;
    }

    //Update context menu inputs
    refreshEntityActionsContextMenus(entity_id);

    //Return statement
    return entity_actions_context_width;
  }

  /*
    refreshEntityActionsContextMenuInputs() - Refreshes all entity actions context menu inputs.
    arg0_entity_id: (String) - The entity ID which tor efresh entity actions context menus for.
  */
  function refreshEntityActionsContextMenuInputs (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);
    var entity_actions_anchor_el = entity_el.querySelector(`${common_selectors.entity_actions_context_menu_anchor}`);
    var entity_actions_context_menus = entity_actions_anchor_el.querySelectorAll(`${common_selectors.entity_actions_context_menu_anchor} > .context-menu`);
    var entity_timestamp = getTimestamp(main.date);

    //Placeholder handlers
    //Iterate over all entity_actions_context_menus; fetch their IDs and update their inputs based on .placeholders
    for (var i = 0; i < entity_actions_context_menus.length; i++) {
      var entity_actions_obj = config.flattened_entity_actions[entity_actions_context_menus[i].id];
      var input_obj = getInputsAsObject(entity_actions_context_menus[i], { entity_id: entity_id });

      if (entity_actions_obj)
        if (entity_actions_obj.interface) {
          var all_interface_keys = Object.keys(entity_actions_obj.interface);

          //Iterate over all_interface_keys to fill out inputs if placeholder exists
          for (var x = 0; x < all_interface_keys.length; x++) {
            var local_value = entity_actions_obj.interface[all_interface_keys[x]];

            //Make sure local_value.placeholder is a valid field before filling it in
            var local_input_el = entity_actions_context_menus[i].querySelector(`#${local_value.id}`);
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

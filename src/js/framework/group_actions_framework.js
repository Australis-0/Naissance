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
      
  }

  function printGroupActionNavigationMenu (arg0_group_id, arg1_parent_el) {

  }

  function refreshGroupActionContextMenus (arg0_group_id) {

  }

  function refreshGroupActionContextMenuInputs (arg0_group_id) {

  }
}

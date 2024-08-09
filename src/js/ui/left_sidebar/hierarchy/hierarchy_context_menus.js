{
  /*
    printHierarchyContextMenu() - Handles click and input events for the main map entities hierarchy.
    arg0_hierarchy_key: (String) - Optional. 'hierarchy' by default.
    arg1_group_id: (String)
  */
  function printHierarchyContextMenu (arg0_hierarchy_key, arg1_group_id) {
    //Convert from parameters
    var hierarchy_key = (arg0_hierarchy_key) ? arg0_hierarchy_key : "hierarchy";
    var group_id = arg1_group_id;

    //Declare local instance variables
    var context_menu_el = document.querySelector(`#${hierarchy_key}-context-menu`);
    var group_el = document.querySelector(`div.group[data-id="${group_id}"]`);
    var hierarchy_container_el = document.querySelector(`#${hierarchy_key}`);
    var hierarchy_obj = main.hierarchies[hierarchy_key];

    //Make sure context_menu_el is visible; move context_menu_el to group_el position
    showElement(context_menu_el);
    adjustHierarchyContextMenus(hierarchy_key, group_el);

    //Set context menu
    context_menu_el = createContextMenu({
      anchor: `#${hierarchy_key}-context-menu`,
      id: "context-menu-container",
      name: "Group Context Menu",

      create_subgroup_button: {
        id: "create-subgroup-button",
        name: `Create Subgroup`,
        type: "button",

        x: 0,
        y: 0,

        onclick: `addGroup('hierarchy', { parent_group: '${group_id}' });`
      },
      delete_group_button: {
        id: "delete-group-button",
        name: "Delete Group",
        type: "button",

        x: 0,
        y: 1,

        onclick: `deleteGroup('hierarchy', '${group_id}');`
      },
      delete_all_button: {
        id: "delete-all-button",
        name: "Delete All",
        type: "button",

        x: 0,
        y: 2,

        onclick: `deleteGroupRecursively('hierarchy', '${group_id}');`
      },
      set_mask_button: {
        id: "set-mask-button",
        name: "Set Mask",
        type: "button",

        x: 0,
        y: 3,

        onclick: `printHierarchyMaskContextMenu('hierarchy', '${group_id}');`
      }
    });
  }

  function printHierarchyMaskContextMenu (arg0_hierarchy_key, arg1_group_id) {
    //Convert from parameters
    var hierarchy_key = (arg0_hierarchy_key) ? arg0_hierarchy_key : "hierarchy";
    var group_id = arg1_group_id;

    //Declare local instance variables
    var context_menu_el = document.querySelector(`#${hierarchy_key}-context-menu-two`);
    var group_el = document.querySelector(`div.group[data-id="${group_id}"]`);
    var main_context_menu_el = document.querySelector(`#${hierarchy_key}-context-menu`);

    //Check mode
    if (group_el) {
      showElement(context_menu_el);
      //context_menu_el.setAttribute("style", `top: calc(${offset_top}px);`);

      context_menu_el.innerHTML = createContextMenu({
        anchor: `#${hierarchy_key}-context-menu-two`,
        id: "context-menu-container-two",
        name: "Set Mask:",

        group_mask_select: {
          id: "group-mask-select",
          type: "select",

          x: 0,
          y: 0,

          options: {
            add: "Add (Brush > Mask)",
            intersect_add: "Intersect Add (Brush > Intersection)",
            intersect_overlay: "Intersect Overlay (Brush in Intersection)",
            subtract: "Subtract (Mask > Brush)",
            clear: "None"
          }
        },
        confirm_mask_button: {
          id: "confirm-mask-button",
          name: `Confirm Mask`,
          type: "button",

          x: 0,
          y: 1,

          onclick: `setGroupMask('${group_id}');`
        },
      });
    }
  }
}

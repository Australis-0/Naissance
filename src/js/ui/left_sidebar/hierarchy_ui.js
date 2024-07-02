{
  /*
    handleSidebarContextMenu() - Handles click and input events for the main map entities hierarchy.
    arg0_hierarchy_key: (String) - Optional. 'hierarchy' by default.
    arg1_group_id: (String)
  */
  function handleSidebarContextMenu (arg0_hierarchy_key, arg1_group_id) {
    //Convert from parameters
    var hierarchy_key = (arg0_hierarchy_key) ? arg0_hierarchy_key : "hierarchy";
    var group_id = arg1_group_id;

    //Declare local instance variables
    var context_menu_el = document.querySelector(`#${hierarchy_key}-context-menu`);
    var group_el = document.querySelector(`div.group[id*="${group_id}"]`);
    var hierarchy_container_el = document.querySelector(`#${hierarchy_key}`);
    var hierarchy_obj = main.hierarchies[hierarchy_key];

    //Get button elements
    var create_subgroup_btn = context_menu_el.querySelector(`#context-menu-create-subgroup-button`);
    var delete_all_btn = context_menu_el.querySelector(`#context-menu-delete-all-button`);
    var delete_group_btn = context_menu_el.querySelector("#context-menu-delete-group-button");
    var set_mask_btn = context_menu_el.querySelector(`#context-menu-mask-group-button`);

    //Set button functionality
    create_subgroup_btn.setAttribute("onclick", `createGroup("hierarchy", "${group_id}");`);
    delete_group_btn.setAttribute("onclick", `deleteGroup("hierarchy", "${group_id}");`);
    delete_all_btn.setAttribute("onclick", `deleteGroupRecursively("hierarchy", "${group_id}");`);
    set_mask_btn.setAttribute("onclick", `handleSidebarMaskContextMenu("hierarchy", "${group_id}");`);
  }

  function handleSidebarMaskContextMenu (arg0_hierarchy_key, arg1_group_id) {
    //Convert from parameters
    var hierarchy_key = (arg0_hierarchy_key) ? arg0_hierarchy_key : "hierarchy";
    var group_id = arg1_group_id;

    //Declare local instance variables
    var context_menu_el = document.querySelector(`#${hierarchy_key}-context-menu-two`);
    var group_el = document.querySelector(`div.group[id="${group_id}"]`);
    var offset_top = group_el.offsetTop - context_menu_el.scrollTop;

    //Check mode
    if (group_el) {
      showElement(context_menu_el);
      context_menu_el.setAttribute("style", `top: calc(${offset_top}px);`);

      context_menu_el.innerHTML = `
        <div id = "mask-context-menu-text" class = "context-menu-text">
          <b>Set Mask:</b><br>
          <select id = "group-mask-${group_id}">
            <option value = "add">Add (Brush > Mask)</option>
            <option value = "intersect_add">Intersect Add (Brush > Intersection)</option>
            <option value = "intersect_overlay">Intersect Overlay (Brush in Intersection)</option>
            <option value = "subtract">Subtract (Mask > Brush)</option>
            <option value = "clear">None</option>
          </select>
        </div>
        <div id = "mask-context-menu-confirm" class = "context-menu-button confirm" onclick = "setGroupMask('${group_id}');">
          <img src = "gfx/interface/checkmark_icon.png" class = "icon small negative" draggable = "false"> Confirm
        </div>
      `;
    }
  }
}

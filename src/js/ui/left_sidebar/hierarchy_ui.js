/*
  handleSidebarContextMenu() - Handles click and input events for the main map entities hierarchy.
  arg0_hierarchy_key: (String)
  arg1_group_id: (String)
*/
function handleSidebarContextMenu (arg0_hierarchy_key, arg1_group_id) {
  //Convert from parameters
  var hierarchy_key = arg0_hierarchy_key;
  var group_id = arg1_group_id;

  //Declare local instance variables
  var context_menu_el = document.querySelector(`#hierarchy-context-menu`);
  var group_el = document.querySelector(`div.group[id*="${group_id}"]`);
  var hierarchy_container_el = document.querySelector(`#hierarchy`);
  var hierarchy_obj = main.hierarchies[hierarchy_key];

  //Get button elements
  var create_subgroup_btn = context_menu_el.querySelector(`#context-menu-create-subgroup-button`);
  var delete_all_btn = context_menu_el.querySelector(`#context-menu-delete-all-button`);
  var delete_group_btn = context_menu_el.querySelector("#context-menu-delete-group-button");

  //Set button functionality
  create_subgroup_btn.setAttribute("onclick", `createGroup('${group_id}');`);
  delete_group_btn.setAttribute("onclick", `deleteGroup('${group_id}');`);
  delete_all_btn.setAttribute("onclick", `deleteGroupRecursively('${group_id}');`);
}

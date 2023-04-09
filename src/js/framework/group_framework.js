function deleteGroup (arg0_group_id, arg1_do_not_refresh) {
  //Convert from parameters
  var group_id = arg0_group_id;
  var do_not_refresh = arg1_do_not_refresh;

  //Declare local instance variables
  var context_menu_el = document.getElementById("hierarchy-context-menu");
  var group_layer = getGroup(group_id, { return_layer: true });
  var group_obj = getGroup(group_id);
  var parent_group = getGroupGroup(group_id);

  if (group_obj) {
    //Make sure to move all subgroups and entities out into group's parent element if it exists (change parent_group)
    if (parent_group)
      if (group_obj.subgroups) {
        if (!parent_group.subgroups) parent_group.subgroups = [];

        //Add all current subgroups to parent_group.subgroups if not already there
        for (var i = 0; i < group_obj.subgroups.length; i++)
          if (!parent_group.subgroups.includes(group_obj.subgroups[i]))
            parent_group.subgroups.push(group_obj.subgroups[i]);
      }

    //Delete group
    delete window[`${group_layer}_groups`][group_id];

    //Remove all mentions of group_id from subgroups in layer
    var layer_groups = window[`${group_layer}_groups`];

    var all_layer_groups = Object.keys(layer_groups);

    for (var i = 0; i < all_layer_groups.length; i++) {
      var local_group = layer_groups[all_layer_groups[i]];

      if (local_group.subgroups)
        for (var x = 0; x < local_group.subgroups.length; x++)
          if (local_group.subgroups[x] == group_id)
            local_group.subgroups.splice(x, 1);

      //Delete local_group.subgroups key if nothing is left
      if (local_group.subgroups)
        if (local_group.subgroups.length == 0)
          delete local_group.subgroups;
    }

    //Close context menu if attached to current group
    var context_menu_group = context_menu_el.getAttribute("group");

    if (context_menu_group == group_id)
      closeSidebarContextMenu();

    //Refresh sidebar
    if (!do_not_refresh)
      refreshSidebar();
  }
}

function deleteGroupRecursively (arg0_group_id) {
  //Convert from parameters
  var group_id = arg0_group_id;

  //Declare local instance variables
  var context_menu_el = document.getElementById("hierarchy-context-menu");
  var group_layer = getGroup(group_id, { return_layer: true });
  var group_obj = getGroup(group_id);
  var parent_group = getGroupGroup(group_id);
  var still_has_subgroups = true;

  //Delete all subgroups first to move everything to the base group until group_obj has no subgroups
  var clear_subgroups_loop = setInterval(function(){
    if (!group_obj.subgroups) {
      still_has_subgroups = false;
    } else
      try {
        if (group_obj.subgroups)
          for (var i = 0; i < group_obj.subgroups.length; i++)
            deleteGroup(group_obj.subgroups[i], true);
      } catch {}

    if (!still_has_subgroups) {
      //Delete all entities remaining in base group
      if (group_obj.entities)
        for (var i = 0; i < group_obj.entities.length; i++)
          deleteEntity(group_obj.entities[i]);

      //Delete group proper
      deleteGroup(group_id, true);

      //Refresh sidebar; reload map
      refreshSidebar();
      loadDate();

      //Clear interval
      clearInterval(clear_subgroups_loop);
    }
  }, 0);
}

/*
  getGroup() - Returns a group object or key.
  {
    return_layer: true/false - Whether to return the layer key instead of object
    return_key: true/false - Whether to return the key instead of object
  }
*/
function getGroup (arg0_group_id, arg1_options) {
  //Convert from parameters
  var group_id = arg0_group_id;
  var options = (arg1_options) ? arg1_options : {};

  //Iterate over all layers for group ID
  for (var i = 0; i < layers.length; i++) {
    var local_layer = window[`${layers[i]}_groups`];

    if (local_layer[group_id])
      if (options.return_layer) {
        return layers[i];
      } else {
        return (!options.return_key) ? local_layer[group_id] : group_id;
      }
  }
}

function getGroupGroup (arg0_group_id) {
  //Convert from parameters
  var group_id = arg0_group_id;

  //Iterate over all layers; groups for subgroups
  for (var i = 0; i < layers.length; i++) {
    var local_layer = window[`${layers[i]}_groups`];

    var all_local_groups = Object.keys(local_layer);

    for (var x = 0; x < all_local_groups.length; x++) {
      var local_group = local_layer[all_local_groups[x]];

      if (local_group.subgroups)
        if (local_group.subgroups.includes(group_id));
          return local_group;
    }
  }
}

function moveGroupToGroup (arg0_group_id, arg1_group_id) {
  //Convert from parameters
  var child_group_id = arg0_group_id;
  var parent_group_id = arg1_group_id;

  //Declare local instance variables
  var new_group = getGroup(parent_group_id);
  var old_group = getGroupGroup(child_group_id);

  //Remove from old_group if group has already been assigned a group
  if (old_group)
    if (old_group.subgroups) {
      for (var i = 0; i < old_group.subgroups.length; i++)
        if (old_group.subgroups[i] == child_group_id)
          old_group.subgroups.splice(i, 1);

      if (old_group.subgroups.length == 0)
        delete old_group.subgroups;
    }

  //Add to new group
  if (new_group) {
    //Make sure subgroups array exists if possible
    if (!new_group.subgroups)
      new_group.subgroups = [];

    //Push to new_group.subgroups
    new_group.subgroups.push(child_group_id);
  }
}

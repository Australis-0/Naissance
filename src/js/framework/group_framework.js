function getGroup (arg0_group_id) {
  //Convert from parameters
  var group_id = arg0_group_id;

  //Iterate over all layers for group ID
  for (var i = 0; i < layers.length; i++) {
    var local_layer = window[`${layers[i]}_groups`];

    if (local_layer[group_id])
      return local_layer[group_id];
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

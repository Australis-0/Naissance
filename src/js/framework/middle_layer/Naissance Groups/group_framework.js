//Helper functions
{
  function removeGroupFromAllSubgroups (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var deleted = false;

    //Iterate over all layers to delete
    for (var i = 0; i < window.layers.length; i++) {
      var local_groups = window[`${layers[i]}_groups`];

      var all_local_groups = Object.keys(local_groups);

      for (var x = 0; x < all_local_groups.length; x++) {
        var local_group = local_groups[all_local_groups[x]];

        if (local_group.subgroups)
          for (var y = local_group.subgroups.length - 1; y >= 0; y--)
            if (local_group.subgroups[y] == group_id) {
              local_group.subgroups.splice(y, 1);
              deleted = true;
            }
      }
    }

    //Return statement
    return deleted;
  }
}

//Group functions
{
  function createGroup (arg0_parent_group_id, arg1_do_not_refresh) {
    //Convert from parameters
    var parent_group_id = arg0_parent_group_id;
    var do_not_refresh = arg1_do_not_refresh;

    //Declare local instance variables
    var group_id = generateGroupID();
    var group_obj = {
      name: "New Group",
      id: group_id,

      parent_group: (parent_group_id) ? parent_group_id : undefined
    };
    var sidebar_el = document.getElementById("hierarchy");

    var selected_layer_el = sidebar_el.querySelector(`[id='${selected_layer}']`);

    window[`${selected_layer}_groups`][group_id] = group_obj;

    //Create actual UI element
    var group_el = createGroupElement(selected_layer, group_id);

    //If group_obj.parent_group is not defined, we know we're creating it directly in a layer
    if (!group_obj.parent_group) {
      var all_first_layer_entities = selected_layer_el.querySelectorAll(`.layer > .entity`);
      var all_first_layer_groups = selected_layer_el.querySelectorAll(`.layer > .group`);

      (all_first_layer_groups.length > 0) ?
        all_first_layer_groups[all_first_layer_groups.length - 1].after(group_el) :
        (all_first_layer_entities.length > 0) ?
          all_first_layer_entities[0].before(group_el) :
          selected_layer_el.append(group_el);
    } else {
      //Assign to subgroups element
      var subgroups_el = sidebar_el.querySelector(`[id='${parent_group_id}-subgroups']`);

      //Make sure it exists in new parent .subgroups
      if (parent_group_id) {
        var parent_group = getGroup(parent_group_id);

        if (parent_group) {
          if (!parent_group.subgroups) parent_group.subgroups = [];
          parent_group.subgroups.push(group_id);
        }
      }

      //Append to sidebar HTML regardless
      if (subgroups_el)
        subgroups_el.append(group_el);
    }

    //Refresh sidebar
    if (!do_not_refresh) {
      refreshSidebar();

      //Focus on newly created group
      var actual_group_el = selected_layer_el.querySelectorAll(`[id='${group_id}'].group > input`);

      if (actual_group_el.length > 0)
        actual_group_el[0].focus();
    }

    //Return statement
    return group_obj;
  }

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
      //KEEP AT TOP! - Remove group options first
      {
        removeGroupMask(group_id, { do_not_override_entity_masks: true });
      }

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

      if (context_menu_group == group_id) {
        closeSidebarContextMenu();
        closeSidebarSubcontextMenu();
      }

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

    //Guard clause for object
    if (typeof group_id == "object") return group_id;

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

  /*
    getGroupEntities() - Recursively fetches an array of entity objects from groups and subgroups

    options: {
      return_keys: truie/false, - Whether to return keys. False by default
      surface_layer: true/false - Whether to only get surface layer entities. False by default
    }
  */
  function getGroupEntities (arg0_group_id, arg1_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var entity_array = [];
    var group_obj = getGroup(group_id);

    if (group_obj.entities) {
      for (var i = 0; i < group_obj.entities.length; i++) {
        var local_entity = getEntity(group_obj.entities[i]);

        entity_array.push((!options.return_keys) ? local_entity : local_entity.options.className);
      }
    }
    if (group_obj.subgroups) {
      for (var i = 0; i < group_obj.subgroups.length; i++)
        //Call function recursively
        entity_array = appendArrays(entity_array, getGroupEntities(group_obj.subgroups[i], options));
    }

    //Return statement
    return entity_array;
  }

  /*
    getGroupGroup() - Fetches group group
    options: {
      return_key: true/false - Optional. Whether to return the key. False by default, returns [`<layer>_groups`, `key`] if true
    }
  */
  function getGroupGroup (arg0_group_id, arg1_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var options = (arg1_options) ? arg1_options : {};

    //Iterate over all layers; groups for subgroups
    for (var i = 0; i < layers.length; i++) {
      var local_key = `${layers[i]}_groups`;

      var local_layer = window[local_key];

      var all_local_groups = Object.keys(local_layer);

      for (var x = 0; x < all_local_groups.length; x++) {
        var local_group = local_layer[all_local_groups[x]];

        if (local_group.subgroups)
          if (local_group.subgroups.includes(group_id));
            return (!options.return_key) ? local_group : [local_key, all_local_groups[x]];
      }
    }
  }

  function moveEntityToGroup (arg0_entity_id, arg1_group_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var group_id = arg1_group_id;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var new_group = getGroup(group_id);
    var old_group = getEntityGroup(entity_id);

    //Initialise local instance variables
    entity_id = entity_obj.options.className;

    //Remove from old group if entity has already been assigned a group
    if (old_group)
      if (old_group.entities) {
        for (var i = 0; i < old_group.entities.length; i++)
          if (old_group.entities[i] == entity_id)
            old_group.entities.splice(i, 1);

        if (old_group.entities.length == 0)
          delete old_group.entities;
      }

    //Add to new group
    if (new_group) {
      //Make sure entities array exists if possible
      if (!new_group.entities)
        new_group.entities = [];

      //Push to new_group.entities
      new_group.entities.push(entity_id);

      //Group options handling
      {
        //Mask handling
        removeEntityMask(entity_obj);

        if (new_group.mask)
          window.brush[`mask_${new_group.mask}`].push(entity_obj);
      }
    }
  }

  function moveGroupToGroup (arg0_group_id, arg1_group_id) {
    //Convert from parameters
    var child_group_id = arg0_group_id;
    var parent_group_id = arg1_group_id;

    //Declare local instance variables
    var new_group = (typeof parent_group_id != "object") ? getGroup(parent_group_id) : parent_group_id;

    //Remove group from all subgroups in all layers first
    removeGroupFromAllSubgroups(child_group_id);

    //Add to new group
    if (new_group) {
      var is_in_group = false;

      //Make sure subgroups array exists if possible
      if (!new_group.subgroups) {
        new_group.subgroups = [];
      } else {
        if (new_group.subgroups.includes(child_group_id))
          is_in_group = true;
      }

      //Push to new_group.subgroups
      if (!is_in_group)
        new_group.subgroups.push(child_group_id);
    }
  }
}

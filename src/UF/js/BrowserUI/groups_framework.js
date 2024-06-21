//Helper functions
{
  /*
    removeGroupFromAllSubgroups() - Removes a group from all subgroups.
    arg0_group_id: (String)
    arg1_options: (Object)
      hierarchy_key: (String) - The hierarchy key to provide.
  */
  function removeGroupFromAllSubgroups (arg0_group_id, arg1_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var deleted = false;

    if (options.hierarchy_key) {
      var hierarchy_obj = main.hierarchies[options.hierarchy_key];

      var all_layers = Object.keys(hierarchy_obj.layers);

      //Iterate over all layers to delete
      for (var i = 0; i < all_layers.length; i++) {
        var local_groups = hierarchy_obj.groups[all_layers[i]];

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
    } else {
      //Iterate over all layers to delete
      for (var i = 0; i < main.all_layers.length; i++) {
        var local_groups = main.groups[main.all_layers[i]];

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
    }

    //Return statement
    return deleted;
  }
}

//Group functions
{
  /*
    createGroup() - Creates a group in a given hierarchy and its corresponding element.
    arg0_parent_group_id: (String) - Optional. The parent group ID. Undefined by default.
    arg1_options: (Object)
      hierarchy_el: (HTMLElement)
    arg2_do_not_refresh: (Boolean)
  */
  function createGroup (arg0_parent_group_id, arg1_options, arg2_do_not_refresh) {
    //Convert from parameters
    var parent_group_id = arg0_parent_group_id;
    var options = (arg1_options) ? arg1_options : {};
    var do_not_refresh = arg2_do_not_refresh;

    //Declare local instance variables
    var group_id = generateGroupID();
    var group_obj = {
      name: "New Group",
      id: group_id,

      parent_group: (parent_group_id) ? parent_group_id : undefined
    };
    var selected_layer = main.brush.selected_layer;
    var sidebar_el = (options.hierarchy_el) ? options.hierarchy_el : document.getElementById("hierarchy");

    var selected_layer_el = sidebar_el.querySelector(`[id='${selected_layer}']`);

    main.groups[selected_layer][group_id] = group_obj;

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

  /*
    deleteGroup() - Deletes a group in a given hierarchy and its corresponding element.
    arg0_group_id: (String)
    arg1_options: (Object)
      hierarchy_context_el: (HTMLElement)
    arg2_do_not_refresh: (Boolean)
  */
  function deleteGroup (arg0_group_id, arg1_options, arg2_do_not_refresh) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var options = (arg1_options) ? arg1_options : {};
    var do_not_refresh = arg2_do_not_refresh;

    //Declare local instance variables
    var context_menu_el = (options.hierarchy_context_el) ? options.hierarchy_context_el : document.getElementById("hierarchy-context-menu");
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
      delete main.groups[group_layer][group_id];

      //Remove all mentions of group_id from subgroups in layer
      var layer_groups = main.groups[group_layer];

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

  /*
    deleteGroupRecursively() - Deletes a group recursively, including all sub-elements.
    arg0_group_id: (String)
    arg1_options: (Object)
      hierarchy_context_el: (HTMLElement)
  */
  function deleteGroupRecursively (arg0_group_id, arg1_options) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var context_menu_el = (options.hierarchy_context_el) ? options.hierarchy_context_el : document.getElementById("hierarchy-context-menu");
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
    arg0_group_id: (String)
    arg1_options: (Object)
      hierarchy_id: (String) - Optional. Whether to fetch a group inside a custom hierarchy.
      return_layer: (Object) - Optional. Whether to return the layer key instead of object. False by default.
      return_key: (Object) - Optional. Whether to return the key instead of object. False by default.

    Returns: (String/Object/String)
  */
  function getGroup (arg0_group_id, arg1_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for object
    if (typeof group_id == "object") return group_id;

    //Check whether options.hierarchy_id is defined
    for (var i = 0; i < main.all_layers.length; i++) {
      var local_layer = main.groups[main.all_layers[i]];

      if (local_layer[group_id])
        if (options.return_layer) {
          return main.all_layers[i];
        } else {
          return (!options.return_key) ? local_layer[group_id] : group_id;
        }
    }
  }

  /*
    getGroupEntities() - Recursively fetches an array of entity objects from groups and subgroups.
    arg0_group_id: (String)
    arg1_options: (Object)
      return_keys: (Boolean) - Optional. Whether to return keys. False by default
      surface_layer: (Boolean) - Optional. Whether to only get surface layer entities. False by default

    Returns: (Array<Object>)
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
    getGroupGroup() - Fetches the parent group of a child group. [WIP] - Debug for multiple hierarchies
    arg0_group_id: (String)
    arg1_options: (Object)
      return_key: (Boolean) - Optional. Whether to return the key. False by default, returns [`<layer>_groups`, `key`] if true

    Returns: (Object/Array<String, String>)
  */
  function getGroupGroup (arg0_group_id, arg1_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var options = (arg1_options) ? arg1_options : {};

    //Iterate over all layers; groups for subgroups
    for (var i = 0; i < main.all_layers.length; i++) {
      var local_key = main.all_layers[i];
      var local_layer = main.layers[main.all_layers[i]];

      var all_local_groups = Object.keys(local_layer);

      for (var x = 0; x < all_local_groups.length; x++) {
        var local_group = local_layer[all_local_groups[x]];

        if (local_group.subgroups)
          if (local_group.subgroups.includes(group_id));
            return (!options.return_key) ? local_group : [main.all_layers[i], all_local_groups[x]];
      }
    }
  }

  /*
    moveEntityToGroup() - Moves an entity to a given group. [WIP] - Debug for multiple hierarchies
    arg0_entity_id: (String)
    arg1_group_id: (String)
  */
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
          main.brush.masks[new_group.mask].push(entity_obj);
      }
    }
  }

  /*
    moveGroupToGroup() - Moves a group inside another group. [WIP] - Debug for multiple hierarchies
    arg0_group_id: (String)
    arg1_group_id: (String)
  */
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

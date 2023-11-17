//Initialise Layer rendering functions
{
  /*
    getGroupRenderingOrder() - Fetches the group rendering order.
    options: {
      layer: "polities" - Optional. Optimisation parameter. Defines the layer the group is currently in
    }
  */
  function getGroupRenderingOrder (arg0_group_obj, arg1_options) {
    //Convert from parameters
    var group_obj = arg0_group_obj;
    var options = (arg1_options) ? arg1_options : { layer: "polities" };

    //Declare local instance variables
    var rendering_order = [];

    //Render all entities first
    if (group_obj.entities)
      rendering_order = appendArrays(rendering_order, group_obj.entities);

    //Render all subgroups next
    if (group_obj.subgroups)
      for (var i = 0; i < group_obj.subgroups.length; i++) {
        var local_subgroup = (options.layer) ?
          window[`${options.layer}_groups`][group_obj.subgroups[i]] :
          getGroup(group_obj.subgroups[i]);
        var new_options = JSON.parse(JSON.stringify(options));

        rendering_order = appendArrays(rendering_order, getGroupRenderingOrder(local_subgroup, new_options));
      }

    //Return statement
    return rendering_order;
  }

  /*
    getLayerRenderingOrder() - Renders polities within a layer.
    options: {
      return_objects: true/false - Whether to return entity objects instead. False by default
    }
  */
  function getLayerRenderingOrder (arg0_layer, arg1_options) {
    //Convert from parameters
    var layer = arg0_layer;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var layer_groups = window[`${layer}_groups`];
    var rendering_order = [];
    var ungrouped_entities = getUngroupedEntities(layer);

    var all_layer_groups = Object.keys(layer_groups);

    //Iterate over layer_groups and start only with surface groups
    for (var i = 0; i < all_layer_groups.length; i++) {
      var local_group = layer_groups[all_layer_groups[i]];

      if (!local_group.parent_group)
        rendering_order = appendArrays(rendering_order, getGroupRenderingOrder(local_group, { layer: layer }));
    }

    //Append ungrouped_entities to end of rendering order
    if (ungrouped_entities.length > 0)
      rendering_order = appendArrays(rendering_order, ungrouped_entities);

    //Entity object handling
    if (options.return_objects) {
      var new_rendering_order = [];

      for (var i = 0; i < rendering_order.length; i++)
        new_rendering_order.push(getEntity(rendering_order[i]));

      rendering_order = new_rendering_order;
    }

    //Return statement
    return rendering_order;
  }
}

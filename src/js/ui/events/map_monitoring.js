//Add event listeners
map.on("zoomend", function (e) {
  //Declare local instance variables
  var brush_obj = main.brush;
  var local_render_order = getHierarchyRenderingOrder({ exclude_selection: true });
  var zoom_level = e.target._zoom;

  //Renders need to happen in local_render_order; so iterate over that instead
  for (var i = 0; i < local_render_order.length; i++) {
    var local_entity = getEntity(local_render_order[i]);

    if (local_entity) {
      updateEntityVisibility(local_render_order[i]);
    } else {
      console.log(`Entity object:`, getEntity(local_render_order[i]));
      console.warn(`${local_render_order[x]} is bugged out as an entity. Please check the savefile for malformed data structures.`);
    }
  }
});

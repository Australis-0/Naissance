//Initialise Sidebar functions
{
  function initSidebar () {
    var hierarchy_el = document.getElementById("hierarchy");

    initHierarchy(hierarchy_el, "hierarchy", {
      create_new_group_selector: `#hierarchy-create-new-group`,
      context_menu_selector: `#hierarchy-context-menu, #hierarchy-context-menu-two`,

      context_menu_function: "handleSidebarContextMenu"
    });
  }
}

//Sidebar UI functions
{
  /*
    onSidebarDragEnd() - Handles the end of a drag event in a nested sortable hierarchy.
    arg0_event: (Object) - The event object from the drag event.

    Returns: (undefined)
  */
  function onSidebarDragEnd(arg0_event) {
    //Convert from parameters
    var e = arg0_event;

    //Declare local instance variables
    var element_id, old_index, new_index, group_children;
    var element_obj = e.item;
    var target_obj = e.to;
    var target_id, target_parent, subgroups_el, entities_el, group_element, group_obj, selector;

    //Guard clauses
    if (!element_obj || !target_obj) return;

    if (target_obj.id === "hierarchy") {
      e.from.append(element_obj);
      return;
    }

    // Determine the nesting levels
    var target_nesting_level = parseInt(target_obj.getAttribute("data-nesting-level"), 10) || 0;
    var element_nesting_level = parseInt(element_obj.getAttribute("data-nesting-level"), 10) || 0;

    // Adjust the nesting level and padding based on the drop target
    element_obj.setAttribute("data-nesting-level", target_nesting_level + 1);
    element_obj.style.paddingLeft = `${(target_nesting_level + 1) * 20}px`;

    // Ensure target_id is properly defined
    target_id = target_obj.getAttribute("id") || "";
    target_parent = target_obj.parentElement;

    // Handle group dragging
    if (element_obj.getAttribute("class") && element_obj.getAttribute("class").includes("group"))
      if (!target_id.includes("-subgroups"))
        try {
          subgroups_el = target_obj.querySelector(`[id='${target_id}-subgroups']`);

          (subgroups_el) ?
            subgroups_el.appendChild(element_obj) :
            target_obj.appendChild(element_obj);
        } catch (error) {
          target_obj.appendChild(element_obj);
        }

    //Handle entity dragging
    if (element_obj.getAttribute("class") && element_obj.getAttribute("class").includes("entity")) {
      entities_el = target_obj.querySelector(`[id='${target_id}-entities']`) ||
        target_parent.querySelector(`[id='${target_parent.id}-entities']`);

      (entities_el) ?
        entities_el.appendChild(element_obj) :
        target_obj.appendChild(element_obj);
    }

    //Update group and entity belonging
    element_id = element_obj.id;
    group_element = element_obj.closest('.group');

    if (group_element) {
      group_obj = getGroup("hierarchy", group_element.id);
      selector = "";

      if (element_obj.getAttribute("class").includes("entity")) {
        moveEntityToGroup("hierarchy", element_id, group_element.id);
        selector = "entities";
      }
      if (element_obj.getAttribute("class").includes("group")) {
        moveGroupToGroup("hierarchy", element_id, group_element.id);
        selector = "subgroups";
      }

      if (group_obj) {
        group_children = Array.from(element_obj.parentElement.children);
        old_index = group_obj[selector].indexOf(element_id);
        new_index = group_children.indexOf(element_obj);

        moveElement(group_obj[selector], old_index, new_index);
      }
    }
  }

  function refreshSidebar (arg0_do_not_refresh) {
    //Convert from parameters
    var do_not_refresh = arg0_do_not_refresh;

    //Declare local instance variables
    var brush_obj = main.brush;
    var sidebar_el = document.getElementById("hierarchy");

    //Reset HTML
    if (!do_not_refresh)
      sidebar_el.innerHTML = "";

    //Create all layer elements
    for (var i = 0; i < main.all_layers.length; i++) {
      var layer_el = sidebar_el.querySelectorAll(`[id='${main.all_layers[i]}']`);

      //Create a new layer container element if only if it doesn't already exist
      if (layer_el.length == 0) {
        var local_header_el = document.createElement("input");
        var local_layer_el = document.createElement("div");

        local_layer_el.setAttribute("id", main.all_layers[i]);
        local_layer_el.setAttribute("class", "layer");
        local_layer_el.setAttribute("onclick", `selectLayer(document.querySelector("${config.ui.hierarchy}"), '${main.all_layers[i]}');`);

        //Append header
        local_header_el.setAttribute("class", "layer-input");

        local_header_el.value = main.all_layers[i];
        local_layer_el.appendChild(local_header_el);

        //Append to sidebar_el
        sidebar_el.appendChild(local_layer_el);
      }
    }

    //Iterate over all window.layers
    for (var i = 0; i < main.all_layers.length; i++) {
      var local_groups = main.groups[main.all_layers[i]];
      var local_layer = main.layers[main.all_layers[i]];
      var local_layer_el = sidebar_el.querySelector(`[id='${main.all_layers[i]}']`);

      //Init layer
      initHierarchyLayer("hierarchy", main.all_layers[i], {
        load_groups: local_groups,
        load_layer: local_layer,

        layer_is_leaflet_array: true
      });

      var all_local_groups = Object.keys(local_groups);
      var first_layer_groups = [];
      var ungrouped_entities = getUngroupedEntities("hierarchy", main.all_layers[i]);

      //Check for first layer groups
      for (var x = 0; x < all_local_groups.length; x++) {
        var local_group = local_groups[all_local_groups[x]];

        //Check if local_group has parent_group. If not, this is a first layer group
        if (!local_group.parent_group)
          first_layer_groups.push(all_local_groups[x]);
      }

      //Initialise first layer group HTML with entities
      for (var x = 0; x < first_layer_groups.length; x++) {
        var local_group_el = getRecursiveGroupElement("hierarchy", main.all_layers[i], first_layer_groups[x]);

        if (!local_layer_el.querySelector(`[id='${first_layer_groups[x]}']`))
          local_layer_el.appendChild(local_group_el);
      }

      //Append ungrouped entities to end of list
      for (var x = 0; x < ungrouped_entities.length; x++) {
        var local_entity_el = createEntityElement(main.all_layers[i], ungrouped_entities[x]);

        if (!local_layer_el.querySelector(`[id='${ungrouped_entities[x]}']`))
          local_layer_el.appendChild(local_entity_el);
      }
    }

    //Make sidebar draggable
    var all_listings = document.querySelectorAll("#hierarchy div");

    for (var i = 0; i < all_listings.length; i++)
      Sortable.create(all_listings[i], {
        animation: 350,
        group: {
          name: "hierarchy",
          pull: true,
          put: true
        },
        fallbackOnBody: true,
        swapThreshold: 0.50,

        onEnd: function (e) {
          onSidebarDragEnd(e);
        }
      });

    Sortable.create(sidebar_el, {
      animation: 350,
      group: {
        name: "hierarchy",
        pull: true,
        put: true
      },
      fallbackOnBody: true,
      swapThreshold: 0.50,

      onEnd: function (e) {
        onSidebarDragEnd(e);
      }
    });

    //Select current selected layer
    selectLayer(sidebar_el, brush_obj.selected_layer);
  }
}

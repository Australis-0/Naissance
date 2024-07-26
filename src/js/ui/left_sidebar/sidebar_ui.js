//Initialise Sidebar functions
{
  function initSidebarUI () {
    var hierarchy_el = document.getElementById("hierarchy");

    initHierarchy(hierarchy_el, "hierarchy", {
      create_new_group_selector: `#hierarchy-create-new-group`,
      context_menu_selector: `#hierarchy-context-menu, #hierarchy-context-menu-two`,

      context_menu_function: "handleSidebarContextMenu"
    });
    initialiseSidebarEvents();
  }
}

//Sidebar UI functions
{
  function initialiseSidebarEvents () {
    //Declare local instance variables
    var dragged;
    var hierarchy_el = getUISelector("hierarchy");

    //Function body
    var placeholder = document.createElement("div");
    placeholder.className = "placeholder";

    //DragStart handler on placeholder
    hierarchy_el.addEventListener("dragstart", function (e) {
      dragged = e.target;
      e.target.style.opacity = 0.8;
    });

    //DragEnd handler on placeholder
    hierarchy_el.addEventListener("dragend", function (e) {
      e.target.style.opacity = "";
      if (placeholder.parentNode)
        placeholder.parentNode.removeChild(placeholder);
    });

    //DragOver handler for groups and entities
    hierarchy_el.addEventListener("dragover", function (e) {
      e.preventDefault();
      var target = e.target;

      //Check to make sure target is valid
      if (target.className == "group" || target.className == "entity" || target.className == "hierarchy") {
        var rect = target.getBoundingClientRect();
        var offset = e.clientY - rect.top;

        (offset > rect.height/2) ?
          target.parentNode.insertBefore(placeholder, target.nextSibling) :
          target.parentNode.insertBefore(placeholder, target);
      }
    });

    //Drop handler for groups and entities
    hierarchy_el.addEventListener("drop", function (e) {
      e.preventDefault();
      var dragged_hierarchy = getHierarchyID(dragged);
      var dragged_type = dragged.dataset.type;
      var target = e.target;
      var target_hierarchy = getHierarchyID(target);

      //Guard clause; prevent cross-contamination between hierarchies
      if (target_hierarchy != dragged_hierarchy) return;

      //Group/entity/base-hierarchy handling
      if (target.className == "group") {
        if (dragged_type == "group" || dragged_type == "entity") {
          dragged.parentNode.removeChild(dragged);
          target.appendChild(dragged);
        }
      } else if (target.className == "entity" && dragged_type == "entity" && placeholder.parentNode) {
        //Only allow entities to be dropped before or after other entities, not inside them
        dragged.parentNode.removeChild(dragged);
        placeholder.parentNode.replaceChild(dragged, placeholder);
      } else if (target.className == "hierarchy") {
        dragged.parentNode.removeChild(dragged);

        //Check to see dragged_type
        if (dragged_type == "group") {
          insertGroupAtTop(target, dragged);
        } else if (dragged_type == "entity") {
          insertEntityAtBottom(target, dragged);
        }

        if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      }
    });
  }

  function insertEntityAtBottom (arg0_container_el, arg1_entity_el) {
    //Convert from parameters
    var container_el = arg0_container_el;
    var entity_el = arg1_entity_el;

    //Attempt to append child at end
    container.appendChild(entity_el);
  }

  function insertGroupAtTop (arg0_container_el, arg1_group_el) { //[WIP] - Add controls bar later
    //Convert from parameters
    var container_el = arg0_container_el;
    var group_el = arg1_group_el;

    container.prepend(group);
  }

  function refreshSidebar (arg0_do_not_refresh) {
    //Convert from parameters
    var do_not_refresh = arg0_do_not_refresh;

    //Declare local instance variables
    var brush_obj = main.brush;
    var sidebar_el = getUISelector("hierarchy");

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
        local_layer_el.setAttribute("onclick", `selectLayer(document.querySelector("${config.ui.hierarchy_container}"), '${main.all_layers[i]}');`);

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
          //onSidebarDragEnd(e);
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

//Hierarchies - Requires Sortable.js to function.

//Initialise Sidebar functions
{
  /*
    initHierarchy() - Initialises a hierarchy within a given HTMLElement.
    arg0_element: (HTMLElement) - The context menu element representing the hierarchy.
    arg1_hierarchy_key: (HTMLElement) - The subcontext menu for the hierarchy to open/close, if it exists
    arg2_options: (Object)
      create_new_group_selector: (String) - The query selector of the 'Create New Group' button
      context_menu_selectors: (Array<String>) - An array of given context menu query selectors to handle
      global_selectors: (Boolean)
  */
  function initHierarchy (arg0_hierarchy_el, arg1_hierarchy_key, arg2_options) {
    //Convert from parameters
    var hierarchy_el = arg0_hierarchy_el;
    var hierarchy_key = arg1_hierarchy_key;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise variables
    if (!global.main) global.main = {};
    if (!global.main.hierarchies) global.main.hierarchies = {};
    if (!global.main.hierarchies[hierarchy_key])
      global.main.hierarchies[hierarchy_key] = {
        hierarchy_el: hierarchy_el,
        groups: {},
        layers: {}
      };

    //Declare local instance variables
    var hierarchies_obj = global.main.hierarchies;
    var hierarchy_obj = hierarchies_obj[hierarchy_key];

    //Button handlers for hierarchy_el
    var create_new_group_el = (options.create_new_group_selector) ?
      options.create_new_group_selector :
      hierarchy_el.querySelector(`#hierarchy-create-new-group`);

    create_new_group_el.onclick = function () {
      createGroup();
    };


    //Context menu handling for hierarchy
    if (options.context_menu_selectors)
      hierarchy_el.onclick = function (e) {
        if (
          !arrayHasElementAttribute(e.composedPath(), "id", "hierarchy-context-menu") &&
          !arrayHasElementAttribute(e.composedPath(), "class", "group-context-menu-icon")
        )
          closeHierarchyContextMenus(hierarchy_el, options.context_menu_selectors, {
            global_selectors: options.global_selectors
          });
      };
  }
}

//Hierarchy Context Menu UI functions
{
  /*
    closeHierarchyContextMenus() - Closes multiple hierarchy context menus depending on selectors.
    arg0_hierarchy_el: (HTMLElement) - The element containing the hierarchy.
    arg1_context_menu_selectors: (Array<String>) - The array of context menu selectors which to handle.
    arg2_options: (Object)
      global_selectors: (Boolean)
  */
  function closeHierarchyContextMenus (arg0_hierarchy_el, arg1_context_menu_selectors, arg2_options) {
    //Convert from parameters
    var hierarchy_el = arg0_hierarchy_el;
    var context_menu_selectors = arg1_context_menu_selectors;
    var options = (arg2_options) ? arg2_options : {};

    //Close context menus by iterating over context_menu_selectors
    for (var i = 0; i < context_menu_selectors.length; i++) {
      var local_context_el;

      local_context_el = (options.global_selectors) ?
        hierarchy_el.querySelector(context_menu_selectors[i]) :
        document.querySelector(context_menu_selectors[i]);

      //Close context menu
      if (!local_context_el.getAttribute("class").includes("display-none"))
        local_context_el.setAttribute("class",
          local_context_el.getAttribute("class") + " display-none"
        );
      local_context_el.removeAttribute("group");
    }
  }
}

//Sidebar UI functions
{
  /*
    changeEntityName() - Changes an entity name in a hierarchy.
  */
  function changeEntityName (arg0_hierarchy_key, arg1_element) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var element = arg1_element;

    //Declare local instance variables
    var entity_id = element.parentElement.id;
    var entity_obj = getEntityInHierarchy(hierarchy_key, entity_id);

    //Set name
    if (entity_obj._latlngs) {
      if (entity_obj.options)
        setEntityNameFromInput(entity_id, element);
    } else {
      entity_obj.name = element.innerText;
    }
  }

  /*
    createEntityElement() - Creates and returns an entity element.
    arg0_hierarchy_key: (Object) - The hierarchy key to reference.
    arg1_options: (Object)
      id: (String)
      name: (String)

      information_el: (HTMLElement)
      is_hidden: (Boolean)
      selected_entities: (Array<String>)

      onkeyup_function: (Function)
  */
  function createEntityElement (arg0_hierarchy_key, arg1_options) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.selected_entities) options.selected_entities = [];

    //Declare local instance variables
    var entity_id = options.id;
    var entity_name = options.name;
    var header_el = document.createElement("input");
    var is_hidden = options.is_hidden;
    var local_el = document.createElement("div");
    var selected_entities = (options.selected_entities) ? options.selected_entities : [];

    var entity_class = `entity${(selected_entities.includes(entity_id)) ? " selected" : ""}`;

    //Initialise local instance variables
    if (is_hidden)
      entity_class += ` extinct`;

    local_el.setAttribute("class", entity_class);
    local_el.setAttribute("id", entity_id);

    if (options.onkeyup_function) {
      header_el.setAttribute("onkeyup", options.onkeyup_function);
    } else {
      header_el.setAttribute("onkeyup", `changeEntityName("${hierarchy_key}", this);`);
    }
    header_el.value = entity_name;

    //Append all formatted elements
    local_el.appendChild(header_el);
    local_el.onclick = function (e) {
      editHierarchyElement(e);

      if (window.ctrl_pressed)
        if (!selected_entities.includes(entity_id)) {
          selected_entities.push(entity_id);
        } else {
          //Remove from selection
          for (var i = 0; i < selected_entities.length; i++)
            if (selected_entities[i] == entity_id)
              selected_entities.splice(i, 1);
        }

      //Append class if selected, remove selected class if not
      if (selected_entities.includes(entity_id)) {
        if (!local_el.getAttribute("class").includes("selected"))
          local_el.setAttribute("class", `${local_el.getAttribute("class")} selected`);
      } else {
        local_el.setAttribute("class", local_el.getAttribute("class").replace(" selected", ""));
      }

      //Update sidebar selection information last
      if (options.information_el)
        updateHierarchySelectionInformation(options.information_el, options);
    };

    //Return statement
    return local_el;
  }

  /*
    createGroupElement() - Creates a group element and returns it as part of a hierarchy.
    arg0_hierarchy_key: (String) - The hierarchy key to reference.
    arg1_layer: (String) - The layer name.
    arg2_group_id: (String) - The Group ID to reference.

    Returns: (HTMLElement)
  */
  function createGroupElement (arg0_hierarchy_key, arg1_layer, arg2_group_id) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var layer = arg1_layer;
    var group_id = arg2_group_id;

    //Declare local instance variables
    var ctx_menu_el = document.createElement("img");
    var group_class = `group`;
    var header_el = document.createElement("input");
    var hierarchy_obj = main.hierarchies[hierarchy_key];
    var local_el = document.createElement("div");
    var local_entities_el = document.createElement("div");
    var local_groups = hierarchy_obj.groups[layer];
    var local_layer = hierarchy_obj.layers[layer];
    var local_subgroups_el = document.createElement("div");

    var groups_obj = hierarchy_obj.groups[layer];
    var group_obj = groups_obj[group_id];

    //Initialise local instance variables
    {
      if (group_obj)
        if (group_obj.mask)
          group_class += ` mask-${group_obj.mask}`;
    }

    //Set element formatting
    ctx_menu_el.setAttribute("class", "group-context-menu-icon");
    ctx_menu_el.setAttribute("draggable", "false");
    ctx_menu_el.setAttribute("src", "./gfx/interface/context_menu_icon.png");
    ctx_menu_el.setAttribute("onclick", `toggleHierarchyContextMenu("#${hierarchy_key}", "${group_id}", "#hierarchy-context-menu");`); //[WIP]

    local_el.setAttribute("class", group_class);
    local_el.setAttribute("id", group_id);
    local_el.setAttribute("onmouseout", "updateSidebarHover();");
    local_el.setAttribute("onmouseover", "updateSidebarHover();");

    local_entities_el.setAttribute("id", `${group_id}-entities`);
    local_entities_el.setAttribute("class", `entities`);
    local_subgroups_el.setAttribute("id", `${group_id}-subgroups`);
    local_subgroups_el.setAttribute("class", `subgroups`);

    //Make sure local_group exists
    if (group_obj) {
      //Add header_el to local_el
      header_el.setAttribute("onkeyup", `updateAllGroups("${hierarchy_key}", true);`);
      header_el.value = group_obj.name;

      //Append all entities
      if (group_obj.entities)
        for (var i = 0; i < group_obj.entities.length; i++)
          try {
            var local_entity = getEntityInLayer(hierarchy_key, layer, group_obj.entities[i]);
            var local_entity_name;

            //Initialise local_entity parameters
            if (local_entity)
              if (local_entity.options)
                local_entity_name = (local_entity.options.entity_name) ? local_entity.options.entity_name : "Unnamed Entity";

            local_entities_el.appendChild(
              createEntityElement(hierarchy_key,  {
                id: group_obj.entities[i],
                name: local_entity_name
              })
            );
          } catch (e) {
            console.warn(e);
          }

      //Append local_subgroups_el, local_entities_el to local_el
      local_el.appendChild(header_el);
      local_el.appendChild(ctx_menu_el);

      local_el.appendChild(local_subgroups_el);
      local_el.appendChild(local_entities_el);

      local_el.onclick = function (e) {
        editHierarchyElement(e);
      };

      //Return statement
      return local_el;
    }
  }

  /*
    editHierarchyElement() - Handles editing hierarchy elements.
    arg0_e: (Event, Click)
  */
  function editHierarchyElement (arg0_e) {
    //Convert from parameters
    var e = arg0_e;

    //Declare local instance variables
    var context_menu_clicked = false;
    var name_field_el = document.querySelectorAll(`div:hover > input`);

    if (e.composedPath())
      if (e.composedPath()[0].getAttribute("class"))
        if (e.composedPath()[0].getAttribute("class").includes("context-menu-icon"))
          context_menu_clicked = true;

    if (name_field_el.length > 0 && !context_menu_clicked)
      name_field_el[name_field_el.length - 1].focus();
  }

  /*
    generateHierarchyGroupID() - Generates a random hierarchy group ID.
    arg0_hierarchy_el: (HTMLElement)

    Returns: (String)
  */
  function generateHierarchyGroupID (arg0_hierarchy_el) {
    //Convert from parameters
    var hierarchy_el = arg0_hierarchy_el;

    //While loop to find ID, just in-case of conflicting random ID's:
    while (true) {
      var id_taken = false;
      var local_id = generateRandomID();

      //Check to see if ID is already taken in sidebar
      var identical_groups_el = hierarchy_el.querySelectorAll(`[id='${local_id}']`);

      if (identical_groups_el.length == 0) {
        return local_id;
        break;
      }
    }
  }

  function getEntityID (arg0_hierarchy_key, arg1_layer, arg2_entity_obj) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var layer = arg1_layer;
    var entity_obj = arg2_entity_obj;

    //Check if entity_obj is of a Leaflet type
    if (entity_obj._latlngs) {
      if (entity_obj.options.className)
        return entity_obj.options.className;
    } else {
      if (entity_obj.id)
        return entity_obj.id;
    }
  }

  function getEntityInHierarchy (arg0_hierarchy_key, arg1_entity_id) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var entity_id = arg1_entity_id;

    //Declare local instance variables
    var hierarchy_obj = main.hierarchies[hierarchy_key];

    var all_hierarchy_layers = Object.keys(hierarchy_obj.layers);

    //Iterate over all_hierarchy_layers
    for (var i = 0; i < all_hierarchy_layers.length; i++) {
      var local_entity = getEntityInLayer(hierarchy_key, all_hierarchy_layers[i], entity_id);

      if (local_entity)
        return local_entity;
    }
  }

  function getEntityInLayer (arg0_hierarchy_key, arg1_layer, arg2_entity_id) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var layer = arg1_layer;
    var entity_id = arg2_entity_id;

    //Declare local instance variables
    var hierarchy_obj = main.hierarchies[hierarchy_key];
    var local_layer = hierarchy_obj.layers[layer];

    if (Array.isArray(local_layer)) {
      for (var i = 0; i < local_layer.length; i++)
        if (local_layer[i]._latlngs) {
          //Leaflet handler
          if (local_layer[i].options.className == entity_id)
            return local_layer[i];
        } else {
          //Non-leaflet handler
          if (local_layer[i].id == entity_id)
            return local_layer[i];
        }
    } else {
      //Return statement
      return local_layer[entity_id];
    }
  }

  /*
    getRecursiveGroupElement() - Fetches a group element recursively, within a given subgroup (1st-order)
    arg0_hierarchy_key: (String) - The hierarchy key to reference.
    arg1_layer: (String) - The layer which to search for the recursive group element.
    arg2_group_id: (String)
    arg3_group_el: (HTMLElement) - Optional. Will create a new group element by default.

    Returns: (HTMLElement)
  */
  function getRecursiveGroupElement (arg0_hierarchy_key, arg1_layer, arg2_group_id, arg3_group_el) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var layer = arg1_layer;
    var group_id = arg2_group_id;
    var group_el = (arg3_group_el) ? arg3_group_el : createGroupElement(hierarchy_key, layer, group_id);

    //Declare local instance variables
    var hierarchy_obj = main.hierarchies[hierarchy_key];
    var local_groups = hierarchy_obj.groups[layer];

    var all_local_groups = Object.keys(local_groups);
    var local_group = local_groups[group_id];

    //Only keep going if group has subgroups
    if (local_group)
      if (local_group.subgroups)
        if (local_group.subgroups.length > 0)
        for (var i = 0; i < local_group.subgroups.length; i++) {
          var local_subgroup = local_groups[local_group.subgroups[i]];
          var local_subgroup_el = getRecursiveGroupElement(hierarchy_key, layer, local_group.subgroups[i]);

          //Append everything else
          if (local_subgroup_el)
            group_el.querySelector(`[id='${group_id}-subgroups']`).appendChild(local_subgroup_el);
        }

    //Return statement
    return group_el;
  }

  /*
    getUngroupedEntities() - Fetches ungrouped entities for a given layer in a hierarchy.
    arg0_hierarchy_key: (String) - The hierarchy key to reference.
    arg1_layer: (String)

    Returns: (Array<String>)
  */
  function getUngroupedEntities (arg0_hierarchy_key, arg1_layer) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var layer = arg1_layer;

    //Declare local instance variables
    var grouped_entities = [];
    var hierarchy_obj = main.hierarchies[hierarchy_key];
    var local_groups = hierarchy_obj.groups[layer];
    var local_layer = hierarchy_obj.layers[layer];
    var ungrouped_entities = [];

    //Iterate over all_local_groups to push to grouped_entities
    var all_local_groups = Object.keys(local_groups);

    for (var i = 0; i < all_local_groups.length; i++) {
      var local_group = local_groups[all_local_groups[i]];

      if (local_group.entities)
        for (var x = 0; x < local_group.entities.length; x++)
          if (!grouped_entities.includes(local_group.entities[x]))
            grouped_entities.push(local_group.entities[x]);
    }

    //Iterate over all local_layer elements, check against grouped_entities
    if (layer)
      for (var i = 0; i < local_layer.length; i++)
        if (!grouped_entities.includes(local_layer[i].name))
          ungrouped_entities.push(
            getEntityID(hierarchy_key, layer, local_layer[i])
          );

    //Return statement
    return ungrouped_entities;
  }

  /*
    initHierarchyLayer() - Initialises a hierarchy layer.
    arg0_hierarchy_key: (String)
    arg1_layer: (String)
    arg2_options: (Object)
      load_layer: (Object)
      load_groups: (Object)

      layer_is_leaflet_array: (Boolean)
  */
  function initHierarchyLayer (arg0_hierarchy_key, arg1_layer, arg2_options) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var layer = arg1_layer;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var hierarchy_obj = main.hierarchies[hierarchy_key];

    //Add to hierarchy_obj
    if (!hierarchy_obj.groups[layer])
      hierarchy_obj.groups[layer] = {};

      if (options.load_groups)
        hierarchy_obj.groups[layer] = options.load_groups;
    if (!hierarchy_obj.layers[layer])
      hierarchy_obj.layers[layer] = {};

      if (options.layer_is_leaflet_array)
        hierarchy_obj.is_leaflet = true;
      if (options.load_layer)
        hierarchy_obj.layers[layer] = options.load_layer;
  }

  /*
    onHierarchyDragEnd() - Handles local dragend events for a hierarchy element. Internal reference function.
    arg0_event: (Event, DragEnd)
  */
  function onHierarchyDragEnd (arg0_event) {
    //Convert from parameters
    var e = arg0_event;

    //Declare local instance variables
    var element_obj = e.item;
    var target_obj = e.to;

    //Make sure element_obj isn't being moved into hierarchy
    if (target_obj.id != "hierarchy") {
      //Check for dragged element class type
      if (target_obj.getAttribute("class")) {
        var target_id = target_obj.getAttribute("id");
        var target_parent = target_obj.parentElement;

        //Improper group location handling
        if (element_obj.getAttribute("class").includes("group"))
          //Move to subgroups if the element is not already there
          if (!target_id.includes("-subgroups")) {
            try {
              var subgroups_el = target_obj.querySelector(`[id='${target_id}-subgroups']`);

              //Make sure we're after the layer header field
              if (element_obj.nextElementSibling.getAttribute("class").includes("layer-input")) {
                target_obj.querySelector(".layer > input").after(element_obj);
              } else {
                var properly_moved = false;

                //Make sure to before/prepend since we're dealing with groups
                if (target_obj && !target_obj.getAttribute("class").includes("layer")) {
                    target_obj.before(element_obj);

                    properly_moved = true;
                  }

                //If a subgroups element was detected, we should be inside a group container - prepend to subcontainer instead
                if (subgroups_el && !properly_moved)
                  if (subgroups_el.id.includes("-subgroups"))
                    subgroups_el.prepend(element_obj);
              }
            } catch {
              //Now we know we're inside of an entity (improper location)
              var subgroups_el = target_obj.parentElement;
              var properly_moved = false;
              var test_el = target_obj.parentElement;

              //Layer case handling
              if (target_obj.getAttribute("class").includes("layer")) {
                var all_ungrouped_entities = target_obj.querySelectorAll(".layer > .entity");

                (all_ungrouped_entities.length > 0) ?
                  all_ungrouped_entities[0].before(element_obj) :
                  target_obj.append(element_obj);

                properly_moved = true;
              }

              if (!properly_moved) {
                //First-layer case handling
                if (subgroups_el.id != "hierarchy") {
                  subgroups_el = subgroups_el.parentElement;
                  test_el = subgroups_el.querySelector(`[id='${subgroups_el.id}-subgroups']`);
                }

                //Append instead of prepend since entities go last
                target_obj.append(element_obj);
              }
            }

            //Postmortem test
            {
              var element_parent = element_obj.parentElement;

              //Entity handling
              if (element_parent.getAttribute("class").includes("entity")) {
                //Move it out of the entity div first
                element_parent.before(element_obj);
              }

              //Group handling
              if (
                !element_parent.getAttribute("class").includes("-subgroups") &&
                element_parent.getAttribute("class").includes("group")
              ) {
                var subgroups_el = element_parent.querySelector(".subgroups");

                if (subgroups_el)
                  try {
                    subgroups_el.append(element_obj);
                  } catch {}
              }

              //Keep moving it upwards until it's finally above all the entities
              while (true) {
                //Recursive immediate sibling entity testing
                var keep_moving = false;
                var previous_sibling = element_obj.previousSibling;

                if (previous_sibling)
                  if (previous_sibling.getAttribute("class").includes("entity")) {
                    previous_sibling.before(element_obj);

                    keep_moving = true;
                  }

                if (!keep_moving)
                  break;
              }
            }
          }

        //Improper entity location handling
        if (element_obj.getAttribute("class").includes("entity"))
          if (!target_id.includes("-entities")) {
            var entities_el = target_parent.querySelector(`[id='${target_id}-entities']`);

            if (!entities_el)
              entities_el = target_parent.querySelector(`[id='${target_parent.id}-entities']`);

            (target_id != "hierarchy" && entities_el) ?
              entities_el.append(element_obj) :
              target_obj.append(element_obj);
          }
      }

      //Update group and entity belonging by checking parent
      {
        var element_id = element_obj.id;
        var group_element = element_obj.parentElement.parentElement;
        var group_obj = getGroup(element_id);
        var selector = "";

        //Entity handling
        if (element_obj.getAttribute("class").includes("entity")) {
          moveEntityToGroup(element_id, group_element.id);
          selector = "entities";
        }
        if (element_obj.getAttribute("class").includes("group")) {
          moveGroupToGroup(element_id, group_element.id);
          selector = "subgroups";
        }

        //Only reorganise elements if this is being moved within an actual group
        if (group_obj) {
          var group_children = Array.from(element_obj.parentElement.children);
          var old_index = group_obj[selector].indexOf(element_id);
          var new_index = group_children.indexOf(element_obj);

          //Move element within selector
          moveElement(group_obj[selector], old_index, new_index);
        }
      }
    } else {
      e.from.append(element_obj);
    }
  }

  /*
    refreshHierarchy() - Reloads the current DOM of a hierarchy element.
    arg0_hierarchy_el: (HTMLElement)
    arg1_hierarchy_key: (String) - The hierarchy key to reference.
    arg2_do_not_refresh: (Boolean)
  */
  function refreshHierarchy (arg0_hierarchy_el, arg1_hierarchy_key, arg2_do_not_refresh) {
    var hierarchy_el = arg0_hierarchy_el;
    var hierarchy_key = arg1_hierarchy_key;
    var do_not_refresh = arg2_do_not_refresh;

    //Declare local instance variables
    var hierarchy_obj = main.hierarchies[hierarchy_key];

    var all_layers = Object.keys(hierarchy_obj.layers);

    //Reset HTML
    if (!do_not_refresh)
      hierarchy_el.innerHTML = "";

    //Create all layer elements
    for (var i = 0; i < all_layers.length; i++) {
      var local_groups = hierarchy_obj.groups[all_layers[i]];
      var local_layer = hierarchy_obj.layers[all_layers[i]];
      var local_layer_el = sidebar_el.querySelector(`[id='${all_layers[i]}']`);

      var all_local_groups = Object.keys(local_groups);
      var first_layer_groups = [];
      var ungrouped_entities = getUngroupedEntities(all_layers[i]);

      //Check for first layer groups
      for (var x = 0; x < all_local_groups.length; x++) {
        var local_group = local_groups[all_local_groups[x]];

        //Check if local_group has parent_group. If not, this is a first layer group
        if (!local_group.parent_group)
          first_layer_groups.push(all_local_groups[x]);
      }

      //Initialise first layer group HTML with entities
      for (var x = 0; x < first_layer_groups.length; x++) {
        var local_group_el = getRecursiveGroupElement(all_layers[i], first_layer_groups[x]);

        if (!local_layer_el.querySelector(`[id='${first_layer_groups[x]}']`))
          local_layer_el.appendChild(local_group_el);
      }

      //Append ungrouped entities to end of list
      for (var x = 0; x < ungrouped_entities.length; x++) {
        var local_entity_el = createEntityElement(all_layers[i], ungrouped_entities[x]);

        if (!local_layer_el.querySelector(`[id='${ungrouped_entities[x]}']`))
          local_layer_el.appendChild(local_entity_el);
      }
    }

    //Make sidebar draggable
    var all_listings = hierarchy_el.querySelectorAll("div");

    for (var i = 0; i < all_listings.length; i++)
      Sortable.create(all_listings[i], {
        animation: 350,
        group: hierarchy_key,
        fallbackOnBody: true,
        swapThreshold: 0.65,

        onEnd: function (e) {
          onHierarchyDragEnd(e);
        }
      });

    Sortable.create(hierarchy_el, {
      animation: 350,
      group: hierarchy_key,
      fallbackOnBody: true,
      swapThreshold: 0.65,

      onEnd: function (e) {
        onHierarchyDragEnd(e);
      }
    });
  }

  /*
    selectLayer() - Selects a layer in a given hierarchy_el.
    arg0_hierarchy_el: (HTMLElement)
    arg1_layer: (String)
  */
  function selectLayer (arg0_hierarchy_el, arg1_layer) {
    //Convert from prameters
    var hierarchy_el = arg0_hierarchy_el;
    var layer = arg1_layer;

    //Declare local instance variables
    var all_selected_layers = hierarchy_el.querySelectorAll(`.layer.selected`);
    var selected_layer = hierarchy_el.querySelectorAll(`[id='${layer}']`);

    //Deselect all currently selected layers
    for (var i = 0; i < all_selected_layers.length; i++)
      all_selected_layers[i].setAttribute("class",
        all_selected_layers[i].getAttribute("class").replace(" selected", "")
      );

    //Select current layer
    if (selected_layer.length > 0) {
      selected_layer[0].setAttribute("class",
        selected_layer[0].getAttribute("class") + " selected"
      );
      selected_layer = layer;
    }
  }

  /*
    toggleHierarchyContextMenu() - Toggles hierarchy context menus based on their context selector.
    arg0_hierarchy_el: (HTMLElement)
    arg1_group_id: (String)
    arg2_context_selector: (String)
    arg3_function: (Function) - Optional.
  */
  function toggleHierarchyContextMenu (arg0_hierarchy_el, arg1_group_id, arg2_context_selector, arg3_function) {
    //Convert from parameters
    var hierarchy_el = arg0_hierarchy_el;
    var group_id = arg1_group_id;
    var context_selector = arg2_context_selector;
    var local_function = arg3_function;

    //hierarchy_el string handler
    if (typeof hierarchy_el == "string")
      hierarchy_el = document.querySelector(hierarchy_el);

    //Declare local instance variables
    var context_menu_els = document.querySelectorAll(context_selector);
    var group_el = hierarchy_el.querySelector(`div.group[id="${group_id}"]`);
    var offset_top = group_el.offsetTop - hierarchy_el.scrollTop;

    //Iterate over all context_menu_els
    for (var i = 0; i < context_menu_els.length; i++)
      if (context_menu_els[0].getAttribute("class").includes("display-none"))
        context_menu_els[0].setAttribute("class",
          context_menu_els[0].getAttribute("class")
            .replace(" instant-display-none", "")
            .replace(" display-none", "")
        );
    context_menu_els[0].style.top = `${offset_top}px`;

    //Apply function
    if (local_function)
      local_function(context_menu_el);
  }

  /*
    updateAllGroups() - Updates all groups in a given hierarchy_el.
    arg0_hierarchy_el: (HTMLElement)
    arg1_hierarchy_key: (String)
    arg2_do_not_refresh: (Boolean)
  */
  function updateAllGroups (arg0_hierarchy_key, arg1_do_not_refresh) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var do_not_refresh = arg1_do_not_refresh;

    //Declare local instance variables
    var hierarchy_obj = main.hierarchies[hierarchy_key];

    var all_layers = Object.keys(hierarchy_obj.layers);
    var hierarchy_el = hierarchy_obj.hierarchy_el;

    //Iterate over all layers
    for (var i = 0; i < all_layers.length; i++)
      updateGroups(hierarchy_key, hierarchy_el, all_layers[i], do_not_refresh);
  }

  /*
    updateGroups() - Internal modular helper function for updateAllGroups().
    arg0_hierarchy_key: (String)
    arg1_hierarchy_el: (HTMLElement)
    arg2_layer: (String)
    arg3_do_not_refresh: (Boolean)
  */
  function updateGroups (arg0_hierarchy_key, arg1_hierarchy_el, arg2_layer, arg3_do_not_refresh) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var hierarchy_el = arg1_hierarchy_el;
    var layer = arg2_layer;
    var do_not_refresh = arg3_do_not_refresh;

    //Declare local instance variables
    var first_layer_groups = [];
    var groups_obj = {};
    var hierarchy_obj = main.hierarchies[hierarchy_key];

    var all_groups = hierarchy_el.querySelectorAll("div.group");

    //Iterate over all_groups
    for (var i = 0; i < all_groups.length; i++) {
      var all_subelements = all_groups[i].children;
      var local_entities = [];
      var local_id = all_groups[i].getAttribute("id");
      var local_subgroups = [];

      var group_obj = getGroup(/*hierarchy_key, */local_id);

      var local_entities_el = all_groups[i].querySelector(`[id='${local_id}-entities']`);
      var local_subgroups_el = all_groups[i].querySelector(`[id='${local_id}-subgroups']`);

      //Apply name
      for (var x = 0; x < all_subelements.length; x++)
        if (all_subelements[x].tagName == "INPUT")
          group_obj.name = all_subelements[x].value;

      //Apply parent_group
      if (all_groups[i].parentElement)
        if (all_groups[i].parentElement.parentElement) {
          var parent_group_id = all_groups[i].parentElement.parentElement.getAttribute("id");

          if (parent_group_id != "hierarchy")
            group_obj.parent_group = parent_group_id;
        }

      //Format local_entities
      if (local_entities_el) {
        var all_local_entities = local_entities_el.children;

        for (var x = 0; x < all_local_entities.length; x++)
          local_entities.push(all_local_entities[x].getAttribute("id"));
      }

      //Format local_subgroups
      if (local_subgroups_el) {
        var all_local_subgroups = local_subgroups_el.children;

        for (var x = 0; x < all_local_subgroups.length; x++)
          local_subgroups.push(all_local_subgroups[x].getAttribute("id"));
      }

      //Add local_entities and local_subgroups if they exist
      if (local_subgroups.length > 0)
        group_obj.subgroups = local_subgroups;
      if (local_entities.length > 0)
        group_obj.entities = local_entities;

      if (local_subgroups.length == 0)
        first_layer_groups.push(local_id);

      //Add to groups_obj
      groups_obj[local_id] = group_obj;
    }

    //Set hierarchy_obj.groups[<layer>] as groups_obj, refreshHierarchy();
    hierarchy_obj.groups[layer] = groups_obj;

    if (!do_not_refresh)
      refreshHierarchy(hierarchy_el, do_not_refresh);
  }

  /*
    updateHierarchySelectionInformation() - Updates hierarchy selection information for a given hierarchy element.
    arg0_information_el: (HTMLElement) - The element in which to display infromation in.
    arg1_options: (Object)
      selected_entities: (Array<Object>) - Contains all currently selected entities in the hierarchy.
  */
  function updateHierarchySelectionInformation (arg0_information_el, arg1_options) {
    //Convert from parameters
    var selection_info_el = arg0_information_el;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.selected_entities) options.selected_entities = [];

    //Set selection_info_el
    selection_info_el.innerHTML = (options.selected_entities.length > 0) ?
      `${parseNumber(options.selected_entities.length)} entities selected.` :
      "";
  }
}

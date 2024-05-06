//Hierarchies - Requires Sortable.js to function.

//Initialise Sidebar functions
{
  /*
    initHierarchy() - Initialises a hierarchy within a given HTMLElement.
    arg0_element: (HTMLElement) - The context menu element representing the hierarchy.
    arg1_context_menu_element: (HTMLElement) - The subcontext menu for the hierarchy to open/close, if it exists
    arg2_storage_variable: (Object) - The storage object which to reference for storing groups/items.
  */
  function initHierarchy (arg0_element, arg1_context_menu_element, arg2_storage_variable) { //[WIP] - Document
    //Convert from parameters
    var sidebar_el = arg0_element;
    var context_menu_el = arg1_context_menu_element;
    var storage_variable = arg2_storage_variable;

    //Declare local instance variables
    var add_group_btn_el = sidebar_el.querySelector(`#add-group-button`);

    //Declare globals
    if (!window.hierarchies)
      window.hierarchies = [];
    window[storage_variable] = {};
    window.hierarchies.push(window[storage_variable]);

    //Button handlers
    add_group_btn_el.onclick = function () {
      createGroup(sidebar_el);
    };

    //Sidebar click handler
    if (context_menu_el)
      sidebar_el.onclick = function (e) {
        //Context menu should be closed if the context menu itself or the button isn't a parent in the path
        if (
          !arrayHasElementAttribute(e.composedPath(), "id", "hierarchy-context-menu") &&
          !arrayHasElementAttribute(e.composedPath(), "class", "group-context-menu-icon")
        )
          closeHierarchyContextMenu(context_menu_el);
      };

    //Initialise sidebar functions
    initialiseHierarchy(sidebar_el);
  }
}

//Hierarchy Context menu UI functions
{
  /*
    closeHierarchyContextMenu() - Invokes hideElement() on an HTMLElement representing a context menu.
    arg0_context_menu_element: (HTMLElement) - The element to hide.
  */
  function closeSidebarSubcontextMenu () {
    //Declare local instance variables
    var hierarchy_subcontext_el = document.getElementById("hierarchy-context-menu-two");

    hideElement(hierarchy_subcontext_el);
  }

  /*
    printHierarchyContextMenu() - Displays a hierarchy context menu.
    arg0_element: (HTMLElement) - The HTML element representing the hierarchy.
    arg1_context_menu_element: (HTMLElement) - The div container to set the context menu element in.
    arg2_group_id: (String) - The ID of the group for which to print the context menu.
    arg3_html: (String) - The innerHTML to pass to the context menu.
  */
  function printSidebarSubcontextMenu (arg0_element, arg1_context_menu_element, arg2_group_id, arg3_html) {
    //Convert from parameters
    var hierarchy_el = arg0_context_menu_element;
    var hierarchy_context_el = arg1_context_menu_element;
    var group_id = arg2_group_id;
    var html = arg3_html;

    //Declare local instance variables
    var group_el = hierarchy_el.querySelector(`div.group[id="${group_id}"]`);
    var offset_top = group_el.offsetTop - hierarchy_context_el.scrollTop;

    //Check if group exists
    if (group_el) {
      showElement(hierarchy_context_el);
      hierarchy_context_el.setAttribute("style", `top: calc(${offset_top}px);`);

      hierarchy_context_el.innerHTML = html;
    }
  }
}

//[WIP] - Sloppy salvaged code to be brute-force debugged
//Internal helper functions
{
  function closeSidebarContextMenu () { //DONE
    //Declare local instance variables
    var context_menu_el = document.querySelector(`#hierarchy-context-menu`);

    //Close context menu
    if (!context_menu_el.getAttribute("class").includes("display-none"))
      context_menu_el.setAttribute("class",
        context_menu_el.getAttribute("class") + " display-none"
      );
    context_menu_el.removeAttribute("group");
  }

  function createEntityElement (arg0_layer, arg1_entity_id) { //DONE
    //Convert from parameters
    var layer = arg0_layer;
    var entity_id = arg1_entity_id;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id, layer);

    if (entity_obj) {
      var entity_id = entity_obj.options.className;
      var header_el = document.createElement("input");
      var is_hidden = isPolityHidden(entity_id, window.date);
      var local_el = document.createElement("div");

      var entity_class = `entity${(window.sidebar_selected_entities.includes(entity_id)) ? " selected" : ""}`;

      //Initialise local instance variables
      if (is_hidden)
        entity_class += ` extinct`;

      local_el.setAttribute("class", entity_class);
      local_el.setAttribute("id", entity_id);

      header_el.setAttribute("onkeyup", "updateAllGroups(true);");
      header_el.value = getEntityName(entity_id, window.date);

      //Append all formatted elements
      local_el.appendChild(header_el);
      local_el.onclick = function (e) {
        editSidebarElement(e);

        if (window.ctrl_pressed)
          if (!window.sidebar_selected_entities.includes(entity_id)) {
            window.sidebar_selected_entities.push(entity_id);
          } else {
            //Remove from selection
            for (var i = 0; i < window.sidebar_selected_entities.length; i++)
              if (window.sidebar_selected_entities[i] == entity_id)
                window.sidebar_selected_entities.splice(i, 1);
          }

        //Append class if selected, remove selected class if not
        if (window.sidebar_selected_entities.includes(entity_id)) {
          if (!local_el.getAttribute("class").includes("selected"))
            local_el.setAttribute("class", `${local_el.getAttribute("class")} selected`);
        } else {
          local_el.setAttribute("class", local_el.getAttribute("class").replace(" selected", ""));
        }

        //Update sidebar selection information last
        updateSidebarSelectionInformation();
      };

      //Return statement
      return local_el;
    }
  }

  function createGroupElement (arg0_layer, arg1_group_id) { //DONE
    //Convert from parameters
    var layer = arg0_layer;
    var group_id = arg1_group_id;

    //Declare local instance variables
    var ctx_menu_el = document.createElement("img");
    var group_class = `group`;
    var header_el = document.createElement("input");
    var local_el = document.createElement("div");
    var local_entities_el = document.createElement("div");
    var local_groups = window[`${layer}_groups`];
    var local_layer = window[`${layer}_layer`];
    var local_subgroups_el = document.createElement("div");

    var group_obj = local_groups[group_id];

    //Initialise local instance variables
    {
      if (group_obj.mask)
        group_class += ` mask-${group_obj.mask}`;
    }

    //Set element formatting
    ctx_menu_el.setAttribute("class", "group-context-menu-icon");
    ctx_menu_el.setAttribute("draggable", "false");
    ctx_menu_el.setAttribute("src", "./gfx/interface/context_menu_icon.png");
    ctx_menu_el.setAttribute("onclick", `toggleSidebarContextMenu('${group_id}');`);

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
      header_el.setAttribute("onkeyup", "updateAllGroups(true);");
      header_el.value = group_obj.name;

      //Append all entities
      if (group_obj.entities)
        for (var i = 0; i < group_obj.entities.length; i++)
          try {
            local_entities_el.appendChild(
              createEntityElement(layer, group_obj.entities[i])
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
        editSidebarElement(e);
      };

      //Return statement
      return local_el;
    }
  }

  function editSidebarElement (e) {
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

  function generateGroupID () {
    //Declare local instance variables
    var sidebar_el = document.getElementById("hierarchy");

    //While loop to find ID, just in-case of conflicting random ID's:
    while (true) {
      var id_taken = false;
      var local_id = generateRandomID();

      //Check to see if ID is already taken in sidebar
      var identical_groups_el = sidebar_el.querySelectorAll(`[id='${local_id}']`);

      if (identical_groups_el.length == 0) {
        return local_id;
        break;
      }
    }
  }

  function getRecursiveGroupElement (arg0_layer, arg1_group_id, arg2_el) {
    //Convert from parameters
    var layer = arg0_layer;
    var group_id = arg1_group_id;
    var element = (arg2_el) ? arg2_el : createGroupElement(layer, group_id);

    //Declare local instance variables
    var local_groups = window[`${layer}_groups`];

    var all_local_groups = Object.keys(local_groups);
    var local_group = local_groups[group_id];

    //Only keep going if group has subgroups

    if (local_group)
      if (local_group.subgroups)
        if (local_group.subgroups.length > 0)
          for (var i = 0; i < local_group.subgroups.length; i++) {
            var local_subgroup = local_groups[local_group.subgroups[i]];
            var local_subgroup_el = getRecursiveGroupElement(layer, local_group.subgroups[i]);

            //Append everything else
            if (local_subgroup_el)
              element.querySelector(`[id='${group_id}-subgroups']`).appendChild(local_subgroup_el);
          }

    //Return statement
    return element;
  }

  function getUngroupedEntities (arg0_layer) {
    //Convert from parameters
    var layer = arg0_layer;

    //Declare local instance variables
    var local_groups = window[`${layer}_groups`];
    var local_layer = window[`${layer}_layer`];

    var all_local_groups = Object.keys(local_groups);
    var grouped_entities = [];
    var ungrouped_entities = [];

    //Iterate over all_local_groups to push to grouped_entities
    for (var i = 0; i < all_local_groups.length; i++) {
      var local_group = local_groups[all_local_groups[i]];

      if (local_group.entities)
        for (var x = 0; x < local_group.entities.length; x++)
          if (!grouped_entities.includes(local_group.entities[x]))
            grouped_entities.push(local_group.entities[x]);
    }

    //Iterate over all local_layer elements, check against grouped_entities
    for (var i = 0; i < local_layer.length; i++)
      if (!grouped_entities.includes(local_layer[i].options.className))
        ungrouped_entities.push(local_layer[i].options.className);

    //Return statement
    return ungrouped_entities;
  }

  function onSidebarDragEnd (arg0_event) {
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
        var group_obj = getGroup(group_element.id);
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

  function refreshSidebar (arg0_do_not_refresh) {
    //Convert from parameters
    var do_not_refresh = arg0_do_not_refresh;

    //Declare local instance variables
    var sidebar_el = document.getElementById("hierarchy");

    //Reset HTML
    if (!do_not_refresh)
      sidebar_el.innerHTML = "";

    //Create all layer elements
    for (var i = 0; i < layers.length; i++) {
      var layer_el = sidebar_el.querySelectorAll(`[id='${layers[i]}']`);

      //Create a new layer container element if only if it doesn't already exist
      if (layer_el.length == 0) {
        var local_header_el = document.createElement("input");
        var local_layer_el = document.createElement("div");

        local_layer_el.setAttribute("id", layers[i]);
        local_layer_el.setAttribute("class", "layer");
        local_layer_el.setAttribute("onclick", `selectLayer('${layers[i]}');`);

        //Append header
        local_header_el.setAttribute("class", "layer-input");

        local_header_el.value = layers[i];
        local_layer_el.appendChild(local_header_el);

        //Append to sidebar_el
        sidebar_el.appendChild(local_layer_el);
      }
    }

    //Iterate over all window.layers
    for (var i = 0; i < layers.length; i++) {
      var local_groups = window[`${layers[i]}_groups`];
      var local_layer = window[`${layers[i]}_layer`];
      var local_layer_el = sidebar_el.querySelector(`[id='${layers[i]}']`);

      var all_local_groups = Object.keys(local_groups);
      var first_layer_groups = [];
      var ungrouped_entities = getUngroupedEntities(layers[i]);

      //Check for first layer groups
      for (var x = 0; x < all_local_groups.length; x++) {
        var local_group = local_groups[all_local_groups[x]];

        //Check if local_group has parent_group. If not, this is a first layer group
        if (!local_group.parent_group)
          first_layer_groups.push(all_local_groups[x]);
      }

      //Initialise first layer group HTML with entities
      for (var x = 0; x < first_layer_groups.length; x++) {
        var local_group_el = getRecursiveGroupElement(layers[i], first_layer_groups[x]);

        if (!local_layer_el.querySelector(`[id='${first_layer_groups[x]}']`))
          local_layer_el.appendChild(local_group_el);
      }

      //Append ungrouped entities to end of list
      for (var x = 0; x < ungrouped_entities.length; x++) {
        var local_entity_el = createEntityElement(layers[i], ungrouped_entities[x]);

        if (!local_layer_el.querySelector(`[id='${ungrouped_entities[x]}']`))
          local_layer_el.appendChild(local_entity_el);
      }
    }

    //Make sidebar draggable
    var all_listings = document.querySelectorAll("#hierarchy div");

    for (var i = 0; i < all_listings.length; i++)
      Sortable.create(all_listings[i], {
        animation: 350,
        group: "hierarchy",
        fallbackOnBody: true,
        swapThreshold: 0.65,

        onEnd: function (e) {
          onSidebarDragEnd(e);
        }
      });

    Sortable.create(sidebar_el, {
      animation: 350,
      group: "hierarchy",
      fallbackOnBody: true,
      swapThreshold: 0.65,

      onEnd: function (e) {
        onSidebarDragEnd(e);
      }
    });

    //Select current selected layer
    selectLayer(selected_layer);
  }

  function selectLayer (arg0_layer) {
    //Convert from parameters
    var layer = arg0_layer;

    //Declare local instance variables
    var sidebar_el = document.getElementById("hierarchy");

    var all_selected_layers = sidebar_el.querySelectorAll(`.layer.selected`);
    var selected_layer = sidebar_el.querySelectorAll(`[id='${layer}']`);

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

  function toggleSidebarContextMenu (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var context_menu_el = document.querySelector(`#hierarchy-context-menu`);
    var hierarchy_container_el = document.querySelector(`#hierarchy`);
    var group_el = document.querySelector(`div.group[id="${group_id}"]`);
    var offset_top = group_el.offsetTop - hierarchy_container_el.scrollTop;

    var create_subgroup_btn = context_menu_el.querySelector(`#context-menu-create-subgroup-button`);
    var delete_all_btn = context_menu_el.querySelector(`#context-menu-delete-all-button`);
    var delete_group_btn = context_menu_el.querySelector("#context-menu-delete-group-button");
    var set_mask_btn = context_menu_el.querySelector(`#context-menu-mask-group-button`);

    //Toggleable open
    if (context_menu_el.getAttribute("class").includes("display-none")) {
      context_menu_el.setAttribute("class",
        context_menu_el.getAttribute("class")
          .replace(" instant-display-none", "")
          .replace(" display-none", "")
      );
    }

    //Set group attribute for context menu for obvious reasons
    context_menu_el.setAttribute("group", group_id);
    context_menu_el.setAttribute("style", `top: calc(${offset_top}px);`);

    //Set button functionality
    create_subgroup_btn.setAttribute("onclick", `createGroup('${group_id}');`);
    delete_group_btn.setAttribute("onclick", `deleteGroup('${group_id}');`);
    delete_all_btn.setAttribute("onclick", `deleteGroupRecursively('${group_id}');`);

    set_mask_btn.onclick = function (e) {
      printSidebarSubcontextMenu(e, group_id, "mask");
    };
  }

  function updateAllGroups (arg0_do_not_refresh) {
    //Convert from parameters
    var do_not_refresh = arg0_do_not_refresh;

    //Iterate over all layers
    for (var i = 0; i < layers.length; i++)
      updateGroups(layers[i], do_not_refresh);
  }

  function updateGroups (arg0_layer, arg1_do_not_refresh) { //[WIP] - Add layer elements
    //Convert from parameters
    var layer = arg0_layer;
    var do_not_refresh = arg1_do_not_refresh;

    //Declare local instance variables
    var first_layer_groups = [];
    var groups_obj = {};
    var sidebar_el = document.getElementById("hierarchy");

    var all_groups = document.querySelectorAll("div.group");

    //Iterate over all_groups
    for (var i = 0; i < all_groups.length; i++) {
      var all_subelements = all_groups[i].children;
      var local_entities = [];
      var local_id = all_groups[i].getAttribute("id");
      var local_subgroups = [];

      var group_obj = getGroup(local_id);

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

    //Set window[<layer>_groups] as groups_obj; refreshSidebar();
    window[`${layer}_groups`] = groups_obj;

    if (!do_not_refresh)
      refreshSidebar();
  }

  function updateSidebarSelectionInformation () {
    //Declare local instance variables
    var selection_info_el = document.getElementById(`hierarchy-selection-info`);

    selection_info_el.innerHTML = (window.sidebar_selected_entities.length > 0) ?
      `${parseNumber(window.sidebar_selected_entities.length)} entities selected.` :
      "";
  }
}

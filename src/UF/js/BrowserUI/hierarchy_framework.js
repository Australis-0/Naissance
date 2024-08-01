//Hierarchies
//Initialisation functions
{
  /*
    initHierarchy() - Initialises a new hierarchy.
    arg0_options: (Object)
      hierarchy_selector: (String) - The selector of the hierarchy container.
      id: (String) - The ID to initialise the hierarchy with.
  */
  function initHierarchy (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Make sure main.hierarchies exists
    if (!global.main) global.main = {};
    if (!global.main.hierarchies) global.main.hierarchies = {};

    //Declare local instance variables
    var hierarchy_el = (options.hierarchy_selector) ?
      document.querySelector(options.hierarchy_selector) : document.querySelector("#hierarchy");
    var hierarchies = main.hierarchies;
    var hierarchy_id = (options.id) ? options.id : generateRandomID(hierarchies);

    hierarchies[hierarchy_id] = {
      groups: {}
    };

    //Create hierarchy_div
    hierarchy_div = document.createElement("div");
    hierarchy_div.className = "hierarchy";
    hierarchy_div.id = hierarchy_id;

    //Create controls_div
    {
      var controls_div = document.createElement("div");
      controls_div.className = "controls";

      //Add Group button
      var add_group_button = document.createElement("button");
      add_group_button.textContent = `Add Group`;
      add_group_button.addEventListener("click", function () {
        addGroup(hierarchy_id);
      });

      //Add Entity button
      var add_entity_button = document.createElement("button");
      add_entity_button.textContent = `Add Entity`;
      add_entity_button.addEventListener("click", function () {
        addEntity(hierarchy_id);
      });

      //Populate controls_div
      controls_div.appendChild(add_group_button);
      controls_div.appendChild(add_entity_button);
      hierarchy_el.appendChild(controls_div);
    }
  }
}

//Hierarchy UI Functions - [WIP] - Make sure groups/entities are populated with both proper IDs and names
{
  /*
    addEntity() - Adds an entity to a hierarchy in the DOM.
    arg0_hierarchy_id: (String)
    arg1_options: (Object)
      id: (String)
      name: (String)
      parent_group: (String)
  */
  function addEntity (arg0_hierarchy_id, arg1_options) {
    //Convert from parameters
    var hierarchy_id = arg0_hierarchy_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var hierarchy_el = document.getElementById(hierarchy_id);
    var new_entity = createEntity((options.name) ? options.name : "New Entity", options);
    var parent_el = (options.parent_group) ? hierarchy_el.querySelector(`.group[data-id="${options.parent_group}"]`) : hierarchy_el;

    renderList(hierarchy_el, [new_entity]);

    if (options.parent_group) {
      var entity_el = hierarchy_el.querySelector(`.entity[data-id="${options.id}"]`);
      insertEntityAtBottom(parent_el, entity_el);
    }
    setupDragAndDrop();
  }

  /*
    arg0_hierarchy_id: (String)
    arg1_options: (Object)
      id: (String)
      name: (String)
      parent_group: (String)
  */
  function addGroup (arg0_hierarchy_id, arg1_options) {
    //Convert from parameters
    var hierarchy_id = arg0_hierarchy_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var hierarchy_el = document.getElementById(hierarchy_id);
    var new_group = createGroup((options.name) ? options.name : "New Group", undefined, options);
    var parent_el = (options.parent_group) ? hierarchy_el.querySelector(`.group[data-id="${options.parent_group}"]`) : hierarchy_el;

    renderList(parent_el, [new_group]);
    insertGroupAtTop(parent_el, parent_el.lastChild);
    setupDragAndDrop();
  }

  function createEntity (arg0_name, arg1_options) {
    //Convert from parameters
    var name = (arg0_name) ? arg0_name : "New Entity";
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var entity_obj = {
      id: (options.id) ? options.id : generateRandomID(),
      name: name,
      type: "entity"
    };
    entity_obj = mergeObjects(entity_obj, options, { overwrite: true });

    //Return statement
    return entity_obj;
  }

  function createGroup (arg0_name, arg1_children, arg2_options) {
    //Convert from parameters
    var name = (arg0_name) ? arg0_name : "New Group";
    var children = arg1_children;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var group_obj = {
      id: (options.id) ? options.id : generateRandomID(),
      name: name,
      type: "group",
      children: children || [],
    };
    group_obj = mergeObjects(group_obj, options, { overwrite: true });

    //Return statement
    return group_obj;
  }

  function deleteItem (arg0_el) {
    //Convert from parameters
    var local_el = arg0_el;

    //Remove element
    local_el.parentNode.removeChild(local_el);
  }

  /*
    exportHierarchies() - Exports hierarchies according to Naissance standards.
    arg0_options: (Object)
      naissance_hierarchy: (String) - Whether to export the string as a Naissance hierarchy.
  */
  function exportHierarchies (arg0_options) { //[WIP] - Work on element.querySelector('div') and replace it with a more specific selector
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var hierarchies_obj = {};
    var hierarchy_divs = document.body.getElementsByClassName("hierarchy");

    //Iterate over hierarchy_divs
    for (var i = 0; i < hierarchy_divs.length; i++) {
      var hierarchy_div = hierarchy_divs[i];
      var hierarchy_id = hierarchy_div.id;
      hierarchies_obj[hierarchy_id] = {};
      var local_hierarchy_obj = main.hierarchies[hierarchy_id];

      //Process local groups
      var groups = {};
      var groups_container = hierarchy_div.querySelectorAll(".group, .entity");
      var entities = [];

      //Push .id if possible
      if (local_hierarchy_obj.id)
        hierarchies_obj.id = local_hierarchy_obj.id;

      //Iterate over all descendent groups
      groups_container.forEach(function (element) {
        if (element.className == "group") {
          var group_id = element.dataset.id;
          var group_name = element.querySelector("div").textContent;
          var local_children = element.children;

          var new_group = {
            name: group_name,

            entities: [],
            subgroups: []
          };

          //Make sure data isn't lost from main.hierarchies
          groups[group_id] = new_group;
          if (local_hierarchy_obj.groups)
            if (local_hierarchy_obj.groups[group_id])
              groups[group_id] = mergeObjects(new_group, local_hierarchy_obj.groups[group_id], { overwrite: true });

          //Iterate over children and add them
          for (var x = 0; x < local_children.length; x++) {
            var local_child = local_children[x];

            if (local_child.className == "entity") {
              groups[group_id].entities.push(local_child.dataset.id);
            } else if (local_child.className == "group") {
              groups[group_id].subgroups.push(local_child.dataset.id);
            }
          }
        } else if (element.className == "entity") {
          var local_entity_id = element.dataset.id;
          var new_entity = {
            id: local_entity_id,
            name: element.querySelector("div").textContent
          };

          //Make sure data isn't lost from main.hierarchies
          if (local_hierarchy_obj.entities)
            for (var x = 0; x < local_hierarchy_obj.entities.length; x++) {
              var local_entity = local_hierarchy_obj.entities[x];

              //Check to see if hierarchy_id == options.naissance_hierarchy
              if (hierarchy_id == options.naissance_hierarchy) {
                //Look for .options.className
                if (local_entity.options)
                  if (local_entity.options.className == local_entity_id)
                    new_entity = dumbMergeObjects(new_entity, local_entity);
              } else {
                //Look for .id
                if (local_entity.id == local_entity_id)
                  new_entity = dumbMergeObjects(new_entity, local_entity);
              }
            }

          //Push to export entities array
          entities.push(new_entity);
        }
      });

      hierarchies_obj[hierarchy_id].groups = groups;
      hierarchies_obj[hierarchy_id].entities = entities;
    }

    //Return statement
    return hierarchies_obj;
  }

  /*
    getHierarchyElement() - Fetches a hierarchy element.
    arg0_hierarchy_key: (String)
    arg1_element_id: (String)
    arg2_options: (Object)
      naissance_hierarchy: (Boolean)
      return_key: (Boolean)
  */
  function getHierarchyElement (arg0_hierarchy_key, arg1_element_id, arg2_options) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var element_id = arg1_element_id;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var hierarchy_obj = main.hierarchies[hierarchy_key];

    //Iterate over hierarchy_obj.entities
    if (hierarchy_obj.entities)
      for (var i = 0; i < hierarchy_obj.entities.length; i++) {
        var local_entity = hierarchy_obj.entities[i];

        if (options.naissance_hierarchy) {
          if (local_entity.options)
            if (local_entity.options.className == element_id)
              //Return statement
              return (!options.return_key) ? local_entity : options.return_key;
        } else {
          if (local_entity.id == element_id)
            //Return statement
            return (!options.return_key) ? local_entity : options.return_key;
        }
      }
  }

  function getHierarchyID (arg0_element) {
    //Convert from parameters
    var element = arg0_element;

    //Recursive loop to find parent hierarchy
    while (element)  {
      if (element.className == "hierarchy") return element.id;
      element = element.parentNode;
    }
  }

  function getUngroupedEntities (arg0_hierarchy_key) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;

    //Declare local instance variables
    var hierarchy_obj = main.hierarchies[hierarchy_key];
    var grouped_entities = [];
    var ungrouped_entities = [];

    if (hierarchy_obj.groups) {
      var all_groups = Object.keys(hierarchy_obj.groups);

      for (var i = 0; i < all_groups.length; i++) {
        var local_group = hierarchy_obj.groups[all_groups[i]];

        if (local_group.entities)
          grouped_entities = appendArrays(grouped_entities, local_group.entities);
      }
    }
    if (hierarchy_obj.entities)
      for (var i = 0; i < hierarchy_obj.entities.length; i++) {
        var local_entity = hierarchy_obj.entities[i];
        var local_entity_id;

        if (local_entity.options)
          if (local_entity.options.className)
            local_entity_id = local_entity.options.className;
        if (!local_entity_id)
          local_entity_id = local_entity.id;

        //Check to see if local_entity_id is in grouped_entities
        if (!grouped_entities.includes(local_entity_id))
          ungrouped_entities.push(local_entity_id);
      }

    //Return statement
    return ungrouped_entities;
  }

  function insertEntityAtBottom (arg0_container_el, arg1_entity_el) {
    //Convert from parameters
    var container_el = arg0_container_el;
    var entity_el = arg1_entity_el;

    container_el.appendChild(entity_el);
  }

  function insertGroupAtTop (arg0_container_el, arg1_group_el) {
    //Convert from parameters
    var container_el = arg0_container_el;
    var group_el = arg1_group_el;

    //Declare local instance variables
    var controls_el = container_el.querySelector(".controls");
    var has_entity_el = container_el.querySelector(".entity");

    (!has_entity_el) ?
      appendAfterSiblings(container_el, `.group`, group_el) :
      appendBeforeSiblings(container_el, `.entity`, group_el);
  }

  function renameItem (arg0_element) {
    //Convert from parameters
    var element = arg0_element;

    //Declare local instance variables
    var new_name;

    var input = document.createElement("input");
    input.type = "text";
    input.value = element.textContent;
    input.addEventListener("blur", function () {
      new_name = input.value;
      element.textContent = new_name;
    });

    element.textContent = "";
    element.appendChild(input);
    input.focus();
  }

  //[WIP] - Finish renderHierarchy() - Renders hierarchy elements from object
  /*
    renderHierarchy() - Renders a hierarchy into the DOM.
    arg0_hierarchy_key: (String)
    arg1_options: (Object)
      depth: (Number)
      excluded_entities: (Array<String>)
      excluded_groups: (Array<String>)
      naissance_hierarchy: (Boolean)
  */
  function renderHierarchy (arg0_hierarchy_key, arg1_options) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise optimisation parameters
    if (!options.depth) options.depth = -1;
    if (!options.excluded_entities) options.excluded_entities = [];
    if (!options.excluded_groups) options.excluded_groups = [];

    //Declare local instance variables
    var excluded_entities = options.excluded_entities;
    var excluded_groups = options.excluded_groups;
    var hierarchy_el = document.getElementById(hierarchy_key);
    var hierarchy_obj = main.hierarchies[hierarchy_key];

    //Iterate options.depth
    options.depth++;

    //Reset hierarchy_el only if elements haven't been reset yet
    if (excluded_entities.length == 0 && excluded_groups.length == 0) {
      var all_group_els = hierarchy_el.querySelectorAll(`#${hierarchy_key} > .group`);
      var all_entity_els = hierarchy_el.querySelectorAll(`#${hierarchy_key} > .entity`);

      for (var i = 0; i < all_group_els.length; i++)
        all_group_els[i].remove();
      for (var i = 0; i < all_entity_els.length; i++)
        all_entity_els[i].remove();
    }

    //Render groups
    if (hierarchy_obj.groups) {
      var all_groups = Object.keys(hierarchy_obj.groups);

      //Render first-layer groups
      for (var i = 0; i < all_groups.length; i++)
        if (!excluded_groups.includes(all_groups[i])) {
          var local_group = hierarchy_obj.groups[all_groups[i]];

          if (!local_group.parent_group) {
            addGroup(hierarchy_key, {
              id: all_groups[i],
              name: local_group.name
            });
            excluded_groups.push(all_groups[i]);
          }
        }

      //Render nth-layer groups
      for (var i = 0; i < all_groups.length; i++)
        if (!excluded_groups.includes(all_groups[i])) {
          var local_group = hierarchy_obj.groups[all_groups[i]];

          if (local_group.parent_group) {
            addGroup(hierarchy_key, {
              id: all_groups[i],
              name: local_group.name,
              parent_group: local_group.parent_group
            });
            excluded_groups.push(all_groups[i]); //Mark as already rendered

            //Render subgroups
            renderHierarchy(hierarchy_key, options);
          }
        }
    }

    //Render entities
    var all_ungrouped_entities = getUngroupedEntities(hierarchy_key);

    //Render first-layer entities
    for (var i = 0; i < all_ungrouped_entities.length; i++)
      if (!excluded_entities.includes(all_ungrouped_entities[i])) {
        var local_entity = getHierarchyElement(hierarchy_key, all_ungrouped_entities[i], {
          naissance_hierarchy: options.naissance_hierarchy
        });

        addEntity(hierarchy_key, {
          id: all_ungrouped_entities[i],
          name: local_entity.name
        });
        excluded_entities.push(all_ungrouped_entities[i]);
      }
    //Render nth-layer entities
    for (var i = 0; i < hierarchy_obj.entities.length; i++) {
      var local_entity = hierarchy_obj.entities[i];
      var local_entity_id;
      var local_entity_name;

      //Fetch local_entity_id
      if (options.naissance_hierarchy) {
        if (local_entity.options) {
          local_entity_id = local_entity.options.className;
          local_entity_name = local_entity.options.entity_name;
        }
      } else {
        local_entity_id = local_entity.id;
        local_entity_name = local_entity.name;
      }

      if (!all_ungrouped_entities.includes(local_entity_id) && !excluded_entities.includes(local_entity_id)) {
        addEntity(hierarchy_key, {
          id: local_entity_id,
          name: local_entity_name,
          parent_group: getEntityGroup(hierarchy_key, local_entity_id, { return_key: true })
        });
        excluded_entities.push(local_entity_id);
      }
    }
  }

  function renderList (arg0_parent_el, arg1_items) {
    //Convert from parameters
    var parent_el = arg0_parent_el;
    var items = getList(arg1_items);

    //Iterate over all items
    for (var i = 0; i < items.length; i++) {
      var local_div = document.createElement("div");
      var local_item = items[i];

      local_div.className = local_item.type;
      local_div.draggable = true;
      local_div.dataset.id = local_item.id;
      local_div.dataset.type = local_item.type;

      var name_div = document.createElement("div");
      name_div.textContent = local_item.name;
      name_div.addEventListener("click", function (e) {
        renameItem(e.target);
      });

      var delete_button = document.createElement("button");
      delete_button.textContent = "Delete";
      delete_button.addEventListener("click", function (e) {
        renameItem(e.target);
      });

      //Append name_div, delete_button to local_div
      local_div.appendChild(name_div);
      local_div.appendChild(delete_button);
      parent_el.appendChild(local_div);

      //Recursively render list
      if (local_item.type == "group")
        renderList(local_div, local_item.children);
    }
  }

  function setupDragAndDrop () {
    //Declare local instance variables
    var dragged;
    var placeholder = document.createElement("div");
    placeholder.className = "placeholder";

    //DragStart handler
    document.addEventListener("dragstart", function (e) {
      dragged = e.target;
      e.target.style.opacity = 0.8;
    });

    //DragEnd handler
    document.addEventListener("dragend", function (e) {
      e.target.style.opacity = "";
      if (placeholder.parentNode)
        placeholder.parentNode.removeChild(placeholder);
    })

    //DragOver handler
    document.addEventListener("dragover", function (e) {
      e.preventDefault();
      var target = e.target;

      if (target.className == "group" || target.className == "entity" || target.className == "hierarchy") {
        var rect = target.getBoundingClientRect();
        var offset = e.clientY - rect.top;

        (offset > rect.height/2) ?
          target.parentNode.insertBefore(placeholder, target.nextSibling) :
          target.parentNode.insertBefore(placeholder, target);
      }
    });

    //Drop handler
    document.addEventListener("drop", function (e) {
      e.preventDefault();
      var dragged_hierarchy = getHierarchyID(dragged);
      var dragged_type = dragged.dataset.type;
      var target = e.target;
      var target_hierarchy = getHierarchyID(target);

      //Guard clause to prevent cross-contamination between hierarchies
      if (target_hierarchy != dragged_hierarchy) return;

      //Ensure placeholder in the correct position
      if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);

      //Define parent
      var parent = target.closest(".hierarchy, .group");

      //Group/Entity handling
      if (dragged_type == "group") {
        //Ensure groups are not dropped inside entities
        if (target.className == "entity") parent = target.closest(".hierarchy, .group");

        //If dropping a group, insert before the first entity or at the end if no entities
        var first_entity = parent.querySelector(".entity");

        (first_entity && first_entity.parentNode == parent) ?
          parent.insertBefore(dragged, first_entity) :
          parent.appendChild(dragged);
      } else if (dragged_type == "entity") {
        //If dropping an entity, insert after the last group or at the end if no groups
        var last_group = parent.querySelector(".group:last-of-type");

        (last_group && last_group.parentNode == parent) ?
          parent.insertBefore(dragged, last_group.nextSibling) :
          parent.appendChild(dragged);
      }
    });
  }
}

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
  function addGroup (arg0_hierarchy_id) {
    //Convert from parameters
    var hierarchy_id = arg0_hierarchy_id;

    //Declare local instance variables
    var hierarchy_div = document.getElementById(hierarchy_id);
    var new_group = createGroup("New Group");

    renderList(hierarchy_div, [new_group]);
    insertGroupAtTop(hierarchy_div, hierarchy_div.lastChild);
    setupDragAndDrop();
  }

  function addEntity (arg0_hierarchy_id) {
    //Convert from parameters
    var hierarchy_id = arg0_hierarchy_id;

    //Declare local instance variables
    var hierarchy_div = document.getElementById(hierarchy_id);
    var new_entity = createEntity("New Entity");

    renderList(hierarchy_div, [new_entity]);
    setupDragAndDrop();
  }

  function createGroup (arg0_name, arg1_children) {
    //Convert from parameters
    var name = (arg0_name) ? arg0_name : "New Group";
    var children = arg1_children;

    //Declare local instance variables
    var group_obj = {
      id: generateRandomID(),
      name: name,
      type: "group",
      children: children || [],
    };

    //Return statement
    return group_obj;
  }

  function createEntity (arg0_name) {
    //Convert from parameters
    var name = (arg0_name) ? arg0_name : "New Entity";

    //Declare local instance variables
    var entity_obj = {
      id: generateRandomID(),
      name: name,
      type: "entity"
    };

    //Return statement
    return entity_obj;
  }

  function deleteItem (arg0_el) {
    //Convert from parameters
    var local_el = arg0_el;

    //Remove element
    local_el.parentNode.removeChild(local_el);
  }

  function exportHierarchies () { //[WIP] - Work on element.querySelector('div') and replace it with a more specific selector
    //Convert from parameters
    var hierarchies_obj = {};
    var hierarchy_divs = document.body.getElementsByClassName("hierarchy");

    //Iterate over hierarchy_divs
    for (var i = 0; i < hierarchy_divs.length; i++) {
      var hierarchy_div = hierarchy_divs[i];
      var hierarchy_id = hierarchy_div.id;
      hierarchies_obj[hierarchy_id] = {};

      //Process local groups
      var groups = {};
      var groups_container = hierarchy_div.querySelectorAll(".group, .entity");
      var entities = [];

      //Iterate over all descendent groups
      groups_container.forEach(function (element) {
        if (element.className == "group") {
          var group_id = element.dataset.id;
          var group_name = element.querySelector("div").textContent;
          var local_children = element.children;

          groups[group_id] = {
            name: group_name,

            entities: [],
            subgroups: []
          };

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
          entities.push({
            id: element.dataset.id,
            name: element.querySelector("div").textContent
          });
        }
      });

      hierarchies_obj[hierarchy_id][`${hierarchy_id}_groups`] = {
        [hierarchy_id]: groups
      };
      hierarchies_obj[hierarchy_id][`${hierarchy_id}_entities`] = entities;
    }

    //Return statement
    return hierarchies_obj;
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
    var ungrouped_entities = [];

    var all_hierarchy_keys = Object.keys(hierarchy_obj);

    //Iterate over all_hierarchy_keys to determine _entities
    for (var i = 0; i < all_hierarchy_keys.length; i++)
      if (all_hierarchy_keys[i].includes("_entities")) {
        var local_keys = Object.keys(hierarchy_obj[all_hierarchy_keys[i]]);
        var local_value = hierarchy_obj[all_hierarchy_keys[i]];

        //Iterate over local_keys and push to ungrouped_entities
        for (var x = 0; x < local_keys.length; x++)
          ungrouped_entities.push(local_value[local_keys[x]]);
      }

    //Return statement
    return ungrouped_entities;
  }

  function initHierarchyLayer (arg0_hierarchy_key, arg1_layer, arg2_options) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var layer = arg1_layer;
    var options = (arg2_options) ? arg2_options : {};

    //Ensure the main hierarchy  object exists
    if (!main.hierarchies[hierarchy_key]) main.hierarchies[hierarchy_key] = {};

    //Declare local instance variables
    var hierarchy_obj = main.hierarchies[hierarchy_key];

    //Initialise <layer_key>_groups and <layer_key> if not already present
    if (!hierarchy_obj[`${layer}_groups`]) hierarchy_obj[`${layer}_groups`] = {};
    if (options.load_groups)
      hierarchy_obj[`${layer}_groups`] = options.load_groups;

      if (!hierarchy_obj[`${layer}_groups`][layer]) hierarchy_obj[`${layer}_groups`][layer] = {};
      if (options.load_layer) hierarchy_obj[`${layer}_groups`][layer] = options.load_layer;

    //Initialise <layer_key>_entities array for the layer
    if (!hierarchy_obj[`${layer}_entities`]) hierarchy_obj[`${layer}_entities`] = [];

    //Set the is_leaflet flag if specified
    if (options.layer_is_leaflet_array)
      hierarchy_obj[`${layer}_groups`].is_leaflet = true;
  }

  function insertGroupAtTop (arg0_container_el, arg1_group_el) {
    //Convert from parameters
    var container_el = arg0_container_el;
    var group_el = arg1_group_el;

    //Declare local instance variables
    var controls_el = container_el.querySelector(".controls");
    container_el.insertBefore(group_el, controls_el.nextSibling);
  }

  function insertEntityAtBottom (arg0_container_el, arg1_entity_el) {
    //Convert from parameters
    var container_el = arg0_container_el;
    var entity_el = arg1_entity_el;

    container_el.appendChild(entity_el);
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

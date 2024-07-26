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

  function refreshSidebar (arg0_do_not_refresh) {
  }
}

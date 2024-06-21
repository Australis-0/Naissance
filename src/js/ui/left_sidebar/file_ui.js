//Listener events
document.getElementById("load-file").onclick = function (e) {
  var load_file_name_el = document.getElementById("load-file-path");

  var load_file_name = load_file_name_el.value;

  //Process load_file_name
  load_file_name = load_file_name.split("\\");
  load_file_name = load_file_name[load_file_name.length - 1].replace(".js", "");

  loadSave(load_file_name);
};
document.getElementById("save-file").onclick = function (e) {
  var save_file_name_el = document.getElementById("save-file-name");

  var save_file_name = save_file_name_el.value;

  //Write save
  writeSave((save_file_name.length > 0) ? save_file_name : "save");
};

//[WIP] - Temporary hierarchy functions - move out in future
{
  /*
    createHierarchy() - Creates a hierarchy and its corresponding elements.

    arg0_options: (Object)
      context_menu_selector: (String)
      context_menu_selectors: (Array<String>)
      hierarchy_selector: (String)

      hierarchy_key: (String)

      container_el: (HTMLElement) - Assigns a container element to createHierarchy() if necessary.
      context_menu_html: (String) - Optional.
  */
  function createHierarchy (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var container_el = (options.container_el) ? options.container_el : document.body;
    var context_menu_selector = options.context_menu_selector;
    var context_menu_selectors = options.context_menu_selectors;
    var hierarchy_selector = options.hierarchy_selector;
    var hierarchy_key = options.hierarchy_key;

    if (context_menu_selector && hierarchy_selector) {
      var context_menu_el = document.querySelector(context_menu_selector);
      var hierarchy_el = document.querySelector(hierarchy_selector);

      //Call initHierarchy()
      initHierarchy(hierarchy_el, hierarchy_key, {
        context_menu_selectors: context_menu_selectors
      });
    } else {
      //Create context_menu_el; hierarchy_el
      var local_hierarchy_html = `
        <!-- Hierarchy buttons -->
        <button id = "hierarchy-create-new-group">Create New Group</button>

        <br><br>

        <!-- Hierarchy container -->
        <div id = "hierarchy-${hierarchy_key}" class = "hierarchy-elements-container"></div>
        <br>

        <!-- Hierarchy selection info -->
        <div id = "hierarchy-${hierarchy_key}-selection-info" class = "hierarchy-selection-info-container">

        <!-- Hierarchy context menu -->
        <div id = "hierarchy-context-menu" class = "context-menu-container instant-display-none">
          ${(options.context_menu_html) ? options.context_menu_html : ""}
        </div>
      `;

      //Append local_hierarchy_html to container_el
      container_el.innerHTML += local_hierarchy_html;

      //Call initHierarchy()
    }
  }
}

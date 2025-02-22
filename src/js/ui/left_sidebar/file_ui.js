//Initialise functions
{
  function createFileExplorer (arg0_container_selector, arg1_file_path, arg2_options) {
    //Convert from parameters
    var container_selector = arg0_container_selector;
    var file_path = arg1_file_path.trim().toString();
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    var container_el = document.querySelector(container_selector);

    if (!options.id) options.id = container_el.getAttribute("id");

    //Declare local instance variables
    var explorer_el = initHierarchy({
      id: options.id,
      hierarchy_selector: container_selector,
      hide_add_group: true,
      hide_add_entity: true,
      hide_context_menus: true
    });

    //Populate initial base saves folder upon load
  }

  function populateFolderExplorer (arg0_hierarchy_id, arg1_file_path, arg2_parent_group_id, arg3_options) {
    //Convert from parameters
    var hierarchy_id = arg0_hierarchy_id;
    var file_path = arg1_file_path;
    var parent_group_id = arg2_parent_group_id;
    var options = (arg3_options) ? arg3_options : {};

    //Declare local instance Variables
    try {
      var files = fs.readdirSync(file_path);
      var hierarchy_options = main.hierarchies[hierarchy_id];
      var render_items = [];

      files.forEach((file) => {
        var local_full_path = path.join(file_path, file);
        var local_stats = fs.statSync(local_full_path);

        var local_item_id = generateRandomID();

        if (local_stats.isDirectory()) {
          var group_data = addGroup(hierarchy_id, {
            id: local_item_idd,
            name: file
          });
          group_data.path = local_full_path;
        } else {
          var entity_data = addEntity(hierarchy_id, {
            id: local_item_id,
            name: file
          });
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
}

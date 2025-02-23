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

    //Initialise hierarchy
    if (!main.hierarchies[options.id]) {
      var explorer_el = initHierarchy({
        id: options.id,
        hierarchy_selector: container_selector,
        hide_add_group: true,
        hide_add_entity: true,
        hide_context_menus: true,

        disable_renaming: true
      });

      //Populate initial base saves folder upon load
      populateFolderExplorer(options.id, file_path);
    }
  }

  function populateFolderExplorer (arg0_hierarchy_id, arg1_file_path, arg2_parent_group_id, arg3_options) {
    //Convert from parameters
    var hierarchy_id = arg0_hierarchy_id;
    var file_path = arg1_file_path;
    var parent_group_id = arg2_parent_group_id;
    var options = (arg3_options) ? arg3_options : {};

    //Declare local instance variables
    var all_drives = getAllDrives();
    var container_selector = (options.hierarchy_selector) ?
      options.hierarchy_selector : `#${hierarchy_id}`;
    var container_el = document.querySelector(container_selector);


    //Populate initial folder
    try {
      var files = fs.readdirSync(file_path);
      var hierarchy_options = main.hierarchies[hierarchy_id];
      var render_items = [];

      //1. Display folders at top
      if (main.selected_path.split("\\").length > 1) {
        var back_group_data = addGroup(hierarchy_id, {
          id: generateRandomID(),
          name: ".."
        });
        back_group_data.path = "..";
      }

      //1.1. Display drives if main.selected_path is a length of 2 and main.selected_path[1] == ""
      if (main.selected_path.split("\\").length == 1) {
        for (var i = 0; i < all_drives.length; i++) {
          let local_drive = all_drives[i];
          let local_full_path = `${local_drive}\\`;
          let local_item_id = generateRandomID();

          let drive_data = addGroup(hierarchy_id, {
            id: local_item_id,
            name: local_drive
          });
          let drive_el = document.querySelector(`${container_selector} .group[data-id="${local_item_id}"]`);

          drive_el.setAttribute("data-drive", "true");
          drive_data.path = local_full_path;
        }
      }

      files.forEach((file) => {
        try {
          var local_full_path = path.join(file_path, file);
          var local_stats = fs.statSync(local_full_path);

          var local_item_id = generateRandomID();

          if (local_stats.isDirectory()) {
            var group_data = addGroup(hierarchy_id, {
              id: local_item_id,
              name: file
            });
            group_data.path = local_full_path;
          }
        } catch (e) {}
      });
      //2. Display files at bottom
      files.forEach((file) => {
        try {
          var local_full_path = path.join(file_path, file);
          var local_stats = fs.statSync(local_full_path);

          var local_item_id = generateRandomID();

          if (!local_stats.isDirectory()) {
            var entity_data = addEntity(hierarchy_id, {
              id: local_item_id,
              name: file
            });
          }
        } catch (e) {}
      });

      //3. Add event listeners
      //Add click listeners to folders
      var all_folder_els = container_el.querySelectorAll(".group");

      for (var i = 0; i < all_folder_els.length; i++) {
        let local_folder_el = all_folder_els[i];

        local_folder_el.onclick = function (e) {
          var local_file_name_el = local_folder_el.querySelector(".item-name");
          var local_file_path = `${main.selected_path}\\${local_file_name_el.innerText}`;
          var local_type = local_folder_el.getAttribute("class");

          if (!local_folder_el.getAttribute("data-drive")) {
            //Regular folder/file handler
            if (local_type.includes("group")) {
              if (!["\\..", ".."].includes(local_file_name_el.innerText)) {
                main.selected_path = local_file_path;

                clearHierarchy(hierarchy_id, { hierarchy_selector: container_selector });
                populateFolderExplorer(hierarchy_id, local_file_path);
              } else {
                //Go up a folder
                var split_local_file_path = main.selected_path.split("\\");
                split_local_file_path.pop();
                main.selected_path = split_local_file_path.join("\\");

                clearHierarchy(hierarchy_id, { hierarchy_selector: container_selector });
                populateFolderExplorer(hierarchy_id, local_file_path);
              }
            } else if (local_type.includes("entity")) {
              console.log("Clicked:", local_file_name_el.innerText);
            }
          } else {
            //Drive handler
            main.selected_path = `${local_file_name_el.innerText}`;

            clearHierarchy(hierarchy_id, { hierarchy_selector: container_selector });
            populateFolderExplorer(hierarchy_id, main.selected_path + "\\");
          }
        };
      }
    } catch (e) {
      console.error(e);
    }
  }
}

//Initialise functions
{
  function closeEntityActionContextMenus (arg0_entity_id) {

  }
  function closeEntityActionLastContextMenu (arg0_entity_id) {

  }

  function printEntityActions (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_selector = getEntityElement(entity_id, { return_selector: true });

    //Set local context menu and functionality
    var entity_actions_ui = createContextMenu({
      anchor: `${entity_selector} ${common_selectors.entity_actions_context_menu_anchor}`,
      class: "entity-context-menu actions-menu",

      edit_entity_button: {
        id: "edit-entity-button",
        name: "Edit Polity",
        type: "button",
        icon: "gfx/interface/pencil_filled_icon.png",
        onclick: `editEntity('${entity_id}');`,
        x: 0,
        y: 0,
      },
      simplify_path_button: {
        id: "simplify-entity-button",
        name: "Simplify Path",
        type: "button",
        icon: "gfx/interface/simplify_icon.png",
        context: true,
        x: 1,
        y: 0,
      },
      hide_polity_button: {
        id: "hide-polity-button",
        name: "Hide Polity",
        type: "button",
        icon: "gfx/interface/hide_polity_icon.png",
        context: true,
        x: 0,
        y: 1,
      },
      apply_path_button: {
        id: "apply-path-button",
        name: "Apply Path",
        type: "button",
        icon: "gfx/interface/apply_path_icon.png",
        context: true,
        x: 1,
        y: 1,
      },
      clean_keyframes_button: {
        id: "clean-keyframes-button",
        name: "Clean Keyframes",
        type: "button",
        icon: "gfx/interface/clean_keyframes_icon.png",
        context: true,
        x: 1,
        y: 2,
      }
    });
  }
}

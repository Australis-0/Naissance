//Initialise entity context menus
{
  //Initialise Entity Actions context menus
  {

  }

  //Initialise Entity Keyframe context menus
  {
    function closeActionContextMenu (arg0_entity_id, arg1_instant) {
      //Convert from parameters
      var entity_id = arg0_entity_id;
      var instant = arg1_instant;

      //Declare local instance variables
      var actions_context_menu_el = document.querySelector(`${config.ui.entity_action_context_menu}-${entity_id}`);

      //Set to display-none
      if (!actions_context_menu_el.getAttribute("class").includes("display-none"))
        addClass(actions_context_menu_el, ` ${(instant) ? "instant-" : ""}display-none`);
    }
  }
}

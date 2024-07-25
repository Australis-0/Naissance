//Declare functions
{
  //groupActions() - Groups the current action with the last action if it is the same.
  function groupActions (arg0_action) {
    //Convert from parameters
    var current_action = arg0_action;

    //Declare local instance variables
    var action_grouped = false;
    var last_action = getLastAction();

    //Check to make sure last_action exists
    if (last_action)
      if (last_action.id == current_action.id) {
        var current_redo_parameters = current_action.redo_function_parameters;
        var current_undo_parameters = current_action.undo_function_parameters;
        var current_timeline = global.timelines[global.actions.current_timeline];
        var last_redo_parameters = last_action.redo_function_parameters;
        var last_undo_parameters = last_action.undo_function_parameters;

        //Action ID handler
        if (["add_to_brush", "remove_from_brush"].includes(current_action.id)) {
          try {
            if (last_redo_parameters[0]) {
              last_redo_parameters[0] = union(last_redo_parameters[0], current_redo_parameters[0]);
            } else {
              last_redo_parameters[0] = current_redo_parameters[0];
            }

            if (last_undo_parameters[0]) {
              last_undo_parameters[0] = union(last_undo_parameters[0], current_undo_parameters[0]);
            } else {
              last_undo_parameters[0] = current_undo_parameters[0];
            }

            action_grouped = true;
          } catch (e) {}
        }
      }

    //Return statement
    return action_grouped;
  }

  //initialiseUndoRedoActions() - Sets up undo/redo actions.
  function initialiseUndoRedoActions () {
    createAction("add_to_brush", {
      name: "Add To Brush",

      function: "addToBrush",
      reverse_function: "removeFromBrush"
    });

    createAction("remove_from_brush", {
      name: "Remove From Brush",

      function: "removeFromBrush",
      reverse_function: "addToBrush"
    });

    //Call initialiseUndoRedoUI()
    initialiseUndoRedoUI();
  }
}

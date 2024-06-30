//Action Timelines - Used for undo/redo trees.

/*
  createTimeline() - Creates a new timeline from a parent (or an unassociataed one if no parent is defined). The parent may be cloned into the new timeline if necessary.
  arg0_parent_timeline: (String) - Optional. The ID of the parent timeline to split off from. global.actions.initial_timeline by default
  arg1_options: (Object)
    timeline_index: (Number) - Optional. The index off of which the timeline should split. The last index of the timeline by default
    return_key: (Boolean) - Optional. Whether to return the timeline key. False by default.

  Returns: (Object, Timeline)/(String)
*/
function createTimeline (arg0_parent_timeline, arg1_options) {
  //Convert from parameters
  var parent_timeline_id = (arg0_parent_timeline) ? arg0_parent_timeline : global.actions.initial_timeline;
  var options = (arg1_options) ? arg1_options : {};

  //Declare local instance variables
  var new_timeline_id = generateRandomID(global.timelines);
  var parent_timeline_array = global.timelines[parent_timeline_id];

  //Create a new timeline with a base action
  global.timelines[new_timeline_id] = [];

  var new_timeline = global.timelines[new_timeline_id];
  var root_action = {};

  root_action.id = new_timeline_id;
  root_action.parent_timeline_id = parent_timeline_id;
  root_action.parent_timeline_index = (options.timeline_index) ?
    options.timeline_index : parent_timeline_array[parent_timeline_array.length - 1];

  //Push root_action to timeline
  new_timeline.push(root_action);

  //Return statement
  return (!options.return_key) ? global.timelines[new_timeline_id] : options.return_key;
}

/*
  constructTimelineGraph() - Returns an A* compatible graph of global.timelines.

  Returns: (Object)
    <Timeline ID-index>: (Object)
      <Timeline ID-index>: (Number) - Represents the connection cost between the current Timeline Position and another Timeline Position.
*/
function constructTimelineGraph () {
  //Declare local instance variables
  var all_timelines = Object.keys(global.timelines);
  var timeline_graph = {};

  //Iterate over all timelines
  for (var i = 0; i < all_timelines.length; i++) {
    var local_timeline = global.timelines[all_timelines[i]];

    for (var x = 0; x < local_timeline.length; x++) {
      var local_connections = [];
      var local_key = `${all_timelines[i]}-${x}`;

      //parent_timeline_id-parent_timeline_index connection handler
      if (local_timeline[x].parent_timeline_id) {
        var parent_timeline_index = returnSafeNumber(local_timeline[x].parent_timeline_index);

        var parent_key = `${local_timeline[x].parent_timeline_id}-${parent_timeline_index}`;

        //Check if parent_timeline_obj is defined
        if (!timeline_graph[parent_key])
          timeline_graph[parent_key] = {};
        var parent_node = timeline_graph[parent_key];

        //Set look-forwards connection to current node
        parent_node[local_key] = 1;
      }

      //Look forwards to see if there's a connection here
      if (local_timeline[x + 1])
        local_connections.push(`${all_timelines[i]}-${x + 1}`);

      //Initialise local node
      if (!timeline_graph[local_key])
        timeline_graph[local_key] = {};
      var local_node = timeline_graph[local_key];

      //Add local_connections
      for (var y = 0; y < local_connections.length; y++)
        if (!local_node[local_connections[y]])
          local_node[local_connections[y]] = 1;
    }
  }

  //Return statement
  return timeline_graph;
}

/*
  deleteTimeline() - Deletes a timeline and the timelines that branch off of it.
  arg0_timeline_id: (String) - The timeline ID to delete.
*/
function deleteTimeline (arg0_timeline_id) {
  //Convert from parameters
  var timeline_id = arg0_timeline_id;

  //Declare local instance variables
  var all_timelines = Object.keys(global.timelines);
  var timeline = global.timelines[timeline_id];

  //Delete all timelines that branch off of this one recursively
  for (var i = 0; i < all_timelines.length; i++) {
    var local_timeline = all_timelines[i];

    if (local_timeline[0])
      if (local_timeline[0].parent_timeline_id == timeline_id)
        deleteTimeline(all_timelines[i]); //Recursive deletion
  }

  //If this timeline is the current_timeline, shift current_timeline to initial_timeline
  if (timeline_id == global.actions.current_timeline)
    global.actions.current_timeline = global.actions.initial_timeline;

  //Delete timeline
  delete global.timelines[timeline_id];

  //If this timeline is the initial timeline, delete global.actions.current_timeline; initialise undo/redo again
  if (timeline_id == global.actions.initial_timeline) {
    delete global.actions.current_timeline;
    delete global.actions.initial_timeline;

    initialiseUndoRedo();
  }
}

/*
  generateTimelineGraph() - Returns a graph of all timelines starting from initial_timeline[0].
  arg0_timeline_id: (String) - The ID of the timeline to start generating a graph from.
  arg1_options: (Object)
    x_offset: (Number) - Optional. The current x offset. 0 by default.
    y_offset: (Number) - Optional. The current y offset. 0 by default.

  Returns: (Object) - A timeline graph object to render.
*/
function generateTimelineGraph (arg0_timeline_id, arg1_options) {
  //Convert from parameters
  var timeline_id = arg0_timeline_id;
  var options = (arg1_options) ? arg1_options : {};

  //Declare local instance variables
  var all_timelines = Object.keys(global.timelines);
  var current_y_offset = 0;
  var timeline_array = global.timelines[timeline_id];
  var timeline_coordinates = {};
  var timeline_graph = {}; //Object list of UI elements: { x: (Number), y: (Number), name: (String), connections: (Array<Array<x, y>>) };
  var x_offset = returnSafeNumber(options.x_offset);
  var y_offset = returnSafeNumber(options.y_offset);

  //Produce graph at this layer only for the current timeline and immediate all_timelines connected to it, then call
  for (var i = 0; i < all_timelines.length; i++) {
    var local_timeline = global.timelines[all_timelines[i]];

    if (local_timeline[0])
      if (local_timeline[0].parent_timeline_id == timeline_id) {
        var local_timeline_width = getTimelineWidth(all_timelines[i]);

        //Calculate x_offset; y_offset
        var local_x_offset = x_offset + returnSafeNumber(local_timeline[0].parent_timeline_index);
        var local_y_offset = y_offset + current_y_offset + local_timeline_width;

        current_y_offset += local_timeline_width;

        //Iterate recursively
        var new_timeline_graph = generateTimelineGraph(all_timelines[i], {
          x_offset: local_x_offset,
          y_offset: local_y_offset,

          x_original: x_offset,
          y_original: y_offset
        });

        timeline_graph = mergeObjects(timeline_graph, new_timeline_graph);
      }
  }

  //Iterate over current timeline_array
  for (var i = 0; i < timeline_array.length; i++) {
    var local_connections = [];
    var local_id = generateRandomID(timeline_graph);

    timeline_graph[local_id] = {};

    //.x_original/.y_original handler
    if (options.x_original != undefined && options.y_original != undefined)
      local_connections.push([options.x_original, options.y_original]);

    //Connecttions handler
    if (local_connections.length > 0)
      timeline_graph[local_id].connections = local_connections;

    //Add .data field
    timeline_graph[local_id].data = timeline_array[i];
    timeline_graph[local_id].x = i;
    timeline_graph[local_id].y = 0;
  }

  //Add x_offset; y_offset to timeline_graph and to connections
  var all_elements = Object.keys(timeline_graph);

  for (var i = 0; i < all_elements.length; i++) {
    var local_element = timeline_graph[all_elements[i]];

    local_element.x += x_offset;
    local_element.y += y_offset;

    if (local_element.connections)
      for (var i = 0; i < local_element.connections.length; i++) {
        local_element.connections[i][0] += x_offset;
        local_element.connections[i][1] += y_offset;
      }
  }

  //Return statement
  return timeline_graph;
}

/*
  getTimelineWidth() - Fetches the total X/Y width of a timeline from all future descendant timelines.
  arg0_timeline_id: (String) - The ID of the timeline to measure the descendant width of

  Returns: (Number)
*/
function getTimelineWidth (arg0_timeline_id) {
  //Convert from parameters
  var timeline_id = arg0_timeline_id;

  //Declare local instance variables
  var all_timelines = Object.keys(timeline_id);
  var timeline_width = 0;

  //Iterate over timeline_array
  for (var i = 0; i < all_timelines.length; i++) {
    var local_timeline = global.timelines[all_timelines[i]];

    if (local_timeline[0])
      if (local_timeline[0].parent_timeline_id == timeline_id)
        timeline_width += getTimelineWidth(all_timelines[i]);
  }

  //Return statement
  return timeline_width;
}

/*
  loadTimeline() - Loads in the current timeline, undoing/redoing all actions needed to get there.
  arg0_timeline_id: (String) - The ID of the timeline to load into the current state
  arg1_options: (Object)
    timeline_index: (Number) - Optional. The index off of which the timeline should split. The last index of the timeline by default
*/
function loadTimeline (arg0_timeline_id, arg1_options) {
  //Convert from parameters
  var timeline_id = arg0_timeline_id;
  var options = (arg1_options) ? arg1_options : {};

  //Declare local instance variables
  var current_index = returnSafeNumber(global.actions.current_index);
  var timeline_graph = constructTimelineGraph();

  //A* traversal from current_timeline-current_index to destination timeline_id-options.timeline_index
  var end_key = `${timeline_id}-${returnSafeNumber(options.timeline_index)}`;
  var start_key = `${global.actions.current_timeline}-${current_index}`;

  var path = aStar(timeline_graph, start_key, end_key);

  //Iterate over path and perform delta toggles
  for (var i = 0; i < path.length; i++) {
    var split_key = path[i].split("-");

    var local_element = global.timelines[split_key[0]][parseInt(split_key[1])];

    //Perform current delta action, then set toggle
    if (local_element.delta_toggle == "undo") {
      global[local_element.undo_function](...local_element.undo_function_parameters);
      local_element.delta_toggle = "redo";
    } else {
      global[local_element.redo_function](...local_element.redo_function_parameters);
      local_element.delta_toggle = "undo";
    }
  }

  //Set global.actions.current_timeline, global.actions.current_index
  global.actions.current_timeline = timeline_id;
  global.actions.current_index = returnSafeNumber(options.timeline_index);
}

/*
  jumpToTimeline() - Jumps to a specific timeline.
  arg0_timeline_id: (String) - The timeline ID to jump to
*/
function jumpToTimeline (arg0_timeline_id) {
  //Convert from parameters
  var timeline_id = arg0_timeline_id;

  //Invoke loadTimeline()
  loadTimeline(timeline_id, { timeline_index: 0 });
}

/*
  redoAction() - Redoes an action in the current timeline.
  
  Returns: (Boolean) - Whether the action was successfully redone
*/
function redoAction () {
  //Declare local instance variables
  var current_index = returnSafeNumber(global.actions.current_index);
  var current_timeline = global.timelines[global.actions.current_timeline];

  //See if there's an action to redo
  if (current_timeline[current_index + 1]) {
    var local_element = current_timeline[current_index + 1];

    //Move forwards in the current timeline by default
    global[local_element.redo_function](...local_element.redo_function_parameters);
    local_element.delta_toggle = "undo";
    global.actions.current_index = current_index + 1;

    //Return statement; action successfully redone
    return true;
  } else {
    //Return statement; nothing left to redo in the current tree
    return false;
  }
}

/*
  performAction() - Logs a delta action in the current timeline.
  arg0_options: (Object)
    action_id: (String) - The ID of the action currently being performed.
    redo_function: (String) - The corresponding redo function.
    redo_function_parameters: (Array<Variable, ...>) - The current arguments passed to perform the delta action.
    undo_function: (String) - The corresponding undo function.
    undo_function_parameters: (Array<Variable, ...>) - The arguments needed to undo the delta action.
*/
function performAction (arg0_options) {
  //Convert from parameters
  var options = (arg0_options) ? arg0_options : {};

  //Declare local instance variables
  var current_timeline = global.timelines[global.actions.current_timeline];
  var current_index = returnSafeNumber(global.actions.current_index);
  var local_action = global.actions[options.action_id];
  var new_action = {
    id: options.action_id,
    name: (local_action.name) ? local_action.name : options.action_id,

    delta_toggle: "undo",

    redo_function: options.redo_function,
    redo_function_parameters: options.redo_function_parameters,
    undo_function: options.undo_function,
    undo_function_parameters: options.undo_function_parameters
  };

  //If the current_index is not the same as the length of the current timeline - 1, split off a new timeline; and set current_timeline to that.
  if (current_index != current_timeline.length - 1) {
    var new_timeline = createTimeline(global.actions.current_timeline);

    new_timeline.push(new_action);

    //Set current_timeline; current_index to new_timeline
    global.actions.current_timeline = new_timeline[0].id;
    global.actions.current_index = 1;
  } else {
    current_timeline.push(new_action);

    //Set current_index
    global.actions.current_index = current_timeline.length - 1;
  }
}

/*
  undoAction() - Undoes the last action in the current timeline.

  Returns: (Boolean) - Whether the action was successfully undone.
*/
function undoAction () {
  //Declare localk instance variables
  var current_index = returnSafeNumber(global.actions.current_index);
  var current_timeline = global.timelines[global.actions.current_timeline];

  //See if there's an action to undo
  if (current_timeline[current_index - 1]) {
    var local_element = current_timeline[current_index - 1];

    //Move backwards in the current timeline by default
    global[local_element.undo_function](...local_element.undo_function_parameters);
    local_element.delta_toggle = "redo";
    global.actions.current_index = current_index - 1;

    //Return statement; action successfully undone
    return true;
  } else {
    //Return statement; nothing left to undo in the current tree
    return false;
  }
}

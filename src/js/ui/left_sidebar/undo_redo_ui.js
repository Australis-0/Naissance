//Declare functions
{
  function generateTimelineCanvasElement (arg0_canvas, arg1_options) {
    //Convert from parameters
    var canvas = arg0_canvas;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (options.flipped != false)
      options.flipped = true;

    //Declare local instance variables
    var ctx = canvas.getContext("2d");
    var timeline_graph = generateTimelineGraph();
      if (options.flipped)
        timeline_graph = getFlippedTimeline(timeline_graph);

    var all_graph_keys = Object.keys(timeline_graph);
    var canvas_height = 0;
    var canvas_width = 0;
    var node_height = 14;
    var spacing_x = 140;
    var spacing_y = 60;

    //Store node positions for event handling
    var node_positions = {};
    var row_tracker = {};
    var saved_image;

    //Determine canvas size based on graph
    var timeline_height = 1 + getTimelineMaxY(timeline_graph);
    var timeline_width = getTimelineMaxX(timeline_graph);

    //Clear previous render
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous render

    //Iterate over all graph keys and render nodes
    for (var i = 0; i < all_graph_keys.length; i++) {
      var local_graph_entry = timeline_graph[all_graph_keys[i]];
      var local_x = local_graph_entry.x*spacing_x - 50;
      var local_y = local_graph_entry.y*spacing_y + 10;

      if (!row_tracker[local_graph_entry.y]) row_tracker[local_graph_entry.y] = [];
        row_tracker[local_graph_entry.y].push(all_graph_keys[i]);

      //Measure text width and define node height
      var is_selected = false;
      var node_text = (local_graph_entry.data.name) ?
        local_graph_entry.data.name : "Unlisted";
      var text_height = node_text.split("\n").length*node_height;
      var text_width = ctx.measureText(node_text).width;

      //Custom text parsing
      if (local_graph_entry.data.child_timelines && local_graph_entry.x == 1)
        node_text = `S. Init.`;
      if (local_graph_entry.data.parent_timeline_id)
        node_text = `Split From Timeline`;

      //is_selected parser
      if (local_graph_entry.timeline_id == global.actions.current_timeline && local_graph_entry.timeline_index == global.actions.current_index)
        is_selected = true;

      //Store position for click detection
      node_positions[all_graph_keys[i]] = {
        id: `${local_graph_entry.x}-${local_graph_entry.y}`,
        name: node_text,

        data: local_graph_entry.data,
        is_selected: is_selected,
        timeline_id: local_graph_entry.timeline_id,
        timeline_index: local_graph_entry.timeline_index,

        height: text_height,
        width: text_width,
        x: local_x,
        y: local_y,
      };
    }

    //Calculate canvas.height, canvas.width
    var all_node_positions_keys = Object.keys(node_positions);

    for (var i = 0; i < all_node_positions_keys.length; i++) {
      var local_node = node_positions[all_node_positions_keys[i]];

      canvas_height = Math.max(canvas_height, returnSafeNumber(local_node.y + local_node.height));
      canvas_width = Math.max(canvas_width, returnSafeNumber(local_node.x + local_node.width));
    }

    canvas.setAttribute("height", canvas_height);
    canvas.setAttribute("width", canvas_width);

    //Draw action nodes
    for (var i = 0; i < all_node_positions_keys.length; i++) {
      var local_node = node_positions[all_node_positions_keys[i]];

      if (local_node.is_selected) {
        ctx.fillStyle = `rgb(235, 235, 235)`;
        ctx.fillRect(local_node.x - local_node.width/2 - local_node.height/2, local_node.y - local_node.height/2 - local_node.height/2, local_node.width + local_node.height, local_node.height + local_node.height);
      }

      ctx.fillStyle = (!local_node.is_selected) ? "white" : "black";
      ctx.font = `${node_height}px Barlow Light`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(local_node.name, local_node.x, local_node.y);
    }

    //Draw horizontal lines
    var all_row_tracker_keys = Object.keys(row_tracker);

    for (var i = 0; i < all_row_tracker_keys.length; i++) {
      var local_row = row_tracker[all_row_tracker_keys[i]];
        local_row.sort((a, b) => node_positions[a].x - node_positions[b].x); //Sort nodes by X position

      for (var x = 0; x < local_row.length - 1; x++) {
        var local_end_key = local_row[x + 1];
        var local_start_key = local_row[x];

        var local_end_node = node_positions[local_end_key];
        var local_end_x = local_end_node.x - local_end_node.width - local_end_node.height;
        var local_end_y = local_end_node.y;
        var local_start_node = node_positions[local_start_key];
        var local_start_x = local_start_node.x + local_start_node.width/2 + local_start_node.height/2;
        var local_start_y = local_start_node.y;

        //Draw line between nodes
        ctx.beginPath();
        ctx.moveTo(local_start_x, local_start_y);
        ctx.lineTo(local_end_x, local_end_y);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      }
    }

    //Draw vertical lines
    for (var i = 0; i < all_graph_keys.length; i++) {
      var local_graph_entry = timeline_graph[all_graph_keys[i]];
      var local_node = node_positions[all_graph_keys[i]];
      var local_start_x = local_node.x;
      var local_start_y = local_node.y - local_node.height;

      if (local_graph_entry.connection_ids) {
        for (var x = 0; x < local_graph_entry.connection_ids.length; x++)
          if (node_positions[local_graph_entry.connection_ids[x]]) {
            var local_connecting_node = node_positions[local_graph_entry.connection_ids[x]];
            var local_end_x = local_connecting_node.x;
            var local_end_y = local_connecting_node.y + local_node.height;

            //Draw line between nodes
            ctx.beginPath();
            ctx.moveTo(local_start_x, local_start_y);
            ctx.lineTo(local_end_x, local_end_y);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
          }
      }
    }

    //Iterate over all node_positions and fetch maximum x and y to set canvas.height; canvas.width
    var all_node_positions_keys = Object.keys(node_positions);
    var canvas_height = 0;
    var canvas_width = 0;

    //Add click event listener to detect node clicks
    canvas.onclick = function (e) {
      var all_node_positions = Object.keys(node_positions);
      var canvas_el_rect = canvas.getBoundingClientRect();
      var click_x = e.clientX - canvas_el_rect.left;
      var click_y = e.clientY - canvas_el_rect.top;

      //Iterate over all_node_positions
      for (var i = 0; i < all_node_positions.length; i++) {
        var local_node = node_positions[all_node_positions[i]];

        if (click_x >= local_node.x - local_node.width/2 && click_x <= local_node.x + local_node.width && click_y >= local_node.y - local_node.height/2 && click_y <= local_node.y + local_node.height/2)
          console.log(`Clicked on key: ${local_node.id}`, local_node);
      }
    };
  }

  //initialiseUndoRedoUI() - Initialises undo/redo elements in UI. [WIP] - Finish function body
  function initialiseUndoRedoUI () {
    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var undo_redo_ui_el = document.querySelector(common_selectors.undo_redo_container);

    //Create global.undo_redo_loop
    global.undo_redo_loop = setInterval(function(){
      //Generate timeline table element
      generateTimelineCanvasElement(undo_redo_ui_el);
    }, 1000);
  }
}

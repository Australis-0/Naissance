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
    var spacing_x = 80;
    var spacing_y = 60;

    //Store node positions for event handling
    var node_positions = {};
    var row_tracker = {};

    //Determine canvas size based on graph
    var timeline_height = 1 + getTimelineMaxY(timeline_graph);
    var timeline_width = getTimelineMaxX(timeline_graph);

    canvas.width = timeline_width*spacing_x + 100;
    canvas.height = timeline_height*spacing_y + 100;

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
      var node_height = 14;
      var node_text = (local_graph_entry.data.name) ?
        local_graph_entry.data.name : "Unlisted";
      var text_width = ctx.measureText(node_text).width;

      //Store position for click detection
      node_positions[all_graph_keys[i]] = {
        id: `${local_graph_entry.x}-${local_graph_entry.y}`,
        x: local_x,
        y: local_y,

        height: node_height,
        width: text_width
      };

      //Draw text for node
      ctx.fillStyle = "white";
      ctx.font = `${node_height}px Barlow Light`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node_text, local_x, local_y);
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
        var local_end_x = local_end_node.x - local_end_node.width/2 - local_end_node.height/2;
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

//Declare functions
{
  function generateTimelineCanvasElement (arg0_canvas, arg1_options) {
    // Convert from parameters
    var canvas = arg0_canvas;
    var options = (arg1_options) ? arg1_options : {};

    // Initialize options
    if (options.flipped !== false) options.flipped = true;

    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous render

    // Declare local instance variables
    var timeline_graph = generateTimelineGraph();
    if (options.flipped) timeline_graph = getFlippedTimeline(timeline_graph);

    var all_graph_keys = Object.keys(timeline_graph);
    var nodeRadius = 15; // Node circle size
    var spacingX = 80;
    var spacingY = 60;

    // Store node positions for event handling
    var nodePositions = {};

    // Determine canvas size based on graph
    var timeline_height = 1 + getTimelineMaxY(timeline_graph);
    var timeline_width = getTimelineMaxX(timeline_graph);
    canvas.width = timeline_width * spacingX + 100;
    canvas.height = timeline_height * spacingY + 100;

    // Iterate over all graph keys and render nodes
    all_graph_keys.forEach((key) => {
        var local_graph_entry = timeline_graph[key];
        var x = local_graph_entry.x * spacingX + 50;
        var y = local_graph_entry.y * spacingY + 50;

        // Store position for click detection
        nodePositions[key] = { x, y, radius: nodeRadius };

        // Draw node (circle)
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();

        // Draw text inside node
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(local_graph_entry.data?.name || "Unlisted", x, y);
    });

    // Draw connections
    all_graph_keys.forEach((key) => {
        var local_graph_entry = timeline_graph[key];
        var startX = nodePositions[key].x;
        var startY = nodePositions[key].y;

        if (local_graph_entry.connection_ids) {
            local_graph_entry.connection_ids.forEach((connKey) => {
                if (nodePositions[connKey]) {
                    var endX = nodePositions[connKey].x;
                    var endY = nodePositions[connKey].y;

                    // Draw line between nodes
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.closePath();
                }
            });
        }
    });

    // Add click event listener to detect node clicks
    canvas.onclick = function (event) {
        var rect = canvas.getBoundingClientRect();
        var clickX = event.clientX - rect.left;
        var clickY = event.clientY - rect.top;

        for (let key in nodePositions) {
            let { x, y, radius } = nodePositions[key];
            let distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
            if (distance <= radius) {
                console.log(`Clicked on key: ${key}`);
                break;
            }
        }
    };
  }

  /*
    generateTimelineTableElement() - Generates a timeline table element of the current undo/redo tree.
    arg0_element: (HTMLElement)
    arg1_options: (Object)
      flipped: (Boolean) - Optional. True by default.
  */
  function generateTimelineTableElement (arg0_element, arg1_options) { //[WIP] - Fix lines and finish function body
    //Convert from parameters
    var element = arg0_element;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (options.flipped != false) options.flipped = true;

    //Declare local instance variables
    var table_html = [];
    var timeline_graph = generateTimelineGraph();
      //Flip timeline graph if applicable
      if (options.flipped) timeline_graph = getFlippedTimeline(timeline_graph);

    var all_graph_keys = Object.keys(timeline_graph);
    var timeline_height = 1 + getTimelineMaxY(timeline_graph);
    var timeline_width = getTimelineMaxX(timeline_graph);

    //Populate table_html with timeline_x; timeline_y
    var table_graph_el = generateTable(timeline_width, timeline_height);

    //Assign table_html to element
    element.innerHTML = table_graph_el;

    //Iterate over all_graph_keys
    for (var i = 0; i < all_graph_keys.length; i++) {
      var local_graph_entry = timeline_graph[all_graph_keys[i]];
      var local_graph_entry_name = `Unlisted Action`;

      var local_graph_element = element.querySelector(`[id='${local_graph_entry.x}-${local_graph_entry.y}']`);

      //Make sure local_graph_element exists
      if (local_graph_element) {
        //Append local_graph_entry.data.name to element
        if (local_graph_entry.data)
          if (local_graph_entry.data.name)
            local_graph_entry_name = local_graph_entry.data.name;
        local_graph_element.innerHTML = local_graph_entry_name;

        //Set ID in 'class' attribute
        local_graph_element.setAttribute("class",
          local_graph_element.getAttribute("class") + ` ${all_graph_keys[i]}`
        );

        //Append local_graph_entry.connections to element, drawing lines in between table elements
        //[WIP] - This needs to be debugged later
        if (local_graph_entry.connection_ids)
          //Iterate over local_graph_entry.connection_ids
          for (var x = 0; x < local_graph_entry.connection_ids.length; x++) {
            var local_connection_id = local_graph_entry.connection_ids[x];
            var local_to_element = element.querySelector(`[class*='${local_connection_id}']`);

            if (local_to_element) {
              var generated_line = generateLine(local_graph_element, local_to_element, {
                colour: "white"
              });
            }
          }
      }
    }

    //Return statement
    return element.innerHTML;
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

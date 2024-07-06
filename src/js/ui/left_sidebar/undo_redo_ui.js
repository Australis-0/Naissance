//Declare functions
{
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
        /*if (local_graph_entry.connection_ids)
          //Iterate over local_graph_entry.connection_ids
          for (var x = 0; x < local_graph_entry.connection_ids.length; x++) {
            var local_connection_id = local_graph_entry.connection_ids[x];
            var local_to_element = element.querySelector(`[class*='${local_connection_id}']`);

            if (local_to_element) {
              var generated_line = generateLine(local_graph_element, local_to_element, {
                colour: "white"
              });

              //element.innerHTML += generated_line;
            }
          }*/
      }
    }

    //Return statement
    return element.innerHTML;
  }

  //initialiseUndoRedoUI() - Initialises undo/redo elements in UI. [WIP] - Finish function body
  function initialiseUndoRedoUI () {
    //Declare local instance variables
    var undo_redo_ui_el = document.getElementById(`undo-redo-ui-container`);

    //Create global.undo_redo_loop
    global.undo_redo_loop = setInterval(function(){
      //Generate timeline table element
      //generateTimelineTableElement(undo_redo_ui_el);
    }, 1000);
  }
}

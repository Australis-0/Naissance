//Direct Brush UI functions
{
  function initBrush () {
    //Declare local instance variables
    var brush_obj = main.brush;

    main.cursor_layer = new maptalks.VectorLayer("cursor_layer").addTo(map);

    //On mousemove event for map
    map.on("mousemove", function (e) {
      //Set cursor
      {
        //Remove previous cursor
        if (brush_obj.cursor)
          brush_obj.cursor.remove();

        //Set new cursor
        brush_obj.cursor = new maptalks.Circle(e.coordinate, brush_obj.radius, {
          symbol: {
            lineColor: RGBToHex(0, 0, 0),
            lineDasharray: [4, 4],
            polygonFill: "transparent",
            lineWidth: 2
          }
        });
        main.cursor_layer.addGeometry(brush_obj.cursor);
      }

      //Left click to paint
      if (main.events.mouse_pressed) {
        if (main.events.left_mouse) {
          //Initialise brush_obj.current_path if not defined
          if (!brush_obj.current_path) {
            brush_obj.current_path = brush_obj.cursor;
            if (!brush_obj.entity_options)
              brush_obj.entity_options = {};
              if (!brush_obj.entity_options.className)
                brush_obj.entity_options.className = generateEntityID();
              if (!brush_obj.entity_options.history)
                brush_obj.entity_options.history = {};
          }

          brush_obj.brush_change = true;
          addToBrush(brush_obj.cursor);
          brush_obj.current_path = union(brush_obj.current_path, brush_obj.cursor);
        } else if (main.events.right_mouse) {
          //Only delete if brush_obj.current_path exists
          if (brush_obj.current_path)
            try {
              removeFromBrush(brush_obj.cursor);

              brush_obj.brush_change = true;
            } catch (e) {
              //The selection has been completely deleted
              delete brush_obj.current_path;

              brush_obj.brush_change = true;
            }
        }

        //Refresh selection display
        refreshBrush();
      }
    });

    //Brush cursor outline
    map.getContainer().addEventListener("wheel", function (e) {
      //Normalise the wheel delta across different browsers
      var delta_y = e.deltaY*-1;

      if (window.ctrl_pressed) {
        if (delta_y < 0)
          brush_obj.radius = brush_obj.radius*1.1;
        if (delta_y > 0)
          brush_obj.radius = brush_obj.radius*0.9;
      }
    });
  }

  function processBrush () {
    //Declare local instance variables
    var brush_obj = main.brush;
    var selected_id = "";

    if (brush_obj.brush_change) { //brush_obj.brush_change here refers to discrete changes; not continuous changes
      if (brush_obj.current_path) {
        if (brush_obj.current_selection)
          selected_id = brush_obj.current_selection.options.className;

        //Simplify processing
        if (brush_obj.auto_simplify_when_editing)
          if (brush_obj.current_path)
            brush_obj.current_path = simplify(brush_obj.current_path, brush_obj.simplify_tolerance);

        //Set new poly now
        refreshBrush();
      }

      //Set brush_obj.brush_change to false to avoid repeat processing
      brush_obj.brush_change = false;
    }
  }

  function refreshBrush () {
    //Declare local instance variables
    var brush_obj = main.brush;

    //Refresh polity
    {
      if (brush_obj.current_selection) {
        brush_obj.current_selection.remove();
        delete brush_obj.current_selection; //current_selection has to actually be deleted to avoid refresh errors
      }
      if (brush_obj.current_path) {
        brush_obj.current_selection = createPolygon(brush_obj.current_path, brush_obj.entity_options);
        brush_obj.current_selection.remove();
        brush_obj.current_selection.addTo(main.cursor_layer);
      }

      //Bind tooltip to selection
      if (brush_obj.current_selection) {
        brush_obj.current_selection.setSymbol(brush_obj.entity_options);
        brush_obj.current_selection.on("click", function (e) {
          printEntityContextMenu(e.target.options.className, { coords: e.coordinate, is_being_edited: true });
        });
      }
    }
  }
}

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

        //Mask processing
        {
          //Iterate over all mask_add entities
          for (var i = 0; i < brush_obj.masks.add.length; i++) {
            var local_value = brush_obj.masks.add[i];

            var local_id = local_value.options.className;

            if (local_id != selected_id)
              if (local_value._latlngs && brush_obj.current_path) {
                var local_coords = difference(local_value._latlngs, brush_obj.current_path);

                //If local_coords is defined, set it - otherwise hide it
                if (local_coords) {
                  local_value.setLatLngs(local_coords);

                  //Set new ._latlngs to coords of current history frame
                  createHistoryFrame(local_value.options.className, main.date, {}, local_coords);
                } else {
                  hideEntity(local_value.options.className, main.date);
                }
              }
          }

          //[WIP] - This section needs to be refactored with the following algorithm:
          /*
            1. Fetch brush_obj.masks.intersect_overlay result
            2. Subtract brush_obj.masks.intersect_overlay result from all entities in brush_obj.masks.intersect_add
          */
          //Iterate over all mask_intersect_add entities
          /*
          if (brush_obj.masks.intersect_add.length > 0) {
            //1. Fetch combined_union
            var combined_union = convertMaptalksCoordsToTurf(brush_obj.masks.intersect_add[0]);

            for (var i = 0; i < brush_obj.masks.intersect_add.length; i++) {
              var local_value = brush_obj.masks.intersect_add[i];

              var local_id = local_value.options.className;

              if (local_id != selected_id)
                if (local_value._coordinates)
                  combined_union = union(convertMaptalksCoordsToTurf(local_value), combined_union);
            }

            //2. Set brush_obj.current_path to intersection of brush and combined_union
            brush_obj.current_path = intersection(brush_obj.current_path, combined_union);
            if (brush_obj.current_path) {
              var old_current_path = JSON.parse(JSON.stringify(brush_obj.current_path));
              brush_obj.current_path = buffer(brush_obj.current_path, {
                radius: 0.001,
                units: "kilometers"
              });
            }

            //3. Now, iterate over brush_obj.masks.intersect_add with brush_obj.masks.add logic
            for (var i = 0; i < brush_obj.masks.intersect_add.length; i++) {
              var local_value = brush_obj.masks.intersect_add[i];

              var local_id = local_value.options.className;

              if (local_id != selected_id)
                if (local_value._coordinates && brush_obj.current_path) {
                  var local_coords = difference(convertMaptalksCoordsToTurf(local_value), brush_obj.current_path);

                  //If local_coords is defined, set it - otherwise hide it
                  if (local_coords) {
                    try {
                      local_value.setCoordinates(local_coords);
                    } catch {}

                    //Set new ._latlngs to coords of current history frame
                    createHistoryFrame(local_value.options.className, main.date, {}, local_coords);
                  } else {
                    hideEntity(local_value.options.className, main.date);
                  }
                }
            }

            //4. Push selection to mask now to make sure it masks the entire group
            if (brush_obj.current_selection)
              brush_obj.masks.intersect_add.push({
                selection: true,

                options: brush_obj.current_selection.options,
                _latlngs: old_current_path
              });
            for (var i = 0; i < brush_obj.masks.intersect_add.length; i++) {
              var local_value = brush_obj.masks.intersect_add[i];

              if (local_value.selection) {
                console.log("Local value:", local_value);
                console.log(getCoordsType(local_value));
                if (local_value._latlngs)
                  brush_obj.current_path = union(getTurfObject(local_value), brush_obj.current_path);
              }
            }
          }
          */

          //Iterate over all mask_intersect_overlay entities
          if (brush_obj.masks.intersect_overlay.length > 0) {
            var combined_union = convertMaptalksCoordsToTurf(brush_obj.masks.intersect_overlay[0]);

            for (var i = 0; i < brush_obj.masks.intersect_overlay.length; i++) {
              var local_value = brush_obj.masks.intersect_overlay[i];

              var local_id = local_value.options.className;

              if (local_id != selected_id)
                if (local_value._coordinates)
                  combined_union = union(convertMaptalksCoordsToTurf(local_value), combined_union);
            }

            brush_obj.current_path = intersection(brush_obj.current_path, combined_union);
          }

          //Iterate over all mask_subtract entities
          for (var i = 0; i < brush_obj.masks.subtract.length; i++) {
            var local_value = brush_obj.masks.subtract[i];

            var local_id = local_value.options.className;

            if (local_id != selected_id)
              if (local_value._coordinates)
                brush_obj.current_path = difference(brush_obj.current_path, convertMaptalksCoordsToTurf(local_value));
          }
        }

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

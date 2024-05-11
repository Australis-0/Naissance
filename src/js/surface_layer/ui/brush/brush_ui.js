//Direct Brush UI functions
{
  function initBrush () {
    map.on("mousemove", function (e) {
      //Set cursor
      {
        //Remove previous cursor
        if (main.brush.cursor)
          main.brush.cursor.remove();

        //Set new cursor
        main.brush.cursor = LGeo.circle(e.latlng, main.brush.radius, {
          color: RGBToHex(0, 0, 0),
          dashArray: 4,
          fill: false,
          weight: 2
        }).addTo(map);
      }

      //Left click to paint
      if (main.events.mouse_pressed) {
        if (main.events.left_mouse) {
          //Initialise main.brush.current_path if not defined
          if (!main.brush.current_path)
            main.brush.current_path = main.brush.cursor;

           main.brush.current_path = union( main.brush.current_path, main.brush.cursor);

          main.brush.brush_change = true;
        } else if (main.events.right_mouse) {
          //Only delete if  main.brush.current_path exists
          if (main.brush.current_path)
            try {
               main.brush.current_path = difference( main.brush.current_path, main.brush.cursor);

              brush.brush_change = true;
            } catch {
              //The selection has been completely deleted
              delete window. main.brush.current_path;
            }
        }

        //Refresh selection display
        refreshBrush();
      }
    });

    //Brush cursor outline
    L.DomEvent.on(L.DomUtil.get("map"), "mousewheel", function (e) {
      if (e.wheelDeltaY < 0)
        main.brush.radius = main.brush.radius*1.1;
      if (e.wheelDeltaY > 0)
        main.brush.radius = main.brush.radius*0.9;
    });
  }

  function processBrush () {
    //Declare local instance variables
    var brush_obj = getBrush();
    var selected_id = "";

    if (brush_obj.brush_change) {
      if ( main.brush.current_path) {
        if (main.brush.current_selection)
          selected_id = main.brush.current_selection.options.className;

        //Mask processing
        {
          //Iterate over all mask_add entities
          for (var i = 0; i < main.brush.masks.add.length; i++) {
            var local_value = main.brush.masks.add[i];

            var local_id = local_value.options.className;

            if (local_id != selected_id)
              if (local_value._latlngs) {
                var local_coords = difference(local_value._latlngs,  main.brush.current_path);

                local_value.setLatLngs(local_coords);

                //Set new ._latlngs to coords of current history frame
                createHistoryFrame(local_value.options.className, main.date, {}, local_coords);
              }
          }

          //Iterate over all mask_intersect_add entities
          if (main.brush.masks.intersect_add.length > 0) {
            var combined_union = getTurfObject(main.brush.masks.intersect_add[0]._latlngs);

            for (var i = 0; i < main.brush.masks.intersect_add.length; i++) {
              var local_value = main.brush.masks.intersect_add[i];

              var local_id = local_value.options.className;

              if (local_id != selected_id || local_value.selection)
                if (local_value._latlngs)
                  combined_union = union(local_value._latlngs, combined_union);
            }

            //Fetch the area that perfectly overlaps with the intersection
             main.brush.current_path = intersection( main.brush.current_path, combined_union);

            //Overwrite intersection area
            if ( main.brush.current_path) {
              //Buffer by 1m on a deep copy to make sure we don't have issues
              var old_current_path = JSON.parse(JSON.stringify(main.brush.current_path));
              main.brush.current_path = buffer(main.brush.current_path, {
                radius: 0.001,
                units: "kilometers"
              });

              for (var i = 0; i < main.brush.masks.intersect_add.length; i++) {
                var local_value = main.brush.masks.intersect_add[i];

                var local_entity_id = local_value.options.className;

                if (local_entity_id != selected_id)
                  if (local_value._latlngs) {

                    local_value._latlngs = difference(local_value._latlngs, main.brush.current_path);
                    createHistoryFrame(local_entity_id, date, {}, local_value._latlngs);

                    local_value.removeFrom(map);
                    local_value.addTo(map);
                  }
              }

              //Push selection to mask now in order to make sure it masks the entire group
              if (main.brush.current_selection)
                main.brush.masks.intersect_add.push({
                  selection: true,

                  options: main.brush.current_selection.options,
                  _latlngs: old_current_path
                });

              for (var i = 0; i < main.brush.masks.intersect_add.length; i++) {
                var local_value = main.brush.masks.intersect_add[i];

                if (local_value.selection)
                  main.brush.current_path = union(local_value._latlngs, main.brush.current_path);
              }
            }
          }

          //Iterate over all mask_intersect_overlay entities
          if (main.brush.masks.intersect_overlay.length > 0) {
            var combined_union = getTurfObject(main.brush.masks.intersect_overlay[0]._latlngs);

            for (var i = 0; i < main.brush.masks.intersect_overlay.length; i++) {
              var local_value = main.brush.masks.intersect_overlay[i];

              var local_id = local_value.options.className;

              if (local_id != selected_id)
                if (local_value._latlngs)
                  combined_union = union(local_value._latlngs, combined_union);
            }

            main.brush.current_path = intersection(main.brush.current_path, combined_union);
          }

          //Iterate over all mask_subtract entities
          for (var i = 0; i < main.brush.masks.subtract.length; i++) {
            var local_value = main.brush.masks.subtract[i];

            var local_id = local_value.options.className;

            if (local_id != selected_id)
              if (local_value._latlngs)
                main.brush.current_path = difference(main.brush.current_path, local_value._latlngs);
          }
        }

        //Simplify processing
        if (main.brush.auto_simplify_when_editing)
          if (main.brush.current_path)
            main.brush.current_path = simplify(main.brush.current_path, main.brush.simplify_tolerance);

        //Set new poly now
        refreshBrush();
      }

      //Set brush_obj.brush_change to false to avoid repeat processing
      brush_obj.brush_change = false;
    }
  }

  function refreshBrush () {
    //Refresh polity
    {
      if (main.brush.current_selection)
        main.brush.current_selection.remove();
      if (main.brush.current_path)
        main.brush.current_selection = L.polygon(main.brush.current_path, main.brush.polity_options).addTo(map);

      //Bind tooltip to selection
      if (main.brush.current_selection) {
        L.setOptions(main.brush.current_selection, main.brush.polity_options);
        main.brush.current_selection.on("click", function (e) {
          entityUI(e, true);
        });
      }
    }
  }
}

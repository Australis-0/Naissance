//Direct Brush UI functions
{
  function initBrush () {
    map.on("mousemove", function (e) {
      //Set cursor
      {
        //Remove previous cursor
        if (window.cursor)
          cursor.remove();

        //Set new cursor
        cursor = LGeo.circle(e.latlng, brush.radius, {
          color: RGBToHex(0, 0, 0),
          dashArray: 4,
          fill: false,
          weight: 2
        }).addTo(map);
      }

      //Left click to paint
      if (mouse_pressed) {
        if (window.left_mouse) {
          //Initialise current_union if not defined
          if (!window.current_union)
            window.current_union = cursor;

          current_union = union(current_union, cursor);

          brush.brush_change = true;
        } else if (window.right_mouse) {
          //Only delete if current_union exists
          if (window.current_union)
            try {
              current_union = difference(current_union, cursor);

              brush.brush_change = true;
            } catch {
              //The selection has been completely deleted
              delete window.current_union;
            }
        }

        //Refresh selection display
        refreshBrush();
      }
    });

    //Brush cursor outline
    L.DomEvent.on(L.DomUtil.get("map"), "mousewheel", function (e) {
      if (e.wheelDeltaY < 0)
        brush.radius = brush.radius*1.1;
      if (e.wheelDeltaY > 0)
        brush.radius = brush.radius*0.9;
    });
  }

  function processBrush () {
    //Declare local instance variables
    var brush_obj = getBrush();
    var selected_id = "";

    if (brush_obj.brush_change) {
      if (window.current_union) {
        if (window.selection)
          selected_id = window.selection.options.className;

        //Mask processing
        {
          //Iterate over all mask_add entities
          for (var i = 0; i < brush_obj.mask_add.length; i++) {
            var local_value = brush_obj.mask_add[i];

            var local_id = local_value.options.className;

            if (local_id != selected_id)
              if (local_value._latlngs) {
                var local_coords = difference(local_value._latlngs, current_union);

                local_value.setLatLngs(local_coords);

                //Set new ._latlngs to coords of current history frame
                createHistoryFrame(local_value.options.className, window.date, {}, local_coords);
              }
          }

          //Iterate over all mask_intersect_add entities
          if (brush_obj.mask_intersect_add.length > 0) {
            var combined_union = getTurfObject(brush_obj.mask_intersect_add[0]._latlngs);

            for (var i = 0; i < brush_obj.mask_intersect_add.length; i++) {
              var local_value = brush_obj.mask_intersect_add[i];

              var local_id = local_value.options.className;

              if (local_id != selected_id || local_value.selection)
                if (local_value._latlngs)
                  combined_union = union(local_value._latlngs, combined_union);
            }

            //Fetch the area that perfectly overlaps with the intersection
            current_union = intersection(current_union, combined_union);

            //Overwrite intersection area
            if (current_union) {
              //Buffer by 1m on a deep copy to make sure we don't have issues
              var old_current_union = JSON.parse(JSON.stringify(current_union));
              current_union = buffer(current_union, {
                radius: 0.001,
                units: "kilometers"
              });

              for (var i = 0; i < brush_obj.mask_intersect_add.length; i++) {
                var local_value = brush_obj.mask_intersect_add[i];

                var local_id = local_value.options.className;

                if (local_id != selected_id)
                  if (local_value._latlngs) {
                    local_value._latlngs = difference(local_value._latlngs, current_union);
                    local_value.removeFrom(map);
                    local_value.addTo(map);
                  }
              }

              //Push selection to mask now in order to make sure it masks the entire group
              if (window.selection)
                brush_obj.mask_intersect_add.push({
                  selection: true,

                  options: window.selection.options,
                  _latlngs: old_current_union
                });

              for (var i = 0; i < brush_obj.mask_intersect_add.length; i++) {
                var local_value = brush_obj.mask_intersect_add[i];

                if (local_value.selection)
                  current_union = union(local_value._latlngs, current_union);
              }
            }
          }


          //Iterate over all mask_intersect_overlay entities
          if (brush_obj.mask_intersect_overlay.length > 0) {
            var combined_union = getTurfObject(brush_obj.mask_intersect_overlay[0]._latlngs);

            for (var i = 0; i < brush_obj.mask_intersect_overlay.length; i++) {
              var local_value = brush_obj.mask_intersect_overlay[i];

              var local_id = local_value.options.className;

              if (local_id != selected_id)
                if (local_value._latlngs)
                  combined_union = union(local_value._latlngs, combined_union);
            }

            current_union = intersection(current_union, combined_union);
          }

          //Iterate over all mask_subtract entities
          for (var i = 0; i < brush_obj.mask_subtract.length; i++) {
            var local_value = brush_obj.mask_subtract[i];

            var local_id = local_value.options.className;

            if (local_id != selected_id)
              if (local_value._latlngs)
                current_union = difference(current_union, local_value._latlngs);
          }
        }

        //Simplify processing
        if (brush_obj.auto_simplify_when_editing)
          if (current_union)
            current_union = simplify(current_union, window.simplify_tolerance);

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
      if (window.selection)
        window.selection.remove();
      if (window.current_union)
        window.selection = L.polygon(current_union, window.polity_options).addTo(map);

      //Bind tooltip to selection
      if (window.selection) {
        L.setOptions(selection, window.polity_options);
        selection.on("click", function (e) {
          entityUI(e, true);
        });
      }
    }
  }
}

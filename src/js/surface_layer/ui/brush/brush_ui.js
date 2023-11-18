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
          //Iterate over all_mask_add_keys
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


          //Iterate over all_mask_subtract_keys
          for (var i = 0; i < brush_obj.mask_subtract.length; i++) {
            var local_value = brush_obj.mask_subtract[i];

            var local_id = local_value.options.className;

            if (local_id != selected_id) {
              var local_value = brush_obj.mask_subtract[i];

              if (local_value._latlngs)
                current_union = difference(current_union, local_value._latlngs);
            }
          }
        }

        //Simplify processing
        if (brush_obj.auto_simplify_when_editing)
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

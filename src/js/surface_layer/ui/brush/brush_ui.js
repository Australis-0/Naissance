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

          if (window.brush.auto_simplify_when_editing)
            current_union = simplify(current_union, window.simplify_tolerance);
        } else if (window.right_mouse) {
          //Only delete if current_union exists
          if (window.current_union)
            try {
              current_union = difference(current_union, cursor);

              if (window.brush.auto_simplify_when_editing)
                current_union = simplify(current_union, window.simplify_tolerance);
            } catch {
              //The selection has been completely deleted
              delete window.current_union;
            }
        }

        //Refresh selection display
        {
          if (window.selection) window.selection.remove();
          if (window.current_union)
            window.selection = L.polygon(current_union, window.polity_options).addTo(map);

          //Bind tooltip to selection
          L.setOptions(selection, window.polity_options);
          selection.on("click", function (e) {
            entityUI(e, true);
          });
        }
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
}

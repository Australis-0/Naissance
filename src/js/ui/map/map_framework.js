//Declare functions
function clearMap () {
  //Clear entities
  if (main.entities)
    for (var i = 0; i < main.entities.length; i++)
      main.entities[i].remove();

  try {
    clearBrush();
  } catch {}
}

function returnLoop (arg0_map_element, arg1_styling) {
  //Convert from parameters
  var map_element = arg0_map_element;
  var css = arg1_styling;

  //Return statement
  return L.vectorGrid.slicer(map_element.toGeoJSON(), {
    rendererFactory: L.svg.tile,
    vectorTileLayerStyles: {
      sliced: function (properties, zoom) {
        return css;
      }
    },
    interactive: true
  });
}

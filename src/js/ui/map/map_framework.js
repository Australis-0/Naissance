//Declare functions
function clearMap () {
  //Clear entities
  for (var i = 0; i < main.all_layers.length; i++) {
    var local_layer = main.layers[main.all_layers[i]];

    for (var x = 0; x < local_layer.length; x++)
      local_layer[x].remove();
    local_layer = [];
  }

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

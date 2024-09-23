//Initialise functions
{
  /*
    arg0_coords: (Array<Array<Number, Number>>) - The initial coords to create a polygon with.
    arg1_options: (Object)
      do_not_display: (Boolean) - Optional. Whether to not display the polygon. False by default.
      <key>: (Variable) - Other values for options.

    Returns: (Object, MapTalks)
  */
  function createPolygon (arg0_coords, arg1_options) {
    //Convert from parameters
    var coords = arg0_coords;
    var options = (arg1_options) ? convertLeafletOptionsToMaptalks(arg1_options) : {
      "test": true, //Note that this actually moves it in
      'lineColor': '#34495e',
      'lineWidth': 2,
      'polygonFill': '#1bbc9b',
      'polygonOpacity': 0.6
    };

    //Initialise options
    if (!options.lineColor) options.lineColor = "#34495e";
    if (!options.lineWidth) options.lineWidth = 2;
    if (!options.polygonFill) options.polygonFill = "#1bbc9b";
    if (!options.polygonOpacity) options.polygonOpacity = 0.6;

    if (!validateCoordinates(coords))
      coords = flipCoordinates(convertCoordsToGeoJSON(coords));
    coords = flipCoordinates(coords);

    //Declare local instance variables
    var old_options = JSON.parse(JSON.stringify(options));

    var maptalks_polygon = new maptalks.Polygon(coords, {
      symbol: options
    });

    try {
      if (maptalks_polygon.getExtent()) {
        if (!options.do_not_display)
          main.entity_layer.addGeometry(maptalks_polygon);
        maptalks_polygon.options = dumbMergeObjects(maptalks_polygon.options, old_options);
      } else {
        maptalks_polygon = new maptalks.GeoJSON.toGeometry(new L.Polygon(flipCoordinates(coords)).toGeoJSON(), (geometry) => {
          geometry.config("symbol", options);
          if (!options.do_not_display)
            geometry.addTo(main.entity_layer);
          geometry.options = dumbMergeObjects(maptalks_polygon.options, old_options);
        });
      }
    } catch (e) {
      maptalks_polygon = createPolygonFallback(coords, options);
    }

    //Return statement
    return maptalks_polygon;
  }

  function createPolygonFallback (arg0_coords, arg1_options) {
    //Convert from parameters
    var coords = arg0_coords;
    var options = (arg1_options) ? arg1_options : {};

    coords = flipCoordinates(coords);

    //Declare local instance variables
    var local_geometry = maptalks.GeoJSON.toGeometry((new L.Polygon(coords)).toGeoJSON());
    var old_options = JSON.parse(JSON.stringify(options));

    if (!options.do_not_display)
      local_geometry.addTo(main.entity_layer);
    local_geometry.setSymbol(options);
    local_geometry.options = dumbMergeObjects(local_geometry.options, old_options);

    //Return statement
    return local_geometry;
  }
}

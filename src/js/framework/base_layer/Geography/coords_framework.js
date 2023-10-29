//Coordinate conversion functions
{
  function convertToLeaflet (arg0_format) {
    //Convert from parameters
    var format = arg0_format;

    //Declare local instance variables
    var format_type = getCoordsType(format);
    var leaflet_coords;

    //Guard clauses if already of Leaflet type
    if (format_type == "leaflet")
      return JSON.parse(JSON.stringify(format));
    if (format_type == "leaflet_non_poly")
      return JSON.parse(JSON.stringify(format._latlngs));

    //If a valid format type, convert it to Leaflet somehow
    if (format_type)
      if (format_type == "geojson") {
        if (format._layers) {
          var all_layers = Object.keys(format._layers);

          if (all_layers.length > 0)
            leaflet_coords = format._layers[all_layers[0]]._latlngs;
        }
      } else if (format_type == "naissance") {
        var temp_polygon = L.polygon(format);

        leaflet_coords = temp_polygon._latlngs;
      } else if (format_type == "naissance_history") {
        var temp_polygon = L.polygon(format.coords)

        leaflet_coords = temp_polygon._latlngs;
      } else if (format_type == "turf") {
        var turf_obj = getTurfObject(format);

        var local_geojson = L.geoJSON(turf_obj);

        leaflet_coords = getGeoJSONCoords(local_geojson);
      } else if (format_type == "turf_object") {
        var local_geojson = L.geoJSON(format);

        leaflet_coords = getGeoJSONCoords(local_geojson);
      }

    //Return statement
    return leaflet_coords;
  }

  //convertToNaissance() - Recursive function stripping lat, lng from coordinates
  function convertToNaissance (arg0_format) {
    //Convert from parameters
    var format = arg0_format;

    //Declare local instance variables
    var leaflet_coords = convertToLeaflet(format);

    //Iterate over leaflet_coords
    for (var i = 0; i < leaflet_coords.length; i++)
      if (Array.isArray(leaflet_coords[i])) {
        console.log(`Calling convertToNaissance()!`);
        leaflet_coords[i] = convertToNaissance(leaflet_coords[i]);
      } else {
        leaflet_coords[i] = [leaflet_coords[i].lat, leaflet_coords[i].lng];
      }

    //Return statement
    return leaflet_coords;
  }

  //convertToTurf() - Returns [coordinates, type];
  function convertToTurf (arg0_format) {
    //Convert from parameters
    var format = arg0_format;

    //Declare local instance variables
    var format_type = getCoordsType(format);
    var turf_coords;

    //Guard clauses if already Turf type
    if (format_type == "turf")
      return format;

    //If a valid format type, convert it to Turf somehow
    if (format_type)
      if (format_type == "geojson") {
        var geojson_coords = getGeoJSONCoords(format);

        turf_coords = convertLeafletToTurf(geojson_coords);
      } else if (["leaflet", "naissance"].includes(format_type)) {
        turf_coords = convertLeafletToTurf(format);
      } else if (format_type == "leaflet_non_poly") {
        turf_coords = convertLeafletToTurf(format._latlngs);
      } else if (format_type == "naissance_history") {
        var no_coords = false;

        //Guard clause if no coords
        {
          if (format.coords) {
            if (format.coords.length == 0)
              no_coords = true;
          } else {
            no_coords = true;
          }

          if (no_coords)
            return [format.coords, "polygon"];
        }

        turf_coords = convertLeafletToTurf(format.coords);
      } else if (format_type == "turf_object") {
        turf_coords = convertLeafletToTurf(format);
      }

    //Return statement
    return turf_coords;
  }

  //getCoordsType() - Returns either 'geojson', 'leaflet', 'leaflet_non_poly', 'naissance', 'naissance_history', 'turf', or 'turf_object'
  function getCoordsType (arg0_format) {
    //Convert from parameters
    var format = arg0_format;

    //Declare local instance variables
    var coord_type;

    //Check if type is GeoJSON
    if (format._initHooksCalled && !format._latlngs)
      return "geojson";

    //Check if type is Leaflet
    if (format._latlngs)
      return "leaflet_non_poly";
    if (Array.isArray(format)) {
      var flattened_array = format.flat(Infinity);

      if (typeof flattened_array[0] == "object")
        if (flattened_array[0].lat && flattened_array[1].lng)
          return "leaflet";
    }

    //Check if type is naissance
    if (Array.isArray(format))
      if (!format.some(isNaN))
        return "naissance";

    //Check if type is naissance_history
    if (typeof format == "object")
      if (format.id && format.coords)
        return "naissance_history";

    //Check if type is turf
    if (Array.isArray(format))
      if (format.length == 2)
        if (format.isArray(format[0]) && typeof format[1] == "string")
          if (["polygon", "multiPolygon"].includes(format[1]))
            return "turf";

    //Check if type is turf_object
    if (typeof format == "object")
      if (format.type == "Feature" && format.geometry)
        return "turf_object";
  }
}

//Internals functions - Should not actually be used by end dev
{
  function convertLeafletToTurf (arg0_geojson) {
    //Convert from parameters
    var geojson = arg0_geojson;

    //Declare local instance variables
    var temp_polygon = L.polygon(geojson).toGeoJSON();

    return [
      temp_polygon.geometry.coordinates,
      (temp_polygon.geometry.type == "Polygon") ? "polygon" : "multiPolygon"
    ];
  }

  function convertLeafletToNaissance (arg0_coords) {
    //Convert from parameters
    var coords = arg0_coords;

    //Iterate over coords
    for (var i = 0; i < coords.length; i++)
      if (Array.isArray(coords[i])) {
        coords[i] = convertLeafletToNaissance(coords[i]);
      } else {
        coords[i] = [coords[i].lat, coords[i].lng];
      }

    //Return statement
    return coords;
  }

  function getGeoJSONCoords (arg0_geoJSON) {
    //Convert from parameters
    var geojson = arg0_geoJSON;

    //Declare local instance variables
    var coords = [];

    //Check if layers exists
    if (geojson._layers) {
      var all_layers = Object.keys(geojson._layers);

      if (all_layers.length > 0)
        coords = geojson._layers[all_layers[0]]._latlngs;
    }

    //Return statement
    return coords;
  }
}

//Declare functions
function clearBrush () {
  //Declare local instance variables
  var all_remnant_unions = document.querySelectorAll(".current-union.leaflet-interactive");

  //Clear polygon if deleted
  for (var i = 0; i < entity_cache.length; i++)
    entity_cache[i].remove();
  entity_cache = [];

  current_entity.clearLayers();
  current_union.remove();

  //Remove polygon artefacts
  for (var i = 0; i < all_remnant_unions.length; i++)
    all_remnant_unions[i].remove();
}

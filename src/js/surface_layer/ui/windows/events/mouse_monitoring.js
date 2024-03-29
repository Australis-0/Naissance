//Map popup events
map.on("popupopen", function (e) {
  var local_popup = e.popup;

  if (local_popup.options.id == "entity-ui-popup")
    setTimeout(function(){
      var entity_id = local_popup.options.class;

      populateEntityUI(entity_id);
    }, 200);
});

map.on("popupclose", function (e) {
  var local_popup = e.popup;

  if (local_popup.options.id == "entity-ui-popup") {
    //Close entity UI
    delete opened_interfaces[local_popup.options.class];
    delete opened_popups[local_popup.options.class];
  }
})

//Mouse down/up events
document.getElementById("map").onmousedown = function (e) {
  var sidebar_container_el = document.querySelector("sidebar-ui-container:hover");

  if (!(e.which == 2 || e.button == 4) && !sidebar_container_el) {
    window.mouse_pressed = true;
    map.dragging.disable();
  }

  if (e.button == 2)
    window.right_mouse = true;
  window.left_mouse = (!window.right_mouse);
};

document.body.onmouseup = function (e) {
  window.mouse_pressed = false;
  window.right_mouse = false;

  map.dragging.enable();

  //Process brush
  processBrush();
};

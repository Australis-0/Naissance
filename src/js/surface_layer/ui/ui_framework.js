//UI window functions
{
  function closePopup () {
    map.closePopup();
  }

  function updateSidebarHover () {
    //Declare local instance variables
    var all_hovers = document.querySelectorAll(`.hierarchy-elements-container div:hover`);
    var all_legacy_hovers = document.querySelectorAll(`.hover`);

    //Clear all elements with .hover class
    for (var i = 0; i < all_legacy_hovers.length; i++)
      all_legacy_hovers[i].setAttribute("class",
        all_legacy_hovers[i].getAttribute("class").replace(" hover", "")
      );

    //Set only last hover to be hovered
    if (all_hovers.length > 0) {
      var local_class = all_hovers[all_hovers.length - 1].getAttribute("class");

      (local_class) ?
        all_hovers[all_hovers.length - 1].setAttribute("class",
          local_class + " hover"
        ) :
        all_hovers[all_hovers.length - 1].setAttribute("class", " hover");
    }
  }
}

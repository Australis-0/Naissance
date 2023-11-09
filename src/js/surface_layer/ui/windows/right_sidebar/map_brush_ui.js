//Minimise UI functions
{
  function toggleMapmodeSettings () {
    //Declare local instance variables
    var local_btn = document.getElementById("toggle-mapmode-settings-btn");
    var local_el = document.getElementById("mapmode-settings-container");

    toggleElementVisibility(local_el, local_btn);
  }

  function toggleSelectMapmode () {
    //Declare local instance variables
    var local_btn = document.getElementById("toggle-select-mapmode-btn");
    var local_el = document.getElementById("select-mapmode-container");

    toggleElementVisibility(local_el, local_btn);
  }
}

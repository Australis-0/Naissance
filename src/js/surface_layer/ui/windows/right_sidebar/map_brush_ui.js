//Brush UI functions
{
  function printBrush () {
    //Declare local instance variables
    var brush_info_el = document.getElementById("brush-information-container");
    var brush_obj = getBrush();

    //Format brush_string
    var brush_string = [];

    //Push brush_string
    brush_string.push(`Radius: ${parseNumber(brush_obj.radius)}m`);

    //Additional information handler
    {
      //Selected entity editing
      if (window.editing_entity) {
        var entity_name = getEntityName(window.editing_entity, window.date);

        brush_string.push(`Selected Entity: ${entity_name}`);
      }

      //Simplification handler
      if (brush_obj.simplify_tolerance)
        brush_string.push(`Simplify Tolerance: ${parseNumber(brush_obj.simplify_tolerance, { display_float: true })}`);
    }


    //Set innerHTML
    brush_info_el.innerHTML = brush_string.join(` &nbsp;|&nbsp; `);

    //Return statement
    return brush_string;
  }
}

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

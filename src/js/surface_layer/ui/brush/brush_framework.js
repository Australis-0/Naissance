//Declare functions
function clearBrush () {
  if (window.selection)
    selection.remove();
    
  delete window.current_union;
  delete window.editing_entity;
}

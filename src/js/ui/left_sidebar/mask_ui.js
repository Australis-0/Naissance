//Declare Mask UI functions
{
  function setGroupMask (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var mask_select_el = document.getElementById(`group-mask-${group_id}`);

    //If mask_select_el exists, read and set mask
    if (mask_select_el)
      addGroupMask(group_id, mask_select_el.value);
  }
}

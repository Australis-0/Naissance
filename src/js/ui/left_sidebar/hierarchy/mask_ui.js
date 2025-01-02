//Declare Mask UI functions
{
  function setGroupMask (arg0_group_id, arg1_mode) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var mode = (arg1_mode) ? arg1_mode : "clear";

    //If mask_select_el exists, read and set mask
    (mode != "clear") ?
      addGroupMask(group_id, mode) :
      removeGroupMask(group_id, mode);
    refreshHierarchy();
  }
}

//Internals functions - Should not actually be used by end dev
{
  function isSameFrame (arg0_history_frame, arg1_history_frame) {
    //Convert from parameters
    var history_frame = arg0_history_frame;
    var ot_history_frame = arg1_history_frame;

    //Return statement
    return (
      JSON.stringify(history_frame.coords) == JSON.stringify(ot_history_frame.coords) &&
      JSON.stringify(history_frame.options) && JSON.stringify(ot_history_frame.options));
  }
}

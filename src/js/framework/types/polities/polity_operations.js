//Entity operations functions
{
  function getSimplifyTolerance (arg0_tolerance) {
    //Convert from parameters
    var tolerance = parseInt(arg0_tolerance);

    //Declare local instance variables
    var simplify_tolerance = tolerance/Math.pow(10, 3);

    //Return statement
    return simplify_tolerance;
  }
}

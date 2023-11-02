//General localisation functions
{
  function parseLocalisation (arg0_string, arg1_options) {
    //Convert from parameters
    var string = arg0_string;
    var options = (arg1_options) ? arg1_options : {};

    //Iterate over all scopes if they exist
    if (options.scopes) {
      var all_scopes = Object.keys(options.scopes);

      for (var i = 0; i < all_scopes.length; i++) {
        var local_regex = new RegExp(`{${all_scopes[i]}}`, "gm");
        var local_value = options.scopes[all_scopes[i]];

        string = string.replace(local_regex, local_value);
      }
    }

    //Return statement
    return string;
  }
}

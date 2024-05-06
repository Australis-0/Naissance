global.log = {
  /*
    log.debug() - Logs debugging to the console.
    options: (...)
      flag: (Boolean) - Optional. Only outputs a debug log if this variable is true. global.debug by default
  */
  debug: function () {
    //Convert from parameters
    var options = (arguments[arguments.length - 1]) ? arguments[arguments.length - 1] : {};

    //Initialise options
    if (!options.flag) options.flag = global.debug;

    //Declare local instance variables
    var log_fulfilled = false;
    var log_prefix = (log.prefix) ? log.prefix : "";

    //Check if options.flag is true
    if (options.flag)
      log_fulfilled = true;

    //Invoke console function
    if (log_fulfilled)
      console.log(`${log_prefix} [DEBUG]`, ...arguments);
  },

  error: function () {
    //Declare local instance variables
    var log_prefix = (log.prefix) ? log.prefix : "";

    //Invoke console function
    console.log(`${log_prefix} [ERROR]`, ...arguments);
  },

  info: function () {
    //Declare local instance variables
    var log_prefix = (log.prefix) ? log.prefix : "";

    //Invoke console function
    console.log(`${log_prefix} [INFO]`, ...arguments);
  },

  warn: function () {
    //Declare local instance variables
    var log_prefix = (log.prefix) ? log.prefix : "";

    //Invoke console function
    console.log(`${log_prefix} [WARN]`, ...arguments);
  }
};

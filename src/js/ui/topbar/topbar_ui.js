//Declare functions
{
  function switchTopbarTab (arg0_tab) {
    //Convert from parameters
    var tab = arg0_tab.toLowerCase();

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;

    var left_sidebar_page_els = document.querySelectorAll(common_selectors.left_sidebar_pages);
    var topbar_tab_button_els = document.querySelectorAll(common_selectors.topbar_tab_buttons);

    //Iterate over all topbar_tab_button_els and remove ' active' from class list; then add ' active' to topbar_tab_button_el class
    for (var i = 0; i < topbar_tab_button_els.length; i++)
      topbar_tab_button_els[i].setAttribute("class",
        topbar_tab_button_els[i].getAttribute("class").replace(` active`, "")
      );
    for (var i = 0; i < topbar_tab_button_els.length; i++)
      if (topbar_tab_button_els[i].getAttribute("class") == tab)
        topbar_tab_button_els[i].setAttribute("class", `${topbar_tab_button_els[i].getAttribute("class")} active`);

    //Iterate over all left_sidebar_page_els and hide them
    for (var i = 0; i < left_sidebar_page_els.length; i++)
      hideElement(left_sidebar_page_els[i]);

    //Show current tab
    var current_page_el = getUISelector(`${tab}_page`);

    showElement(current_page_el);
  }
}

//Initialise Topbar UI functions
{
  function initTopbar () {
    //Declare listener events
    getUISelector("file_button").onclick = function (e) {
      switchTopbarTab("file");
    };
    getUISelector("map_button").onclick = function (e) {
      switchTopbarTab("map");
    };
  }

  function initTopbarUI () {
    //Initialise topbar only after Topbar UI has first been loaded
    initTopbar();
  }
}

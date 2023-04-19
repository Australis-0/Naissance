//Declare functions
function switchTopbarTab (arg0_tab) {
  //Convert from parameters
  var tab = arg0_tab;

  //Declare local instance variables
  var all_pages = document.querySelectorAll(`.sidebar-container [page="true"]`);
  var all_tabs = document.querySelectorAll(`#topbar-container ul li`);
  var active_tab_el = document.querySelector(`#topbar-container ul li.${tab}`);
  var file_page_el = document.querySelector(`.file-container`);
  var hierarchy_page_el = document.querySelector(`.hierarchy-container`);

  //Clear active attribute from all_tabs first
  for (var i = 0; i < all_tabs.length; i++)
    all_tabs[i].setAttribute("class", all_tabs[i].getAttribute("class").replace(" active", ""));

  //Set new tab
  if (active_tab_el)
    if (!active_tab_el.getAttribute("class").includes("active"))
      active_tab_el.setAttribute("class", `${active_tab_el.getAttribute("class")} active`);

  //Switch tabs in sidebar-ui-container
  for (var i = 0; i < all_pages.length; i++)
    if (!all_pages[i].getAttribute("class").includes("hidden"))
      all_pages[i].setAttribute("class", `${all_pages[i].getAttribute("class")} hidden`);

  //Set contents of sidebar UI to switched tab
  if (tab == "file")
    file_page_el.setAttribute("class", file_page_el.getAttribute("class").replace(" hidden", ""));
  if (tab == "map")
    hierarchy_page_el.setAttribute("class", hierarchy_page_el.getAttribute("class").replace(" hidden", ""));
}

//Declare listener events
document.getElementById("topbar-container").onclick = function (e) {
  var parent_el = e.target.parentElement;
  var target_el = e.target;

  if (parent_el.getAttribute("class")) {
    switchTopbarTab(parent_el.getAttribute("class").replace(" active", "").trim());
  } else if (target_el.getAttribute("class")) {
    switchTopbarTab(target_el.getAttribute("class").replace(" active", "").trim());
  }
};

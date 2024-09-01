//Entity action functions
{
  function hidePolity (arg0_entity_id, arg1_date, arg2_do_not_reload) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = arg1_date;
    var do_not_reload = arg2_do_not_reload;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    if (entity_obj) {
      createHistoryFrame(entity_id, date, {
        extinct: true
      });

      try { printEntityBio(entity_id); } catch {}
      try { populateTimelineGraph(entity_id); } catch {}

      if (!do_not_reload)
        loadDate();
    }
  }
}

(function (root, factory) {
  root.logmaticRUM = factory();
}(this, function () {


  var logmaticGetResourceTiming = function (since) {


    var entries = findPerformanceEntriesForFrame(BOOMR.window, true, 0, 0);
    var navStart = getNavStartTime(BOOMR.window);

    if (!entries || !entries.length) {
      return {};
    }


    function addAssetEntry(container, entry) {

      container.nb = container.nb || 0;
      container.t_max = container.t_max || 0;
      container.entries = container.entries || [];


      // update the number of items
      container.nb++;
      container.t_max = Math.max(e.time, container.t_max);

      // keep the entry
      container.entries.push(e);

      // add the asset to the corresponding group
      container[e.type] = container[e.type] || {};
      container[e.type].nb = container[e.type].nb || 0;
      container[e.type].t_max = container[e.type].t_max || 0;

      container[e.type].nb++;
      container[e.type].t_max = Math.max(e.time, container[e.type].t_max);
    }

    var items = {};
    for (var i = 0; i < entries.length; i++) {

      var e = entries[i];

      if (e.name.indexOf("about:") === 0 ||
        e.name.indexOf("javascript:") === 0) {
        continue;
      }

      if (e.name.indexOf(BOOMR.url) > -1 ||
        e.name.indexOf(BOOMR.config_url) > -1) {
        continue;
      }

      if (since && (navStart + e.startTime) < since) {
        continue;
      }

      // format the entry
      e.type = (typeof  e.initiatorType === "undefined") ? "other" : e.initiatorType
      e.name = BOOMR.utils.cleanupURL(e.name);
      e.time = trimTiming(e.responseEnd, e.startTime);

      addAssetEntry(items, e);

    }

    // sort and slice the final arra
    items.entries.sort(function (e1, e2) {
      // sort: DESC, based on the time loaded
      return e2.time - e1.time;
    });

    items.worst_entries = items.entries.slice(0, impl.worst_entries_threshold).map(function (item) {
      return item.name + " took " + item.time + " ms";
    });
    items.entries = undefined;


    return items;

  };


  var beaconPrettyfier= function (beacon) {

    var prettyBeacon = {};

    prettyBeacon.rum = {};
    prettyBeacon.rum.assets = JSON.parse(beacon.restiming);
    prettyBeacon.rum.t_done = beacon.t_done;
    prettyBeacon.rum.t_resp = beacon.t_resp;
    prettyBeacon.rum.t_page = beacon.t_page;
    prettyBeacon.url = location.href;

    // optional timers
    var others = beacon.t_other.split(",");
    for (var i = 0; i < others.length; i++) {
      var item = others[i].split("|");
      prettyBeacon.rum[item[0]] = parseInt(item[1]);
    }

    return prettyBeacon;

  }

  // public methods
  return {
    logmaticGetResourceTiming: logmaticGetResourceTiming,
    beaconPrettyfier: beaconPrettyfier
  }

}));


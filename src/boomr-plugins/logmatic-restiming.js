/**
 \file restiming.js
 Plugin to collect metrics from the W3C Resource Timing API.
 For more information about Resource Timing,
 see: http://www.w3.org/TR/resource-timing/
 */

(function () {

  var impl;

  BOOMR = BOOMR || {};
  BOOMR.plugins = BOOMR.plugins || {};
  if (BOOMR.plugins.Logmatic) {
    return;
  }


  function trimTiming(time, startTime) {
    if (typeof time !== "number") {
      time = 0;
    }

    if (typeof startTime !== "number") {
      startTime = 0;
    }

    // strip from microseconds to milliseconds only
    var timeMs = Math.round(time ? time : 0);
    var startTimeMs = Math.round(startTime ? startTime : 0);

    return timeMs === 0 ? 0 : (timeMs - startTimeMs);
  }

  /**
   * Attempts to get the navigationStart time for a frame.
   * @returns navigationStart time, or 0 if not accessible
   */
  function getNavStartTime(frame) {
    var navStart = 0;

    try {
      if (("performance" in frame) &&
        frame.performance &&
        frame.performance.timing &&
        frame.performance.timing.navigationStart) {
        navStart = frame.performance.timing.navigationStart;
      }
    }
    catch (e) {
      // empty
    }

    return navStart;
  }

  /**
   * Gets all of the performance entries for a frame and its subframes
   *
   * @param [Frame] frame Frame
   * @param [boolean] top This is the top window
   * @param [string] offset Offset in timing from root IFRAME
   * @param [number] depth Recursion depth
   * @return [PerformanceEntry[]] Performance entries
   */
  function findPerformanceEntriesForFrame(frame, isTopWindow, offset, depth) {
    var entries = [], i, navEntries, navStart, frameNavStart, frameOffset, navEntry, t;

    if (typeof isTopWindow === "undefined") {
      isTopWindow = true;
    }

    if (typeof offset === "undefined") {
      offset = 0;
    }

    if (typeof depth === "undefined") {
      depth = 0;
    }

    if (depth > 10) {
      return entries;
    }

    navStart = getNavStartTime(frame);

    // get sub-frames' entries first
    if (frame.frames) {
      for (i = 0; i < frame.frames.length; i++) {
        frameNavStart = getNavStartTime(frame.frames[i]);
        frameOffset = 0;
        if (frameNavStart > navStart) {
          frameOffset = offset + (frameNavStart - navStart);
        }

        entries = entries.concat(findPerformanceEntriesForFrame(frame.frames[i], false, frameOffset, depth + 1));
      }
    }

    try {
      if (!("performance" in frame) || !frame.performance ||
        typeof frame.performance.getEntriesByType !== "function") {
        return entries;
      }

      // add an entry for the top page
      if (isTopWindow) {
        navEntries = frame.performance.getEntriesByType("navigation");
        if (navEntries && navEntries.length === 1) {
          navEntry = navEntries[0];

          // replace document with the actual URL
          entries.push({
            name: frame.location.href,
            startTime: 0,
            redirectStart: navEntry.redirectStart,
            redirectEnd: navEntry.redirectEnd,
            fetchStart: navEntry.fetchStart,
            domainLookupStart: navEntry.domainLookupStart,
            domainLookupEnd: navEntry.domainLookupEnd,
            connectStart: navEntry.connectStart,
            secureConnectionStart: navEntry.secureConnectionStart,
            connectEnd: navEntry.connectEnd,
            requestStart: navEntry.requestStart,
            responseStart: navEntry.responseStart,
            responseEnd: navEntry.responseEnd
          });
        }
        else if (frame.performance.timing) {
          // add a fake entry from the timing object
          t = frame.performance.timing;
          entries.push({
            name: frame.location.href,
            startTime: 0,
            redirectStart: t.redirectStart ? (t.redirectStart - t.navigationStart) : 0,
            redirectEnd: t.redirectEnd ? (t.redirectEnd - t.navigationStart) : 0,
            fetchStart: t.fetchStart ? (t.fetchStart - t.navigationStart) : 0,
            domainLookupStart: t.domainLookupStart ? (t.domainLookupStart - t.navigationStart) : 0,
            domainLookupEnd: t.domainLookupEnd ? (t.domainLookupEnd - t.navigationStart) : 0,
            connectStart: t.connectStart ? (t.connectStart - t.navigationStart) : 0,
            secureConnectionStart: t.secureConnectionStart ? (t.secureConnectionStart - t.navigationStart) : 0,
            connectEnd: t.connectEnd ? (t.connectEnd - t.navigationStart) : 0,
            requestStart: t.requestStart ? (t.requestStart - t.navigationStart) : 0,
            responseStart: t.responseStart ? (t.responseStart - t.navigationStart) : 0,
            responseEnd: t.responseEnd ? (t.responseEnd - t.navigationStart) : 0
          });
        }
      }

      // offset all of the entries by the specified offset for this frame
      var frameEntries = frame.performance.getEntriesByType("resource"),
        frameFixedEntries = [];

      for (i = 0; frameEntries && i < frameEntries.length; i++) {
        t = frameEntries[i];
        frameFixedEntries.push({
          name: t.name,
          initiatorType: t.initiatorType,
          startTime: t.startTime + offset,
          redirectStart: t.redirectStart ? (t.redirectStart + offset) : 0,
          redirectEnd: t.redirectEnd ? (t.redirectEnd + offset) : 0,
          fetchStart: t.fetchStart ? (t.fetchStart + offset) : 0,
          domainLookupStart: t.domainLookupStart ? (t.domainLookupStart + offset) : 0,
          domainLookupEnd: t.domainLookupEnd ? (t.domainLookupEnd + offset) : 0,
          connectStart: t.connectStart ? (t.connectStart + offset) : 0,
          secureConnectionStart: t.secureConnectionStart ? (t.secureConnectionStart + offset) : 0,
          connectEnd: t.connectEnd ? (t.connectEnd + offset) : 0,
          requestStart: t.requestStart ? (t.requestStart + offset) : 0,
          responseStart: t.responseStart ? (t.responseStart + offset) : 0,
          responseEnd: t.responseEnd ? (t.responseEnd + offset) : 0
        });
      }

      entries = entries.concat(frameFixedEntries);
    }
    catch (e) {
      return entries;
    }

    return entries;
  }


  function beaconPrettyfier(beacon) {

    var prettyBeacon = {};

    prettyBeacon.rum = {};
    prettyBeacon.rum.assets = JSON.parse(beacon.restiming);
    prettyBeacon.rum.t_done = beacon.t_done;
    prettyBeacon.rum.t_resp = beacon.t_resp;
    prettyBeacon.rum.t_page = beacon.t_page;
    prettyBeacon.url = location.href;
    prettyBeacon.domain = location.hostname;

    // optional timers
    var others = beacon.t_other.split(",");
    for (var i = 0; i < others.length; i++) {
      var item = others[i].split("|");
      prettyBeacon.rum[item[0]] = parseInt(item[1]);
    }

    prettyBeacon.message  = "[RUM JS] Page '" + location.href.replace(location.origin, "") + "' loaded in " + prettyBeacon.rum.t_done + " ms (response: " + prettyBeacon.rum.t_resp + " ms, loading: " + prettyBeacon.rum.t_page + " ms)";

    return prettyBeacon;

  }

  /**
   * Gathers performance entries and optimizes the result.
   * @param [number] since Only get timings since
   * @return Object performance entries
   */
  function getResourceTiming(since) {


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

    items.worst_entries = items.entries.slice(0, impl.worst_entries_number).map(function (item){
      return item.name + " took " + item.time + " ms";
    });
    items.entries = undefined;


    return items;
  }

  impl = {
    complete: false,
    initialized: false,
    supported: false,
    worst_entries_number: 10,
    xhr_load: function () {
      if (this.complete) {
        return;
      }

      // page load might not have happened, or will happen later, so
      // set us as complete so we don't hold the page load
      this.complete = true;
      BOOMR.sendBeacon();
    },
    done: function () {
      var r;
      if (this.complete) {
        return;
      }

      BOOMR.removeVar("restiming");
      r = getResourceTiming();
      if (r) {
        BOOMR.info("Client supports Resource Timing API", "restiming");
        BOOMR.addVar({
          restiming: JSON.stringify(r)
        });
      }
      this.complete = true;
      BOOMR.sendBeacon();
    },

    clearMetrics: function (vars) {
      if (vars.hasOwnProperty("restiming")) {
        BOOMR.removeVar("restiming");
      }
    }
  };

  BOOMR.plugins.Logmatic = {
    init: function (config) {
      var p = BOOMR.window.performance;

      BOOMR.utils.pluginConfig(impl, config, "Logmatic", ["worst_entries_number"]);

      if (impl.initialized) {
        return this;
      }

      if (p && typeof p.getEntriesByType === "function") {
        BOOMR.subscribe("page_ready", impl.done, null, impl);
        BOOMR.subscribe("xhr_load", impl.xhr_load, null, impl);
        BOOMR.subscribe("onbeacon", impl.clearMetrics, null, impl);
        BOOMR.subscribe("before_unload", impl.done, null, impl);
        impl.supported = true;
      }
      else {
        impl.complete = true;
      }

      impl.initialized = true;

      return this;
    },
    is_complete: function () {
      return true;
    },
    is_supported: function () {
      return impl.initialized && impl.supported;
    },
    // exports for test
    trimTiming: trimTiming,
    findPerformanceEntriesForFrame: findPerformanceEntriesForFrame,
    getResourceTiming: getResourceTiming,
    beaconPrettyfier: beaconPrettyfier
  };

}());

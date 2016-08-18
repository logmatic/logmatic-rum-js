var _logger = console;
if (logmatic) {
  _logger = logmatic;
}

var boomr = BOOMR.init({});

function prettify(beacon) {

  var sexyBeacon = {};

  sexyBeacon.assets = JSON.parse(beacon.restiming);
  sexyBeacon.benchmarks = {};
  sexyBeacon.benchmarks.t_done = beacon.t_done;
  sexyBeacon.benchmarks.t_resp = beacon.t_resp;
  sexyBeacon.benchmarks.t_page = beacon.t_page;
  sexyBeacon.url = location.href;

  // timers
  var others = beacon.t_other.split(",");
  for (var i = 0; i < others.length; i++) {
    var item = others[i].split("|");
    sexyBeacon.benchmarks[item[0]] = parseInt(item[1]);
  }

  // assets
  

  return sexyBeacon;

}

boomr.subscribe('before_beacon', function (beacon) {

  _logger.log(beacon.r + " took " + beacon.t_done + " ms", prettify(beacon));

});
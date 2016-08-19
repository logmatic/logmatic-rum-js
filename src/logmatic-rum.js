// init Boomerang
var boomr = BOOMR.init({});

// Do not use the beacon
boomr.subscribe('before_beacon', function (beacon) {

  beacon = BOOMR.plugins.Logmatic.beaconPrettyfier(beacon);
  logmatic.log(beacon.message, beacon);
});
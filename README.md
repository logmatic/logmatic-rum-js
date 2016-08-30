# logmatic-rum-js
*Link to the [Logmatic.io documentation](http://doc.logmatic.io/)*

This library aims at collecting End User Web performance and streaming it to Logmatic.io

## Features 
- Easy to setup, compatible with modern browsers
- Use the library as a complement of [logmatic-js](https://github.com/logmatic/logmatic-js) and [boomerang](https://github.com/SOASTA/boomerang) libs
- All-in-one minified scripts
- No-wrapper, use Boomerang as usual
- Single Page Application Monitoring (Angular, Backbone, etc.)

## Quick Start

### Load and initialize the library (synchronous way)
You simply have to include the minified scripts and initialize your logmatic.io logger with your key.
If you're using bower, install it as usual: `bower install --save logmatic-rum-js`. 


```html
<html>
  <head>
    <title>Example to report User Monitoring performance to Logmatic.io</title>
   
    <script type="text/javascript" src="path/to/boomerang.min.js"></script>
    <script type="text/javascript" src="path/to/logmatic.min.js"></script>
    <script type="text/javascript" src="path/to/logmatic-rum.min.js"></script>

    <script>
        // set up your Logmatic account
        logmatic.init('<your_api_key>');
        // see @https://github.com/logmatic/logmatic-js customize the logger as expected
        
        // set up boomerang
        BOOMR.init({});
	</script>
    ...
  </head>
...
</html>
```
And that's all. 

By default, Logmatic-RUM provides these 3 regular Boomerang metrics:
* `t_done`: Time duration between the first page request (i.e. the navigationStart) and the time where the `done()` is fired.
* `t_resp`: Network time duration
* `t_page`: Renderer time duration

So, once loaded in a page you should see this kind of events in the [Logmatic.io](https://app.logmatic.io) explore view.

```json
{
   "severity":"info",
   "message":"[RUM JS] Page '/#!/phones/motorola-xoom' took 398 ms to load (response: 11 ms, loading: 387 ms)",
   "rum":{
      "t_done":398,
      "t_resp":11,
      "t_page":387,
      "rt":{
          "t_domloaded": 230
       },
      "restiming":{
         "nb":24,
         "t_max":135,
         "worst_entries":[
            "http://localhost:8000/phone-detail/phone-detail.module.js took 135 ms",
            "http://localhost:8000/phone-detail/phone-detail.component.js took 135 ms",
            "http://localhost:8000/phone-list/phone-list.component.js took 132 ms",
            "http://localhost:8000/core/phone/phone.service.js took 98 ms",
            "http://localhost:8000/core/core.module.js took 95 ms"
         ],
         "other":{
            "nb":1,
            "t_max":13
         },
         "img":{
            "nb":1,
            "t_max":36
         },
         "link":{
            "nb":3,
            "t_max":13
         },
         "script":{
            "nb":19,
            "t_max":135
         }
      }
   },
   "url":"http://localhost:8000/#!/phones/motorola-xoom",
   "domain":"localhost"
}
```


## Provided demo
In `demo/`, you'll find a script that download and launch a simple demo app in order to make some experiments. 
We encourage you to have a look at it as you'll be able to shoot a some events in a few seconds.
To start the demo app, follow these steps:

```bash
cd demo

# launch a simple and static page
./logmatic-rum-demo.sh "<your-api-key>"
```

and open [http://localhost:8000/](http://localhost:8000/) on your browser.

**Just don't forget to set your own API key.**

## Using Boomerang features

`logmatic-rum-js` has been designed as a regular Boomerang's plugin. Hence, you can leaverage all the features and the use cases provided by Boomerang.

Although you can read the [use cases](http://www.lognormal.com/boomerang/doc/use-cases.html) provided in the Boomerang documentation please find below the ones we wanted to highlight here:
* [Add your own timers](#add-your-own-timers)
* [Customize the beacon reporting](#customize-the-beacon-reporting)
* [How to add another Boomerang plugins to your build](#how-to-add-another-boomerang-plugins-to-your-build)


### Add your own timers
Boomerang allows you to define custom timers for tracking custom components. This feature is emboddied by the `RT` plugin directly loaded in the boomerang most basic Boomerang library (so no need to rebuild the library here...).

In order to fine-control when the beacon is fired, you need to disable the autorun mode.
```html
        // init Boomerang
        BOOMR.init({
            autorun: false
        });
```

You are responsible to fire the beacon somewhere in your code, when your page/app is ready. You have just to call the 
`BOOMR.page_ready();` method.

To add some custom timers you have to use the 2 following methods: `BOOMR.plugins.RT.startTimer("a_timer")` and 
`BOOMR.plugins.RT.endTimer("a_timer")`.
 
To illustrate this, let's track the angular the dom loading times:
```js
   
    ...
    // Somewhere in a controler
    function PhoneDetailController($routeParams, Phone) {
    
        var self = this;
        
        // start the timer and labelize it
        BOOMR.plugins.RT.startTimer("t_angular");

        self.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {

          self.setImage(phone.images[0]);
          
          
          // stop the timer and add labelize it
          BOOMR.plugins.RT.endTimer("t_angular");
          
          
        });
    })
    ...

```
Don't forget to fire the beacon somewhere after the timer.
```js

    // At the end of your main controler, when your page is loaded
    BOOMR.page_ready();

```

Events fired look like as the following one: 
```json

    ...
    "t_page":387,
    "RT":{
        "t_domloaded": 230,
        "t_angular": 23
    },
    ...

```

### Single-Page application monitoring
Actually, we only test this with angular. Please feel free to create an issue if you face any troubles.

To use Boomerang and Logmatic with Angular, you need set both Boomerang and Angular.
Get sources from the `dist/boomerang-angular` directory, or build your own.
Then, declare initialize the plugin right into `init` method:

```html
        BOOMR.init({
            // AngularJS
            Angular: {
                enabled: true
            },
            autorun: false,
            // Disable XHR instrumentation as this is auto-enabled by the SPA-plugins
            instrument_xhr: false
        });
```

Then, in your angular bootstrap script add the following code 

```javascript
  // This block enable RUM for angular
  .run(['$rootScope', function ($rootScope) {
      // If boomerang is loaded to late to watch the first route change happen
      // toggle hadRouteChange to true using the routeChangeStart callback.
      // This will tell the plugin to fire a beacon immediately as it gets
      // initialized and not wait for a routeChange event.
      var hadRouteChange = false;
      $rootScope.$on("$routeChangeStart", function () {
        hadRouteChange = true;
      });
      function hookAngularBoomerang() {

        if (window.BOOMR && BOOMR.version) {
          if (BOOMR.plugins && BOOMR.plugins.Angular) {
            // pass your $rootScope object and the aforementioned hadRoueChange variable to
            // the hook to both make sure we are listening for route changes and check whether
            // or not we we're on time
            BOOMR.plugins.Angular.hook($rootScope, hadRouteChange);
          }
          return true;
        }
      }

      // If we hooked in correctly we would return true if not we wait for the onBoomerangLoaded event
      // to fire and try again as we can be sure then that Boomerang has arrived in the page
      if (!hookAngularBoomerang()) {
        if (document.addEventListener) {
          document.addEventListener("onBoomerangLoaded", hookAngularBoomerang);
        } else if (document.attachEvent) {
          document.attachEvent("onpropertychange", function (e) {
            e = e || window.event;
            if (e && e.propertyName === "onBoomerangLoaded") {
              hookAngularBoomerang();
            }
          });
        }
      }
    }]
  )
```

Depending of the framework uses, check the corresponding [documenation API](https://soasta.github.io/boomerang/doc/api/SPA.html).

### Customize the beacon reporting
Right now, you can define how many worst assets the lib reports by setting the option `number_of_worst_entries` through the `restiming` plugin.
By default, logmaticRUM reports the worst 10 entries. If you want to change it, set the right property in your code.
```html
        // init Boomerang
        BOOMR.init({
            Logmatic: {
                "number_of_worst_entries": 20
            }
        });
```

### Customize the logger instance 
`logmatic-rum-js` uses as default the logmatic instance. But if you have multiple logger, and you want to choose the default one,
you can provides to the library which logger to use as follow.
```html
        // init Boomerang
        BOOMR.init({
            Logmatic: {
                logger: my_other_logmatic_handler
            }
        });
```

## Build and contribute
### Hack the code
If you want to contribute or customize the Boomerang lib with another plugins, we provide some grunt tasks.
The project use npm and bower in order to keep proper dependency to the boomerang project.

If you want to set a dev environment and build your release, follow these steps.

Getting latest sources:
```shell
git clone https://github.com/logmatic/logmatic-rum-js
cd logmatic-rum-js
npm install 
```

### Customize, add plugins and build the your version

The default minified script provided by Logmatic contains these plugins:
* `boomerang.js`: the library
* `/plugins/restiming.js`: the restiming plugin
* `/plugins/rt.js`: the RT plugin
* `/plugins/zzz_last_plugin.js`: required for the build

You can build your own boomerang minified script and adding the DNS and BW plugins with `grunt`. 
To personalize the build, edit the `package.json` file and add your target. Look at the `angular` declaration for instance:

```json
{
  "minimal": [
    "plugins/rt.js",
    "plugins/restiming.js"
  ],
  "angular": [
    "plugins/auto_xhr.js",
    "plugins/spa.js",
    "plugins/angular.js",
    "plugins/rt.js",
    "plugins/restiming.js"
  ],
  "...
}
```

Then, run the `grunt` command with the target expected.

```
grunt --target=angular
```

The build is generated into the `dist/` directory:
* `<target>/boomerang.min.js` and `<target>/boomerang.min.js.map`: the minified version of boomerang. Logging directives have been removed.
* `logmatic-rum.min.js` and `logmatic-rum.min.js.map` the minified version of logmatic-rum.

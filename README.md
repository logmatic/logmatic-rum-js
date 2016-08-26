# logmatic-rum-js
*Link to the [Logmatic.io documentation](http://doc.logmatic.io/)*

This library aims at collecting End User Web performance and streaming it to Logmatic.io

## Features 
- Easy to setup, compatible with modern browsers
- Use the library as a complement of [logmatic-js](https://github.com/logmatic/logmatic-js) and [boomerang](https://github.com/SOASTA/boomerang) libs
- All-in-one minified scripts
- No-wrapper, use Boomerang as usual
- *\[ Coming soon \] Single Page Application User Monitoring* 

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
    "t_other":{
        "t_domloaded": 230,
        "t_angular": 23
    },
    ...

```

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


### How to add another Boomerang plugin to your build
The default minified script provided by Logmatic contains these plugins:
* `boomerang.js`: the library
* `/plugins/restiming.js`: the restiming plugin
* `/plugins/rt.js`: the RT plugin
* `/plugins/zzz_last_plugin.js`: required for the build


You can build your own boomerang minified script and adding the DNS and BW plugins with `grunt`
Edit the `Gruntfile.js` and follow the steps below.

```

  ...
  concat: {
      boomerang: {
        dest: 'dist/boomerang-debug.js',
        src: [
          'bower_components/boomerang/boomerang.js',
          'bower_components/boomerang/plugins/restiming.js',
          'bower_components/boomerang/plugins/rt.js',
          'bower_components/boomerang/plugins/zzz_last_plugin.js'
        ]
      }
    },
  ...
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

Build the scripts:
```
grunt
```
Scripts are generated into the `dist/` directory:
* `boomerang-debug.js`: all boomerang files with logging enabled
* `boomerang.js`: all boomerang files. Logging directives have been removed.
* `boomerang.min.js` and `boomerang.min.js.map`: the minified version of boomerang. Logging directives have been removed.
* `logmatic-rum.min.js` and `logmatic-rum.min.js.map` the minified version of logmatic-rum.

### Provided demo
In `demo/`, you'll find a script that download and launch a simple demo app (based on angular-1.x) in order to make some experiments. 
We encourage you to have a look at it as you'll be able to shoot a some events in a few seconds.
To start the demo app, follow these steps:

```bash
cd demo
./logmatic-rum-demo.sh "<your-api-key>"
```

and open [http://localhost:8000/](http://localhost:8000/) on your browser.

Just don't forget to set your own API key.

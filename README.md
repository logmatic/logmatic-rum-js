# logmatic-rum-js
*Link to the [Logmatic.io documentation](http://doc.logmatic.io/)*

Collects End User Web performance and stream it to Logmatic.io

## Features 
- Easy to setup, compatible with modern browsers
- Use the library as a complement of [logmatic-js](https://github.com/logmatic/logmatic-js) and [boomerang](https://github.com/SOASTA/boomerang) libs
- All-in-one minified scripts
- No-wrapper, use Boomerang as usual
- *\[ Coming soon \] Single Page Application User Monitoring* 

## Quick Start

### Load and initialize library (synchronous way)
You simply have to include the minified scripts and initialize your logmatic.io logger with your key.

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

By default, Boomerang provides these timers:
* `t_done`: Time duration between the first page request (i.e. the navigationStart) and the time where the `done()` is fired.
* `t_resp`: Network duration loading part
* `t_page`: Renderer page duration

So, you should be able to see this kind of event directly from the Logmatic.io explore view.

```json
{
   "severity":"info",
   "message":"[RUM JS] Page '/#!/phones/motorola-xoom' took 398 ms to load (response: 11 ms, loading: 387 ms)",
   "rum":{
      "t_done":398,
      "t_resp":11,
      "t_page":387,
      "t_other":{
          "t_domloaded": 230
           },
      "assets":{
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

## Boomerang features

Logmatic-rum-js is just an initializer for Boomerang. 

So, you are able to use all features provide by Boomerang as usual

```html
  <head>
    <title>Example to report User Monitoring performance to Logmatic.io</title>
   
    <script type="text/javascript" src="path/to/boomerang.min.js"></script>
    <script type="text/javascript" src="path/to/logmatic.min.js"></script>
    <script type="text/javascript" src="path/to/logmatic-rum.min.js"></script>


    <script>
        logmatic.init('<your_api_key>');
        // see @https://github.com/logmatic/logmatic-js customize the logger as expected
                
        
        // init Boomerang as usual
        BOOMR.init({
            // init plugins that you want to use
            // check below some advanced examples
        
        });
        
	</script>
    ...
  </head>
...
</html>
```


### Add your own timers
Boomerang allows to define custom timers for tracking things that you need. Boomerang use the `RT` plugin to achieve it.
*Logmatic-rum-js* brings Boomerang as a native lib,so you are able to use that plugin.

In order to fine-control when the beacon is fired, you need to disable the autorun mode.
```html
        // init Boomerang
        BOOMR.init({
            autorun: false
        });
```

You are responsible to fire the beacon somewhere in your code, when your page/app is ready. You have just to call the 
`BOOMR.page_ready();` method.

To add another timer to the default ones (`t_done`, `t_resp`, `t_resp`), you have to use `BOOMR.plugins.RT.startTimer("a_timer")` and 
`BOOMR.plugins.RT.endTimer("a_timer")` API methods.
 
For instance, you can track some async loadings like that:
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
Don't forget to fire the beacon some where after the timer.
```js

    // At the end of your main controler, when your page is loaded
    BOOMR.page_ready();

```

Events fired look like as following 
```json

    ...
    "t_page":387,
    "t_other":{
        "t_domloaded": 230,
        "t_angular": 23
    },
    ...

```

### Customize the reporting
Right now, you can define how many entries the lib reports by setting the option `worst_entries_number`.
By default, logmaticRUM reports the worst-10 entries. If you want to change it, set the right property in your code.
```html
        // init Boomerang
        BOOMR.init({
            Logmatic: {
                "worst_entries_number": 20
            }
        });
```


### How to add another Boomerang plugins to your build
The default minified script provided by Logmatic contains these plugins:
* `boomerang.js`: the library
* `/plugins/restiming.js`: the restiming plugin
* `/plugins/rt.js`: the RT plugin
* `/plugins/zzz_last_plugin.js`: required for the build


You can build your own boomerang minified script and adding the DNS and BW plugins for instance with `grunt`
Edit the `Gruntfile.js` and follow steps describes below.

```json

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

### Try the demo
In `demo/`, you'll find a script that download and launch a simple demo app (based on angular-1.x) in order to make some experiments. 
We encourage you to have a look at it as you'll be able to shoot a some events in a few seconds.
To start the demo app, follow these steps:

```bash
cd demo
./logmatic-rum-demo.sh "<your-api-key>"
```

and open [http://localhost:8000/](http://localhost:8000/) on your browser.

Just don't forget to set your own API key.

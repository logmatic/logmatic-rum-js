# logmatic-rum-js
*Link to the [Logmatic.io documentation](http://doc.logmatic.io/)*

Collects End User Web performance and stream it to Logmatic.io

## Features 
- Easy to setup, compatible with modern browsers
- Use the library as a complement of [logmatic-js](https://github.com/logmatic/logmatic-js) and [boomerang](https://github.com/SOASTA/boomerang) libs
- All-in-one minified script
- Human*-readable RUM event (page and assets report)
- No-wrapper, use Boomerang as usual

## Quick Start

### Load and initialize library

You simply have to include the minified scripts and initialize your logmatic.io logger with your key.

```html
<html>
  <head>
    <title>Example to report User Monitoring performance to Logmatic.io</title>
   
    <script type="text/javascript" src="path/to/boomerang.min.js"></script>
    <script type="text/javascript" src="path/to/logmatic.min.js"></script>
    <script type="text/javascript" src="path/to/logmatic-rum.min.js"></script>

    <script>
        logmatic.init('<your_api_key>');
        // see @https://github.com/logmatic/logmatic-js customize the logger as expected
	</script>
    ...
  </head>
...
</html>
```

And that's all. 
You should be able to see this kind of event directly from the Logmatic.io explore view.

```json
{
   "severity":"info",
   "message":"[RUM JS] http://localhost:8000/#!/phones/motorola-xoom took 398 ms to load (response: 11 ms, loading: 387 ms)",
   "rum":{
      "t_domloaded":374,
      "t_done":398,
      "assets":{
         "other":{
            "nb":1,
            "t_max":13
         },
         "img":{
            "nb":1,
            "t_max":36
         },
         "nb":24,
         "worst_entries":[
            "http://localhost:8000/phone-detail/phone-detail.module.js took 135 ms",
            "http://localhost:8000/phone-detail/phone-detail.component.js took 135 ms",
            "http://localhost:8000/phone-list/phone-list.component.js took 132 ms",
            "http://localhost:8000/core/phone/phone.service.js took 98 ms",
            "http://localhost:8000/core/core.module.js took 95 ms"
         ],
         "t_max":135,
         "link":{
            "nb":3,
            "t_max":13
         },
         "script":{
            "nb":19,
            "t_max":135
         }
      },
      "t_resp":11,
      "t_page":387
   },
   "url":"http://localhost:8000/#!/phones/motorola-xoom"
}
```

### Fire your own timers

TODO

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
grunt build
```

### Try the `web-test` app
In `test/`, you'll find e a test web app (based on angular-1.x) in order to make some experiments. 
We encourage you to have a look at it as you'll be able to shoot a some events in a few seconds.

Just don't forget to set your own API key.
To serve it, just copy/past this command.
```
grunt serve:test
```
#!/bin/bash


[[ -z "$1" ]] && echo "Please, provide a Logmatic.io api key. (More details: https://app.logmatic.io)"


echo "Launching '${2:-minimal}' demo ..."
echo "Using '$1' as an api key for Logmatic.io"


git clone https://github.com/angular/angular-phonecat
cd angular-phonecat

# Inject the API Key
sed "s/API_KEY/$1/" ../index-demo-${2:-minimal}.html > app/index.html

# Wire Angular and Boomerang
cp ../app.config-demo.js app/app.config.js

ln -sf ../../../dist/boomerang-${2:-minimal}/boomerang.min.js app/boomerang.min.js
ln -sf ../../../dist/boomerang-${2:-minimal}/boomerang.min.js.map app/boomerang.min.js.map
ln -sf ../../../dist/logmatic-rum.min.js app/logmatic-rum.min.js
ln -sf ../../../dist/logmatic-rum.min.js.map app/logmatic-rum.min.js.map
ln -sf ../../../src/logmatic-rum.js app/logmatic-rum.js

bower install logmatic-js
npm start
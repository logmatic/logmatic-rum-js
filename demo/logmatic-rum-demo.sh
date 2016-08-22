#!/bin/bash

echo "Using '$1' as an api key for Logmatic.io"
git clone https://github.com/angular/angular-phonecat
cd angular-phonecat

sed "s/API_KEY/$1/" ../index-demo.html > app/index.html

ln -sf ../../../dist/boomerang.min.js app/boomerang.min.js
ln -sf ../../../dist/logmatic-rum.min.js app/logmatic-rum.min.js

bower install logmatic-js
npm start
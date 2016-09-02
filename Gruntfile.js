module.exports = function (grunt) {

  // plugins configuration
  var plugins = grunt.file.readJSON("plugins.json");

  // add an option --target
  var target = grunt.option('target') || 'minimal';

  // boomerang.js and plugins/*.js order
  var plugins_src = [];
  var boomerang_path = "bower_components/boomerang/";
  plugins_src.push(boomerang_path + "boomerang.js");
  plugins_src.push(plugins[target].map(
    function (file) {
      return boomerang_path + file;
    }));
  plugins_src.push(boomerang_path + "zzz_last_plugin.js");


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      boomerang: {
        src: plugins_src,
        dest: 'build/boomerang-debug.js'
      }
    },
    removelogging: {
      dist: {
        src: "build/boomerang-debug.js",
        dest: "build/boomerang.js",
        options: {
          namespace: ['console', 'window.console', 'boomr', 'BOOMR']
        }
      }
    },
    uglify: {
      options: {
        sourceMap: true
      },
      main: {
        files: {
          'build/logmatic-rum.min.js': ['src/logmatic-rum.js'],
          'build/boomerang.min.js': ['build/boomerang.js']
        }
      }
    },
    copy: {
      main: {
        files: [
          // includes files within path
          {expand: true, src: ['build/boomerang.min.js*'], dest: 'dist/boomerang-' + target, flatten: true, filter: 'isFile'},
          {expand: true, src: ['build/logmatic-rum*'], dest: 'dist/', flatten: true,  filter: 'isFile'}
        ]
      }
    },
    clean: ['build/']

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks("grunt-remove-logging");
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('default', ['concat', 'removelogging', 'uglify', "copy", "clean"]);

};

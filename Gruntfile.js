module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      boomreang: {
        dest: 'dist/boomerang-debug.js',
        src: [
          'bower_components/boomerang/boomerang.js',
          'src/boomr-plugins/restiming.js',
          'bower_components/boomerang/plugins/rt.js',
          'bower_components/boomerang/plugins/zzz_last_plugin.js'
        ]
      }
    },

    removelogging: {
      dist: {
        src: "dist/boomerang-debug.js",
        dest: "dist/boomerang.js",
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
          'dist/logmatic-rum.min.js': ['src/logmatic-rum.js'],
          'dist/boomerang.min.js': ['dist/boomerang.js']
        }
      }
    }
  })  ;
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks("grunt-remove-logging");
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['concat', 'removelogging', 'uglify']);

};

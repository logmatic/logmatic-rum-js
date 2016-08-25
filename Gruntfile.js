module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

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
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks("grunt-remove-logging");
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['concat', 'removelogging', 'uglify']);
  grunt.registerTask('angular', ['concat:angular', 'removelogging', 'uglify']);

};

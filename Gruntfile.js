'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserSync: {
      bsFiles: {
          src : 'frog.css'
        },
        options: {
          server: {
              baseDir: './'
            }
          },
          watchTask: true
        },
        jshint: {
          all: ['Gruntfile.js', '*.js']
        },
        watch: {
          scripts: {
            files: ['*.js'],
            tasks: ['jshint']
          }
        }
      });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['browserSync', 'watch']);

};
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Default package configuration.
    pkg: grunt.file.readJSON('package.json'),

    // Javascript validation.
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js']
    },

    // Minify Javascript Assets.
    uglify: {
      build: {
        src: 'src/javascripts/<%= pkg.name %>.js', // Take temporary pre-compiled asset.
        dest: 'dist/<%= pkg.name %>.min.js' // Plop it in the distribution folder.
      }
    },

    // Minify Stylesheet Assets.
    cssmin: {
      minify: {
        src: 'src/stylesheets/<%= pkg.name %>.css',
        dest: 'dist/<%= pkg.name %>.min.css',
      }
    },

    // Release & Deployment Tasks.
    release: {
      options: {
        npmtag: false // Don't deploy to NPM as we don't want to release like that.
      }
    } 
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Load the plugin for minifys CSS.
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  // Load the plugin that validates the JS markup.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Release tasks to manage version number bump, tag etc.
  grunt.loadNpmTasks('grunt-release');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);
};
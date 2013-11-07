module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        src: 'src/javascripts/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js']
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Load the plugin that validates the JS markup.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify']);

};
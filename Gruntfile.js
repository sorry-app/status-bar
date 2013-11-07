module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        src: 'tmp/<%= pkg.name %>.js', // Take temporary pre-compiled asset.
        dest: 'dist/<%= pkg.name %>.min.js' // Plop it in the distribution folder.
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js']
    },
    cssmin: {
      minify: {
        src: 'src/stylesheets/<%= pkg.name %>.css',
        dest: 'dist/<%= pkg.name %>.min.css',
      }
    },    
    release: {
      options: {
        npmtag: false // Don't deploy to NPM as we don't want to release like that.
      }
    },
    preprocess : {
        // TODO: Could we somehow make src/dest cross env, rather than in all.
        dev : {
            src : 'src/javascripts/<%= pkg.name %>.js', // Take the source file.
            dest: 'tmp/<%= pkg.name %>.js', // Put the processed version in the tmp.
            options : {
                context : {
                    api_endpoint : 'http://localhost:3000',
                }
            }
        },
        prod : {
            src : 'src/javascripts/<%= pkg.name %>.js', // Take the source file.
            dest: 'tmp/<%= pkg.name %>.js', // Put the processed version in the tmp.
            options : {
                context : {
                    api_endpoint : 'http://app.sorryapp.com',
                }
            }          
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
  // Module for injecting and controlling environment based varisbls.
  grunt.loadNpmTasks('grunt-preprocess');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'preprocess:dev', 'uglify', 'cssmin']);

};
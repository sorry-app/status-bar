module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Default package configuration.
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('aws.json'),

    // Set the major version as a variable.
    // This is used for deploying bleeding edge builds.

    // Watch and instant rebuild.
    watch: {
      files: ['index.html', 'src/**/*'],
      tasks: ['default'],
    },

    // Javascript validation.
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js']
    },

    // Concatenate the JS assets.
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['src/javascripts/jquery.xdomainrequest.js', 'src/javascripts/<%= pkg.name %>.js'],
        dest: 'tmp/concat-<%= pkg.name %>.js',
      },
    },

    // Minify Javascript Assets.
    uglify: {
      build: {
        src: 'tmp/concat-<%= pkg.name %>.js', // Take temporary pre-compiled asset.
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
        npmtag: false, // Don't deploy to NPM as we don't want to release like that.
        tagName: '<%= name %>-<%= version %>'
      }
    },

    // Deployment.
    s3: {
        options: {
          key: '<%= aws.key %>',
          secret: '<%= aws.secret %>',
          bucket: 'code.sorryapp.com',
          region: 'eu-west-1',
          access: 'public-read',
        },
        dev: {
          upload: [
            {
              src: 'dist/<%= pkg.name %>.min.js',
              dest: '<%= pkg.name %>/<%= pkg.version %>/<%= pkg.name %>.min.js',
              options: { gzip: true }
            },
            {
              src: 'dist/<%= pkg.name %>.min.css',
              dest: '<%= pkg.name %>/<%= pkg.version %>/<%= pkg.name %>.min.css',
              options: { gzip: true }
            },
            // Also deploy a bleeding edge version on the major number.
            {
              src: 'dist/<%= pkg.name %>.min.css',
              dest: '<%= pkg.name %>/<%= pkg.version.split(".")[0] %>.latest/<%= pkg.name %>.min.css',
              options: { gzip: true }
            },
            {
              src: 'dist/<%= pkg.name %>.min.js',
              dest: '<%= pkg.name %>/<%= pkg.version.split(".")[0] %>.latest/<%= pkg.name %>.min.js',
              options: { gzip: true }
            }
          ]
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
  // AWS/S3 deployment tools.
  grunt.loadNpmTasks('grunt-s3');
  // Watcher for rebuilding when files changes.
  grunt.loadNpmTasks('grunt-contrib-watch');
  // Plugin for concatenating files.
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['jshint','concat', 'uglify', 'cssmin']);
};
/*jshint multistr: true */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Default package configuration.
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('aws.json'),

    // Define a banner to added to the compiled assets.
    banner: "/* <%= pkg.name %> v<%= pkg.version %> | " +
            "(c) 2013 <%= pkg.author %>. | " +
            "http://www.apache.org/licenses/LICENSE-2.0.html */",

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

    // qUnit test framework.
    qunit: {
      options: {
        inject: 'tests/vendor/phantom.js' // Used for running the tests headlessly.
      },
      files: ['tests/*.html']
    },    

    // Concatenate the JS assets.
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['src/javascripts/jquery.xdomainrequest.js', 'src/javascripts/utils.js', 'src/javascripts/<%= pkg.name %>.js'],
        dest: 'tmp/concat-<%= pkg.name %>.js',
      },
    },

    // Minify Javascript Assets.
    uglify: {
      build: {
        src: 'tmp/concat-<%= pkg.name %>.js', // Take temporary pre-compiled asset.
        dest: 'dist/<%= pkg.name %>.min.js' // Plop it in the distribution folder.
      },
      options: {
        banner: '<%= banner %>'
      }
    },

    // Copy unprocesed assets like fonts.
    copy: {
      main: {
        files: [
          // includes files within path and its sub-directories
          {expand: true, cwd: 'src/fonts', src: ['**'], dest: 'dist/fonts'},
        ],
      },
    },

    // Minify Stylesheet Assets.
    cssmin: {
      options: {
        banner: '<%= banner %>'
      },
      minify: {
        src: ['src/stylesheets/<%= pkg.name %>.css', 'src/stylesheets/open-sans.css'],
        dest: 'dist/<%= pkg.name %>.min.css',
      }
    },

    // Release & Deployment Tasks.
    release: {
      options: {
        npm: false, // Don't deploy to NPM as we don't want to release like that.
        tagName: 'status-bar-<%= version %>' // TODO: We can't use a variable for the package name.
      }
    },    

    // Local demo / development site.
    connect: {
      server: {
        options: {
          port: 9001,
          keepalive: true
        }
      }
    },

    // Deployment.
    s3: {
        options: {
          key: '<%= aws.key %>',
          secret: '<%= aws.secret %>',
          bucket: 'sorry-assets-production',
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
            },
            // And also a bleeding edge minor release.
            {
              src: 'dist/<%= pkg.name %>.min.css',
              dest: '<%= pkg.name %>/<%= pkg.version.split(".")[0] %>.<%= pkg.version.split(".")[1] %>.latest/<%= pkg.name %>.min.css',
              options: { gzip: true }
            },
            {
              src: 'dist/<%= pkg.name %>.min.js',
              dest: '<%= pkg.name %>/<%= pkg.version.split(".")[0] %>.<%= pkg.version.split(".")[1] %>.latest/<%= pkg.name %>.min.js',
              options: { gzip: true }
            }            
          ]
        }
    }
  });

  // Copy unprocessed files lke fonts.
  grunt.loadNpmTasks('grunt-contrib-copy');
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
  // qUnit test runner.
  grunt.loadNpmTasks('grunt-contrib-qunit');
  // Connect to the test / demo page.
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'cssmin', 'copy']);

  // Test task(s).
  grunt.registerTask('test', ['jshint', 'qunit']);
};
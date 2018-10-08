/*jshint multistr: true */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Default package configuration.
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('aws.json'),

    // Define a banner to added to the compiled assets.
    banner: "/* <%= pkg.name %> v<%= pkg.version %> | " +
            "(c) <%= grunt.template.today('yyyy') %> <%= pkg.author %>. | " +
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
      all: ['Gruntfile.js', 'src/javascripts/*.js']
    },

    // qUnit test framework.
    qunit: {
      options: {
        inject: 'tests/vendor/phantom.js' // Used for running the tests headlessly.
      },
      files: ['tests/*.html']
    },

    // Minify Javascript Assets.
    uglify: {
      build: {
        src: 'dist/<%= pkg.name %>.js', // Take temporary pre-compiled asset.
        dest: 'dist/<%= pkg.name %>.min.js' // Plop it in the distribution folder.
      },
      options: {
        banner: '<%= banner %>',
        sourceMap: true // Help with debugging errors.
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

    // Bundle dependancies into a single package.
    browserify: {
      build: {
        src: 'src/javascripts/<%= pkg.name %>.js', // Take temporary pre-compiled asset.
        dest: 'dist/<%= pkg.name %>.js', // Plop it in the distribution folder.
        options: {
          alias: {
            'sorry-api': './src/javascripts/lib/sorry-api' // Not available as its own NPM yet.
          },
          browserifyOptions: {
            // Standalone, self contained bundle/package.
            standalone: 'sorryStatusBar'
          }          
        }
      }
    },

    // Minify Stylesheet Assets.
    cssmin: {
      options: {
        banner: '<%= banner %>'
      },
      minify: {
        src: 'src/stylesheets/<%= pkg.name %>.css',
        dest: 'dist/<%= pkg.name %>.min.css',
      }
    },

    // Release & Deployment Tasks.
    release: {
      options: {
        npm: false, // Don't deploy to NPM as we don't want to release like that.
        tagName: '<%= version %>',
        afterBump: ['default'] // Recompile JS with new banners.
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
    aws_s3: {
      options: {
        accessKeyId: '<%= aws.key %>', // Use the variables
        secretAccessKey: '<%= aws.secret %>', // You can also use env variables
        region: 'eu-west-1',
        bucket: 'sorry-assets-production',
        access: 'public-read'
      },
      dev: {
        files: [
          // Upload this version of the plugin.
          {expand: true, cwd: 'dist/', src: ['**'], dest: '<%= pkg.name %>/<%= pkg.version %>/', params: { CacheControl: 'public, max-age=31536000' }},
          // And also a bleeding edge minor release.
          {expand: true, cwd: 'dist/', src: ['**'], dest: '<%= pkg.name %>/<%= pkg.version.split(".")[0] %>.<%= pkg.version.split(".")[1] %>.latest/', params: { CacheControl: 'public, max-age=86400' }},          
          // Also deploy a bleeding edge version on the major number.
          {expand: true, cwd: 'dist/', src: ['**'], dest: '<%= pkg.name %>/<%= pkg.version.split(".")[0] %>.latest/', params: { CacheControl: 'public, max-age=3600' }},
          // A non-version latest release.
          {expand: true, cwd: 'dist/', src: ['**'], dest: '<%= pkg.name %>/latest/', params: { CacheControl: 'public, max-age=3600' }}
        ]
      }
    },

    // Cloudfront cleanup.
    invalidate_cloudfront: {
      options: {
        key: '<%= aws.key %>',
        secret: '<%= aws.secret %>',
        distribution: '<%= aws.distribution %>'
      },
      release: {
        files: [{
          expand: true,
          cwd: './dist/',
          src: ['**/*'],
          filter: 'isFile',
          dest: '<%= pkg.name %>/<%= pkg.version.split(".")[0] %>.latest/'
        }, {
          expand: true,
          cwd: './dist/',
          src: ['**/*'],
          filter: 'isFile',
          dest: '<%= pkg.name %>/<%= pkg.version.split(".")[0] %>.<%= pkg.version.split(".")[1] %>.latest/'
        }, {
          expand: true,
          cwd: './dist/',
          src: ['**/*'],
          filter: 'isFile',
          dest: '<%= pkg.name %>/latest/'
        }]
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
  grunt.loadNpmTasks('grunt-aws-s3');
  // Clean cloudfront up for the .latest builds.
  grunt.loadNpmTasks('grunt-invalidate-cloudfront');
  // Watcher for rebuilding when files changes.
  grunt.loadNpmTasks('grunt-contrib-watch');
  // qUnit test runner.
  grunt.loadNpmTasks('grunt-contrib-qunit');
  // Connect to the test / demo page.
  grunt.loadNpmTasks('grunt-contrib-connect');
  // Bundle dependany modules together for distribution.
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'browserify', 'uglify', 'cssmin', 'copy']);

  // Test task(s).
  grunt.registerTask('test', ['jshint', 'qunit']);

  // Publish task.
  grunt.registerTask('publish', ['aws_s3', 'invalidate_cloudfront']);
};
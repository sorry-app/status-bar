# Sorry Status Announcer Plugin

Add your Sorry status updates as an announcement bar to your app or website with this jQuery plugin.

## Installing The Plugin

### jQuery required

Please note that all our JavaScript plugins require [jQuery](http://jquery.com/) to be included. This plugin has been tested with 1.10.1. It should work with both older and newer versions of jQuery, however they are currently untested.

### Include the plugin

To save you installing the plugin locally, we provide a CDN based version hosted with AWS, which can be linked to directly. Be sure to include this just before the closing &lt;/ body&gt; tag at the footer of your site, and after jQuery has been included.

```HTML
<script src="http://code.sorryapp.com/0.0.1/sorry-announcer.min.js"></script>
```

### Link it to your status page.

In order for the plugin to know where to source your status updates from we must add your pages SorryApp subdomain to the configuration.

Configuration of this plugin is handled using the data API. In this case we need to add a data attribute to your pages &lt;body&gt; tag.

```HTML
<body data-sorry-announcement="{{ your subdomain goes here }}">
```

### Style the plugin

#### Default Styling

We provide a default style for your widget direct from our CDN to get you up and running as quickly as possible. Simply include a link to this in the head of your site.

```HTML
<script src="http://code.sorryapp.com/0.0.1/sorry-announcer.min.css"></script>
```

#### Custom Styling

If you want to custom style your widget, you only need create your own CSS. To help you understand how to style it the markup for the widget is based loosely on the [Twitter Bootstrap Alert](http://getbootstrap.com/components/#alerts), and looks like this:

```HTML
<div class="sorry-announcement">
	<button type="button" class="sorry-announcement-close" aria-hidden="true">&times;</button>

	<span class="sorry-announcement-text">{{ Your status message goes here }}</span> 

	<a target="_blank" class="sorry-announcement-link">{{ The link to your page goes here }}</a>
</div>
```

## Build &amp; Release

### Install Grunt

If you want to create your own custom build, or contribute to the project it’s important you know how our build and release process works.

This project uses Grunt with convenient methods for working with the project. It's how we compile our code, run tests, and more. To use it, install the required dependencies as directed and then run some Grunt commands.

From the command line:

1. Install `grunt-cli` globally with `npm install -g grunt-cli`.
2. Navigate to the root `/sorry-announce` directory, then run `npm install`. npm will look at [package.json](package.json) and automatically install the necessary local dependencies listed there.

When completed, you'll be able to run the various Grunt commands provided from the command line.

**Unfamiliar with `npm`? Don't have node installed?** That's a-okay. npm stands for [node packaged modules](http://npmjs.org/) and is a way to manage development dependencies through node.js. [Download and install node.js](http://nodejs.org/download/) before proceeding.

### Available Grunt commands

#### Build - `grunt`
Run `grunt` to run tests locally and compile the CSS and JavaScript into `/dist`.

#### Release a new version - `grunt release`

grunt release bumps the [version number](#versioning) and creates a new git tag. You’ll need write access to the repository for this to work.

#### Deploy the latest version. - `grunt s3`

We use AWS S3 to host the assets on code.sorryapp.com. Running this command will push the latest build to S3 into the directory /sorry-announcer/<% version number%>/sorry-accouner.js

#### Watch - `grunt watch`
This is a convenience method for watching just Less files and automatically building them whenever you save.

### Troubleshooting dependencies

Should you encounter problems with installing dependencies or running Grunt commands, uninstall all previous dependency versions (global and local). Then, rerun `npm install`.

## Versioning

For transparency and insight into our release cycle, and for striving to maintain backward compatibility, This project will be maintained under the Semantic Versioning guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

* Breaking backward compatibility bumps the major (and resets the minor and patch)
* New additions without breaking backward compatibility bumps the minor (and resets the patch)
* Bug fixes and misc changes bumps the patch

For more information on SemVer, please visit <http://semver.org/>.

## Authors & Contributors

**Robert Rawlins**

+ <http://twitter.com/sirrawlins>
+ <https://github.com/SirRawlins>

**Robin Geall**

+ <http://twitter.com/robingeall>

## Copyright

Copyright &copy; 2013 Support Time Limited. See LICENSE for details.

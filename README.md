# Sorry Status Bar Plugin

In an effort to help extend your voice beyond the status page, we’ve put together this Status Bar plugin. 

Once dropped into your website or application it'll broadcast your [Sorry](http://www.sorryapp.com) status updates direct to your users.

#### jQuery required

Please note that all our JavaScript plugins require [jQuery](http://jquery.com/).

This plugin is officialy supported with jQuery `1.10.1` however may work on older versions.

## Installing The Plugin

### Simply Include the Javascript 

Just before the closing ```</ body>``` tag, but after jQuery has been included. You can specify which pages you want updates to be sourced from by including your Page ID in the `data-for` attribute.

```html
<script src="//code.sorryapp.com/status-bar/2.0.latest/status-bar.min.js" data-for="xxxxxxx"></script>
```

#### Not sure what your Page ID is?

If the address of your status page is ```http://xxxxxx.sorryapp.com``` then ```xxxxxxx``` is what you need to use as the data attribute. This unique ID can also be found in the browsers address bar within the app. ```https://app.sorryapp.com/pages/xxxxx```

## Keep Up To Date

If you want to always have the latest version of the plugin, we offer a source which will always give you the latest minor or patch version without you having to lift a finger. We don't offer an auto-updating source for major releases as these often break backwards compatibity.

Instead of the sources above, use these paths for the latest versions:

	//code.sorryapp.com/status-bar/2.latest/status-bar.min.js

Whilst minor/patch releases should not break backwards compatibility, it's still worth noting that there is always a risk involved in auto-updates like this - so use at your own peril.

## Styling The Plugin

If you want to custom style your widget, you only need create your own CSS. To help you understand how to style it the markup for the widget is based loosely on the [Twitter Bootstrap Alert](http://getbootstrap.com/components/#alerts), and looks like this:

```html
<div class="sorry-status-bar">
	<button type="button" class="sorry-status-bar-close" aria-hidden="true">&times;</button>

	<span class="sorry-status-bar-text">{{ Your status message goes here }}</span> 

	<a target="_blank" class="sorry-status-bar-link">{{ The link to your page goes here }}</a>
</div>
```

## Contributing To The Plugin

If you want to create your own custom build, or contribute to the project it’s important you know how our build and release process works.

This project uses Grunt with convenient methods for working with the project. It's how we compile our code, run tests, and more. To use it, install the required dependencies as directed and then run some Grunt commands.

### Install Grunt

From the command line:

1. Install `grunt-cli` globally with `npm install -g grunt-cli`.
2. Navigate to the root `/sorry-announce` directory, then run `npm install`. npm will look at [package.json](package.json) and automatically install the necessary local dependencies listed there.

When completed, you'll be able to run the various Grunt commands provided from the command line.

**Unfamiliar with `npm`? Don't have node installed?** That's a-okay. npm stands for [node packaged modules](http://npmjs.org/) and is a way to manage development dependencies through node.js. [Download and install node.js](http://nodejs.org/download/) before proceeding.

### Available Grunt commands

#### Build - `grunt`
Run `grunt` to run tests locally and compile the CSS and JavaScript into `/dist`.

#### Release a new version - `grunt release <:patch | :minor | :major>`
grunt release bumps the [version number](#versioning) and creates a new git tag. You’ll need write access to the repository for this to work.

You can append the release command with patch, minor or major depending on the version number increment you wish to make.

#### Deploy the latest version. - `grunt s3`
We use AWS S3 to host the assets on code.sorryapp.com. Running this command will push the latest build to S3 into the directory /sorry-announcer/<% version number%>/sorry-accouner.js

#### Watch - `grunt watch`
This is a convenience method for watching all the core HTML, CSS and JS assets in the project, rebuilding if they change.

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

Copyright & 2013 Support Time Limited. See [LICENSE](LICENSE) for details.

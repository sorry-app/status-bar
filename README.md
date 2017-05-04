# Sorry&#8482; Status Bar Plugin [![GitHub version](https://d25lcipzij17d.cloudfront.net/badge.svg?id=gh&type=6&v=4.0.2&x2=0)](http://badge.fury.io/for/gh/supporttime/status-bar)

In an effort to help extend your voice beyond the status page, we’ve put together this Status Bar plugin. 

Once dropped into your website or application it'll broadcast your [Sorry&#8482;](http://www.sorryapp.com) status updates direct to your users.

## Installing The Plugin

### Simply Include the Javascript 

Just before the closing ```</ body>``` tag. You can specify which pages you want updates to be sourced from by including your Page ID in the `data-for` attribute.

```html
<script src="//code.sorryapp.com/status-bar/4.latest/status-bar.min.js" data-for="xxxxxxx"></script>
```

#### Not sure what your Page ID is?

If the address of your status page is ```http://xxxxxx.sorryapp.com``` then ```xxxxxxx``` is what you need to use as the data attribute. This unique ID can also be found in the browsers address bar within the app. ```https://app.sorryapp.com/pages/xxxxx```

#### Alternate location of your bar

By default the plugin will add the bar to the top of your page. To choose a specific location instead of using the ```data-for``` attribute as above, include the following HTML snippet in your page where you wish the bar to be located.

```html
<div class="sorry-status-bar" data-status-bar-for="xxxxxxx"></div>
```

## Displaying as a Subscriber

If you have personal details about your user, it's possible to configure the plugin to register them as a subscriber. The user will then be listed in your account and you'll be able to target status notices to them, instead of just posting generic site-wide notices.

To do this you need to define their details like so, **before you include the status-bar.js**.

```html
<script>
	window.SorryAPIOptions = {
		subscriber: {
			email: "robrawlins@gmail.com",
			first_name: "Robert",
			last_name: "Rawlins",
			nickname: "Rob",
			company: "Sorry™",
			location_attributes: {
				city: "Chichester",
				state: "West Sussex",
				coutry: "United Kingdom"
			},
			tag_list: "Founder,Developer,Technologist"
		}
	}
</script>
```

Whenever the status-bar loads it'll now register the user as a subscriber, and filter any notices it get's in return to only list those which are applicable to this subscriber.

## Keep Up To Date

If you want to always have the latest version of the plugin, we offer a source which will always give you the latest minor or patch version without you having to lift a finger. We don't offer an auto-updating source for major releases as these often break backwards compatibity.

Instead of the sources above, use these paths for the latest versions:

	//code.sorryapp.com/status-bar/3.latest/status-bar.min.js

Whilst minor/patch releases should not break backwards compatibility, it's still worth noting that there is always a risk involved in auto-updates like this - so use at your own peril.

## Styling The Plugin

If you want to custom style your widget, you only need create your own CSS. To help you understand how to style it the markup for the widget is based loosely on the [Twitter Bootstrap Alert](http://getbootstrap.com/components/#alerts), and looks like this:

```html
<div class="sorry-status-notice" id="sorry-status-notice-{{id}}" role="alert">
	<button type="button" class="sorry-status-notice-close" data-dismiss="status-notice" aria-hidden="true"><i class="sorry-status-notice-icon sorry-status-notice-icon-times-circle"></i></button>

	<div class="sorry-status-notice-content">\
		<h4 class="sorry-status-notice-header"><i class="sorry-status-notice-icon sorry-status-notice-icon-bullhorn"></i> Ongoing</h4>
		<p class="sorry-status-notice-text">{{notice}}</p>
		<a class="sorry-status-notice-link" href="{{link}}" target="_blank" title="Visit our Status Page for more information.">More &#8594;</a>
	</div>
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

Copyright & 2016 Support Time Limited. See [LICENSE](LICENSE) for details.

=== FC's Retirement Age Calculator ===
Contributors: financialcalculators
Donate link:
Tags: calculator, retirement, retirement calculator, retirement age calculator, investments, retirement saving, plugin, sidebar, widget
Requires at least: 2.9.0
Tested up to: 4.7
Stable tag: 1.1.2
License: GNU General Public License
License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

Answers the question: At what age will I be able to retire? With a personalized investment schedule and charts. Supports international conventions.

== Description ==

[Retirement Age Calculator](https://financial-calculators.com/calculator-plugins/retirement-age-calculator-plugin) answers the question, "At what age can I retire?". The calculator easily answers the question and creates a detailed schedule with projected date based investments and charts. A site's users can select their own currency and date convention used in the investment schedule. This is ideal if your site attracts visitors from around the globe. Select from four predefined sizes or modify CSS file to customize size and change colors. Supports touch devices and a responsive designed website. This plugin is based on and uses the code from my [Retirement Calculator](https://financial-calculators.com/retirement-calculator).

*Rebranding with your site's brand name is supported and encouraged.*

The plugin may be used (a) in a post or page's content area via a *shortcode*; or (b) used in a *sidebar widget area*; or (c) called from any template file. See __usage__ under installation for details.

As of this writing, financial-calculators.com has seven plugins listed in the WordPress Plugin Directory with several more available on the website. All plugins have the same general feature set and are consistent in their styling and the way they work. This means you can install all these plugins and maintain a consistent look and feel for your website or blog. If you blog about money, you are encouraged to install all the plugins on your site. It's simple. The more pages, the more opportunity.

**Installation**

Either (a) upload the *fc-retirement-age-calculator* folder with all its files to the */wp-content/plugins/* folder or (b) unzip the plugin's zip file in the */wp-content/plugins/* folder.

Activate the plugin through the *Plugins -> Installed Plugins* menu in WordPress


*Usage*

There are 3 mutually exclusive ways you can deploy the calculator to an individual page (though you can use all three methods on different pages within a site):

1. If you are using widgets, just add the plugin to the sidebar through the Appearance -> Widgets menu in WordPress. Be sure to click *Save*.
1. Add the following code *&lt;?php show_fcretireage_plugin(); ?&gt;* to your template where you want the calculator to appear. See below for options.
1. Add the shortcode *[fcretireageplugin]* in the content area of your page or post and configure shortcode parameters.

__Shortcode parameters__

	* sc_size= tiny | small | medium | large
	* sc_custom_style= No | Yes
	* sc_add_link= No | Yes
	* sc_brand_name= 
	* sc_hide_resize= No | Yes
	* sc_save_amt=
	* sc_n_months=
	* sc_rate=
	* sc_current_age=
	* sc_current_savings=
	* sc_invest_amt=
	* sc_rate=
	* sc_goal_amt=

Examples (1st includes all options):

`[fcretireageplugin sc_size="medium" sc_custom_style="No" sc_add_link="No" sc_brand_name="" sc_hide_resize="No" sc_current_age="28" sc_current_savings="16000" sc_invest_amt="750.0" sc_rate="5.5" sc_goal_amt="1000000.0"]`

`[fcretireageplugin sc_size="small" sc_custom_style="Yes" sc_hide_resize="Yes"]`

`[fcretireageplugin sc_custom_style="No" sc_add_link="Yes" sc_brand_name="Friendly Financial Planners" sc_hide_resize="Yes" sc_current_age="28" sc_current_savings="16000" sc_invest_amt="750.0" sc_rate="5.5" sc_goal_amt="1000000.0"]`

__Optional array parameter passed to *show_fcretireage_plugin()*__

Valid values for options are the same as the shortcode above.

	<?php show_fcretireage_plugin(array('op_size' => "large",
		'op_custom_style' => "No",
		'op_add_link' => "No",
		'op_brand_name' => "",
		'op_hide_resize' => "No",
		'op_current_age' => "28",
		'op_current_savings' => "18000",
		'op_invest_amt' => "750.0",
		'op_rate' => "5.5",
		'op_goal_amt' => "1000000.0")); ?>

*Notes:*

1. If you want to add your brand to the calculator, the *_add_link option must be set to "Yes" (i.e. create a subtle follow link to financial-calculators.com). 
1. When branding, the brand name will be added before "Retirement Calculator".
1. If _custom_style is set to "Yes", the plugin will load fin-calc-widgets-custom.css located in the plugin's CSS folder. If you set the option to "Yes" without making any changes, the calculator will change to a horrendous red which indicates the custom css is being used.
1. The plugin is built and tested on HTML5/CSS3 pages.
1. size (max-width): large: 440px, medium: 340px, small: 290px, tiny: 150px
1. Currently, it is not possible to use more than one of my calculators on a single web page. Putting more than one calculator on a page will cause conflicts.

*Roadmap:*

1. Redesign that allows multiple calculators to work on the same web page.
1. Allow website owner to select a default currency and date format. (This can now be done by patching the code.)
1. Give website owners the ability to not let their visitors change the default date format or currency.

Contact me if you would like to help test any of these new features.


*Other Calculators*

We have two more retirement calculators to complement this plugin (all links take you to the indicated WordPress Plugin Directory page).

1. [Retirement Nest Egg Calculator](https://wordpress.org/plugins/fc-retirement-nest-egg-calculator/) - answers, what will be the value of my retirement fund when I retire?
1. [Retirement Savings Calculator](https://wordpress.org/plugins/fc-retirement-savings-calculator/) - how much do I have to invest periodically to reach my retirement goal?

Plus there are these other plugins:

1. [Auto Loan Calculator](https://wordpress.org/plugins/fc-auto-loan-calculator/) - solves for several unknowns and creates a payment schedule.
1. [Loan Calculator](https://wordpress.org/plugins/fc-loan-calculator/) - a general purpose loan calculator with amortization schedule and charts.
1. [Mortgage Calculator](https://wordpress.org/plugins/fc-mortgage-calculator/) - optionally incorporates points and insurance and creates a payment schedule
1. [Savings Calculator](https://wordpress.org/plugins/fc-savings-calculator/) - calculates the results of regular savings and investing


== Frequently Asked Questions ==

__Can the Retirement Age Calculator plugin be used on a commercial website?__

Yes. I would be honored. Thanks.

Also, if you happen to be a financial blogger, I would encourage you to add a "Calculators" or "Tools" section to your site and include all my calculators. More content equals more opportunity. I expect to have six free plugins by early 2017.

__Does your plugin have any embed advertising?__

Absolutely not.

__Is your plugin self contained?__

Yes. 100% of the plugin is installed on your server. There are no external dependencies.

__Does the plugin include any backlinks?__

No, not by default. If you decide to brand the calculator with your brand and / or set the *add_link* option to *Yes*, two very discreet links are added to my site. (User will not know there are links unless their mouse passes over one.) One anchor is around the copyright in the lower left. The other around the title. Of course you are free to set the *_add_link* option to *Yes* even if you don't rebrand the calculator. :)

__Is the calculator plugin responsive?__

Yes. In fact, I use it on a Bootstrap responsive site. 

__Does the calculator support touch devices?__

Yes. Users uses the calculator from all types of devices.

__Do you offer other calculator plugins?__

Yes. I'm offering a "Plus" version of this plugin on my website. It is free for a limited time. There will be other calculators available shortly as well.

__I like your plugin and I'd like to contribute something but I notice you don't have a link for contributions, why not?__

Thank you. That's very kind of you. Actually, you can contribute, and it won't cost you a cent. Please stop by my ad free [website](https://financial-calculators.com) and check it out. In addition to providing some very advanced calculators, I think that I'm the only one that provides free support via a public forum. Take a look, and if you like what you see, please spread the word. That's better than any monetary compensation.

__The plugin version indicates it is new. Can I trust it?__

Yes. While this is a new plugin, the calculator has been used on my site for years. It has been used by literally 100,000's of users. Any issues you might encounter would most likely be around installing it on a site. Should you run into an problem, I'm happy to help resolve it.


== Screenshots ==

1. The Retirement Calculator's front end showing 2 of the 4 configurable sizes, one with custom brand and no sizing buttons.
2. Investment schedule shown in a lightbox. User can select how date is displayed from 3 international date conventions.
3. Charts shown in a lightbox.
4. Plugin's settings dialogue, as seen under *Appearance* *Widgets* page in WordPress's administration area.

== Changelog ==

= 1.1.2 =
* Updated the CSS so as to resolve a few reported compatibility issues with some sites.
* Improved layout of international date and currency selection dialogue.

= 1.1.1 =
* Fixed - some installations the currency / date dialog was not accessible because the background overlay was on top of the dialog.
* Fixed - some installations the Help text was visible on the main page and not just when the Help button was clicked
* Fixed - missing "+" "-" signs for the optional resizing feature

= 1.1 =
* Improved styling
* Converted project to use a single file CSS regardless of calculator size selected. Single file will be compatible across all financial-calculator.com plugins so site owners can modify style once and copy to all other plugins.
* Fixed - plugin did not recognize all saved settings in WordPress's widgets page administration area
* Fixed - plugin did not recognize all saved settings passed in option array to show_fcretireage_plugin()

= 1.0 =
*	First release

== Upgrade Notice ==
No upgrades.

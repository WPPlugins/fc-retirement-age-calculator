<?php
// financial-calculators.com retirement age calculator plugin
//
// Copyright (c) 2017 financial-calculators.com
// https://financial-calculators.com
//
// This is an add-on for WordPress
// http://wordpress.org/
//
// **********************************************************************
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// The copyright and this notice must remain intact with any derivations
// of this plugin.
// **********************************************************************
/*
Plugin Name: FC Retirement Age Calculator
Plugin URI: https://financial-calculators.com/calculator-plugins/retirement-age-calculator-plugin
Description: A responsive retirement calculator with cumulative schedule and charts. Rebrand with your brand name. Supports multiple currency and date conventions.
Version: 1.1.2
Author: financial-calculators.com
Author URI: https://financial-calculators.com
License: GPL2
*/


/*
	Prefixes:
	fc or fc_ : financial calculators
	op_ : option, set via plugin's admin panel or passed in options object
	sc_ : a shortcode parameter

	Function call:
	<?php show_fcretireage_plugin(<option array>); ?>

	Option array:
	array('op_size' => "large",
		'op_custom_style' => "No",
		'op_add_link' => "No",
		'op_brand_name' => "",
		'op_hide_resize' => "No",
		'op_current_age' => "28",
		'op_current_savings' => "16000.0",
		'op_invest_amt' => "750.0",
		'op_rate' => "5.5",
		'op_goal_amt' => "1000000.0")

	Shortcode - all options:
	[fcretireageplugin sc_size="medium" sc_custom_style="No" sc_add_link="No" sc_brand_name="" sc_hide_resize="No" sc_current_age="28" sc_current_savings="16000" sc_invest_amt="750.0" sc_rate="5.5" sc_goal_amt="1000000.0"]

*/


/* Function: activate_fcretireage_plugin
	** activation hook
	** Initializes the options in the WordPress database when
	** plugin is activated
	**
	** args: none
	** returns: nothing
*/
function activate_fcretireage_plugin() {

	/* activation code here */
	/* as options are added to widget, this array must be updated to update db */
	update_option('fcretireagecalc_plugin', array(
		'op_size' => null,
		'op_custom_style' => "No",
		'op_add_link' => "No",
		'op_brand_name' => "",
		'op_hide_resize' => "No",
		'op_current_age' => "28",
		'op_current_savings' => "16000.0",
		'op_invest_amt' => "750.0",
		'op_rate' => "5.5",
		'op_goal_amt' => "1000000.0"
		));

}
register_activation_hook( __FILE__, 'activate_fcretireage_plugin' );


/* Function: show_fcretireage_widget
** Shows the plugin in a WordPress widget area / sidebar
**
** args: $args (environment variables handled automatically by the hook)
** returns: nothing
*/
function show_fcretireage_widget( $args ) {
	extract( $args );
	$options = get_option( 'fcretireagecalc_plugin' );
	$title = null;

	//production
	echo $before_widget;
	echo $before_title . $title . $after_title;

	show_fcretireage_plugin($options);

	echo $after_widget;

} // show_fcretireage_widget



/* Function: show_fcretireage_plugin
** Show the plugin's GUI, not in sidebar
**
** args: $options
** returns: nothing
*/
function show_fcretireage_plugin($options = array(), $content = null, $code = "") {

	$shortcode = null;  // The actual shortcode : fcretireageplugin

	$language = "en";

	$WL_DIR_PREFIX = $language."/";

	$size = null; // tiny, small, medium, null default large
	$custom_style = null;
	$add_link = null;
	$brand_name = null;
	$hide_resize = null;


	$WL_DIR_PREFIX = $language."/";


	// array_key_exists (0, $options) true only if shortcode is used
	if (!empty($code) || (!empty($options) && array_key_exists (0, $options) && (strtolower($options[0]) == 'fcretireageplugin'))){
		$shortcode = true;


		$codes = shortcode_atts( array(
				'sc_size' => null,
				'sc_custom_style' => "No",
				'sc_add_link' => "No",
				'sc_brand_name' => "",
				'sc_hide_resize' => "No",
				'sc_current_age' => "28",
				'sc_current_savings' => "16000.0",
				'sc_invest_amt' => "750.0",
				'sc_rate' => "5.5",
				'sc_goal_amt' => "1000000.0"
			), $options );



		// validate shortcodes user may have provided
		$size = (strtolower(sanitize_text_field($codes['sc_size'])) === "tiny" || strtolower(sanitize_text_field($codes['sc_size'])) === "small" || strtolower(sanitize_text_field($codes['sc_size'])) === "medium" ) ? strtolower(sanitize_text_field($codes['sc_size'])) : "large";
		$custom_style = (strtolower(sanitize_text_field($codes['sc_custom_style'])) === "yes") ? strtolower(sanitize_text_field($codes['sc_custom_style'])) : "No";
		$add_link = (strtolower(sanitize_text_field($codes['sc_add_link'])) === "yes") ? strtolower(sanitize_text_field($codes['sc_add_link'])) : "No";
		// if sc_brand_name not empty, allow only alpha chars, numbers, number sign, ampersand, apostrophy, negative sign/dash and spaces in brand name
		$brand_name = (!empty($codes['sc_brand_name'])) ? preg_replace("/[^\w#&'\- ]/", '', $codes['sc_brand_name']): "";
		$hide_resize = (strtolower(sanitize_text_field($codes['sc_hide_resize'])) === "yes") ? strtolower(sanitize_text_field($codes['sc_hide_resize'])) : "No";

		$current_age = (is_numeric(sanitize_text_field($codes['sc_current_age']))) ? sanitize_text_field($codes['sc_current_age']) : -1;
		if  ($current_age < 0) {
			$current_age= '0';
			echo('Please enter a valid number greater than 0 for "sc_current_age".'."<br>");
		}
		$current_savings = (is_numeric(sanitize_text_field($codes['sc_current_savings']))) ? sanitize_text_field($codes['sc_current_savings']) : -1;
		if  ($current_savings < 0) {
			$current_savings= '0';
			echo('Please enter a valid number greater than 0 for "sc_current_savings".'."<br>");
		}
		$invest_amt = (is_numeric(sanitize_text_field($codes['sc_invest_amt']))) ? sanitize_text_field($codes['sc_invest_amt']) : -1;
		if  ($invest_amt < 0) {
			$invest_amt= '0';
			echo('Please enter a valid number greater than 0 for "sc_invest_amt".'."<br>");
		}
		$rate = (is_numeric(sanitize_text_field($codes['sc_rate']))) ? sanitize_text_field($codes['sc_rate']) : -1;
		if  ($rate < 0) {
			$rate = '0';
			echo('Please enter a valid number greater than 0 for "sc_rate".'."<br>");
		}
		$goal_amt = (is_numeric(sanitize_text_field($codes['sc_goal_amt']))) ? sanitize_text_field($codes['sc_goal_amt']) : -1;
		if  ($goal_amt < 0) {
			$goal_amt= '0';
			echo('Please enter a valid number greater than 0 for "sc_goal_amt".'."<br>");
		}
		if (strtolower($add_link) !== 'yes') {
			$brand_name = '';
		}


	} else {
		$shortcode = false;

		// 1. process any optional parameters that may have been passed in
		$size = empty( $options["op_size"] ) ? null : sanitize_text_field($options["op_size"]);
		if ($size !== null && strtolower($size) !== "tiny" && strtolower($size) !== "small" && strtolower($size) !== "medium") {
			$size = "large";
		}

		// if optional array element empty assign null to var, if not empty sanitize and assign valid default if parameter element does not contain valid value
		$custom_style = empty( $options['op_custom_style'] ) ? null : (strtolower(sanitize_text_field($options['op_custom_style'])) === "yes") ? "yes"  : "no";
		$hide_resize = empty( $options['op_hide_resize'] ) ? null :  (strtolower(sanitize_text_field($options['op_hide_resize'])) === "yes") ? "yes"  : "no";
		$add_link = empty( $options['op_add_link'] ) ? null : (strtolower(sanitize_text_field($options['op_add_link'])) === "yes") ? "yes" : "no";
		// allow only alpha chars, numbers, number sign, ampersand, apostrophy, negative sign/dash and spaces in brand name
		$brand_name = empty( $options['op_brand_name'] ) ? null : preg_replace("/[^\w#&'\- ]/", '', sanitize_text_field($options['op_brand_name']));

		// numeric values, if optional array element empty or if not a number, assign null to var
		$current_age= empty( $options['op_current_age'] ) ? null : (is_numeric(sanitize_text_field($options['op_current_age']))) ? sanitize_text_field($options['op_current_age']) : null;
		$current_savings= empty( $options['op_current_savings'] ) ? null : (is_numeric(sanitize_text_field($options['op_current_savings']))) ? sanitize_text_field($options['op_current_savings']) : null;
		$invest_amt= empty( $options['op_invest_amt'] ) ? null : (is_numeric(sanitize_text_field($options['op_invest_amt']))) ? sanitize_text_field($options['op_invest_amt']) : null;
		$rate= empty( $options['op_rate'] ) ? null : (is_numeric(sanitize_text_field($options['op_rate']))) ? sanitize_text_field($options['op_rate']) : null;
		$goal_amt= empty( $options['op_goal_amt'] ) ? null : (is_numeric(sanitize_text_field($options['op_goal_amt']))) ? sanitize_text_field($options['op_goal_amt']) : null;


		// 2. Pickup plugin's stored settings and use only if not a function parameter, i.e var still null
		$options = get_option( 'fcretireagecalc_plugin' );

		// If vars !== null, they were validated above. 
		// Do not assume that WordPress database hasn't been hacked. Retest values.
		if ($size === null) {
			$size = empty( $options["op_size"] ) ? null : sanitize_text_field($options["op_size"]);
			if (strtolower($size) !== "tiny" && strtolower($size) !== "small" && strtolower($size) !== "medium") {
				$size = "large";
			}
		}
		$custom_style = ($custom_style === null && empty( $options['op_custom_style'])) ? __('No') : ($custom_style === null && strtolower(sanitize_text_field($options['op_custom_style'])) === "yes") ? "yes" : ($custom_style === null) ? "no" : $custom_style;

		$hide_resize = ($hide_resize === null && empty( $options['op_hide_resize'])) ? __('No') : ($hide_resize === null && strtolower(sanitize_text_field($options['op_hide_resize'])) === "yes") ? "yes" : ($hide_resize === null) ? "no" : $hide_resize;

		$add_link = ($add_link === null && empty( $options['op_add_link'])) ? __('No') : ($add_link === null && strtolower(sanitize_text_field($options['op_add_link'])) === "yes") ? "yes" : ($add_link === null) ? "no" : $add_link;
		if ($brand_name === null) {
			// allow only alpha chars, numbers, number sign, ampersand, apostrophy, negative sign/dash and spaces in brand name
			$brand_name = empty( $options['op_brand_name'] ) ? null : preg_replace("/[^\w#&'\- ]/", '', sanitize_text_field($options['op_brand_name']));
		}
		if (strtolower($add_link) !== 'yes') {
			$brand_name = '';
		}


		// numeric values - if var unassigned in optional parameter and not valid, force -1, retest, display error and reset to valid 0.
		if ($current_age === null) {
			$current_age= (empty( $options['op_current_age'] )) ? '28' : (is_numeric(sanitize_text_field($options['op_current_age']))) ? sanitize_text_field($options['op_current_age']) : -1;
			if ($current_age < 0) {
				$current_age = '0';
				echo('Please enter a valid number for "op_current_age".'."<br>");
			}
		}

		if ($current_savings === null) {
			$current_savings= empty( $options['op_current_savings'] ) ? '18000.0' : (is_numeric(sanitize_text_field($options['op_current_savings']))) ? sanitize_text_field($options['op_current_savings']) : -1;
			if ($current_savings < 0) {
				$current_savings = '0';
				echo('Please enter a valid number greater than 0 for "current_savings".'."<br>");
			}
		}

		if ($invest_amt === null) {
			$invest_amt= empty( $options['op_invest_amt'] ) ? '850.0' : (is_numeric(sanitize_text_field($options['op_invest_amt']))) ? sanitize_text_field($options['op_invest_amt']) : -1;
			if ($invest_amt < 0) {
				$invest_amt = '0';
				echo('Please enter a valid number greater than 0 for "invest_amt".'."<br>");
			}
		}

		if ($rate === null) {
			$rate= empty( $options['op_rate'] ) ? '5.5' : (is_numeric(sanitize_text_field($options['op_rate']))) ? sanitize_text_field($options['op_rate']) : -1;
			if ($rate < 0) {
				$rate = '0';
				echo('Please enter a valid number greater than 0 for "rate".'."<br>");
			}
		}

		if ($goal_amt === null) {
			$goal_amt= empty( $options['op_goal_amt'] ) ? '1000000.0' : (is_numeric(sanitize_text_field($options['op_goal_amt']))) ? sanitize_text_field($options['op_goal_amt']) : -1;
			if ($goal_amt < 0) {
				$goal_amt = '0';
				echo('Please enter a valid number greater than 0 for "op_goal_amt".'."<br>");
			}
		}


		//echo "<br>" . "not a shortcode";
		//echo "$size " . $size . "<br>";
		//echo $custom_style . "<br>";
		//echo $add_link . "<br>";
		//echo $brand_name . "<br>";
		//echo $hide_resize . "<br>";
		//echo $invest_amt. "<br>";
		//echo $rate . "<br>";

	} // $shortcode = false;


	//
	// REGISTER STYLES
	//


	wp_register_style( 'fc-featherlight', plugins_url('css/featherlight.min.css', __FILE__), array(), false, 'screen' );

	wp_register_style( 'fincalcs-style', plugins_url('css/fin-calc-widgets.min.css', __FILE__), array(), false, 'screen' );


	if (strtolower($custom_style) === 'yes') {
		wp_register_style( 'fincalcs-custom-style', plugins_url('css/fin-calc-widgets-custom.css', __FILE__), array(), false, 'screen' );
	} 


	wp_register_style( 'fc-printer-style', plugins_url('css/printer.widget.min.css', __FILE__), array(), false, 'print');


	wp_enqueue_style( 'fc-featherlight' );
	wp_enqueue_style( 'fc-printer-style' );
	wp_enqueue_style( 'fincalcs-style' );


	// load a custom stylesheet so defaults can be easily overridden
	if (strtolower($custom_style) === 'yes') {
		wp_enqueue_style( 'fincalcs-custom-style' );
	} 


	if($shortcode) ob_start();


	// displays the widget
	include($WL_DIR_PREFIX."calculator.gui.php");



	//
	// REGISTER SCRIPTS
	//

	// is jQuery enqueued?
	if (!wp_script_is( 'jquery')) {
		wp_enqueue_script( 'jquery' );
	}

	// register supporting JavaScript libraries and Bootstrap
	wp_register_script('fc-supporting', plugins_url('js/supporting.WIDGETS.min.js', __FILE__), array('jquery'), '', true);
	wp_register_script('fc-custom-bootstrap', plugins_url('js/bootstrap.custom.min.js', __FILE__), array( 'jquery' ), '', true);
	// load the JavaScript math library
	wp_register_script('fc-retireage-interface', plugins_url('js/interface.RETIRE-AGE-WIDGET.min.js', __FILE__), array( 'jquery', 'fc-custom-bootstrap', 'fc-supporting'), '', true);



	wp_enqueue_script( 'fc-retireage-interface' );

	if($shortcode){
		$result = ob_get_contents();
		ob_end_clean();
		if(is_null($content)){
			return $result;
		} else {
			return $content . $result;
		}
	}

} // show_fcretireage_plugin



/* Function: fcretireageplugin_options
**
** Show/process options on the Wordpress admin's widget page
**
** args: nothing
** returns: nothing
*/
function fcretireageplugin_options() {

	// financial-calculators.com retirement age calculator widget options
	$options = $newoptions = get_option('fcretireagecalc_plugin');

	// in event admin updated plugin but did not deactivate / activate, pickup possible new options
	if (!array_key_exists('op_size', $options) || !array_key_exists('op_custom_style', $options) || !array_key_exists('op_add_link', $options) || !array_key_exists('op_brand_name', $options) || !array_key_exists('op_hide_resize', $options) || !array_key_exists('op_current_age', $options) || !array_key_exists('op_current_savings', $options) || !array_key_exists('op_invest_amt', $options) || !array_key_exists('op_rate', $options) || !array_key_exists('op_goal_amt', $options)) {
		// echo('Updated options'. implode(" ", $options));
		update_option('fcretireagecalc_plugin', array(
			'op_size' => null,
			'op_custom_style' => "No",
			'op_add_link' => "No",
			'op_brand_name' => "",
			'op_hide_resize' => "No",
			'op_current_age' => "28",
			'op_current_savings' => "16750.0",
			'op_invest_amt' => "775.0",
			'op_rate' => "5.5",
			'op_goal_amt' => "1000000.0"
			));
		$options = $newoptions = get_option('fcretireagecalc_plugin'); // keep everything in sync
	}


	// if widget's options have previously been set/saved in current session
	if (!empty($_POST['fcretireagecalc_opts'])) {
		$newoptions['op_size'] =  sanitize_text_field($_POST['fcretireagecalc-op_size']);
		if (strtolower($newoptions['op_size']) !== 'tiny' && strtolower($newoptions['op_size']) !== 'small' && strtolower($newoptions['op_size']) !== 'medium') {
			$newoptions['op_size'] = 'large';
		}
		$newoptions['op_custom_style'] =  (strtolower(sanitize_text_field($_POST['fcretireagecalc-op_custom_style'])) === "yes") ? "Yes" : "No";
		$newoptions['op_add_link'] =  (strtolower(sanitize_text_field($_POST['fcretireagecalc-op_add_link'])) === "yes") ? "Yes" : "No";
		// allow word characters, numbers, ampersand, dash, apostrophe, space and number sign
		$newoptions['op_brand_name'] = preg_replace("/[^\w#&'\- ]/", '', $_POST['fcretireagecalc-op_brand_name']);
		if (strtolower($newoptions['op_add_link']) !== 'yes') {
			$newoptions['op_brand_name'] = '';
		}
		$newoptions['op_hide_resize'] =  (strtolower(sanitize_text_field($_POST['fcretireagecalc-op_hide_resize'])) === "yes") ? "Yes" : "No";

		// sanitize and validate numbers
		$newoptions['op_current_age'] =  (is_numeric(sanitize_text_field($_POST['fcretireagecalc-op_current_age']))) ? sanitize_text_field($_POST['fcretireagecalc-op_current_age']) : -1;
		if ($newoptions['op_current_age'] < 0) {
			$newoptions['op_current_age'] = '0';
			echo('Please enter a valid number for "Default current age".'."<br>");
		}

		$newoptions['op_current_savings'] =  (is_numeric(sanitize_text_field($_POST['fcretireagecalc-op_current_savings']))) ? sanitize_text_field($_POST['fcretireagecalc-op_current_savings']) : -1;
		if ($newoptions['op_current_savings'] < 0) {
			$newoptions['op_current_savings'] = '0';
			echo('Please enter a valid number for "Default current savings".'."<br>");
		}

		$newoptions['op_invest_amt'] =  (is_numeric(sanitize_text_field($_POST['fcretireagecalc-op_invest_amt']))) ? sanitize_text_field($_POST['fcretireagecalc-op_invest_amt']) : -1;
		if ($newoptions['op_invest_amt'] < 0) {
			$newoptions['op_invest_amt'] = '0';
			echo('Please enter a valid number for "Default investment amount".'."<br>");
		}

		$newoptions['op_rate'] =  (is_numeric(sanitize_text_field($_POST['fcretireagecalc-op_rate']))) ? sanitize_text_field($_POST['fcretireagecalc-op_rate']) : -1;
		if ($newoptions['op_rate'] < 0) {
			$newoptions['op_rate'] = '0';
			echo('Please enter a valid number for "Default interest rate".'."<br>");
		}

		$newoptions['op_goal_amt'] =  (is_numeric(sanitize_text_field($_POST['fcretireagecalc-op_goal_amt']))) ? sanitize_text_field($_POST['fcretireagecalc-op_goal_amt']) : -1;
		if ($newoptions['op_goal_amt'] < 0) {
			$newoptions['op_goal_amt'] = '0';
			echo('Please enter a valid number for "Default retirement age".'."<br>");
		}

	} 
	//debug
	//else {
	//	echo('Options not yet posted.');
	//}


	// 1st check if options changed and if valid session
	if ( $options != $newoptions && (wp_verify_nonce($_POST['fcretireagecalc_opts'], 'fc_options'))) {
		// 2nd check permissions
		if ( is_user_logged_in() && current_user_can('update_plugins') ) {
			$options = $newoptions;
			update_option('fcretireagecalc_plugin', $options);
		}
		//debug
		//else if (array_key_exists('fcretireagecalc_opts', $_POST) && (!wp_verify_nonce($_POST['fcretireagecalc_opts'], 'fc_options'))) {
		//	echo ('Update failed. Session expired. Please log in again.');
		//}
	}

	$brand_name = esc_attr($options['op_brand_name']);
	$current_age = esc_attr($options['op_current_age']);
	$current_savings = esc_attr($options['op_current_savings']);
	$invest_amt = esc_attr($options['op_invest_amt']);
	$rate = esc_attr($options['op_rate']);
	$goal_amt = esc_attr($options['op_goal_amt']);
?>

		<!--HTML for widget's option page in WordPress' admin panel-->
		<p>
			<label for="fcretireagecalc-op_size"><?php _e( 'Widget\'s size?:' ); ?>
				<select name="fcretireagecalc-op_size" id="fcretireagecalc-op_size" class="widefat">
					<option value="tiny"<?php selected( $options['op_size'], 'tiny' ); ?>><?php _e('Tiny (max width = 150px)'); ?></option>
					<option value="small"<?php selected( $options['op_size'], 'small' ); ?>><?php _e('Small (max width = 290px)'); ?></option>
					<option value="medium"<?php selected( $options['op_size'], 'medium' ); ?>><?php _e('Medium (max width = 340px)'); ?></option>
					<option value="large"<?php selected( $options['op_size'], 'large' ); ?>><?php _e('Large (max width = 440px)'); ?></option>
				</select>
			</label>
		</p>

		<p>
			<label for="fcretireagecalc-op_custom_style"><?php _e( 'Load custom style sheet?:' ); ?>
				<select name="fcretireagecalc-op_custom_style" id="fcretireagecalc-op_custom_style" class="widefat">
					<option value="No"<?php selected( $options['op_custom_style'], 'No' ); ?>><?php _e('No'); ?></option>
					<option value="Yes"<?php selected( $options['op_custom_style'], 'Yes' ); ?>><?php _e('Yes'); ?></option>
				</select>
			</label>
		</p>
		<p>
			If &quot;Yes&quot; loads &lt;site&gt;\wp-content\plugins\fc-retirement-age-calculator\css\fin-calc-widgets-custom.css. Entries in <b>fin-calc-widgets-custom.css</b> modify the widget's look. Editing the provided custom stylesheet is the best way to change colors.
		</p>


		<p>
			<label for="fcretireagecalc-op_hide_resize"><?php _e( 'Hide the resize buttons?:' ); ?>
				<select name="fcretireagecalc-op_hide_resize" id="fcretireagecalc-op_hide_resize" class="widefat">
					<option value="No"<?php selected( $options['op_hide_resize'], 'No' ); ?>><?php _e('No'); ?></option>
					<option value="Yes"<?php selected( $options['op_hide_resize'], 'Yes' ); ?>><?php _e('Yes'); ?></option>
				</select>
			</label>
		</p>


		<p>
			<label for="fcretireagecalc-op_add_link"><?php _e( 'Allow plugin to add links to financial-calculators.com?:' ); ?>
				<select name="fcretireagecalc-op_add_link" id="fcretireagecalc-op_add_link" class="widefat">
					<option value="No"<?php selected( $options['op_add_link'], 'No' ); ?>><?php _e('No'); ?></option>
					<option value="Yes"<?php selected( $options['op_add_link'], 'Yes' ); ?>><?php _e('Yes'); ?></option>
				</select>
			</label>
		</p>
		<p>
			If &quot;Yes&quot;, two very discreet follow links will be inserted in the calculator. If you allow the links, you can rebrand the calculator to include your name or that of your business. Resetting this option to &quot;No&quot; at any time will remove the links. See FAQ's for details.
		</p>



		<p><label for="fcretireagecalc-op_brand_name"><?php _e('Add Your Brand Name:'); ?> <input class="widefat" id="fcretireagecalc-op_brand_name" name="fcretireagecalc-op_brand_name" type="text" value="<?php echo $brand_name; ?>" /></label>
		</p>
		<p>
		You may brand this widget with your brand. <b>Example: &quot;<b>Ben's</b>&quot;</b> will be preappended to &quot;Retirement Calculator&quot; For this to work, the above &quot;add links&quot; option must be set to &quot;Yes&quot;.
		</p>

		<div style="width:100%; float:left; clear:both;"><div style="width:45%; float:left; margin-right:4px"><label for="fcretireagecalc-op_current_age"><?php _e('Default current age:'); ?> <input class="widefat" id="fcretireagecalc-op_current_age" name="fcretireagecalc-op_current_age" type="text" value="<?php echo $current_age; ?>" /></label></div>
			<div style="width:45%; float:left"><label for="fcretireagecalc-op_current_savings"><?php _e('Default current savings:'); ?> <input class="widefat" id="fcretireagecalc-op_current_savings" name="fcretireagecalc-op_current_savings" type="text" value="<?php echo $current_savings; ?>" /></label></div></div>



		<div style="width:100%; float:left; clear:both;"><div style="width:45%; float:left; margin-right:4px;"><label for="fcretireagecalc-op_invest_amt"><?php _e('Default investment amount:'); ?> <input class="widefat" id="fcretireagecalc-op_invest_amt" name="fcretireagecalc-op_invest_amt" type="text" value="<?php echo $invest_amt; ?>" /></label></div>
			<div style="width:45%; float:left"><label for="fcretireagecalc-op_goal_amt"><?php _e('Default future goal:'); ?> <input class="widefat" id="fcretireagecalc-op_goal_amt" name="fcretireagecalc-op_goal_amt" type="text" value="<?php echo $goal_amt; ?>" /></label></div></div>
			
			
		<div style="width:100%; float:left; clear:both;"><div style="width:45%; float:left; margin-right:4px;"><label for="fcretireagecalc-op_rate"><?php _e('Default interest rate:'); ?> <input class="widefat" id="fcretireagecalc-op_rate" name="fcretireagecalc-op_rate" type="text" value="<?php echo $rate; ?>" /></label></div><div style="width:45%; float:left"><p style="text-align:center"><?php _e('Enter only digits.<br>No formatting.'); ?></p></div></div>
		

		<p><b>Note:</b> Your visitors will be able to select the date and currency conventions they need by clicking on &quot<b>$ : MM/DD/YYYY</b>&quot; in the calculator's lower right corner.</p>

		<input type="hidden" id="fcretireagecalc_opts" name="fcretireagecalc_opts" value="<?php echo wp_create_nonce('fc_options'); ?>" />


<?php

}



/* Function: fcretireageplugin_register
**
** Registers the plugin to show in WordPress' admin's widget page.
**
** args: none
** returns: nothing
*/
function fcretireageplugin_register() {
	$widget_ops = array('classname' => 'fcretireagecalc_plugin', 'description' => __('Retirement Calculator by financial-calculators.com'));

	$name = __('Retirement Age Calculator');

	// Register WordPress Widgets for use in your themes sidebars.
	// You can also modify your theme and start Customizing Your Sidebar. 
	// wp_register_sidebar_widget($id, $name, $output_callback, $options, $params, ... ); 
	wp_register_sidebar_widget( 'fcretireageplugin', $name, 'show_fcretireage_widget', $widget_ops );


	// Draws the controls form on the WordPress's widget page in admin area
	// and saves the settings when the "Save" button is clicked
	// Registers widget control callback for customizing options.
	// wp_register_widget_control( int|string $id, string $name, callable $control_callback, array $options = array() )
	wp_register_widget_control( 'fcretireageplugin', $name, 'fcretireageplugin_options' );
} // fcretireageplugin_register


// Hooks a function on to a specific action.
add_action( 'widgets_init', 'fcretireageplugin_register' );

// Adds a hook for a shortcode tag.
add_shortcode( 'fcretireageplugin', 'show_fcretireage_plugin' );


/* end of file */

<?php

	// GitHub Guideline.js Example
	// Proxies the github repository page and injects neccessary files to run Guideline.js.

	$github_url = 'https://github.com/';
	$repository_name = 'comfirm/Guideline.js';
	$disclaimer = '<div class="gl-proxy-disclaimer">Notice! This is not the real github.com. This is a proxy demonstrating Guideline.js on GitHub! <a href="https://raw.github.com/comfirm/Guideline.js/master/examples/github/index.php">Click here to have a look at the source code.</a></div>';

	// Used when including a file that is referenced in a parent/protected directory.
	$include_target = @$_GET['include_target'];

	if(isset($include_target)){
		$mime_types = array(
			'js' => 'text/javascript',
			'css' => 'text/css'
		);

		$allowed_includes = array(
			'lightshow' => '../../lib/lightshow.jquery.min.js',
			'scrollto' => '../../lib/scrollto.jquery.js',
			'guideline' => '../../src/guideline.js'
		);

		if(array_key_exists($include_target, $allowed_includes)){
			$filepath = $allowed_includes[$include_target];

			// Set appropriate content type header
			$extension = pathinfo($filepath, PATHINFO_EXTENSION);
			header(sprintf("Content-Type: " . $mime_types[$extension]));

			die(file_get_contents($filepath));
		}
	}

	// Build tags which we will inject into content
	$content_injections = array();

	$injection_template = array(
		'js_inline' => '<script type="text/javascript">%s</script>',
		'js_include' => '<script src="%s" type="text/javascript"></script>',
		'css_include' => '<link href="%s" media="all" rel="stylesheet" type="text/css" />'
	);

	$injection_items = array(
		'css_include' => array(
			'css/style.css'
		),
		'js_include' => array(
			'?include_target=lightshow',
			'?include_target=scrollto',
			'?include_target=guideline',
			'github.guideline.js'

		),
		'js_inline' => array(
			'$(document).ready(function(){ Guideline.setCurrentPage("repository"); });',
			'Guideline.getGuide("github").start();'
		)
	);

	foreach($injection_items as $type => $items){
		if(count($items) > 0){
			foreach($items as $item){
				$content_injections[] = sprintf($injection_template[$type], $item);
			}
		}
	}

	// Read the GitHub repository HTML and inject our tags into it
	$content = file_get_contents($github_url.$repository_name);
	$content = str_replace('href="/', 'href="'.$github_url, $content); // Change relative URLs to absolute
	$content = str_replace('<div id="wrapper">', '<div id="wrapper">'.$disclaimer, $content); // Inject a disclaimer so visiters are aware that this is a proxy
	$content = str_replace('<meta http-equiv="x-pjax-version"', implode("\n", $content_injections)."\n".'<meta http-equiv="x-pjax-version"', $content);
	
	echo($content);

?>
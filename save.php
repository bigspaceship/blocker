<?php
	
	if( $_SERVER['HTTP_HOST'] == 'gfischer.local' || $_SERVER['HTTP_HOST'] == '10.0.1.129' )
	{
		define( 'BASEURL', 'http://'.$_SERVER['HTTP_HOST'].'/adobe/builder' );
	}
	else {
		// !gf we might need to update that stuff at some point...
		define( 'BASEURL', 'http://area51.bigspaceship.com/private/adobe/html5/isometric/' );
	}
	
	$title = $_POST['title'];
	$cubes = $_POST['cubes_text'];

	//print_r($_POST);
	
	$time = time();
	$file = "features/" . $time . "- " . $title . ".txt"; 
	$h = fopen( $file, "w" ) or die( "fail" );
	$cubes = urldecode( $cubes );
	$cubes = str_replace('	', '', $cubes);
	$cubes = str_replace('
', '', $cubes);
	$cubes = substr_replace($cubes, '', -1, 1);
	//print_r('cubes = ' . $cubes);
	//exit;
	fwrite( $h, $cubes ) or die("failed again"); 

	fclose( $h );
	
	function strip_unwanted( $string )
	{
		return (string)str_replace(array("\r", "\r\n", "\n", "\t"), '', $string);
	}
	
	$video_urls = array("dQw4w9WgXcQ", "dKWT5wW4gdY", "60Znn2_jDIc", "D091idBiieY");
?>
<!DOCTYPE html>
<html>
	<head>
		<title>file saved</title>
	</head>
	<style>
		*
		{
			color: #333;
		}
		
		article
		{
			margin-top: 50px;
			margin-left: 50px;
			width: 640px;
			float: left;
			font-family: sans-serif;
			display: block;	
		}
		
		h1
		{
			font-size: 20px;
			font-weight: normal;
			margin-bottom: 20px;
		}
		
		p
		{
			line-height: 19px;
			font-size: 14px;
		}
		
		textarea
		{
			font-family: monospace;
			width: 640px;
			padding: 5px;
			font-size: 14px;
			line-height: 19px;
			background: #333;
			color: #fff;
			height: 180px;
		}
		
		a
		{
			color: #f1841d;
			text-decoration: none;
		}
		
		a:hover
		{
			text-decoration: underline;
		}
				
	</style>
	<body>
		<article>
			<object style="height: 390px; width: 640px"><param name="movie" value="http://www.youtube.com/v/<?=$video_urls[array_rand($video_urls)]?>?version=3&autoplay=1"><param name="allowFullScreen" value="true"><param name="allowScriptAccess" value="always"><embed src="http://www.youtube.com/v/<?=$video_urls[array_rand($video_urls)]?>?version=3&autoplay=1" type="application/x-shockwave-flash" allowfullscreen="true" allowScriptAccess="always" width="640" height="390"></object>
			<h1>Thank You.</h1>
			<p>The the object you built has been saved. You can now go back and <a href="index.html">build new assets</a> or notify a developer about what you have done...</p>
			<p>You can find your isometric object here: <a href="<?=BASEURL . '/' . $file?>"><?=BASEURL . '/' . $file?></a></p>
			<textarea><?=$cubes?></textarea>
		</article>	
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6/jquery.js"></script>
		<!-- <script src="javascript/isometric.js"></script> -->
	</body>
</html>
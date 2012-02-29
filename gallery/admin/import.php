<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>Import</title>
			<link href="../css/stylesheet.css" rel="stylesheet" />
		<link href="../css/blocks.css" rel="stylesheet" />
		<link href="css/preview.css" rel="stylesheet" />
	</head>
	<body>
<?php
	if ( isset( $_POST['blocks'] ) )
	{
		$blocks = convertBlocks( $_POST['blocks'] );
		$json = array( 'blocks' => $blocks, 'history' => array() );
		$json = json_encode( $json );
?>
		<div id="blocks" class="blocks-active">
<?php
		foreach ( $blocks as $block )
		{
?>
			<div class="block color-<?=$block['color']?>" style="top: <?=$block['position']['y']?>px; left: <?=$block['position']['x']?>px; z-index: <?=$block['position']['z']?>;"></div>
<?php
		}
?>
		</div>
		<textarea style="width: 90%; height: 90%; font-family: monospace; font-size: 11px; line-height: 18px;"><?=$json?></textarea>
<?php
	}

	else
	{
?>
		<form action="<?=$PHP_SELF?>" method="post">
			<label for="block-input">Block Code</label>
			<textarea id="block-input" name="blocks"></textarea>
			<input type="submit" value="convert!" />
		</form>
<?php
	}
?>

	</body>
</html><?php

function convertBlocks( $string )
{
	$blocks = array();
	$items = explode( '|',  $string );

	foreach ( $items as $item )
	{
		$parts = explode( '.', $item );	
		$block = array();

		$block['position'] = array();
		$block['position']['x'] = $parts[3];
		$block['position']['y'] = $parts[2];
		$block['position']['z'] = $parts[4];
		$block['color'] = getColor( $parts[0] );
		$block['id'] = $parts[1];
		$block['type'] = 'static';
		$blocks[] = $block;
	}

	return $blocks;
}

function getColor( $char )
{
	$char = strtolower( $char );
	$color = $char;
	
	if ( $char === 'r' ){ $color = 'red'; }
	if ( $char === 'g' ){ $color = 'green'; }
	if ( $char === 'b' ){ $color = 'blue'; }
	if ( $char === 'y' ){ $color = 'yellow'; }
	if ( $char === 'p' ){ $color = 'pink'; }
	if ( $char === 'o' ){ $color = 'orange'; }

	return $color;
}
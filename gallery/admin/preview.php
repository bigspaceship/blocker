<?php
include( '../api/config.php' );

$connection = mysql_connect( $db_host, $db_username, $db_password );

if ( $connection )
{
	mysql_select_db( $db_database, $connection );


}
?>
<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>Gallery Preview</title>
		<link href="../css/stylesheet.css" rel="stylesheet" />
		<link href="../css/blocks.css" rel="stylesheet" />
		<link href="css/preview.css" rel="stylesheet" />
	</head>
	<body>
<?php
	if ( isset( $_GET[ 'id' ] ) )
	{
		$id =  mysql_real_escape_string( $_GET[ 'id' ] );
		$sketches = resultToArray( mysql_query( "SELECT * FROM blocks WHERE id = '" . $id . "'" ) );

		foreach ( $sketches as $sketch )
		{
?>
		<div id="blocks" class="blocks-active">
<?php
			if ( isset( $sketch['blocks'] ) )
			{
				$blocks = unserialize( $sketch['blocks'] );

				foreach ( $blocks as $block )
				{
					$left = $block['position']['x'];
					$top = $block['position']['y'] + ( - 14 * $block['position']['z'] );
?>
			<div class="block color-<?=$block['color']?>" style="top: <?=$top?>px; left: <?=$left?>px; z-index: <?=$block['position']['z']?>; "></div>
<?php
				}
			}
		}
?>
		</div>
<?php
	}
?>
	</body>
</html>
<?php

function resultToArray( $result )
{
	$return_value = array();

	while ( $row = mysql_fetch_array( $result, MYSQL_ASSOC ) )
	{	
		$return_value[] = $row;
	}

	return $return_value;
}
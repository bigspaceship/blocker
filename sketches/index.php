<?php
$path = pathinfo( $_SERVER['PHP_SELF'] );
$dir = './';//$path['dirname'];
$files = scandir( $dir );
$result  = array();
$list = array();

foreach ( $files as $file )
{
	if ( 
		$file !== '.' &&
		$file !== '..' &&
		$file !== 'index.php'
	)
	{
		$file = file_get_contents( 'http://gfischer.local' . $path['dirname'] . '/' . $file );
		$json = json_decode( $file, true );
		
		if ( $json )
		{
			$list[] = $json;
		}
	}
}

$result['sketches'] = $list;
echo json_encode( $result );
?>
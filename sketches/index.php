<?php
$path = pathinfo( $_SERVER['PHP_SELF'] );
$dir = './';//$path['dirname'];
$files = scandir( $dir );

$list = array();

foreach ( $files as $file )
{
	if ( 
		$file !== '.' &&
		$file !== '..' &&
		$file !== 'index.php'
	)
	{
		$list[] = 'http://gfischer.local' . $path['dirname'] . '/' . $file;
	}
}

echo json_encode( $list );

?>
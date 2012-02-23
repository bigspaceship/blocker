<?php
if ( isset ( $_GET[ 'action' ] ) )
{
	require_once( 'public-database.php' );

	$action = $_GET[ 'action' ];

	$output = array();
	$format = 'json';

	if ( $action === 'get-sketch-ids' )
	{
		$ids = getAcceptedSketchIDs();

		foreach ( $ids as $id )
		{
			$output[] = $id['id'];
		}

		sort( $output );
	}

	if ( isset( $_GET[ 'value' ] )  )
	{
		$value = $_GET[ 'value' ];

		if ( $action === 'get-sketch' )
		{
			$sketches = getSketch( $value );

			foreach ( $sketches as $sketch )
			{
				if ( $sketch['blocks'] )
				{
					$sketch['blocks'] = unserialize( stripslashes( $sketch['blocks'] ) );
				}

				if ( ! $sketch['name'] )
				{
					$sketch['name'] = 'untitled';
				}

				$output = $sketch;
			}
		}
	}

	if ( $output )
	{
		if ( $format === 'json' )
		{
			echo json_encode( $output );
		}

		if ( $format === 'dump' )
		{
			echo '<pre>' . print_r( $output, true ) . '</pre>';
		}
	}
}
?>
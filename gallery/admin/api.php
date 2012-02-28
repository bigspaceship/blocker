<?php

if ( isset ( $_GET[ 'action' ] ) )
{
	require_once( 'database.php' );

	$action = $_GET[ 'action' ];

	$output = array();
	$format = 'json';

	if ( $action === 'get-accepted-sketch-ids' )
	{
		$output = getAcceptedSketchIDs();
	}
	
	if ( $action === 'get-unaccepted-sketch-ids' )
	{
		$output = getUnacceptedSketchIDs();
	}

	if ( $action === 'get-all-sketch-ids' )
	{
		$output = getAllSketchIDs();
	}

	if ( $action === 'get-all-sketch-meta' )
	{
		$output = getAllSketchMeta();
	}

	if ( isset( $_GET[ 'value' ] )  )
	{
		$value = $_GET[ 'value' ];

		if ( $action === 'sketch-delete' )
		{
			$output = sketchDelete( $value );
		}

		if ( $action === 'sketch-accept' )
		{
			$output = sketchAccept( $value );
		}

		if ( $action === 'sketch-decline' )
		{
			$output = sketchDecline( $value );
		}

		if ( $action === 'sketch-update' )
		{
			$output = sketchUpdate( $value, $_POST );
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
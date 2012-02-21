<?php
include( 'config.php' );

$connection = mysql_connect( $db_host, $db_username, $db_password );

if ( $connection )
{
	mysql_select_db( $db_database, $connection );
}

function sketchSave( $sketch )
{	
	$blocks = mysql_real_escape_string( serialize( $sketch['blocks'] ) );
	$author = $sketch['author'] ? mysql_real_escape_string( $sketch['author'] ) : 'anonymous';
	$website = $sketch['website'] ? mysql_real_escape_string( $sketch['website'] ) : '';
	$twitter = $sketch['twitter'] ? mysql_real_escape_string( $sketch['twitter'] ) : '';
	$date = $sketch['date'] ? mysql_real_escape_string( $sketch['date'] ) : '';

	mysql_query( "INSERT INTO blocks (blocks, author, website, twitter, date, accepted, moderated) VALUES ('" . $blocks . "', '" . $author . "', '" . $website . "', '" . $twitter . "', '" . $date . "', '0', '0')" );
}

function getAcceptedSketchIDs()
{
	return resultToArray( mysql_query( "SELECT id FROM blocks WHERE accepted = '1' ORDER BY id DESC" ) );
}

function getSketch( $id )
{
	$id = mysql_real_escape_string( $id );
	$result = resultToArray( mysql_query( "SELECT id,blocks,author,website,twitter,accepted,moderated FROM blocks WHERE id = '" . $id .  "'" ) );
	
	//print_r( $result );

	//$result['blocks'] = unserialize( stripslashes( $result['blocks'] ) );
	//$result['author'] = stripslashes( $result['author'] );
	//$result['website'] = stripslashes( $result['website'] );

	return $result;
}

function resultToArray( $result )
{
	$return_value = array();

	while ( $row = mysql_fetch_array( $result, MYSQL_ASSOC ) )
	{
		$return_value[] = $row;
	}

	return $return_value;
}
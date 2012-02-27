<?php
include_once( 'config.php' );
include_once( 'slug.php' );
include_once( 'validemail.php' );

$connection = mysql_connect( $db_host, $db_username, $db_password );

if ( $connection )
{
	mysql_select_db( $db_database, $connection );
}

function sketchSave( $sketch )
{	
	$field_keys= array();
	$field_values = array();

	$db_fields['name'] = $sketch['name'] ? mysql_real_escape_string( $sketch['name'] ) : 'untitled';
	$db_fields['blocks'] = mysql_real_escape_string( serialize( $sketch['blocks'] ) );
	$db_fields['history'] = mysql_real_escape_string( serialize( $sketch['history'] ) );
	$db_fields['author'] = isset( $sketch['author'] ) ? mysql_real_escape_string( utf8_encode( $sketch['author'] ) ) : 'anonymous';
	$db_fields['website'] = isset( $sketch['website'] ) ? mysql_real_escape_string( utf8_encode( $sketch['website'] ) )  : '';
	$db_fields['name'] = isset( $sketch['name'] ) ? mysql_real_escape_string( utf8_encode( $sketch['name'] ) ) : '';
	$db_fields['email'] = ( isset( $sketch['email'] ) && validEmail( $sketch['email'] ) ) ? mysql_real_escape_string( utf8_encode( $sketch['email'] ) ) : '';
	$db_fields['twitter'] = isset( $sketch['twitter'] ) ? mysql_real_escape_string( utf8_encode( $sketch['twitter'] ) ) : '';
	$db_fields['date'] = isset( $sketch['date'] ) ? mysql_real_escape_string( ( $sketch['date'] ) ) : '';
	$db_fields['slug'] = generateSlug( utf8_encode( $sketch['name'] ) );
	$db_fields['accepted'] = '0';

	foreach( $db_fields as $key => $value )
	{
		$field_keys[] = $key;
		$field_values[] = "'" . $value . "'";
	}

	$query_string = "INSERT INTO blocks (";
	$query_string .= join( ',', $field_keys );
	$query_string .= ") VALUES (";
	$query_string .= join( ', ', $field_values );
	$query_string .= ")";

	mysql_query( $query_string );
}

function getAcceptedSketchIDs()
{
	return resultToArray( mysql_query( "SELECT slug FROM blocks WHERE accepted = '1' ORDER BY id DESC" ) );
}

function getSketch( $slug )
{
	$slug = mysql_real_escape_string( $slug );
	$result = resultToArray( mysql_query( "SELECT name,blocks,author,website,twitter,date,slug FROM blocks WHERE slug = '" . $slug .  "'" ) );
	
	return $result;
}

function downloadSketch( $slug )
{
	$slug = mysql_real_escape_string( $slug );
	$result = resultToArray( mysql_query( "SELECT name,slug,blocks,history,author,website,twitter FROM blocks WHERE slug = '" . $slug .  "'" ) );

	return $result;
}

function generateSlug( $name )
{
	$slug = mysql_real_escape_string( slug( $name ) );
	$slug = str_replace( '-json', '', $slug );
	$slug = substr( $slug, 0, 27 );

	$in_database = resultToArray( mysql_query( "SELECT slug FROM blocks WHERE slug LIKE '" . $slug . "%'" ) );

	if ( count( $in_database ) > 0 )
	{
		$slug .= '-' . count( $in_database );
	}

	return $slug;
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
<?php
include( 'config.php' );

$connection = mysql_connect( $db_host, $db_username, $db_password );

if ( $connection )
{
	mysql_select_db( $db_database, $connection );
}

function sketchSave( $sketch )
{
	var $db_fields = array();

	$db_fields['blocks'] = mysql_real_escape_string( serialize( $sketch['blocks'] ) );
	$db_fields['history'] = mysql_real_escape_string( serialize( $sketch['history'] ) );
	$db_fields['author'] = isset( $sketch['author'] ) ? mysql_real_escape_string( $sketch['author'] ) : 'anonymous';
	$db_fields['website'] = isset( $sketch['website'] ) ? mysql_real_escape_string( $sketch['website'] ) : '';
	$db_fields['twitter'] = isset( $sketch['twitter'] ) ? mysql_real_escape_string( $sketch['twitter'] ) : '';
	$db_fields['date'] = isset( $sketch['date'] ) ? mysql_real_escape_string( $sketch['date'] ) : '';
	$db_fields['name'] = isset( $sketch['name'] ) ? mysql_real_escape_string( $sketch['name'] ) : 'untitled';
	$db_fields['slug'] = generateSlug( $sketch['name'] );
	$db_fields['accepted'] = '0';

	$field_keys= array();
	$field_values = array();

	foreach( $db_fields as $key => $value )
	{
		$field_keys[] = $key;
		$field_values[] = "'" . $value . "'";
	}

	$query_string = "INSERT INTO blocks (";
	$query_string .= join( ',', $field_keys );
	$query_string .= ") VALUES (";
	$query_string .= join( ',', $field_values );
	$query_string .= ")";

	echo "=============" . $query_string;

	mysql_query( $query_string );
}
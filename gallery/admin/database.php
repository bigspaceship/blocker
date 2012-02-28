<?php
include( '../config.php' );
include_once( 'sendemail.php' );
include_once( '../api/validemail.php' );

$connection = mysql_connect( $db_host, $db_username, $db_password );

if ( $connection )
{
	mysql_select_db( $db_database, $connection );
}

function sketchSave( $sketch )
{	
	$blocks = mysql_real_escape_string( serialize( $sketch['blocks'] ) );
	$author = isset( $sketch['author'] ) ? mysql_real_escape_string( $sketch['author'] ) : 'anonymous';
	$website = isset( $sketch['website'] ) ? mysql_real_escape_string( $sketch['website'] ) : '';
	$twitter = isset( $sketch['twitter'] ) ? mysql_real_escape_string( $sketch['twitter'] ) : '';
	$date = isset( $sketch['date'] ) ? mysql_real_escape_string( $sketch['date'] ) : '';

	mysql_query( "INSERT INTO blocks (blocks, author, website, twitter, date, accepted, moderated) VALUES ('" . $blocks . "', '" . $author . "', '" . $website . "', '" . $twitter . "', '" . $date . "', '0', '0')" );
}

function sketchAccept( $id )
{
	$id = mysql_real_escape_string( $id );
	mysql_query( "UPDATE blocks SET accepted = '1' WHERE id = '" . $id . "'" );
	mysql_query( "UPDATE blocks SET moderated = '1' WHERE id = '" . $id . "'" );

	$data = resultToArray ( mysql_query( "SELECT id,email,name,twitter,date,author,slug FROM blocks WHERE id = '" . $id . "'" ) );

	sendEmail( $data );

	return $id;
}

function sketchDecline( $id )
{
	$id = mysql_real_escape_string( $id );

	mysql_query( "UPDATE blocks SET accepted = '0' WHERE id = '" . $id . "'" );
	mysql_query( "UPDATE blocks SET moderated = '1' WHERE id = '" . $id . "'" );
	
	return $id;
}

function sketchDelete( $id )
{
	$id = mysql_real_escape_string( $id );
	mysql_query( "DELETE FROM blocks WHERE id = '" . $id . "'" );
	return $id;
}

function sketchUpdate( $id, $post )
{
	$id = mysql_real_escape_string( $id );
	$db_items = array();
	$query_string = "UPDATE blocks SET ";

	foreach ( $post as $key => $value )
	{
		if (
			$value != '' &&
			$value != '-'
		)
		{
			if ( $key === 'email' )
			{
				if ( validEmail( $value ) )
				{
					$value = mysql_real_escape_string( $value );
				}

				else
				{
					$value = '';
				}

				$db_items[] = $key . " = '" . $value . "'";
			}

			else
			{
				$value = mysql_real_escape_string( $value );
				$db_items[] = $key . " = '" . $value . "'";
			}
		}
	}

	$query_string .= implode( ', ', $db_items ) . " WHERE id = '" . $id . "'";

	if ( count( $db_items ) )
	{
		mysql_query( $query_string );
	}

	return $id;	
}

function getAcceptedSketchIDs()
{
	return resultToArray( mysql_query( "SELECT id FROM blocks WHERE accepted = '1'" ) );
}

function getUnacceptedSketchIDs()
{
	return resultToArray( mysql_query( "SELECT id FROM blocks WHERE accepted = '0'" ) );
}

function getAllSketchIDs()
{
	return resultToArray( mysql_query( "SELECT id FROM blocks" ) );
}

function getAllSketchMeta()
{
	return resultToArray( mysql_query( "SELECT id,name,author,website,twitter,email,date,accepted,moderated FROM blocks ORDER BY date DESC" ) );
}

function getNewSketchMeta()
{
	return resultToArray( mysql_query( "SELECT id,name,author,website,twitter,email,date,accepted,moderated FROM blocks WHERE moderated = '0' ORDER BY date DESC" ) );
}

function getSketchMeta( $id )
{
	$id = mysql_real_escape_string( $id );
	$result = resultToArray( mysql_query( "SELECT id,name,author,website,twitter,email,date,email,accepted,moderated FROM blocks WHERE id = ' . $id . '" ) );
	
	$result['author'] = stripslashes( $result['blocks'] );
	$result['website'] = stripslashes( $result['website'] );
	$result['email'] = stripslashes( $result['email'] );
	
	return $result;
}

function resultToArray( $result )
{
	$return_value = array();
	
	while( $row = mysql_fetch_array( $result ) )
	{
		$return_value[] = $row;
	}

	return $return_value;
}
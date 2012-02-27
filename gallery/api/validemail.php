<?php

function validEmail( $email )
{
	$is_valid = true;
	$at_index = strrpos( $email, '@');
	
	if ( is_bool( $at_index ) && ! $at_index )
	{
		$is_valid = false;
	}

	else
	{
		$domain = substr( $email, $at_index + 1 );
		$local = substr( $email, 0, $at_index );
		$local_length = strlen( $local );
		$domain_length = strlen( $domain );

		if (
			$local_length < 1 ||
			$local_length > 64
		)
		{
			// local part length exceeded
			$is_valid = false;
		}
		
		else if (
			$domain_length < 1 ||
			$domain_length > 255
		)
		{
			// domain part length exceeded
			$is_valid = false;
		}

		else if (
			$local[0] == '.' ||
			$local[$local_length-1] == '.'
		)
		{
			// local part starts or ends with '.'
			$is_valid = false;
		}
		else if ( preg_match( '/\\.\\./', $local ) )
		{
			// local part has two consecutive dots
			$is_valid = false;
		}
		
		else if ( ! preg_match( '/^[A-Za-z0-9\\-\\.]+$/', $domain ) )
		{
			// character not valid in domain part
			$is_valid = false;
		}
		
		else if ( preg_match( '/\\.\\./', $domain ) )
		{
			// domain part has two consecutive dots
			$is_valid = false;
		}
		else if ( ! preg_match( '/^(\\\\.|[A-Za-z0-9!#%&`_=\\/$\'*+?^{}|~.-])+$/', str_replace( "\\\\", "", $local ) ) )
		{
			// character not valid in local part unless 
			// local part is quoted
			if ( ! preg_match( '/^"(\\\\"|[^"])+"$/', str_replace( "\\\\", "", $local ) ) )
			{
				$is_valid = false;
			}
		}

		if (
			$is_valid &&
			! ( checkdnsrr( $domain, "MX" ) || checkdnsrr( $domain, "A" ) )
		)
		{
			// domain not found in DNS
			$is_valid = false;
		}
	}

	//error_log( "EMAIL: " .  $email . " VALID: " . $is_valid );
	
	return $is_valid;
}
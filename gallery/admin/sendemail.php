<?php

function sendEmail( $data )
{
	$data = $data[0];

	if ( isset( $data['email'] ) )
	{
		$recipient = $data['email'];

		$subject = 'Sketch Accepted';
		$message = 'Your sketch has been accepted to the gallery. You can see it here: http://gfischer.local/blocks-editor/gallery/#/' . $data['slug'];
		$headers = "From: info@bigspaceship.com\r\n" . "X-Mailer: php";
		
		if ( mail( $recipient, $subject, $message, $headers ) )
		{
			//error_log( 'email successfully sent to ' . $recipient );
		}

		else
		{
			//error_log( 'email did not for for ' . $recipient );
		}
	}
}
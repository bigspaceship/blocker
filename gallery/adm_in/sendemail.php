<?php

function sendEmail( $data )
{
	$data = $data[0];

	if ( isset( $data['email'] ) )
	{
		$recipient = $data['email'];

		$subject = 'Your Sketch Has Been Accepted';
		$message = 'Congratulations! Your sketch has been accepted to the public gallery of Blocker. You can see it here: http://blocker.bigspaceship.com/gallery/#/' . $data['slug'];
		$headers = "From: blocker@bigspaceship.com" . "\r\n" . "Reply-To: blocker@bigspaceship.com" . "\r\n" . "X-Mailer: php";
		
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
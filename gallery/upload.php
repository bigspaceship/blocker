<?php
require_once( 'api/slug.php' );
require_once( 'api/validemail.php' );
require_once( 'api/public-database.php' );
require_once( 'api/data-validate.php' );

if ( ! isset( $_GET[ 'ajax-upload' ] ) )
{
?>
<!doctype html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="en"> <![endif]-->
<!--[if IE 9]>    <html class="no-js ie9" lang="en"> <![endif]-->
<html>
	<head>
		<title>Blocker - Sketch Upload</title>
		<script src="../javascript/libraries/modernizr.custom.74974.js"></script>
		<link rel="stylesheet" href="css/upload.min.css" />
	</head>
	<body>
		<section>
			<h1>Blocker Sketch Upload</h1>
			<p>Upload a sketch that you built with <a href="../index.html">Blocker</a>. Once your sketch has been approved, it will show up in the <a href="../gallery">gallery</a>.</p>
			<p>Please make sure that your sketch consists of less than 1000 blocks before submitting it.</p>
			<p>Please note: The sketch name and file input fields are mandatory.</p>
			<p>If you enter your email address, we will notify you if when we have moderated your sketch. We will not display you email address publicly or give it away. Our <a href="http://www.bigspaceship.com/terms-of-service/">Terms and Conditions</a> apply.</p>
		</section>
<?php
$upload_path = "uploads/";

$input_fields = array();
$input_fields[] = array( 'name' => 'file', 		'type' => 'file', 	'required' => true, 	'label' => 'Sketch File' );
$input_fields[] = array( 'name' => 'name', 		'type' => 'text', 	'required' => true, 	'label' => 'Sketch Name' );
$input_fields[] = array( 'name' => 'author', 	'type' => 'text', 	'required' => false, 	'label' => 'Your Name' );
$input_fields[] = array( 'name' => 'email', 	'type' => 'email', 	'required' => false, 	'label' => 'Your Email Address' );
$input_fields[] = array( 'name' => 'website', 	'type' => 'url', 	'required' => false, 	'label' => 'Your Website' );
$input_fields[] = array( 'name' => 'twitter', 	'type' => 'text', 	'required' => false, 	'label' => 'Your Twitter Handle' );

if (
	! isset( $_FILES[ 'file' ] ) &&
	! isset( $_POST[ 'name' ] )
)
{
?>
		<section>
			<form method="post" action="<?=$_SERVER['PHP_SELF']?>" enctype="multipart/form-data">
<?php
	foreach ( $input_fields as $input_field )
	{
		$required = '';
		
		if ( $input_field['required'] == true )
		{
			$required = 'required="required" ';
		}
?>
					<label for="sketch-<?=$input_field['name']?>"><?=$input_field['label']?></label>
					<input type="<?=$input_field['type']?>" id="sketch-<?=$input_field['name']?>" name="<?=$input_field['name']?>" <?=$required?>/>
<?php
	}
?>
				<input type="submit" value="Submit Sketch" />
			</form>
		</section>
<?php
}

elseif (
	! $_FILES[ 'file' ] ||
	! isset( $_POST[ 'name' ] )
)
{
?>
		<section>
			<form method="post" action="<?=$_SERVER['PHP_SELF']?>" enctype="multipart/form-data">
<?php
	foreach ( $input_fields as $input_field )
	{
		$required = '';
		$value = '';

		if (
			$input_field['required'] == true &&
			$input_field[ 'type' ] !== 'file'
		)
		{
			$required = 'required="required" ';
			
			if ( ! isset ( $_POST[ $input_field[ 'name' ] ] ) )
			{
				$required = 'required="required" class="required-not-filled" ';
			}

			if ( isset ( $_POST[ $input_field[ 'name' ] ] ) )
			{
				$value = 'value="' . $_POST[ $input_field[ 'name' ] ] . '" ';
			}
		}
?>
				<label for="sketch-<?=$input_field['name']?>"><?=$input_field['label']?></label>
				<input type="<?=$input_field['type']?>" id="sketch-<?=$input_field['name']?>" name="<?=$input_field['name']?>" <?=$value?><?=$required?>/>
<?php
	}
?>
				<input type="submit" value="Submit Sketch" />
			</form>
		</section>
<?php
}

elseif ( 
	$_FILES[ 'file' ] &&
	isset( $_POST[ 'name' ] )
)
{
	$json = json_decode( file_get_contents( $_FILES['file']['tmp_name'] ), true );
	$success = false;
	$errors = array();

	$data = $json;

	if ( isset( $_POST['website'] ) ) { $data['website'] = $_POST['website']; };
	if ( isset( $_POST['email'] ) ) { $data['email'] = $_POST['email']; };
	if ( isset( $_POST['twitter'] ) ) { $data['twitter'] = $_POST['twitter']; };
	if ( isset( $_POST['author'] ) && ! isset( $data['author'] ) ) { $data['author'] = $_POST['author']; };
	if ( isset( $_POST['date'] ) && ! isset( $data['date'] ) ) { $data['date'] = $_POST['date']; };

	if ( ! isset( $data['name'] ) )
	{
		if ( isset( $_POST['name'] ) )
		{
			$data['name'] = $_POST['name'];
		}

		elseif ( isset( $_FILES['file']['name'] ) )
		{
			$data['name'] = $_FILES['file']['name'];
		}
	}

	$validated_data = dataValidate( $data );

	if ( $validated_data['valid'] )
	{
		sketchSave( $validated_data['data'] );
	}

	$success = $validated_data['valid'];
	$errors = $validated_data['messages'];	
?>
		<section>
<?php

	if ( ! $success )
	{
?>
			<h1>Unfortunately, the upload of your script failed.</h1>
<?php
		foreach ( $errors as $error )
		{
?>
			<p><?=$error?></p>
<?php
		}
	}

	else
	{
?>
			<h1>Thanks! Your sketch has been uploaded.</h1>
			<p>
				Your submission is being reviewed and will be added to the gallery if approved. If you provided an email address, 
				you will be notified when it is added to the gallery.
			</p>
<?php
	}
?>
			<p>You can <a href="upload.php">upload</a> another sketch.</p>
		</section>
<?php
}
?>
		<footer><p>Blocker was built by <a href="http://www.bigspaceship.com">Big Spaceship</a>.</p></footer>
	</body>
</html>
<?php
}
else
{
	if ( isset( $_POST[ 'data' ] ) )
	{

		$data = json_decode( $_POST[ 'data' ], true );

		$validated_data = dataValidate( $data );
		$result = array();

		if ( $validated_data['valid'] )
		{
			$result = sketchSave( $validated_data['data'] );
		}
	
		$success = $validated_data['valid'];
		$messages = $validated_data['messages'];
				
		$return_value = array( 'success' => $success, 'messages' => $messages, 'success' => $success, 'result' => $result );

		echo json_encode( $return_value );
	}

	else
	{
?>
<p>Please <a href="upload.php">return to the upload form</a>.</p>
<?php
	}
}

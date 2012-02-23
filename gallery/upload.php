<?php
require_once( 'slug.php' );
require_once( 'public-database.php' );
?>
<!doctype html>
<!--[if lt IE 7]> <html itemscope itemtype="http://schema.org/Product" class="no-js ie6 oldie" lang="en"> <![endif]-->
<!--[if IE 7]>    <html itemscope itemtype="http://schema.org/Product" class="no-js ie7 oldie" lang="en"> <![endif]-->
<!--[if IE 8]>    <html itemscope itemtype="http://schema.org/Product" class="no-js ie8 oldie" lang="en"> <![endif]-->
<!--[if IE 9]>    <html itemscope itemtype="http://schema.org/Product" class="no-js ie9" lang="en"> <![endif]-->
<html>
	<head>
		<title>Isometric Block Editor</title>
		<script src="../javascript/libraries/modernizr.custom.74974.js"></script>
		<link rel="stylesheet" href="css/upload.css" />
	</head>
	<body>
		<section>
			<h1>Sketch Upload</h1>
			<p>Upload a sketch that you built with the <a href="../index.html">Blocks Builder</a>. Once your sketch has been approved, it will show up in the gallery.</p>
			<p>Please make sure that your sketch consists of less than 1000 blocks before submitting it.</p>
			<p>Please note: The input fields with a red border are mandatory.</p>
		</section>
<?php
$upload_path = "uploads/";

$input_fields = array();
$input_fields[] = array( 'name' => 'file', 'type' => 'file', 'required' => true, 'label' => 'Sketch File' );
$input_fields[] = array( 'name' => 'name', 'type' => 'text', 'required' => true, 'label' => 'Sketch Name' );
$input_fields[] = array( 'name' => 'author', 'type' => 'text', 'required' => false, 'label' => 'Your Name' );
$input_fields[] = array( 'name' => 'website', 'type' => 'url', 'required' => false, 'label' => 'Your Website' );
$input_fields[] = array( 'name' => 'twitter', 'type' => 'text', 'required' => false, 'label' => 'Your Twitter Handle' );

if ( 
	! $_FILES[ 'file' ] &&
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

	if ( 
		$json &&
		$json['blocks']
	)
	{
		if ( count( $json['blocks'] ) < 1000 )
		{
			$file_name = date( 'Y-m-d-H-i-s' ) . '_' . $_FILES['file']['name'];
			$website = filter_var( $_POST[ 'website' ], FILTER_VALIDATE_URL );
			$author = $_POST[ 'author' ];

			preg_match_all( '/@([A-Za-z0-9_]+)/', $_POST[ 'twitter' ], $twitter_handles );

			if ( ! $json['id'] )
			{
				$json['id'] = $file_name;
			}

			if ( ! $json['name'] )
			{
				$json['name'] = $_FILES['file']['name'];
			}

			if ( strtotime( $json['date'] ) )
			{
				$json['date'] = date( 'Y-m-d H:i', strtotime( $json['date'] ) );
			}

			else
			{
				$json['date'] = date( 'Y-m-d H:i' );
			}

			if ( $website ) { $json['website'] = $website; }
			if ( $author ){ $json['author'] = $author; }
			if ( count( $twitter_handles[1] ) ) { $json['twitter'] = $twitter_handles[1][0]; }

			$json['id'] = slug( $json['id'] );

			if ( $json )
			{
				$file = $upload_path . $file_name;

				if ( strpos( $file, '.json') === false )
				{
					$file = $file . '.json';
				}
			
				sketchSave( $json );

				$success = true;
			}

			else
			{
				$errors[] = 'Could not write the file ' . $file_name;
			}
		}

		else
		{
			$errors[] =  'Your sketch has ' . count( $json['blocks'] ) . ' blocks. Please reduce the block count to less than 1000 blocks and upload the file again.';
		}
	}

	else
	{
		$errors[] = 'Could not read the uploaded file.';
	}
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
			<h1>Upload successfull</h1>
			<p>We will now review your submisstion. If everything goes well, we will add your sketch to the gallery.</p>
<?php
	}
?>
		</section>
<?php
}
?>

	</body>
</html>

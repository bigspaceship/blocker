function stringToSlug( $string )
{
	$string = $string.replace( /^\s+|\s+$/g, '' );
	$string = $string.toLowerCase();

	var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
	var to   = 'aaaaeeeeiiiioooouuuunc------';
	
	for ( var i = 0, l = from.length ; i < l ; i++ )
	{
		$string = $string.replace( new RegExp( from.charAt( i ), 'g' ), to.charAt( i ) );
	}
	
	$string = $string.replace( /[^a-z0-9 -]/g, '' ).replace( /\s+/g, '-' ).replace( /-+/g, '-' );
	
	return $string;
}

function getRandomNumber( $min, $max, $int )
{
	var return_value = Math.random() + ( $max - $min ) + $min;
	
	if ( $int )
	{
		return_value = Math.floor( Math.random() * ( $max - $min + 1 ) ) + $min;
	}

	return return_value;
}

function getNumberKey( $key )
{
	return [49, 50, 51, 52, 53, 54, 55, 56, 57, 48].indexOf( $key );
}

function getColors()
{
	var colors = [];

	$( '.color-buttons a' ).each(
		function()
		{
			var color = $( this ).attr( 'id' ).replace( 'color-button-', '' );
			
			colors.push( color );
		}
	);

	return colors;
}

function getBlockSize()
{
	return { width: 28, height: 14 };
}
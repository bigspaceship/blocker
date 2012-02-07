var Navigation = function()
{
	var _self = this;
	var _slider_options = { min: 1, max: 20, value: 1, step: 1, slide: sliderMoved }

	function init( $colors )
	{
		var color_list_html = '';
		
		if ( $colors )
		{
			for ( var i = 0; i < $colors.length; i++ )
			{
				color_list_html += 	'<li><a href="#" id="color-button-' + $colors[i] + '">' + $colors[i] + '</a></li>';
			}
		}

		$( '.color-buttons' ).append( color_list_html );

		slidersAdd( '.size-slider' );

		$( '.size-sliders' ).hide();
		$( '.color-buttons a' ).click( colorChanged );
		$( '.mode-buttons a' ).click( modeChanged );
		$( '.file-buttons a' ).click( fileClicked );

		editor.colorUpdate( $colors[0] );
		editor.modeUpdate( 'single' );
	}

	function colorChanged( $event )
	{
		$event.preventDefault();

		var new_color = $( $event.target ).attr( 'id' ).replace( 'color-button-', '' );

		$( '.color-buttons .active' ).removeClass( 'active' );
		$( '.color-buttons #color-button-' + new_color ).addClass( 'active' );

		editor.colorUpdate( new_color );
	}

	function modeChanged( $event )
	{
		$event.preventDefault();

		var new_mode = $( $event.target ).attr( 'id' ).replace( 'mode-', '' );

		$( '.mode-buttons .active' ).removeClass( 'active' );
		$( '.mode-buttons #mode-' + new_mode ).addClass( 'active' );

		if (
			new_mode === 'single' ||
			new_mode === 'delete'
		)
		{
			$( '.size-sliders' ).hide();
		}

		if ( new_mode === 'multiple' )
		{
			$( '.size-sliders' ).show();
		}

		editor.modeUpdate( new_mode );
	}

	function fileClicked( $event )
	{
		$event.preventDefault();

		var operation = $( $event.target ).attr( 'id' ).replace( 'file-', '' );
			operation = 'file' + operation.charAt( 0 ).toUpperCase() + operation.substr( 1 ).toLowerCase()

		editor[operation]();
	}

	function slidersAdd( $selector )
	{
		$( $selector ).each(
			function()
			{
				$( this )
					.append( '<div />' )

				$( this )
					.find( 'div' )
					.slider( _slider_options );

				$( this )
					.find( 'h1' )
					.text( $( this ).text() + ': ' + _slider_options.value );


				var id = $( this ).closest( 'li' ).attr( 'id' ).replace( 'size-', '' )
				
				editor.sizeUpdate( { id: id, value: _slider_options.value } );
			}
		);
	}

	function sliderMoved( $event, $ui )
	{
		if ( $( $event.target ).closest( 'li' ).attr( 'id' ) )
		{
			var slider_id = $( $event.target ).closest( 'li' ).attr( 'id' ).replace( 'size-', '' );

			$( $event.target ).closest( 'li' ).find( 'h1' ).text( slider_id + ': ' + $ui.value );

			editor.sizeUpdate( { id: slider_id, value: $ui.value } );
		}
	}

	_self.init = init;
}
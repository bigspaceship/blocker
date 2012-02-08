var Navigation = function()
{
	var _self = this;
	var _slider_options = { min: 1, max: 20, value: 1, step: 1, slide: sliderMoved }

	function init( $colors )
	{
		$( '.color-buttons a:first' ).addClass( 'active' );
		$( '.mode-buttons a:first' ).addClass( 'active' );

		var color = $( '.color-buttons a.active' ).attr( 'id' ).replace( 'color-button-', '' );

		editor.colorUpdate( color );

		slidersAdd( '.size-slider' );

		$( '.single-info' ).show();

		//$( '.size-sliders' ).hide();
		$( '.color-buttons a' ).click( colorChanged );
		$( '.mode-buttons a' ).click( modeChanged );
		$( '.file-buttons a' ).click( fileClicked );
		$( '.history-buttons a' ).click( historyClicked );
		$( '#file-export' ).click( exportClicked );
		$( '#file-import' ).click( importClicked );

		$( '.delete-info a' ).click( deleteClicked );
		$( '#export-html' ).click( exportHTMLClicked );
		$( '#export-json' ).click( exportJSONClicked );

		// gf: check for file API for
		if (
			window.File &&
			window.FileReader &&
			window.FileList &&
			window.Blob
		)
		{
			$( '#import-file' ).change( fileChanged );
		}

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

		if ( new_mode === 'single' )
		{
			$( '.single-info' ).show();
			$( '.size-sliders' ).hide();
			$( '.delete-info' ).hide();
			$( '.export-info' ).hide();
			$( '.import-info' ).hide();
		}

		if ( new_mode === 'delete' )
		{
			$( '.single-info' ).hide();
			$( '.size-sliders' ).hide();
			$( '.delete-info' ).show();
			$( '.export-info' ).hide();
			$( '.import-info' ).hide();
		}

		if ( new_mode === 'multiple' )
		{
			$( '.single-info' ).hide();
			$( '.size-sliders' ).show();
			$( '.delete-info' ).hide();
			$( '.export-info' ).hide();
			$( '.import-info' ).hide();
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

	function fileChanged( $event )
	{
		editor.fileImported( $event );
	}

	function historyClicked( $event )
	{
		$event.preventDefault();

		var action = $( $event.target ).attr( 'id' ).replace( 'history-', '' );

		editor.historyUpdate( action );
	}

	function deleteClicked( $event )
	{
		$event.preventDefault();

		editor.deleteSelected();
	}

	function exportClicked( $event )
	{
		$event.preventDefault();

		$( '.single-info' ).hide();
		$( '.size-sliders' ).hide();
		$( '.delete-info' ).hide();
		$( '.export-info' ).toggle();
		$( '.import-info' ).hide();
	}

	function importClicked( $event )
	{
		$event.preventDefault();

		$( '.single-info' ).hide();
		$( '.size-sliders' ).hide();
		$( '.delete-info' ).hide();
		$( '.export-info' ).hide();
		$( '.import-info' ).toggle();
	}

	function exportHTMLClicked( $event )
	{
		$event.preventDefault();

		editor.exportHTML( $event );
	}

	function exportJSONClicked( $event )
	{
		$event.preventDefault();

		editor.exportJSON( $event );
	}

	function slidersAdd( $selector )
	{
		$( $selector ).each(
			function()
			{
				$( this )
					.append( '<div class="nav-slider"></div>' )

				$( this )
					.find( '.nav-slider' )
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
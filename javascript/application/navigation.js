var Navigation = function()
{
	var _self = this;
	var _slider_options = { min: 1, max: 20, value: 1, step: 1, slide: sliderMoved }
	var _saving = false;

	function init( $colors )
	{
		$( '.color-buttons li:first' ).addClass( 'active' );
		$( '.mode-buttons a:first' ).addClass( 'active' );

		var color = $( '.color-buttons li.active a' ).attr( 'id' ).replace( 'color-button-', '' );

		editor.colorUpdate( color );

		slidersAdd( '.multiple-info .size-slider' );

		$( '.single-info' ).show();

		$( '.color-buttons a' ).click( colorChanged );
		$( '.mode-buttons a' ).click( modeChanged );
		$( '.history-buttons a' ).click( historyClicked );

		$( '#file-export' ).click( exportClicked );
		$( '#file-import' ).click( importClicked );
		$( '#file-save' ).click( saveClicked );
		$( '#file-load' ).click( loadClicked );

		$( '.delete-info a' ).click( deleteClicked );
		$( '.save-info a' ).click( saveToLocal );
		
		$( '#export-html' ).click( exportHTMLClicked );
		$( '#export-json' ).click( exportJSONClicked );

		// gf: check for file API
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

		$( 'nav' ).hover( navOver, navOut );
	}

	function stop()
	{
		$( 'nav' ).hide()
	}

	function start()
	{
		$( 'nav' ).show()
	}

	function colorChanged( $event )
	{
		$event.preventDefault();

		var mode = editor.getMode();
		var new_color = $( $event.target ).attr( 'id' ).replace( 'color-button-', '' );

		$( '.color-buttons .active' ).removeClass( 'active' );
		$( '.color-buttons #color-button-' + new_color )
			.closest( 'li' )
			.addClass( 'active' )

		if ( mode === 'delete' )
		{
			editor.modeUpdate( 'single' );
			showInfo( 'single' );
		}

		else
		{
			showInfo( mode );
		}

		editor.colorUpdate( new_color );
	}

	function modeChanged( $event )
	{
		$event.preventDefault();

		var new_mode = $( $event.target ).attr( 'id' ).replace( 'mode-', '' );

		$( '.mode-buttons .active' ).removeClass( 'active' );
		$( '.mode-buttons #mode-' + new_mode ).addClass( 'active' );

		showInfo( new_mode );
		editor.modeUpdate( new_mode );
	}

	function modeUpdate( $mode )
	{
		$( '.mode-buttons .active' ).removeClass( 'active' );
		$( '.mode-buttons #mode-' + $mode ).addClass( 'active' );
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

		showInfo( 'export' );
	}

	function importClicked( $event )
	{
		$event.preventDefault();

		showInfo( 'import' );
	}

	function saveClicked( $event )
	{
		$event.preventDefault();

		showInfo( 'save' );
	}

	function loadClicked( $event )
	{
		$event.preventDefault();

		showInfo( 'load' );
		sketchListShow();
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

	function saveToLocal( $event )
	{
		$event.preventDefault();

		if ( ! _saving )
		{
			_saving = true;

			$( $event.target )
				.text( 'Saved' )
				.addClass( 'inactive' );

			editor.saveToLocal();
		}		
	}

	function showInfo( $subnav )
	{
		$( '.info-container > *' )
			.not( '.info-' + $subnav )
			.removeClass( 'info-container-active' )
			.hide();

		$( '.info-container .' + $subnav + '-info' )
			.addClass( 'info-container-active' )
			.show();
	}

	function sketchListShow()
	{
		var sketches = editor.load();
		var list_html = '';

		
		if ( sketches.length )
		{
			if ( ! $( '.load-info .sketch-list' ).length )
			{
				$( '.load-info' ).append( '<ul class="sketch-list"></ul>' );
			}

			for ( var i = 0; i < sketches.length; i++ )
			{
				list_html += '<li id="sketch-' + i + '">';
				list_html += 	'<p class="sketch-name"><a href="#">' + sketches[i].name + '</a></p>';
				list_html += 	'<p class="sketch-date">' + sketches[i].date + '</p>';
				list_html += '</li>';
			}

			$( '.load-info .sketch-list' ).html( list_html );
			$( '.load-info .sketch-list a' ).click( sketchListClicked );
		}

		else
		{
			// gf: no sketches :-(
		}
	}

	function sketchListClicked( $event )
	{
		var sketch_index = $( $event.target ).closest( 'li' ).attr( 'id' ).replace( 'sketch-', '' );
		var sketches = editor.load();

		if (
			sketches &&
			sketches.length &&
			sketches[sketch_index] &&
			sketches[sketch_index].blocks
		)
		{
			editor.clear();
			editor.importBlocks( sketches[sketch_index].blocks );
		}
	}

	function savedToLocal()
	{
		setTimeout( function() { 
			$( '.save-info a' )
				.text( 'Save' )
				.removeClass( 'inactive' );
			
			_saving = false;
		}, 1500 );
	}

	function navOver( $event )
	{
		editor.previewRemove();
	}

	function navOut( $event )
	{

	}

	function slidersAdd( $selector )
	{
		$( $selector ).each(
			function()
			{
				$( this )
					.append( '<div class="nav-slider"></div>' );

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

	function getColors()
	{
		var return_value = [];
		
		$( '.color-buttons a' ).each(
			function( $index, $item )
			{
				return_value.push( $( $item ).attr( 'id' ).replace( 'color-button-', '' ) );
			}
		);

		return return_value;
	}

	_self.init = init;
	_self.stop = stop;
	_self.start = start;
	_self.savedToLocal = savedToLocal;
	_self.showInfo = showInfo;
	_self.modeUpdate = modeUpdate;
	_self.getColors = getColors;
}
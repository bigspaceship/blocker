var Navigation = function()
{
	var _self = this;
	var _slider_options = { min: 1, max: 20, value: 1, step: 1, slide: sliderMoved }
	var _saving = false;
	var _modules = {};

	function init( $modules )
	{
		_modules = $modules;

		$( '.color-buttons li:first' ).addClass( 'active' );
		$( '.mode-buttons a:first' ).addClass( 'active' );

		slidersAdd( '.multiple-info .size-slider' );
		showInfo( 'single' );

		$( '.color-buttons a' ).click( colorChanged );
		$( '.mode-buttons a' ).click( modeChanged );
		$( '.history-buttons a' ).click( historyClicked );

		$( '#file-export' ).click( exportClicked );
		$( '#file-import' ).click( importClicked );
		$( '#file-upload' ).click( uploadClicked );

		$( '#file-save' ).click( saveClicked );
		$( '#file-load' ).click( loadClicked );

		$( '#delete-selected' ).click( deleteSelectedClicked );
		$( '#delete-all' ).click( deleteAllClicked );
		$( '#delete-transparent' ).click( deleteTransparentClicked );

		$( '.save-info a' ).click( save );
		
		$( '#export-html' ).click( exportHTMLClicked );
		$( '#export-json' ).click( exportJSONClicked );

		$( '#upload' ).click( sketchUpload );
		$( '.upload-info input' ).keyup( uploadInputCheck );
		$( '#upload-again, #upload-try-again' ).click( uploadAgain );

		$( '#import-file' ).change( fileChanged );

		$( 'nav' ).hover( navOver, navOut );

		var color = $( '.color-buttons li.active a' ).attr( 'id' ).replace( 'color-button-', '' );

		if ( ! Modernizr.localstorage )
		{
			$( '#file-save, #file-load' ).remove();
		}

		if ( ! window.FileReader )
		{
			$( '#file-import' ).remove();
		}

		if ( ! window.BlobBuilder || ! window.URL )
		{
			$( '#file-export' ).remove();
		}

		$( '.upload-inprogress' ).prepend( '<div class="upload-spin"></div>' );

		spinnerAdd( $( '.upload-spin' ) );

		_modules.canvas.setMode( 'single' );
		_modules.canvas.colorUpdate( color );		
	}

	function stop()
	{
		$( 'nav' ).hide()
	}

	function start()
	{
		$( 'nav' ).show()
	}

	function spinnerAdd( $element )
	{
		var spinner_options = {
			lines: 10,
			length: 2,
			width: 1,
			radius: 3,
			color: '#000',
			speed: 0.8,
			trail: 30,
			shadow: false,
			hwaccel: false,
			className: 'spinner',
			zIndex: 2e9,
			top: '10px',
			left: '10px'
		};

		var spinner = new Spinner( spinner_options ).spin( $element[0] );
	}

	function colorChanged( $event )
	{
		$event.preventDefault();

		var mode = _modules.canvas.getMode();
		var new_color = $( $event.target ).attr( 'id' ).replace( 'color-button-', '' );

		$( '.color-buttons .active' ).removeClass( 'active' );
		$( '.color-buttons #color-button-' + new_color )
			.closest( 'li' )
			.addClass( 'active' )

		if ( mode === 'delete' )
		{
			_modules.canvas.setMode( 'single' );
			showInfo( 'single' );
		}

		else
		{
			showInfo( mode );
		}

		_modules.canvas.colorUpdate( new_color );
	}

	function modeChanged( $event )
	{
		$event.preventDefault();

		var new_mode = $( $event.target ).attr( 'id' ).replace( 'mode-', '' );

		$( '.mode-buttons .active' ).removeClass( 'active' );
		$( '.mode-buttons #mode-' + new_mode ).addClass( 'active' );

		showInfo( new_mode );
		_modules.canvas.setMode( new_mode );
	}

	function setMode( $mode )
	{
		$( '.mode-buttons .active' ).removeClass( 'active' );
		$( '.mode-buttons #mode-' + $mode ).addClass( 'active' );
	}

	function fileChanged( $event )
	{
		_modules.memory.fileImported( $event );
	}

	function historyClicked( $event )
	{
		$event.preventDefault();

		var action = $( $event.target ).attr( 'id' ).replace( 'history-', '' );

		_modules.canvas.historyUpdate( action );
	}

	function deleteSelectedClicked( $event )
	{
		$event.preventDefault();

		_modules.canvas.deleteSelected();
	}

	function deleteAllClicked( $event )
	{
		$event.preventDefault();

		var dialog_html = '';
			dialog_html += '<div class="dialog dialog-remove-all">';
			dialog_html += 		'<p>Delete all Blocks?</p>';
			dialog_html += 		'<a href="#" id="dialog-confirm">OK</p>';
			dialog_html += 		'<a href="#" id="dialog-cancel">Cancel</p>';
			dialog_html += '</div>';

		$( 'body' ).append( dialog_html );
		$( '.dialog-remove-all #dialog-confirm' ).click( deleteAll );
		$( '.dialog-remove-all #dialog-cancel' ).click( dialogClose );
	}

	function deleteAll( $event )
	{
		$event.preventDefault();

		_modules.canvas.clear();
		dialogClose();
	}

	function deleteTransparentClicked( $event )
	{
		$event.preventDefault();

		_modules.canvas.deleteTransparent();
	}

	function dialogClose( $event )
	{
		if ( $event )
		{
			$event.preventDefault();
		}

		$( '.dialog' ).remove();
	}

	function exportClicked( $event )
	{
		$event.preventDefault();

		showInfo( 'export' );
	}

	function uploadClicked( $event )
	{
		$event.preventDefault();

		showInfo( 'upload' );
	}

	function uploadInputCheck()
	{
		if ( $( '#upload-sketch' ).val().length > 3 )
		{
			$( '#upload' ).addClass( 'active' );
		}

		else
		{
			$( '#upload' ).removeClass( 'active' );
		}
	}

	function sketchUpload( $event )
	{
		if ( $( '#upload-sketch' ).val().length > 3 )
		{
			var upload_data = {};
				upload_data.name = $( '.upload-info #upload-sketch' ).val()
				upload_data.author = $( '.upload-info #upload-author' ).val() || undefined;
				upload_data.email = $( '.upload-info #upload-email' ).val() || undefined;
				upload_data.website = $( '.upload-info #upload-website' ).val() || undefined;
				upload_data.twitter = $( '.upload-info #upload-twitter' ).val() || undefined;
				upload_data.blocks = _modules.canvas.getBlocks();
				upload_data.history = _modules.history.getHistory();

			_modules.memory.upload( upload_data );

			$( '.upload-form' ).addClass( 'upload-hidden' );
			$( '.upload-inprogress' ).removeClass( 'upload-hidden' );
		}
	}

	function sketchUploadCallback( $response )
	{
		$( '.upload-inprogress' ).addClass( 'upload-hidden' );
		
		if (
			$response.success &&
			$response.messages
		)
		{
			$( '.upload-success' ).removeClass( 'upload-hidden' );
		}

		else
		{
			$( '.upload-failed' ).removeClass( 'upload-hidden' );
		}
	}

	function uploadAgain( $event )
	{
		$event.preventDefault();

		$( '.upload-success, .upload-failed' ).addClass( 'upload-hidden' );
		$( '.upload-form' ).removeClass( 'upload-hidden' );

		uploadInputCheck();
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

		_modules.memory.exportHTML( $event );
	}

	function exportJSONClicked( $event )
	{
		$event.preventDefault();

		_modules.memory.exportJSON( $event );
	}

	function save( $event )
	{
		$event.preventDefault();

		if ( ! _saving )
		{
			_saving = true;

			$( $event.target )
				.text( 'Saved' )
				.addClass( 'inactive' );

			_modules.memory.save();
		}		
	}

	function showInfo( $subnav )
	{
		$( '.info-container > *' )
			.not( '.info-' + $subnav )
			.removeClass( 'info-container-active' )			

		$( '.info-container .' + $subnav + '-info' )
			.addClass( 'info-container-active' )

		$( '.mode-buttons #mode-' + $subnav )
			.addClass( 'active' )
			.parent()
			.siblings()
			.find( 'a' )
			.removeClass( 'active' )
	}

	function sketchListShow()
	{
		var sketches = _modules.memory.load();
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
	}

	function sketchListClicked( $event )
	{
		var sketch_index = $( $event.target ).closest( 'li' ).attr( 'id' ).replace( 'sketch-', '' );
		var sketches = _modules.memory.load();

		if (
			sketches &&
			sketches.length &&
			sketches[sketch_index] &&
			sketches[sketch_index].blocks
		)
		{
			_modules.canvas.clear();
			_modules.canvas.importBlocks( sketches[sketch_index].blocks );
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
		_modules.canvas.previewRemove();
	}

	function navOut( $event )
	{
		_modules.canvas.previewUpdateBlocks();
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
				
				_modules.canvas.sizeUpdate( { id: id, value: _slider_options.value } );
			}
		);
	}

	function sliderMoved( $event, $ui )
	{		
		if ( $( $event.target ).closest( 'li' ).attr( 'id' ) )
		{
			var slider_id = $( $event.target ).closest( 'li' ).attr( 'id' ).replace( 'size-', '' );

			$( $event.target ).closest( 'li' ).find( 'h1' ).text( slider_id + ': ' + $ui.value );

			_modules.canvas.sizeUpdate( { id: slider_id, value: $ui.value } );
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
	_self.setMode = setMode;
	_self.getColors = getColors;
	_self.sketchUploadCallback = sketchUploadCallback;
}
function Editor()
{
	var _self = this;
	var _dependencies = [
		'javascript/libraries/jquery-1.7.1.min.js',
		'javascript/libraries/jquery-ui-1.8.17.custom.min.js',
		'javascript/libraries/jquery.mousewheel.js',
		'javascript/libraries/jquery.event.drag-2.0.js',
		'javascript/libraries/date.format.js',
		'javascript/application/navigation.js',
		'javascript/application/canvas.js',
		'javascript/application/history.js',
		'javascript/application/memory.js',
		'javascript/application/help.js',
		'javascript/application/gallery.js'
	];

	var _colors = []
	var _color;
	var _size = {};
	var _mode;
	var _cubes = [];
	var _history;
	var _memory;
	var _navigation;
	var _canvas;
	var _help;
	var _gallery;

	var _active = false;

	var _number_keys = [49, 50, 51, 52, 53, 54]

	function init()
	{
		yepnope( { load: _dependencies, complete: depencenciesLoaded } );
		//start();
	}

	function start()
	{
		_active = true;
		
		if( _canvas ){ _canvas.start(); }
		if( _navigation ){ _navigation.start(); }
		if( _help ){ _help.start(); }
	}

	function stop()
	{
		_active = false;
		_canvas.stop();
		_navigation.stop();
		_help.stop();
	}

	function depencenciesLoaded( $url, $result, $key )
	{
		_colors = getColors();

		_history = new History();
		_self.getHistory = _history.getHistory;
		_self.importHistory = _history.importHistory;
		_self.historyUpdateIDs = _history.historyUpdateIDs;

		_memory = new Memory();
		_self.load = _memory.load;
		_self.saveToLocal = _memory.save;
		_self.fileImported = _memory.fileImported;
		_self.exportHTML = _memory.exportHTML;
		_self.exportJSON = _memory.exportJSON;

		_navigation = new Navigation();
		_self.savedToLocal = _navigation.savedToLocal;
		_self.getColors = _navigation.getColors;
		_self.showInfo = _navigation.showInfo;
		
		_canvas = new Canvas();
		_self.importBlocks = _canvas.importBlocks;
		_self.getBlocks = _canvas.getBlocks;
		_self.getMode = _canvas.getMode;
		_self.previewRemove = _canvas.previewRemove;
		_self.getBlockSize = _canvas.getBlockSize;
		
		_help = new Help();

		_history.init();
		_navigation.init( _colors );
		_canvas.init();
		_help.init();

		_gallery = new Gallery();
		_gallery.init();
		_gallery.start();

		$( document )
			.keydown( keyDown )
			.keypress( keyPressed )
	}

	function keyPressed( $event )
	{
		if ( _active )
		{

		}
	}

	function keyDown( $event )
	{
		if ( _active )
		{
			var key = $event.which;
			var mode = _canvas.getMode();

			if ( _number_keys.indexOf( key ) !== -1 )
			{
				var index = _number_keys.indexOf( key );
				var target = $( '.color-buttons a' ).eq( index );
				var new_color = target.attr( 'id' ).replace( 'color-button-', '' );

				$( '.color-buttons .active' ).removeClass( 'active' );

				target
					.closest( 'li' )
					.addClass( 'active' );

				if ( mode === 'delete' )
				{
					modeUpdate( 'single' );
					_navigation.showInfo( 'single' );
				}

				else
				{
					_navigation.showInfo( mode );
				}
				
				colorUpdate( new_color );
			}

			if ( ! $( 'input:focus').length )
			{
				// backspace		
				if ( key === 8 )
				{
					if ( mode === 'delete' )
					{
						$event.preventDefault();

						_canvas.deleteSelected();
						_navigation.showInfo( mode );
					}
				}

				if ( $event.metaKey )
				{			
					// Z
					if ( key === 90 || key === 122 )
					{
						if ( $event.shiftKey )
						{
							historyUpdate( 'redo' );
						}

						else
						{
							historyUpdate( 'undo' );
						}

						_navigation.showInfo( mode );
					}

					//O
					if ( key === 111 || key === 79 )
					{
						$event.preventDefault();

						_navigation.showInfo( 'import' );
					}

					//E
					if ( key === 69 || key === 101 ) 
					{
						$event.preventDefault();

						_navigation.showInfo( 'export' );
					}

					//S
					if ( key === 83 || key === 115 )
					{
						$event.preventDefault();

						_navigation.showInfo( 'save' );
					}

					//// S
					//if ( key === 83 || key === 115 )
					//{
					//	modeUpdate( 'single' );
					//	_navigation.showInfo( 'single' );
					//}

					//M
					if ( key === 77 || key === 109 )
					{
						modeUpdate( 'multiple' );
						_navigation.showInfo( 'multiple' );
					}

					//D
					if ( key === 68 || key === 100 )
					{
						modeUpdate( 'delete' );
						_navigation.showInfo( 'delete' );
					}
				}
			}

			if ( key === 13 )
			{
				if ( $( '.export-info' ).hasClass( 'info-container-active' ) )
				{
					if ( ! $( '.export-info .download-link' ).length )
					{
						$( '.export-info #export-json' ).trigger( 'click' );
					}

					else
					{
						//$( '.export-info .download-link' ).trigger( 'click' );
					}
				}

				if ( $( '.import-info' ).hasClass( 'info-container-active' ) )
				{
					$( '.import-info #import-file' ).trigger( 'click' );
				}

				if ( $( '.save-info' ).hasClass( 'info-container-active' ) )
				{
					$( '.save-info .info-button' ).trigger( 'click' );
				}
			}
		}
	}

	function colorUpdate( $new_color )
	{
		if ( _canvas ){ _canvas.colorUpdate( $new_color, _color ); }

		_color = $new_color;
	}

	function modeUpdate( $new_mode )
	{
		_mode = $new_mode;

		if ( _canvas ){ _canvas.modeUpdate( _mode ); }
		if ( _navigation ){ _navigation.modeUpdate( _mode ); }
	}

	function sizeUpdate( $size )
	{
		_size[$size.id] = $size.value;

		if ( _canvas ){ _canvas.sizeUpdate( _size ); }
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

	function historyUpdate( $action, $item )
	{
		if ( $action === 'save' )
		{
			_history[$action]( $item );
		}

		else
		{
			_canvas.historyUpdate( _history[$action]( $item ) );
		}
	}

	function deleteSelected()
	{
		if ( _canvas )
		{
			_canvas.deleteSelected();
		}
	}

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

	function clear()
	{
		_canvas.clear();
		_history.clear();
	}

	_self.init = init;
	_self.start = start;
	_self.stop = stop;
	_self.clear = clear;
	
	_self.colorUpdate = colorUpdate;
	_self.sizeUpdate = sizeUpdate;
	_self.modeUpdate = modeUpdate;
	_self.deleteSelected = deleteSelected;
	_self.stringToSlug = stringToSlug;
	_self.getRandomNumber = getRandomNumber;
	_self.historyUpdate = historyUpdate;

	_self.getColor = function(){ return _color; };
	_self.getMode = function(){ return _mode; };
	_self.getSize = function(){ return _size; };
	_self.getBlocks = function(){ return _canvas.getBlocks(); };
	_self.getActive = function(){ return _active };


}

var editor = new Editor();
	editor.init();
function Editor()
{
	var _self = this;
	var _dependencies = [
		'javascript/libraries/jquery-1.7.1.min.js',
		'javascript/libraries/jquery-ui-1.8.17.custom.min.js',
		'javascript/libraries/jquery.mousewheel.js',
		'javascript/libraries/jquery.event.drag-2.0.js',
		'javascript/application/navigation.js',
		'javascript/application/canvas.js',
		'javascript/application/history.js',
		'javascript/application/memory.js',
		'javascript/application/help.js'
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

	var _number_keys = [49, 50, 51, 52, 53, 54]

	function init()
	{
		yepnope( { load: _dependencies, complete: depencenciesLoaded } );
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
		
		_canvas = new Canvas();
		_self.importBlocks = _canvas.importBlocks;
		_self.getBlocks = _canvas.getBlocks;
		_self.getMode = _canvas.getMode;
		
		_help = new Help();

		_history.init();
		_navigation.init( _colors );
		_canvas.init();
		_help.init();

		$( document )
			.keydown( keyDown )
			.keypress( keyPressed )
	}

	function keyPressed( $event )
	{

	}

	function keyDown( $event )
	{
		var key = $event.which;
		var mode = _canvas.getMode();

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
		}

		else
		{
			// S
			if ( key === 83 || key === 115 )
			{
				modeUpdate( 'single' );
				_navigation.showInfo( 'single' );
			}

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

	_self.init = init;
	
	_self.colorUpdate = colorUpdate;
	_self.sizeUpdate = sizeUpdate;
	_self.modeUpdate = modeUpdate;
	_self.deleteSelected = deleteSelected;

	_self.getColor = function(){ return _color; };
	_self.getMode = function(){ return _mode; };
	_self.getSize = function(){ return _size; };
	_self.getBlocks = function(){ return _canvas.getBlocks(); };

	_self.historyUpdate = historyUpdate;
}

var editor = new Editor();
	editor.init();
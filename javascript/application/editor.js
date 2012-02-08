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
		'javascript/application/memory.js'
	];

	var _colors = []
	var _color;
	var _size = {};
	var _mode;
	
	var _cubes = [];

	var _navigation;
	var _canvas;

	function init()
	{
		yepnope( { load: _dependencies, complete: depencenciesLoaded } );
	}

	function depencenciesLoaded( $url, $result, $key )
	{
		_colors = getColors();

		_history = new History();
		_memory = new Memory();

		_navigation = new Navigation();
		_navigation.init( _colors );

		_canvas = new Canvas();
		_canvas.init();

		_self.getBlocks = _canvas.getBlocks;
		_self.getHistory = _history.getHistory;
		_self.exportHTML = _memory.exportHTML;
		_self.exportJSON = _memory.exportJSON;
	}

	function fileImport()
	{

	}

	function fileExport()
	{

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
	_self.fileImport = fileImport;
	_self.fileExport = fileExport;
	_self.deleteSelected = deleteSelected;

	_self.getColor = function(){ return _color; };
	_self.getMode = function(){ return _mode; };
	_self.getSize = function(){ return _size; };
	_self.getBlocks = function(){ return _canvas.getBlocks(); };

	_self.historyUpdate = historyUpdate;
}

var editor = new Editor();
	editor.init();
function Editor()
{
	var _self = this;
	var _dependencies = [
		'javascript/libraries/jquery-1.7.1.min.js',
		'javascript/libraries/jquery-ui-1.8.13.custom.min.js',
		'javascript/libraries/jquery.mousewheel.js',
		'javascript/libraries/jquery.event.drag-2.0.js',
		'javascript/application/navigation.js',
		'javascript/application/canvas.js'
	];

	var _colors = [ 'yellow', 'blue', 'pink', 'orange', 'green', 'red', 'transparent' ]
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
		_navigation = new Navigation();
		_navigation.init( _colors );

		_canvas = new Canvas();
		_canvas.init();
	}

	function fileImport()
	{

	}

	function fileExport()
	{

	}

	function colorUpdate( $new_color )
	{
		_color = $new_color;

		if ( _canvas ){ _canvas.colorUpdate( _color ); }
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

	_self.init = init;
	
	_self.colorUpdate = colorUpdate;
	_self.sizeUpdate = sizeUpdate;
	_self.modeUpdate = modeUpdate;
	_self.fileImport = fileImport;
	_self.fileExport = fileExport;

	_self.getColor = function(){ return _color; };
	_self.getMode = function(){ return _mode; };
	_self.getSize = function(){ return _size; };
}

var editor = new Editor();
	editor.init();
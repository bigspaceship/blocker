function Application()
{
	var _self = this;
	var _editor;

	function init()
	{
		_editor = new Editor();
		_editor.init();
		_editor.start();

		$( document ).keydown( keyDown );
	}

	function keyDown( $event )
	{
		var key = $event.which;

		_editor.keyDown( $event, key );
	}

	_self.init = init;
}
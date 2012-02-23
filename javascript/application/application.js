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

		warning();
	}

	function keyDown( $event )
	{
		var key = $event.which;

		_editor.keyDown( $event, key );
	}

	function warning()
	{
		if ( Modernizr.touch )
		{
			var warning_html = '';
				warning_html += '<article class="browser-warning">';
				warning_html += 	'<strong>Not Optimized for Touch Input</strong>';
				warning_html += 	' You are using a touch enabled device. Please be aware that this application is not yet optimized for touch input';
				warning_html += '</div>';

			$( 'body' ).prepend( warning_html );
		}
	}

	_self.init = init;
}
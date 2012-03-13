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

		window.addEventListener( 'online', connected );
		window.addEventListener( 'offline', disconnected );

		if ( ! navigator.onLine )
		{
			$( '.toggle-button' ).hide();
		}
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

	function disconnected( $event )
	{
		$( '.toggle-button' ).fadeOut();
		$( '#file-upload').removeClass( 'active' );
		$( '.upload-info.info-container-active' ).removeClass( '.info-container-active' );
	}

	function connected( $event )
	{
		$( '.toggle-button' ).fadeIn();

		if ( $( '.block' ).not( '.preview' ).length )
		{
			$( '#file-upload').addClass( 'active' );
		}
	}

	_self.init = init;
}
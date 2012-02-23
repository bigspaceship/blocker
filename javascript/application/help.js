function Help()
{
	var _self = this;

	var _help;
	var _button;

	function init( _modules )
	{
		_help = $( '.help' );
		//_help.addClass( 'active' );

		_button = $( '.help-toggle' );
		_button.click( buttonClicked );

		$( 'div > h1', _help ).click( headlineClicked );
		$( window ).resize( resized );

		resized();
	}

	function start()
	{
		_help.addClass( 'active' );
	}

	function stop()
	{
		_help.removeClass( 'active' );
	}

	function toggle()
	{
		if ( _help.hasClass( 'active' ) )
		{
			stop();
		}

		else
		{
			start();
		}
	}

	function buttonClicked( $event )
	{
		$event.preventDefault();

		_help.toggleClass( 'active' );
	}

	function headlineClicked( $event )
	{
		var headline = $( $event.target );

		headline.closest( 'div' ).toggleClass( 'help-item-active' );
	}

	function resized( $event )
	{
		var new_height = $( window ).height() - $( 'nav' ).height() - 225;

		_help
			.find( '.help-text' )
			.css( { 'max-height': new_height } );
	}

	_self.init = init;
	_self.start = start;
	_self.stop = stop;
	_self.toggle = toggle;
}
function Help()
{
	var _self = this;

	var _help;
	var _button;

	function init()
	{
		_help = $( '.help' );
		_help.addClass( 'active' );

		_button = $( '.help-toggle' );
		_button.click( buttonClicked );

		$( window ).resize( resized );
		resized();
	}

	function buttonClicked( $event )
	{
		$event.preventDefault();

		_help.toggleClass( 'active' );
	}

	function resized( $event )
	{
		var new_height = $( window ).height() - $( 'nav' ).height() - 225;

		_help
			.find( '.help-text' )
			.css( { 'max-height': new_height } );
	}

	_self.init = init;
}
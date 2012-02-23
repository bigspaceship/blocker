function Application()
{
	var _self = this;
	var _gallery;

	function init()
	{
		var address = $.address.pathNames();

		_gallery = new Gallery();
		_gallery.init();

		$( document ).keydown( keyDown );
		$.address.change( addressChanged );

		_gallery.start();
	}


	function addressChanged()
	{
		var address = $.address.pathNames();

		_gallery.addressChanged( address );
	}

	function keyDown( $event )
	{
		var key = $event.which;

		_gallery.keyDown( $event, key );
	}

	_self.init = init;
}
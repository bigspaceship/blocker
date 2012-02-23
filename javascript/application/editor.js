function Editor()
{
	var _self = this;

	var _modules = {};
		_modules.history = new History();
		_modules.memory = new Memory();
		_modules.navigation = new Navigation();
		_modules.canvas = new Canvas();
		_modules.help = new Help();

	var _active = false;

	function init()
	{
		window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder
		window.URL = window.webkitURL || window.URL;
		
		modulesCall( 'init', _modules );
	}

	function start()
	{
		if ( ! _active )
		{
			_active = true;
		
			modulesCall( 'start' );

			$( '.show-gallery' ).addClass( 'active' );

			$( '.help-button' ).addClass( 'help-button-active' );
		}
	}

	function stop()
	{
		if ( _active )
		{
			_active = false;
			
			modulesCall( 'stop' );

			$( '.help-button' ).removeClass( 'help-button-active' );
		}
	}

	function modulesCall( $function, $arguments )
	{
		for ( name in _modules )
		{
			if ( _modules[name][$function] )
			{
				_modules[name][$function]( $arguments );
			}
		}
	}

	_self.init = init;
	_self.start = start;
	_self.stop = stop;
	_self.keyDown = keyDown;
	_self.getBlockSize = _modules.canvas.getBlockSize;

	function keyDown( $event, $key )
	{
		if ( getNumberKey( $key ) !== -1 )
		{
			numberPressed( $event, $key );
		}

		else
		{
			if ( ! $( 'input:focus').length )
			{
				// backspace		
				if ( $key === 8 )
				{
					if ( _modules.canvas.getMode() === 'delete' )
					{
						$event.preventDefault();

						_modules.canvas.deleteSelected();
						_modules.navigation.showInfo( _modules.canvas.getMode() );
					}
				}

				if ( $event.metaKey || $event.ctrlKey )
				{			
					// Z
					if ( $key === 90 || $key === 122 )
					{
						if ( $event.shiftKey )
						{
							$event.preventDefault();
							historyUpdate( 'redo' );
						}

						else
						{
							$event.preventDefault();
							historyUpdate( 'undo' );
						}

						_modules.navigation.showInfo( _modules.canvas.getMode() );
					}

					//O
					if ( $key === 111 || $key === 79 )
					{
						$event.preventDefault();

						_modules.navigation.showInfo( 'import' );
					}

					//E
					if ( $key === 69 || $key === 101 ) 
					{
						$event.preventDefault();

						_modules.navigation.showInfo( 'export' );
					}

					//S
					if ( $key === 83 || $key === 115 )
					{
						$event.preventDefault();

						_modules.navigation.showInfo( 'save' );
					}

					// A
					if ( $key === 65 )
					{
						$event.preventDefault();
						_modules.canvas.setMode( 'single' );
						_modules.navigation.showInfo( 'single' );
					}

					//M
					if ( $key === 77 || $key === 109 )
					{
						$event.preventDefault();
						_modules.canvas.setMode( 'multiple' );
						_modules.navigation.showInfo( 'multiple' );
					}

					//D
					if ( $key === 68 || $key === 100 )
					{
						$event.preventDefault();
						_modules.canvas.setMode( 'delete' );
						_modules.navigation.showInfo( 'delete' );
					}

					//H
					if ( $key === 72 )
					{
						if( $( '#blocks' ).hasClass( 'blocks-active' ) )
						{
							$event.preventDefault();
							_modules.help.toggle();
						}
					}
				}
			}

			if ( $key === 13 )
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

	function numberPressed( $event, $key )
	{
		if ( _active )
		{
			$event.preventDefault();

			var index = getNumberKey( $key );
			var target = $( '.color-buttons a' ).eq( index );
			var new_color = target.attr( 'id' ).replace( 'color-button-', '' );

			$( '.color-buttons .active' ).removeClass( 'active' );

			target
				.closest( 'li' )
				.addClass( 'active' );

			if ( _modules.canvas.getMode() === 'delete' )
			{
				_modules.canvas.setMode( 'single' );
				_modules.navigation.showInfo( 'single' );
			}

			else
			{
				_modules.navigation.showInfo( _modules.canvas.getMode() );
			}
			
			_modules.canvas.colorUpdate( new_color );
		}
	}
}
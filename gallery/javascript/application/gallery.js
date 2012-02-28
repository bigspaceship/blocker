function Gallery()
{
	var _self = this;

	var _sketches = [];
	var _sketch_ids = [];

	var _sketch_active_id = undefined;
	var _sketch_load_id = undefined;

	var _active = false;
	var _play = true;
	var _animating = false;

	var _just_opened = false;
	var _playing_tmp = false;

	function init()
	{
		window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder
		window.URL = window.webkitURL || window.URL;

		if ( ! $( '#gallery' ).length )
		{
			var gallery_html = '<div id="gallery"></div>';

			$( 'body' ).append( gallery_html );
			$( '#gallery-playpause' ).click( playPause );

			if ( ! window.BlobBuilder )
			{
				$( '.sketch-download' ).remove();
			}

			else
			{
				$( '.sketch-download a' ).click( sketchGenerateDownload );
			}
		}
	}

	function start()
	{
		if ( ! _active )
		{
			_active = true;
			_just_opened = true;

			$( '#gallery, .gallery-info' ).addClass( 'gallery-active' );
			
			$( '.show-editor' ).addClass( 'active' );
		}
	}

	function stop()
	{
		if ( _active )
		{
			_active = false;
			_just_opened = false;

			$( '#gallery' )
				.removeClass( 'gallery-active' )
				.find( '.gallery-sketch' )
				.remove();

			$( '.gallery-info' ).removeClass( 'gallery-active' );
			$( '.gallery-toggle' ).text( 'Show Gallery' );
		}
	}

	function playPause( $event )
	{
		if ( $event.preventDefault )
		{
			$event.preventDefault();
		}

		if ( $event !== undefined )
		{
			if ( ! $event )
			{
				_play = false;
			}

			else
			{
				if ( $event === true )
				{
					_play = true;
				}
				
				else
				{
					if ( $event.target && ! _animating )
					{
						var target = $( $event.target );
						
						if ( ! target.is( 'a' ) )
						{
							target = target.closest( 'a' );

							target
								.find( '.active' )
								.removeClass( 'active' )

							_play = ! _play;

							if ( _play )
							{
								target
									.find( '.gallery-play' )
									.addClass( 'active' )

								play();
							}

							else
							{
								target
									.find( '.gallery-pause' )
									.addClass( 'active' )
							}
						}
					}
				}
			}
		}

		else
		{
			_play = ! _play;
		}
	}

	function play()
	{
		if ( _play ) { sketchLoadNext(); };
	}

	function addressChanged( $address )
	{
		if ( $address.length )
		{
			sketchShowByAddress( $address )
		}

		else
		{
			play();
		}
	}

	function sketchIDsLoad()
	{		
		var json_url = 'api/public-api.php?action=get-sketch-ids';
			
		$.ajax(
			{
				url: json_url,
				dataType: 'json',
				success: sketchIDsLoaded
			}
		);
	}

	function sketchIDsLoaded( $ids )
	{
		_sketch_ids = $ids;

		if ( _active )
		{
			if ( _sketch_load_id !== undefined )
			{
				sketchLoad( _sketch_load_id );

				_sketch_load_id = undefined;
			}

			else
			{
				play();
			}
		}
	}

	function sketchLoad( $id )
	{		
		if (
			_sketch_ids.indexOf( $id ) !== -1 &&
			getSketchIndex( $id ) !== -1
		)
		{
			sketchLoaded( _sketches[_sketch_ids.indexOf( $id )] );
		}

		else
		{
			if (
				_sketch_ids.indexOf( $id ) !== -1 &&
				getSketchIndex( $id ) === -1
			)
			{
				var json_url = 'api/public-api.php?action=get-sketch&value=' + $id;
		
				$.ajax(
					{
						url: json_url,
						dataType: 'json',
						success: sketchLoaded
					}
				);
			}
		}
	}

	function sketchLoaded( $sketch )
	{
		if ( getSketchIndex( $sketch.id ) === -1 )
		{
			_sketches.push( $sketch );
		}

		if ( ! $( '.sketch-' + $sketch.id ).length )
		{
			sketchToDom( $sketch.id );
		}

		if ( _sketch_active_id !== undefined )
		{
			var callback = function(){ sketchShow( $sketch.id ); };

			sketchAnimate( _sketch_active_id, true, callback );
		}

		else
		{
			sketchShow( $sketch.id );
		}
	}

	function sketchShow( $id )
	{
		_sketch_active_id = $id;

		var callback = function(){ setTimeout( play, 3000 ) };
		
		sketchAnimate( _sketch_active_id, false, callback );
	}

	function sketchShowByAddress( $address )
	{
		var sketch_id = $address[$address.length - 1];

		if ( sketch_id )
		{
			if ( _sketch_ids.indexOf( sketch_id ) !== -1 )
			{
				sketchLoad( sketch_id );
			}

			else
			{
				if ( ! _sketch_ids.length )
				{
					_sketch_load_id = sketch_id;

					sketchIDsLoad();
				}
			}
		}

		else
		{
			if ( ! _sketch_ids.length )
			{
				sketchIDsLoad();
			}

			else
			{
				play();
			}
		}
	}

	function sketchLoadNext()
	{
		if ( ! _sketch_ids.length )
		{
			sketchIDsLoad();
		}

		else
		{
			var sketch_next_id = _sketch_ids[0];

			if ( _sketch_active_id !== undefined )
			{
				if (
					_sketch_ids.indexOf( _sketch_active_id ) !== -1 &&
					_sketch_ids.indexOf( _sketch_active_id ) < _sketch_ids.length - 1
				)
				{
					sketch_next_id = _sketch_ids[_sketch_ids.indexOf( _sketch_active_id ) + 1];
				}
			}

			$.address.value( sketch_next_id );
		}
	}

	function sketchToDom( $id )
	{
		var block_size = getBlockSize();
		var sketch_index = getSketchIndex( $id );

		if (
			_sketches[sketch_index] &&
			_sketches[sketch_index].id &&
			_sketches[sketch_index].blocks
		)
		{
			var sketch = _sketches[sketch_index];			
			var sketch_html = '';
			var random_positions = getBlocksPosition( $id, true );

			if ( ! $( '#gallery .sketch-' + sketch.id ).length )
			{
				$( '#gallery' ).append( '<div class="gallery-sketch sketch-' + sketch.id + '"></div>' );
			}

			for ( var i = 0; i < sketch.blocks.length; i++ )
			{
				var new_block = sketch.blocks[i];

				var new_block_css = 'style="';
					new_block_css += 'left:' + random_positions[i].left + 'px; ';
					new_block_css += 'top:' + random_positions[i].top + 'px; ';
					new_block_css += '"';	
				
				var new_block_html = '<div class="block color-' + new_block.color + '" id="gallery-sketch-' + $id + '-block-' + new_block.index + '" ' + new_block_css + '></div>';
				
				sketch_html += new_block_html;				
			}

			$( '#gallery .sketch-' + sketch.id ).html( sketch_html );
		}
	}

	function sketchAnimate( $id, $direction, $callback )
	{
		//if ( _active )
		//{
			var sketch_index = getSketchIndex( $id );			
			var sketch_block_count = _sketches[sketch_index].blocks.length;

			var animation_duration = 500;
			
			var block_animation_time = animation_duration / sketch_block_count;			
			var blocks_to_animate = sketch_block_count / animation_duration;
			
			var new_positions = getBlocksPosition( $id, $direction );
			var sketch_id = _sketches[sketch_index].id;

			_animating = true;

			$( '#gallery-playpause' ).addClass( 'disabled' );
			$( '#gallery-page' ).text( 'Sketch ' + parseInt( sketch_index + 1 ) + ' of ' + _sketch_ids.length );
			
			if ( block_animation_time >= 1 )
			{
				timeout = parseInt( block_animation_time );
				blocks_to_animate = 1;
			}

			else
			{
				animation_duration = animation_duration / 5;
				block_animation_time = animation_duration / sketch_block_count;			
				blocks_to_animate = sketch_block_count / animation_duration;
				timeout = 1;
				blocks_to_animate = Math.ceil( blocks_to_animate );
			}			

			if ( ! $direction )
			{
				$( '#gallery .sketch-' + sketch_id ).addClass( 'active' );
			}

			else
			{
				$( '.gallery-info' ).removeClass( 'active' );
			}

			var animation_options = {
				blocks_to_animate: blocks_to_animate,
				timeout: timeout,
				block_index: 0,
			};

			function blockAnimate( $options )
			{
				if ( $options.blocks_to_animate > 1 )
				{
					var i = $options.blocks_to_animate; while ( i-- )
					{
						var index = $options.block_index + i;

						if ( index < _sketches[sketch_index].blocks.length )
						{
							var block_id = '#gallery-sketch-' + _sketches[sketch_index].id + '-block-' + _sketches[sketch_index].blocks[index].index;
							$( block_id  ).css( new_positions[index] );
						}
					}
				}

				else
				{
					$( '#gallery #gallery-sketch-' + _sketches[sketch_index].id + '-block-' + _sketches[sketch_index].blocks[$options.block_index].index ).css( new_positions[$options.block_index] );
				}				

				if ( _active )
				{
					if ( $options.block_index < _sketches[sketch_index].blocks.length - 1  )
					{
						$options.block_index += $options.blocks_to_animate;

						setTimeout( function(){ blockAnimate( $options ); }, $options.timeout );
					}

					else
					{
						sketchAnimated( $id, $direction, $callback );
					}
				}
			}

			blockAnimate( animation_options );
		//}
	}

	function sketchAnimated( $id, $direction, $callback )
	{
		//if ( _active )
		//{
			_animating = false;

			$( '#gallery-playpause' ).removeClass( 'disabled' );

			if ( $direction )
			{
				$( '.sketch-' + $id ).removeClass( 'active' );
			}

			else
			{
				_sketch_active_id = $id;

				sketchInfoUpdate( _sketches[getSketchIndex( $id )] );
			}

			if ( $callback )
			{
				setTimeout( $callback, 2000 );
			}
		//}
	}

	function sketchInfoUpdate( $sketch )
	{
		var sketch_block_count = $sketch.blocks.length;

		$( '.gallery-info .sketch-blocks' )
			.text( sketch_block_count + ' blocks' )
			.addClass( 'active' );

		if ( $sketch.author )
		{
			var author_html = 'by ';

			if ( $sketch.author )
			{
				if ( $sketch.website )
				{
					author_html += '<a href="' + $sketch.website + '">' + $sketch.author + '</a>';
				}

				else
				{
					author_html += $sketch.author;
				}

				$( '.gallery-info .sketch-author' )
					.html( author_html )
					.addClass( 'active' );
			}			
		}

		else
		{
			$( '.gallery-info .sketch-author' )
				.text( '' )
				.removeClass( 'active' );
		}

		if ( $sketch.name )
		{
			$( '.gallery-info .sketch-name' )
				.text( $sketch.name )
				.addClass( 'active' );
		}

		else
		{
			$( '.gallery-info .sketch-name' )
				.text( '' )
				.removeClass( 'active' );
		}

		if ( $sketch.twitter )
		{
			$( '.gallery-info .sketch-twitter' )
				.html( '<a href="http://www.twitter.com/' + $sketch.twitter + '">@' + $sketch.twitter + '</a>' )
				.addClass( 'active' );
		}

		else
		{
			$( '.gallery-info .sketch-twitter' )
				.text( '' )
				.removeClass( 'active' );
		}

		if ( $sketch.date )
		{
			var date = 'on ' + $sketch.date.split( ' ' )[0];
			$( '.gallery-info .sketch-date' )
				.text( date )
				.addClass( 'active' );
		}

		else
		{
			$( '.gallery-info .sketch-date' )
				.text( '' )
				.removeClass( 'active' );
		}

		$( '.gallery-info ').addClass( 'active' );
	}

	function sketchGenerateDownload( $event )
	{
		$event.preventDefault();

		var sketch_index = getSketchIndex( _sketch_active_id );
		var sketch = _sketches[sketch_index];

		var json_url = 'api/public-api?action=download-sketch&value=' + _sketch_active_id;
			
		$.ajax(
			{
				url: json_url,
				dataType: 'json',
				success: function( $data )
				{
					var dialog_html = '';
						dialog_html += '<div class="dialog dialog-download">';
						dialog_html += 		'<p>Download Sketch "' + sketch.name + '"</p>';
						dialog_html += 		'<a href="#" id="dialog-confirm" class="info-button">download</p>';
						dialog_html += '</div>';

					$( 'body' ).append( dialog_html );

					textToDownload( JSON.stringify( $data ), $data, 'application/json', '.json', $( '#dialog-confirm' ) );
				}
			}
		);
	}

	function sketchDownloaded( $event )
	{
		//$event.preventDefault();

		var target = $( $event.target );
		var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

		// gf: chrome is the only browser that supports the a[download] attribute. :-/
		if ( ! is_chrome )
		{
			window.open( target.attr( 'href' ) );
		}

		$( '.dialog-download' ).remove();
	}

	function textToDownload( $text, $data, $mime_type, $file_extension, $link )
	{
		if ( window.BlobBuilder )
		{
			var blob_builder = new BlobBuilder();
				blob_builder.append( $text );

			var filename = $data.slug || 'myBlocks';
				filename += $file_extension;

			var filepath = window.URL.createObjectURL( blob_builder.getBlob( $mime_type ) );

			var download_link_attributes = {
				download: filename,
				href: filepath,
				'data-downloadurl': [ $mime_type, filename, filepath ].join( ':' )
			}

			$link
				.attr( download_link_attributes )
				.click( sketchDownloaded );
		}
	}

	function getBlocksPosition( $id, $direction )
	{
		var return_value = [];
		var window_width = $( window ).width();
		var window_height = $( window ).height();
		var block_size = getBlockSize();
		var sketch_index = getSketchIndex( $id ) !== -1 ? getSketchIndex( $id ) : 0;

		for ( var i = 0; i < _sketches[sketch_index].blocks.length; i++ )
		{
			var position = {};

			if ( $direction )
			{
				var side = {
					x: parseInt( getRandomNumber( -1, 1, true ) ),
					y: parseInt( getRandomNumber( -1, 1, true ) )
				};

				position.left = - block_size.width;
				position.top = - block_size.width;

				if ( side.x > 0 )
				{
					position.left = ( Math.random() * window_width );

					if ( side.y > 0 )
					{
						position.left += window_width + block_size.width * 2;
					}
				}

				else
				{
					position.top = ( Math.random() * window_height );

					if ( side.y < 0 )
					{
						position.top += window_height + block_size.width * 2;
					}
				}
			}

			else
			{
				var original_position = _sketches[sketch_index].blocks[i].position;

				position.left = original_position.x;
				position.top = parseInt( original_position.y + ( - block_size.height * original_position.z ) );
			}

			return_value.push( position );
		}

		return return_value;
	}

	function getSketchIndex( $id )
	{
		var return_value = -1;

		for ( var i = 0; i < _sketches.length; i++ )
		{
			if ( _sketches[i].id === $id )
			{
				return_value = i;
				break;
			}
		}

		return return_value;
	}

	function keyDown( $event, $key )
	{

	} 

	_self.init = init;
	_self.start = start;
	_self.stop = stop;
	_self.addressChanged = addressChanged;
	_self.keyDown = keyDown;
}
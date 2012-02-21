function Gallery()
{
	var _self = this;

	var _sketches = [];
	var _sketch_ids = [];

	var _sketch_active_id = undefined;
	var _sketch_next_id = undefined;

	var _active = false;
	var _play = true;

	function init()
	{
		if ( ! $( '#gallery' ).length )
		{
			var gallery_html = '<div id="gallery"></div>';

			$( 'body' ).append( gallery_html );
		}

		$( '.gallery-toggle' ).click( galleryClicked );
	}

	function start()
	{
		_active = true;
		
		$( '#gallery, .gallery-info' ).addClass( 'gallery-active' );
		$( '.gallery-toggle' ).text( 'Show Editor' );

		editor.stop();
		sketchIDsLoad();
	}

	function stop()
	{
		_active = false;

		$( '#gallery' )
			.html( '' )
			.removeClass( 'gallery-active' );

		$( '.gallery-info' ).removeClass( 'gallery-active' );
		$( '.gallery-toggle' ).text( 'Show Gallery' );

		editor.start();
	}

	function toggle()
	{
		if ( $( '#gallery' ).hasClass( 'gallery-active' ) )
		{
			stop();
		}

		else
		{
			start();
		}
	}

	function sketchIDsLoad()
	{		
		if ( _active )
		{
			
			var json_url = 'sketches/public-api?action=get-sketch-ids';
			
			$.ajax(
				{
					url: json_url,
					dataType: 'json',
					success: sketchIDsLoaded
				}
			);
		}
	}

	function sketchIDsLoaded( $ids )
	{
		_sketch_ids = $ids;

		if ( _sketch_next_id === undefined )
		{
			_sketch_next_id = _sketch_ids[0];
		}

		sketchLoad( _sketch_next_id );	
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
				var json_url = 'sketches/public-api?action=get-sketch&value=' + $id;
		
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

		var callback = _play ? function(){ setTimeout( sketchLoadNext, 2000 ) } : undefined;
		
		sketchAnimate( _sketch_active_id, false, callback );
	}


	function sketchLoadNext()
	{
		if ( _play )
		{
			if ( _sketch_ids.indexOf( _sketch_active_id ) < _sketch_ids.length - 1 )
			{
				var next_index = _sketch_ids.indexOf( _sketch_active_id ) + 1;
				
				_sketch_next_id = _sketch_ids[next_index];
			}

			else
			{
				_sketch_next_id = _sketch_ids[0];
			}

			sketchLoad( _sketch_next_id );
		}
	}

	function sketchToDom( $id )
	{
		var block_size = editor.getBlockSize();
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
		if ( _active )
		{
			var sketch_index = getSketchIndex( $id );
			
			var block_count = _sketches[sketch_index].blocks.length;
			var animation_duration = 500;
			
			var block_animation_time = animation_duration / block_count;			
			var blocks_to_animate = block_count / animation_duration;
			
			var new_positions = getBlocksPosition( $id, $direction );
			var sketch_id = _sketches[sketch_index].id;
			
			if ( block_animation_time >= 1 )
			{
				timeout = parseInt( block_animation_time );
				blocks_to_animate = 1;
			}

			else
			{
				animation_duration = animation_duration / 10;
				block_animation_time = animation_duration / block_count;			
				blocks_to_animate = block_count / animation_duration;
				timeout = 1;
				blocks_to_animate = Math.ceil( blocks_to_animate ) * 2;
			}			

			if ( ! $direction )
			{
				$( '#gallery .sketch-' + sketch_id ).addClass( 'active' );
			}

			$( '.gallery-info .sketch-name' ).text( _sketches[sketch_index].name );
			$( '.gallery-info .sketch-blocks' ).text( _sketches[sketch_index].blocks.length + ' blocks' );
			
			if ( _sketches[sketch_index].author )
			{
				$( '.gallery-info .sketch-author' )
					.text( 'by ' + _sketches[sketch_index].author )
					.show();
			}

			else
			{
				$( '.gallery-info .sketch-author' ).hide();
			}

			if ( _sketches[sketch_index].date )
			{
				$( '.gallery-info .sketch-date' )
					.text( _sketches[sketch_index].date )
					.show();
			}

			else
			{
				$( '.gallery-info .sketch-date' ).hide();
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
					for ( var i = 0; i < $options.blocks_to_animate; i++ )
					{
						var index = $options.block_index + i;

						if ( index < _sketches[sketch_index].blocks.length )
						{
							$( '#gallery #gallery-sketch-' + _sketches[sketch_index].id + '-block-' + _sketches[sketch_index].blocks[index].index ).css( new_positions[index] );
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
						$options.block_index++;

						setTimeout( function(){ blockAnimate( $options ); }, $options.timeout );
					}

					else
					{
						sketchAnimated( $id, $direction, $callback );
					}
				}
			}

			blockAnimate( animation_options );
		}
	}

	function sketchAnimated( $id, $direction, $callback )
	{
		if ( _active )
		{	
			if ( $direction )
			{
				$( '.sketch-' + $id ).removeClass( 'active' );
			}

			if ( $callback )
			{
				$callback();
			}
		}
	}

	function getBlocksPosition( $id, $direction )
	{
		var return_value = [];
		var window_width = $( window ).width();
		var window_height = $( window ).height();
		var block_size = editor.getBlockSize();
		var sketch_index = getSketchIndex( $id ) !== -1 ? getSketchIndex( $id ) : 0;

		for ( var i = 0; i < _sketches[sketch_index].blocks.length; i++ )
		{
			var position = {};

			if ( $direction )
			{
				var side = {
					x: parseInt( editor.getRandomNumber( -1, 1, true ) ),
					y: parseInt( editor.getRandomNumber( -1, 1, true ) )
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

	function galleryClicked( $event )
	{
		$event.preventDefault();

		if ( _active )
		{
			_active = false;

			$( $event.target ).text( 'Show Gallery' );
			stop();
		}

		else
		{
			$( $event.target  ).text( 'Show Editor' );
			
			_active = true;
			start();
		}
	}

	function showSketchByAddress( $address )
	{
		if ( $address.indexOf( 'gallery' ) !== -1 )
		{
			var sketch_id = $address[$address.indexOf( 'gallery' ) + 1];
			
			sketchShow( sketch_id );
		}
	}

	_self.init = init;
	_self.toggle = toggle;
	_self.sketchAnimate = sketchAnimate;
	_self.getActive = function(){ return _active };
	_self.start = start;
	_self.stop = stop;
	_self.showSketchByAddress = showSketchByAddress;
}
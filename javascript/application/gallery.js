function Gallery()
{
	var _self = this;
	var _sketches = [];
	var _sketch_index = 0;
	var _active = false;

	var _sketch_memory = [];

	function init()
	{
		if ( ! $( '#gallery' ).length )
		{
			var gallery_html = '<div id="gallery"></div>';

			$( 'body' ).append( gallery_html );

			if ( ! _active )
			{
				$( '#gallery' ).hide();
			}
		}

		$( '.gallery-toggle' ).click( galleryClicked );
	}

	function start()
	{
		_active = true;
		
		$( '#gallery' ).show();

		editor.stop();
		sketchesLoad();
	}

	function stop()
	{
		_active = false;

		$( '#gallery' )
			.html( '' )
			.hide();

		editor.start();
	}

	function sketchesLoad()
	{
		if ( ! _sketches.length )
		{
			var sketches = [];
			var json_url = 'sketches/index.php';

			$.ajax(
				{
	  				url: json_url,
	  				dataType: 'json',
	  				success: getSketchesFromJSON,
					error: getSketchesFromLocal
				}
			);		

			function getSketchesFromJSON( $json )
			{
				if (
					$json &&
					$json.sketches &&
					$json.sketches.length
				)
				{
					_sketches = $json.sketches;
					gotSketches();
				}

				else
				{
					getSketchesFromLocal();
				}
			}

			function getSketchesFromLocal()
			{
				_sketches = editor.load() || [];
				gotSketches();
			}
		}

		else
		{
			gotSketches();
		}

		function gotSketches()
		{
			for ( var i = 0; i < _sketches.length; i++ )
			{
				sketchToDom( i );
			}

			sketchAnimate( 0, false );
		}
	}

	function sketchToDom( $sketch_index )
	{
		var block_size = editor.getBlockSize();

		if (
			_sketches[$sketch_index] &&
			_sketches[$sketch_index].id &&
			_sketches[$sketch_index].blocks
		)
		{
			var sketch = _sketches[$sketch_index];			
			var sketch_html = '';
			var random_positions = getBlocksPosition( $sketch_index, true );

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
				
				var new_block_html = '<div class="block color-' + new_block.color + '" id="gallery-block-' + new_block.index + '" ' + new_block_css + '></div>';
				
				sketch_html += new_block_html;				
			}

			$( '#gallery .sketch-' + sketch.id ).html( sketch_html );
		}
	}

	function sketchAnimate( $sketch_index, $direction )
	{
		if ( _active )
		{
			if (
				$sketch_index === undefined ||
				! _sketches[$sketch_index]
			)
			{
				$sketch_index = 0;
			}

			var block_count = _sketches[$sketch_index].blocks.length;
			var animation_duration = 500;
			var block_animation_time = animation_duration / block_count;			
			var blocks_to_animate = block_count / animation_duration;

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

			var new_positions = getBlocksPosition( $sketch_index, $direction );
			var sketch_id = _sketches[$sketch_index].id;

			$( '#gallery .sketch-' + sketch_id ).addClass( 'active' );
			$( '.gallery-info .sketch-name' ).text( _sketches[$sketch_index].name );
			$( '.gallery-info .sketch-blocks' ).text( _sketches[$sketch_index].blocks.length + ' blocks' );
			
			if ( _sketches[$sketch_index].author )
			{
				$( '.gallery-info .sketch-author' )
					.text( 'by ' + _sketches[$sketch_index].author )
					.show();
			}

			else
			{
				$( '.gallery-info .sketch-author' ).hide();
			}

			if ( _sketches[$sketch_index].date )
			{
				$( '.gallery-info .sketch-date' )
					.text( _sketches[$sketch_index].date )
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

			blockAnimate( animation_options );

			function blockAnimate( $options )
			{
				if ( $options.blocks_to_animate > 1 )
				{
					for ( var i = 0; i < $options.blocks_to_animate; i++ )
					{
						var index = $options.block_index + i;

						if ( index < _sketches[$sketch_index].blocks.length )
						{
							$( '#gallery #gallery-block-' + _sketches[$sketch_index].blocks[index].index ).css( new_positions[index] );
						}
					}
				}

				else
				{
					$( '#gallery #gallery-block-' + _sketches[$sketch_index].blocks[$options.block_index].index ).css( new_positions[$options.block_index] );
				}				

				if ( _active )
				{
					if ( $options.block_index < _sketches[$sketch_index].blocks.length - 1  )
					{
						$options.block_index++;

						setTimeout( function(){ blockAnimate( $options ); }, $options.timeout );
					}

					else
					{
						sketchAnimated( $sketch_index, $direction );
					}
				}
			}
		}
	}

	function sketchAnimated( $sketch_index, $direction )
	{
		if ( _active )
		{
			setTimeout( function()
			{
				if ( $direction )
				{
					var next = parseInt( $sketch_index + 1 );

					if ( ! _sketches[$sketch_index] )
					{
						
						next = 0;
					}
					
					setTimeout( function()
					{ 
						if ( next !== $sketch_index )
						{
							$( '#gallery .sketch-' + _sketches[$sketch_index].id ).removeClass( 'active' );
						}

						sketchAnimate( next, false );

					}, 500 );
				}

				else
				{
					setTimeout( function(){ sketchAnimate( $sketch_index, true ); }, 500 );
				}

			}, 500 );
		}
	}

	function getBlocksPosition( $sketch_index, $direction )
	{
		var return_value = [];
		var window_width = $( window ).width();
		var window_height = $( window ).height();
		var block_size = editor.getBlockSize();

		for ( var i = 0; i < _sketches[$sketch_index].blocks.length; i++ )
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
				var original_position = _sketches[$sketch_index].blocks[i].position;

				position.left = original_position.x;
				position.top = parseInt( original_position.y + ( - block_size.height * original_position.z ) );
			}

			return_value.push( position );
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
			$( '.gallery-info' ).hide();
			stop();
		}

		else
		{
			$( $event.target  ).text( 'Create a New Sketch' );
			$( '.gallery-info' ).show();
			
			_active = true;
			start();
		}
	}

	_self.init = init;
	_self.sketchAnimate = sketchAnimate;
	_self.getActive = function(){ return _active };
	_self.start = start;
	_self.stop = stop;
}
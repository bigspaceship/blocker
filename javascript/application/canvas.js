function Canvas()
{
	var _self = this;

	var _block_size = { width: 28, height: 14 };
	var _blocks = [];
	var _cursor = { x: 0, y: 0, target: { x: 0, y: 0 } };
	var _mode;
	var _color;
	var _size;

	function init()
	{
		$( 'body' )
			.click( clicked )
			.mousemove( mouseMoved )
			.append('<div id="cursor"></div>')
			.append('<div id="blocks"></div>');
	}

	function clicked( $event )
	{
		if (
			! $( $event.target ).is( 'nav' ) &&
			! $( $event.target ).closest( 'nav' ).length
		)
		{
			if ( _mode )
			{
				previewToBlock();
			}		
		}
	}


	function mouseMoved( $event )
	{
		if ( $event.pageY > $( 'nav' ).height() )
		{
			_cursor.target.x = getGridPosition( $event.pageX, $event.pageY ).x;
			_cursor.target.y = getGridPosition( $event.pageX, $event.pageY ).y;
		}

		cursorUpdate();
		previewUpdate();
	}

	function cursorUpdate()
	{
		if (
			_cursor.x != _cursor.target.x ||
			_cursor.y != _cursor.target.y
		)
		{
			_cursor.x += parseInt( _cursor.target.x - _cursor.x );
			_cursor.y += parseInt( _cursor.target.y - _cursor.y );
		}

		var cursor_position = {
			 top:	_cursor.y + ( _block_size.height / 2 ),
			 left:	_cursor.x - ( _block_size.height / 2 )
		};

		$( '#cursor' ).css( cursor_position );
	}

	function blocksUpdateZ( $blocks )
	{
		function sortZ( $a, $b )
		{
			var item_1 = ( $a.position.x + ( $a.position.y * _blocks.length ) + ( $a.position.z * _blocks.length * _blocks.length ) );
			var item_2 = ( $b.position.x + ( $b.position.y * _blocks.length ) + ( $b.position.z * _blocks.length * _blocks.length ) );
			
			var result = item_1 - item_2;

			if ( result === 0 )
			{
				result = $a.position.y - $b.position.y;
			}

			if ( result === 0 )
			{
				result = $a.position.x - $b.position.x;
			}

			return result;
		}

		var blocks = $blocks || _blocks;
			blocks.sort( sortZ );
			
		for ( var i = 0; i < blocks.length; i++ )
		{
			var block = blocks[i];
				block.z_index = i + block.position.z;
			
			$( '#block-' + block.index ).css( { zIndex: i } );
		}
	}

	function blockAdd( $type )
	{
		var type = $type || 'solid';

		var new_block = {
			index: _blocks.length,
			color: editor.getColor(),
			position: { x: _cursor.x, y: _cursor.y, z: getGridZ( _cursor.x, _cursor.y ) },
			type: $type	
		}

		var new_block_html = '<div class="block color-' + new_block.color + '" id="block-' + new_block.index + '"></div>';
		
		var new_block_css = {
			top: new_block.position.y + ( - _block_size.height * new_block.position.z ),
			left: new_block.position.x
		};

		_blocks.push( new_block );

		$( '#blocks' ).append( new_block_html );
		$( '#block-' + new_block.index ).css( new_block_css );

		if ( $type === 'preview' )
		{
			$( '#block-' + new_block.index ).addClass( 'preview' );
		}

		blocksUpdateZ();
		cursorUpdate();
		previewUpdate();
		
		//	var color = color_active;
		//	var position = {x: selector.x, y: selector.y, z: gridZ(selector.x, selector.y)};
		//	var cube = {id: index, color: color, position: position, type: $type};
		//	
		//	if($position !== undefined)
		//	{
		//		position = $position;
		//		cube = {id: index, color: color, position: position, type: $type};
		//	}
		//	
		//	cubes[cubes.length] = cube;
		//	
		//	$('#cubes').append('<div class="cube" id="cube-' + index + '"></div>');
		//	$('#cube-' + index).addClass('color-' + color);
		//	$('#cube-' + index).css({top: position.y + (-cube_size.height * position.z), left: position.x});
		//	
		//	if($type == 'preview')
		//	{
		//		$('#cube-' + index).addClass('cube-preview');
		//		$('#cube-' + index).css({opacity: 0.5});
		//	}
		//	
		//	else
		//	{
		//		if($undo !== 'undo')
		//		{
		//			actionAdd(cube, 'add');
		//		}
		//	}
		//				
		//	cube_index++;
		//	
		//	if(mode === 'single-block')
		//	{
		//		cubePreview();
		//	}
		//	
		//	update();
	}

	function blockRemove( $options )
	{
		if ( $options )
		{
			if ( $options.index )
			{
				for ( var i = 0; i < _blocks.length; i++ )
				{
					if ( _blocks[i].index === $options.index )
					{
						_blocks.splice( i, 1 );
						
						$( '#block-' + _blocks[i].index ).remove();

						break;
					}
				}
			}

			if ( $options.blocks )
			{
				$( $options.blocks ).each(
					function()
					{
						var block_index = parseInt( $( this ).attr( 'id' ).replace( 'block-', '' ) );

						for ( var i = 0; i < _blocks.length; i++ )
						{
							if ( _blocks[i].index == block_index )
							{
								$( '#block-' + block_index ).remove();

								_blocks.splice( i, 1 );

								break;
							}
						}
					}
				);
			}
		}
	}

	function previewUpdate()
	{
		if ( ! _mode ) { _mode = editor.getMode(); }
		if ( ! _size ) { _size = editor.getSize(); }

		blocksUpdateZ();

		if ( _mode === 'single' )
		{
			previewSingleBlock();
		}

		if ( _mode === 'multiple' )
		{
			previewMultipleBlocks();
		}
	}

	function previewSingleBlock()
	{
		var preview_position = { x: _cursor.x, y: _cursor.y, z: getGridZ( _cursor.x, _cursor.y ) };

		var preview_css = {
			top: preview_position.y + ( - _block_size.height * preview_position.z ),
			left: preview_position.x
		};

		$( '.block.preview' ).css( preview_css );
	}

	function previewMultipleBlocks()
	{
		$( '.block.preview' ).each(
			function( $index, $item )
			{
				var preview_offset = {
					x: $index % _size.depth,
					y: Math.floor( $index / _size.depth )
				};

				var preview_position = { 
					x: _cursor.x,
					y: _cursor.y,
					z: getGridZ( _cursor.x, _cursor.y )
				};

				if ( preview_offset.x > 0 )
				{
					preview_position.x += _block_size.height * preview_offset.x
					preview_position.y += _block_size.height * preview_offset.x / 2;
				}

				if ( preview_offset.y > 0 )
				{
					preview_position.x += _block_size.height * preview_offset.y
					preview_position.y -= _block_size.height * preview_offset.y / 2;
				}

				var preview_css = {
					top: preview_position.y + ( - _block_size.height * preview_position.z ),
					left: preview_position.x
				};

				$( $item ).css( preview_css );
			}
		);
	}

	function previewUpdateBlocks()
	{
		if ( _mode === 'single' )
		{
			if ( $( '.block.preview' ).length > 1 )
			{
				blockRemove( { blocks: $( '.block.preview' ).not( ':first' ) } );
			}

			if ( ! $( '.block.preview' ).length )
			{
				blockAdd( 'preview' );
			}
		}

		if ( _mode === 'multiple' )
		{
			if ( $( '.block.preview' ).length < _size.width * _size.depth )
			{
				var blocks_to_add =  _size.width * _size.depth - $( '.block.preview' ).length;
				
				for ( var i = 0; i < blocks_to_add; i++ )
				{
					blockAdd( 'preview' );
				}
			}

			if ( $( '.block.preview' ).length > ( _size.width * _size.depth ) )
			{
				var blocks_to_remove_index = ( $( '.block.preview' ).length - ( _size.width * _size.depth ) ) - 1;

				blockRemove( { blocks: $( '.block.preview:gt(' + blocks_to_remove_index + ')' ) } );
			}
		}
	}

	function previewToBlock()
	{
		$( '.block.preview' ).each(
			function()
			{
				var block_index = parseInt( $( this ).attr( 'id' ).replace( 'block-', '' ) );

				$( this ).removeClass( 'preview' );

				for ( var i = 0; i < _blocks.length; i++ )
				{
					if ( _blocks[i].index == block_index )
					{
						_blocks[i].type = 'solid';
						break;
					}
				}
			}
		);
	}

	function previewUpdateColor()
	{
		if (
			_color &&
			! $( '.block.preview' ).hasClass( 'color-' + _color ) &&
			$( '.block.preview' ).length
		)
		{
			var items = $( '.block.preview' );
			var classes = items.attr( 'class' ).split( ' ' );

			for ( var i = 0; i < classes.length; i++ )
			{
				if ( classes[i].indexOf( 'color-' ) )
				{
					classes.splice( i, 1 );
				}
			}

			classes.push( 'color-' + _color );

			items.attr( { 'class': classes.join( ' ' ) } );
		}
	}

	function getGridPosition( $mouseX, $mouseY )
	{
		var grid_x = ( Math.round( ( $mouseX - _block_size.width ) / _block_size.height ) * _block_size.height ) - _block_size.height;
		var grid_y = ( Math.round( ( $mouseY - _block_size.height ) / _block_size.height ) * _block_size.height );
		
		if ( ( grid_x / _block_size.height ) % 2 == 0 )
		{
			grid_y += ( _block_size.height / 2 );
		}
		
		return { x: grid_x, y: grid_y };
	}

	function getGridZ( $cursorX, $cursorY, $blocks )
	{
		var blocks = $blocks || _blocks;
		var return_value = 0;
		
		for ( var i = 0; i < blocks.length; i++ )
		{
			var block = blocks[i];

			if(
				block.position.x == $cursorX && 
				block.position.y == $cursorY
			)
			{
				return_value++;
			}
		}
		
		return return_value;
	}

	function modeUpdate( $mode )
	{
		_mode = $mode;
		previewUpdateBlocks();
		previewUpdate();
	}
	
	function colorUpdate( $color )
	{
		_color = $color;
		previewUpdateColor();
	}

	function sizeUpdate( $size )
	{
		_size = $size;
		previewUpdateBlocks();
		previewUpdate();
	}

	_self.init = init;
	_self.modeUpdate = modeUpdate;
	_self.colorUpdate = colorUpdate;
	_self.sizeUpdate = sizeUpdate;
}
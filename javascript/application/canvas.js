function Canvas()
{
	var _self = this;
	var _active = false;
	var _modules = {};

	var _block_size = getBlockSize();
	var _blocks = [];
	var _cursor = { x: 0, y: 0, target: { x: 0, y: 0 } };
	var _mode;
	var _colors = getColors();
	var _color = _colors[0];
	var _colors;
	var _size = { width: 1, depth: 1 };

	var _mouse_on_canvas = true;
	var _shift_pressed = false;

	var _drag_cache = {};

	function init( $modules )
	{
		_modules = $modules;

		$( 'body' )
			.click( clicked )
			.mousemove( mouseMoved )
			.bind( 'dragstart', dragStarted )
			.bind( 'drag', dragged )
			.bind( 'dragend', dragEnded )
			.append('<div id="cursor"></div>')
			.append('<div id="blocks"></div>')

		previewUpdateBlocks();
		previewUpdate();
	}

	function start()
	{
		if ( ! _active )
		{
			_active = true;

			$( '#blocks' ).addClass( 'blocks-active' );

			if ( ! _mode )
			{
				_mode = 'single';
				_modules.navigation.showInfo( 'single' );

				$( '#cursor' ).show();

				if ( ! $( '.block.preview' ).length )
				{
					previewUpdateBlocks();
				}
			}
		}
	}

	function stop()
	{
		if ( _active )
		{
			_active = false;

			$( '#blocks' ).removeClass( 'blocks-active' );
			$( '#cursor' ).hide();
		}
	}

	function clear()
	{
		blockRemove( { blocks: $( '.block' ) } );
	}

	function clicked( $event )
	{
		if ( _active )
		{
			if (
				! $( $event.target ).is( 'nav' ) &&
				! $( $event.target ).closest( 'nav' ).length &&
				! $( $event.target ).is( '.help' ) &&
				! $( $event.target ).closest( '.help' ).length &&
				! $( $event.target ).is( '.gallery-toggle' ) &&
				! $( $event.target ).closest( '.gallery-toggle' ).length
			)
			{
				if (
					_mouse_on_canvas &&
					( _mode === 'single' || _mode === 'multiple' )
				)
				{
					previewToBlock();
					blocksUpdateZ();
					previewUpdateBlocks();
					previewUpdate();
				}

				if ( _mode === 'delete' )
				{
					blockAddToSelection( $event );
				}
			}
		}
	}

	function mouseMoved( $event )
	{
		if ( _active )
		{
			if ( $event.pageY < $( window ).height() - $( 'nav' ).height() )
			{
				_cursor.target.x = getGridPosition( $event.pageX, $event.pageY ).x;
				_cursor.target.y = getGridPosition( $event.pageX, $event.pageY ).y;

				_mouse_on_canvas = true;

				cursorUpdate();
				previewUpdate();
				
				if (
					_mode === 'single' ||
					_mode === 'multiple'
				)
				{
					$( '#cursor' ).show();

					if ( ! $( '.block.preview' ).length )
					{
						previewUpdateBlocks();
					}

					$( '#blocks' ).removeClass( 'no-preview' );
				}

				else
				{
					$( '#cursor' ).hide();

					if ( $( '.block.preview' ).length )
					{
						blockRemove( $( '.block.preview' ) );
					}

					$( '#blocks' ).addClass( 'no-preview' );
				}
			}

			else
			{
				_mouse_on_canvas = false;
				
				$( '#cursor' ).hide();
				
				if ( $( '.block.preview' ).length )
				{
					previewRemove();
				}

				$( '#blocks' ).addClass( 'no-preview' );
			}

			if ( $event.shiftKey )
			{
				_shift_pressed = true;

				if (
					_mode === 'single' &&
					_mouse_on_canvas &&
					$( '.block.preview' ).length
				)
				{
					previewToBlock();
				}
			}

			else
			{
				shift_pressed = false;
			}
		}
	}

	function dragStarted( $event, $object )
	{
		if ( _active )
		{
			_drag_cache = {};

			if (
				_shift_pressed &&
				_mode === 'delete'
			)
			{
				$( 'body' ).append( '<div id="selection"></div>' );
				
				var selection = {
					width: $object.deltaX,
					height:  $object.deltaY,
					left: $object.startX,
					top: $object.startY
				}
				
				if ( $object.deltaX < 0 )
				{
					selection.width =  $object.deltaX;
					selection.left = $object.startX + $object.deltaX;
				}
					
				if ( $object.deltaY < 0 )
				{
					selection.height = $object.deltaY;
					selection.top = $object.startY + $object.deltaY;
				}
					
				$( '#selection' ).css( selection );
			}
		}

		if ( $event )
		{
			_shift_pressed = $event.shiftKey;
		}
	}

	function dragged( $event, $object )
	{
		if ( _active )
		{
			_shift_pressed = $event.shiftKey;

			if ( _mode === 'single' && _mouse_on_canvas )
			{
				if ( ! $( '.block.preview' ).length )
				{
					previewUpdateBlocks();
				}

				var cursor_position = $( '#cursor' ).position();
					
				if (
					_drag_cache.top !== cursor_position.top &&
					_drag_cache.left !== cursor_position.left
				)
				{
					previewToBlock();
					_drag_cache = cursor_position;
				}				
			}

			if (
				_shift_pressed &&
				_mode === 'delete'
			)
			{
				var selection = {
					width: $object.deltaX,
					height:  $object.deltaY,
					left: $object.startX,
					top: $object.startY
				}

				if ( $object.deltaX < 0 )
				{
					selection.width = $object.deltaX * -1;
					selection.left = $object.startX + $object.deltaX;
				}
						
				if ( $object.deltaY < 0 )
				{
					selection.height = $object.deltaY * -1;
					selection.top = $object.startY + $object.deltaY;
				}

				var i = _blocks.length; while ( i-- )
				{
					var block = $( '#block-' + _blocks[i].index );
					
					if ( block.length )
					{
						var position = block.position();

						if (
							position.left >= selection.left &&
							position.left + _block_size.width <= selection.left + selection.width &&
							position.top >= selection.top &&
							position.top + _block_size.height <= selection.top + selection.height
						)
						{
							block.addClass( 'selected' );
						}

						else
						{
							block.removeClass( 'selected' );
						}
					}
				}
						
				$( '#selection' ).css( selection );
			}	
		}
	}

	function dragEnded( $event )
	{
		if ( _active )
		{
			if ( _mode === 'delete' )
			{
				$( '#selection' ).remove();
			}

			_shift_pressed = false;
		}
	}

	function cursorUpdate()
	{
		if ( _active )
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
	}

	function blocksUpdateZ( $blocks )
	{
		function sortZ( $a, $b )
		{
			var item_1 = ( $a.position.x + ( $a.position.y * _blocks.length ) + ( $a.position.z * _blocks.length * _blocks.length ) );
			var item_2 = ( $b.position.x + ( $b.position.y * _blocks.length ) + ( $b.position.z * _blocks.length * _blocks.length ) );
			
			var result = item_1 - item_2;

			return result;
		}

		var blocks = $blocks || _blocks;
			blocks.sort( sortZ );
			
		var i = _blocks.length; while ( i-- )
		{
			var block = blocks[i];
				block.z_index = i + block.position.z;
			
			$( '#block-' + block.index ).css( { zIndex: i } );
		}
	}

	function blockAdd( $type )
	{
		if ( _active )
		{
			var type = $type || 'solid';

			var new_block = {
				index: parseInt( getHighestBlockIndex() + 1 ),
				color: _color,
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

			updateCounter();
		}
	}

	function blockRemove( $options )
	{
		if ( _active )
		{
			if ( $options )
			{
				if ( $options.index )
				{
					var blocks_to_remove = [];

					var i = _blocks.length; while ( i-- )
					{
						if ( _blocks[i].index === $options.index )
						{
							if ( _blocks[i].type !== 'preview' )
							{
								blocks_to_remove.push( _blocks[i] );	
							}

							_blocks.splice( i, 1 );
							
							$( '#block-' + _blocks[i].index ).remove();

							break;
						}
					}

					if ( blocks_to_remove.length )
					{
						_modules.history.save( { action: 'remove', blocks: blocks_to_remove } );
					}
				}

				if ( $options.blocks )
				{
					$( $options.blocks ).each(
						function()
						{
							var blocks_to_remove = [];
							var block_index = getBlockID( $( this ) );

							var i = _blocks.length; while ( i-- )
							{
								if ( _blocks[i].index == block_index )
								{
									if ( _blocks[i].type !== 'preview' )
									{
										blocks_to_remove.push( _blocks[i] );
									}

									$( '#block-' + block_index ).remove();

									_blocks.splice( i, 1 );

									break;
								}
							}

							if ( blocks_to_remove.length )
							{
								_modules.history.save( { action: 'remove', blocks: blocks_to_remove } );
							}
						}
					);
				}

				if ( $options.position )
				{
					var blocks_to_remove = [];

					var i = _blocks.length; while ( i-- )
					{
						if (
							_blocks[i].position.x === $options.position.x &&
							_blocks[i].position.y === $options.position.y &&
							_blocks[i].position.z === $options.position.z
						)
						{
							if ( _blocks[i].type !== 'preview' )
							{
								blocks_to_remove.push( _blocks[i] );
							}

							$( '#block-' + _blocks[i].index ).remove();

							_blocks.splice( i, 1 );

							break;
						}
					}

					if ( blocks_to_remove.length )
					{
						_modules.history.save( { action: 'remove', blocks: blocks_to_remove } );
					}
				}
			}

			updateCounter();
		}
	}

	function blocksDeleteSelected()
	{
		blockRemove( { blocks: $( '.selected' ) } );
	}

	function blockAddToSelection( $event )
	{
		if ( _active )
		{
			var target = $( $event.target );
			
			if ( target.hasClass( 'block' ) )
			{
				target.toggleClass( 'selected' );
			}
		}
	}

	function previewUpdate()
	{
		if ( _active )
		{
			if ( _mode === 'single' )
			{
				previewSingleBlock();
			}

			if ( _mode === 'multiple' )
			{
				previewMultipleBlocks();
			}

			blocksUpdateZ();
		}
	}

	function previewRemove()
	{
		blockRemove( { blocks: $( '.block.preview' ) } );
	}

	function allRemove()
	{
		blockRemove( { blocks: $( '.block' ) } );
	}

	function deleteTransparent()
	{
		blockRemove( { blocks: $( '.block.color-transparent' ) } );
	}

	function previewSingleBlock()
	{
		var preview_position = { x: _cursor.x, y: _cursor.y, z: getGridZ( _cursor.x, _cursor.y ) };
		var block_index = getBlockID( $( '.block.preview' ) );

		var i = _blocks.length; while ( i-- )
		{
			if ( _blocks[i].index === block_index )
			{
				_blocks[i].position = preview_position;

				break;
			}
		}

		var preview_css = {
			top: preview_position.y + ( - _block_size.height * preview_position.z ),
			left: preview_position.x
		};

		$( '.block.preview' ).css( preview_css );
	}

	function previewMultipleBlocks()
	{
		if ( _active )
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
						z: 1
					};

					var block_index = getBlockID( $( $item ) );

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

					preview_position.z = getGridZ( preview_position.x, preview_position.y );

					var i = _blocks.length; while ( i-- )
					{
						if ( _blocks[i].index === block_index )
						{
							_blocks[i].position = preview_position;

							break;
						}
					}

					var preview_css = {
						top: preview_position.y + ( - _block_size.height * preview_position.z ),
						left: preview_position.x
					};

					$( $item ).css( preview_css );
				}
			);
		}
	}

	function previewUpdateBlocks()
	{
		if ( _active )
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

			updateCounter();
		}
	}

	function previewToBlock()
	{
		if ( _active )
		{
			var blocks_to_add = [];

			$( '.block.preview' ).each(
				function()
				{
					var block_index = getBlockID( $( this ) );

					$( this ).removeClass( 'preview' );

					var i = _blocks.length; while ( i-- )
					{
						if ( _blocks[i].index === block_index )
						{
							blocks_to_add.push( _blocks[i] );
							_blocks[i].type = 'solid';
							break;
						}
					}
				}
			);

			if ( blocks_to_add.length )
			{
				_modules.history.save( { action: 'add', blocks: blocks_to_add } );
			}

			updateCounter();
		}
	}

	function previewUpdateColor( $new_color, $old_color )
	{
		if ( _active )
		{
			$( '.block.preview' )
				.addClass( 'color-' + $new_color )
				.removeClass( 'color-' + $old_color );
		}			
	}

	function historyUpdate( $action, $item )
	{
		options = _modules.history[$action]( $item );

		if ( _active )
		{
			if (
				options &&
				options.blocks &&
				options.action &&
				options.history_action
			)
			{
				if ( options.history_action === 'undo' )
				{
					if ( options.action === 'add' )
					{
						historyRemoveBlocks( options );
					}

					if ( options.action === 'remove' )
					{
						historyAddBlocks( options );
					}
				}

				if ( options.history_action === 'redo' )
				{
					if ( options.action === 'remove' )
					{
						historyRemoveBlocks( options );
					}

					if ( options.action === 'add' )
					{
						historyAddBlocks( options );
					}
				}
			}
		}
	}

	function historyAddBlocks( $options )
	{
		if ( _active )
		{
			var blocks = $options.blocks;

			var i = blocks.length; while ( i-- )
			{
				var block = blocks[i];
					block.index = parseInt( getHighestBlockIndex() + 1 );

				var new_block_html = '<div class="block color-' + block.color + '" id="block-' + block.index + '"></div>';
				
				var new_block_css = {
					top: block.position.y + ( - _block_size.height * block.position.z ),
					left: block.position.x
				};

				_blocks.push( block );

				$( '#blocks' ).append( new_block_html );
				$( '#block-' + block.index ).css( new_block_css );

				blocksUpdateZ();
				updateCounter();
			}
		}
	}

	function historyRemoveBlocks( $options )
	{
		if ( _active )
		{
			var blocks = $options.blocks;

			var i = blocks.length; while ( i-- )
			{
				var block = blocks[i];

				var j = _blocks.length; while ( j-- )
				{
					if ( _blocks[j].index === block.index )
					{
						$( '#block-' + block.index ).remove();

						_blocks.splice( j, 1 );

						blocksUpdateZ();

						break;
					}
				}
			}
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
		var occupied = false;

		var i = _blocks.length; while ( i-- )
		{
			var block = blocks[i];

			if(
				block.position.x === $cursorX && 
				block.position.y === $cursorY &&
				block.type === 'solid' &&
				block.position.z >= return_value
			)
			{
				return_value = block.position.z;
				occupied = true;
			}
		}

		if ( occupied )
		{
			return_value++;
		}

		return return_value;
	}

	function getBlockID( $item )
	{
		var return_value = false;

		if ( $item.attr( 'id' ) )
		{
			return_value = parseInt( $item.attr( 'id' ).replace( 'block-', '' ) );
		}

		return return_value;
	}

	function getHighestBlockIndex()
	{
		var return_value = 0;

		var i = _blocks.length; while ( i-- )
		{
			if ( _blocks[i].index > return_value )
			{
				return_value = _blocks[i].index;
			}
		}

		return return_value;
	}

	function setMode( $mode )
	{
		if ( _active )
		{
			_mode = $mode;
			previewUpdateBlocks();
			previewUpdate();

			if ( _mode === 'delete' )
			{
				previewRemove();
			}

			else
			{
				$( '.block.selected' ).removeClass( 'selected' );
			}
		}
	}

	function getMode()
	{
		return _mode;
	}
	
	function colorUpdate( $new_color, $old_color )
	{
		if ( _active )
		{
			previewUpdateColor( $new_color, $old_color );
			_color = $new_color;
			previewUpdate();
		}
	}

	function sizeUpdate( $size )
	{
		if ( _active )
		{
			_size[$size.id] = $size.value;

			previewUpdateBlocks();
			previewUpdate();
		}
	}

	function importBlocks( $blocks )
	{
		if ( _active )
		{
			for ( var i = 0; i < $blocks.length; i++ )
			{
				var old_index = $blocks[i].index;

				var new_block = $blocks[i];
					new_block.index = getHighestBlockIndex() + 1;

				var new_block_html = '<div class="block color-' + new_block.color + '" id="block-' + new_block.index + '"></div>';
			
				var new_block_css = {
					top: new_block.position.y + ( - _block_size.height * new_block.position.z ),
					left: new_block.position.x
				};

				_modules.history.historyUpdateIDs( old_index, new_block.index );

				_blocks.push( new_block );

				$( '#blocks' ).append( new_block_html );
				$( '#block-' + new_block.index ).css( new_block_css )
			}

			updateCounter();
		}
	}

	function updateCounter()
	{
		if ( _active )
		{
			$( '.stats .count span' ).text( $( '.block:not(.preview)' ).length );

			if ( ! _colors )
			{
				_colors = getColors();
			}

			var i = _colors.length; while ( i-- )
			{
				var color_count = $( '.block.color-' + _colors[i] + ':not(.preview)' ).length;
				
				if ( color_count )
				{
					if ( ! $( '.stats .count-color-' + _colors[i] ).length )
					{
						$( '.stats' ).prepend( '<p class="count-color count-color-' + _colors[i] + '"><span></span> ' + _colors[i] + ' blocks</p>' )
					}

					$( '.stats .count-color-' + _colors[i] + ' span' ).text( color_count );
				}
			}
		}

		updateUploadButton();
	}

	function updateUploadButton()
	{
		var button_show = false;

		if (
			_blocks.length - $( '.block.preview' ).length > 0 &&
			_blocks.length < 3000 &&
			_modules.history.getHistoryLength() < 3000 &&
			navigator.onLine
		)
		{
			button_show = true;
		}

		if ( button_show )
		{
			$( '#file-upload' ).addClass( 'active' );
		}

		else
		{
			$( '.upload-info' ).removeClass( 'info-container-active' );
			$( '#file-upload' ).removeClass( 'active' );
		}
	}

	function getBlocks()
	{
		blockRemove( { blocks: $( '.block.preview' ), position: { x: 0, y: 0, z: 0 } } );
		return _blocks;
	}

	_self.init = init;
	_self.start = start;
	_self.stop = stop;
	_self.clear = clear;
	_self.setMode = setMode;
	_self.getMode = getMode;
	_self.colorUpdate = colorUpdate;
	_self.sizeUpdate = sizeUpdate;
	_self.historyUpdate = historyUpdate;
	_self.deleteSelected = blocksDeleteSelected;
	_self.getBlocks = getBlocks;
	_self.importBlocks = importBlocks;
	_self.getBlocks = getBlocks;
	_self.previewRemove = previewRemove;
	_self.previewUpdateBlocks = previewUpdateBlocks;
	_self.allRemove = allRemove;
	_self.deleteTransparent = deleteTransparent;
}
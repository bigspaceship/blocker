function Canvas()
{
	var _self = this;

	var _block_size = { width: 28, height: 14 };
	var _blocks = [];
	var _cursor = { x: 0, y: 0, target: { x: 0, y: 0 } };
	var _mode;
	var _color;
	var _colors;
	var _size;

	var _mouse_on_canvas = true;
	var _shift_pressed = false;

	function init()
	{
		$( 'body' )
			.click( clicked )
			.mousemove( mouseMoved )
			.bind( 'dragstart', dragStarted )
			.bind( 'drag', dragged )
			.bind( 'dragend', dragEnded )
			.append('<div id="cursor"></div>')
			.append('<div id="blocks"></div>')

		_mode = editor.getMode();
		_color = editor.getColor();
		_colors = editor.getColors();
		_size = editor.getSize();

		blocksLoadFromStorage();

		previewUpdateBlocks();
		previewUpdate();
	}

	function clicked( $event )
	{
		if (
			! $( $event.target ).is( 'nav' ) &&
			! $( $event.target ).closest( 'nav' ).length &&
			! $( $event.target ).is( '.help' ) &&
			! $( $event.target ).closest( '.help' ).length
		)
		{
			if (
				_mouse_on_canvas &&
				_mode !== 'delete'
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

	function mouseMoved( $event )
	{
		if ( $event.pageY < $( window ).height() - $( 'nav' ).height() )
		{
			_cursor.target.x = getGridPosition( $event.pageX, $event.pageY ).x;
			_cursor.target.y = getGridPosition( $event.pageX, $event.pageY ).y;

			_mouse_on_canvas = true;

			cursorUpdate();
			previewUpdate();
			
			if ( _mode === 'delete' )
			{
				$( '#cursor' ).hide();
			}

			else
			{
				$( '#cursor' ).show();

				if ( ! $( '.block.preview' ).length )
				{
					previewUpdateBlocks();
				}
			}
		}

		else
		{
			_mouse_on_canvas = false;
			
			$( '#cursor' ).hide();
			blockRemove( { blocks: $( '.block.preview' ) } );
		}

		if ( $event.shiftKey )
		{
			_shift_pressed = true;

			if (
				_mode === 'single' &&
				_mouse_on_canvas
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

	function dragStarted( $event, $object )
	{
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

	function dragged( $event, $object )
	{
		if ( _mode === 'single' )
		{
			if ( ! $( '.block.preview' ).length )
			{
				previewUpdateBlocks();
			}

			previewToBlock();
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

	function dragEnded( $event )
	{
		if ( _mode === 'delete' )
		{
			$( '#selection' ).remove();
		}
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
		var type = $type || 'solid';

		var new_block = {
			index: parseInt( getHighestBlockIndex() + 1 ),
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
		$( '#block-' + new_block.index )
			.css( new_block_css )
			.hover( blockOver, blockOut );

		if ( $type === 'preview' )
		{
			$( '#block-' + new_block.index ).addClass( 'preview' );
		}

		updateCounter();
	}

	function blockRemove( $options )
	{
		if ( $options )
		{
			if ( $options.index )
			{
				var i = _blocks.length; while ( i-- )
				{
					if ( _blocks[i].index === $options.index )
					{
						if ( _blocks[i].type !== 'preview' )
						{
							editor.historyUpdate( 'save', { action: 'remove', block: _blocks[i] } );
						}

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
						var block_index = getBlockID( $( this ) );

						var i = _blocks.length; while ( i-- )
						{
							if ( _blocks[i].index == block_index )
							{
								if ( _blocks[i].type !== 'preview' )
								{
									editor.historyUpdate( 'save', { action: 'remove', block: _blocks[i] } );
								}

								$( '#block-' + block_index ).remove();

								_blocks.splice( i, 1 );

								break;
							}
						}
					}
				);
			}

			if ( $options.position )
			{
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
							editor.historyUpdate( 'save', { action: 'remove', block: _blocks[i] } );
						}

						$( '#block-' + _blocks[i].index ).remove();

						_blocks.splice( i, 1 );

						break;
					}
				}
			}
		}

		updateCounter();
	}

	function blocksDeleteSelected()
	{
		blockRemove( { blocks: $( '.selected' ) } );
	}

	function blocksLoadFromStorage()
	{
		var storage = editor.load();

		if (
			storage &&
			storage.blocks
		)
		{
			importBlocks( storage.blocks );
		}
	}

	function blockAddToSelection( $event )
	{
		var target = $( $event.target );
		
		if ( target.hasClass( 'block' ) )
		{
			target.toggleClass( 'selected' );
		}
	}

	function blockOver( $event )
	{

	}

	function blockOut( $event )
	{

	}

	function previewUpdate()
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

		updateCounter();
	}

	function previewToBlock()
	{
		$( '.block.preview' ).each(
			function()
			{
				var block_index = getBlockID( $( this ) );

				$( this ).removeClass( 'preview' );

				var i = _blocks.length; while ( i-- )
				{
					if ( _blocks[i].index === block_index )
					{
						editor.historyUpdate( 'save', { action: 'add', block: _blocks[i] } );

						_blocks[i].type = 'solid';
						break;
					}
				}
			}
		);

		updateCounter();
	}

	function previewUpdateColor( $new_color, $old_color )
	{
		$( '.block.preview' )
			.addClass( 'color-' + $new_color )
			.removeClass( 'color-' + $old_color );
			
	}

	function historyUpdate( $options )
	{
		if (
			$options &&
			$options.block &&
			$options.action &&
			$options.history_action
		)
		{
			if ( $options.history_action === 'undo' )
			{
				if ( $options.action === 'add' )
				{
					historyRemoveBlock( $options );
				}

				if ( $options.action === 'remove' )
				{
					historyAddBlock( $options );
				}
			}

			if ( $options.history_action === 'redo' )
			{
				if ( $options.action === 'remove' )
				{
					historyRemoveBlock( $options );
				}

				if ( $options.action === 'add' )
				{
					historyAddBlock( $options );
				}
			}
		}

		else
		{

		}
	}

	function historyAddBlock( $options )
	{
		var block = $options.block;

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

	function historyRemoveBlock( $options )
	{
		var block = $options.block;

		var i = _blocks.length; while ( i-- )
		{
			if ( _blocks[i].index === block.index )
			{
				$( '#block-' + block.index ).remove();

				_blocks.splice( i, 1 );

				blocksUpdateZ();

				break;
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

	function modeUpdate( $mode )
	{
		_mode = $mode;
		previewUpdateBlocks();
		previewUpdate();

		if ( _mode === 'delete' )
		{
			blockRemove( { blocks: $( '.block.preview' ) } );
		}

		else
		{
			$( '.block.selected' ).removeClass( 'selected' );
		}
	}
	
	function colorUpdate( $new_color, $old_color )
	{
		previewUpdateColor( $new_color, $old_color );
		_color = $new_color;
		previewUpdate();
	}

	function sizeUpdate( $size )
	{
		_size = $size;
		previewUpdateBlocks();
		previewUpdate();
	}

	function getBlocks()
	{
		blockRemove( { blocks: $( '.block.preview' ) } );
		
		return _blocks;
	}

	function importBlocks( $blocks )
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

			editor.historyUpdateIDs( old_index, new_block.index );

			_blocks.push( new_block );

			$( '#blocks' ).append( new_block_html );
			$( '#block-' + new_block.index )
				.css( new_block_css )
				.hover( blockOver, blockOut );
		}

		updateCounter();
	}

	function updateCounter()
	{
		$( '.stats .count span' ).text( $( '.block:not(.preview)' ).length );

		if ( ! _colors )
		{
			_colors = editor.getColors();
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

	function getBlocks()
	{
		blockRemove( { blocks: $( '.block.preview' ), position: { x: 0, y: 0, z: 0 } } );
		return _blocks;
	}

	_self.init = init;
	_self.modeUpdate = modeUpdate;
	_self.colorUpdate = colorUpdate;
	_self.sizeUpdate = sizeUpdate;
	_self.historyUpdate = historyUpdate;
	_self.deleteSelected = blocksDeleteSelected;
	_self.getBlocks = getBlocks;
	_self.importBlocks = importBlocks;
	_self.getBlocks = getBlocks;

	_self.getMode = function(){ return _mode };
}
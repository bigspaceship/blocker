function History()
{
	var _self = this;

	var _history = [];
	var _current_index = -1;

	function init()
	{
		// uh.. nothing to do here, really
	}

	function save( $item )
	{
		if (
			_current_index !== _history.length &&
			_history.length
		)
		{
			_history = _history.slice( 0, _current_index );
		}

		_history.push( { action: $item.action, block: $item.block } );
		_current_index = _history.length;
	}

	function undo()
	{
		var return_value = false;

		if ( hasPrev() )
		{
			var prev_index = parseInt( _current_index - 1 );

			return_value = _history[ prev_index ];
			return_value.history_action = 'undo';

			_current_index--;
		}

		return return_value;
	}

	function redo()
	{
		var return_value = false;
		
		if ( hasNext() )
		{
			var next_index = _current_index;

			return_value = _history[ next_index ];
			return_value.history_action = 'redo';
			
			_current_index++;
		}

		return return_value;
	}

	function hasNext()
	{
		var return_value = false;

		if ( _current_index < _history.length )
		{
			return_value = true;
		}

		return return_value;
	}

	function hasPrev()
	{
		var return_value = false;

		if ( _current_index > 0 )
		{
			return_value = true;
		}

		return return_value;
	}

	_self.init = init;
	_self.save = save;
	_self.undo = undo;
	_self.redo = redo;
	_self.hasNext = hasNext;
	_self.hasPrev = hasPrev;
}
function History()
{
	var _self = this;

	var _history = [];
	var _current_index = -1;
	var _imported_history = [];

	function init()
	{
		historyLoadFromStorage();
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

	function getHistory()
	{
		return _history;
	}

	function historyLoadFromStorage()
	{
		var storage = editor.load();

		if ( 
			storage &&
			storage.history
		)
		{
			importHistory( storage.history );
		}
	}

	function importHistory( $history )
	{
		_imported_history = $history;
	}

	function historyUpdateIDs( $old_index, $new_index )
	{
		for ( var i = 0; i < _imported_history.length; i++ )
		{
			if ( _imported_history[i].block.index === $old_index )
			{
				_imported_history[i].block.index = $new_index;
			}

			save( { action: 'add', block: _imported_history[i].block } );
		}

		_imported_history = [];
	}

	function clear()
	{
		_history = [];
		_current_index = -1;
	}

	_self.init = init;
	_self.save = save;
	_self.undo = undo;
	_self.redo = redo;
	_self.clear = clear;
	_self.hasNext = hasNext;
	_self.hasPrev = hasPrev;
	_self.getHistory = getHistory;
	_self.importHistory = importHistory;
	_self.historyUpdateIDs = historyUpdateIDs;
}
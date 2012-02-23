function Memory()
{
	var _self = this;
	var _modules = {};

	function init( $modules )
	{
		_modules = $modules;
	}

	function fileImported( $event )
	{
		var files = $event.target.files;
		var files_imported = [];

		for ( var i = 0; i < files.length; i++ )
		{
			var file = {
				name: files[i].name,
				type: files[i].type,
				size: files[i].size
			}

			files_imported.push( file );
		}

		if (
			files_imported.length &&
			window.FileReader
		)
		{
			var reader = new FileReader();

				reader.readAsText( files[0] );
				reader.onload = ( function( $file ){ return function( $event ) { importJSON( $event.target.result ) }; } )( files[0] );
		}
	}

	function importJSON( $text )
	{
		_modules.canvas.clear();
		_modules.history.clear();

		var object = {};

		try
		{
			object = jQuery.parseJSON( $text );
		}

		catch( $error ) {}

		if (
			object &&
			object.blocks &&
			object.history
		)
		{
			_modules.canvas.clear();
			_modules.history.clear();

			_modules.history.importHistory( object.history );
			_modules.canvas.importBlocks( object.blocks );
		}
	}

	function exportHTML( $event )
	{
		if ( $( '#blocks' ).length )
		{
			var blocks_stylesheet = document.styleSheets[1];
			var html = $( '#blocks' ).html();
			var css = '';

			var now = new Date();

			var data = {
				id: stringToSlug( $( '#export-sketch' ).val() ),
				date: now.format( 'yyyy-mm-dd HH:MM' ),
				name: $( '#export-sketch' ).val()
			};

			for ( var i = 0; i < blocks_stylesheet.cssRules.length; i++ )
			{
				css += blocks_stylesheet.cssRules[i].cssText + '\n';
			}

			html = '<style>' + css + '</style><div id="blocks">' + html + '</div>';

			textToDownload( $event, html, data, 'text/html', '.html' );
		}
	}

	function exportJSON( $event )
	{
		if ( $( '#blocks' ).length )
		{
			var now = new Date();			

			var data = {
				blocks: _modules.canvas.getBlocks(),
				history: _modules.history.getHistory(),
				id: stringToSlug( $( '#export-sketch' ).val() ),
				date: now.format( 'yyyy-mm-dd HH:MM' ),
				name: $( '#export-sketch' ).val()
			};

			var json = '';

			if (
				JSON &&
				JSON.stringify
			)
			{
				json = JSON.stringify( data );
			}

			textToDownload( $event, json, data, 'application/json', '.json' );
		}
	}

	function save()
	{
		if ( $( '#blocks' ).length )
		{
			var date = new Date;

			var data = {
				blocks: _modules.canvas.getBlocks(),
				history: _modules.history.getHistory(),
				id: stringToSlug( $( '#save-sketch' ).val() ),
				date: date.format( 'yyyy-mm-dd HH:MM' ),
				name: $( '#save-sketch' ).val()
			};

			var store = load() || [];
				store.push( data );

			if (
				Modernizr.localstorage &&
				JSON &&
				JSON.stringify
			)
			{
				localStorage.setItem( 'blocks_data', JSON.stringify( store ) );
			}
		}

		_modules.navigation.savedToLocal();
	}

	function load()
	{
		var data = [];
		
		if ( Modernizr.localstorage )
		{
			data = jQuery.parseJSON( localStorage.getItem( 'blocks_data' ) );
		}
		
		return data;
	}

	function textToDownload( $event, $text, $data, $mime_type, $file_extension )
	{
		if ( window.BlobBuilder )
		{
			$( '.export-info input, .export-info label, .export-info .info-button' ).hide();
			
			if ( ! $( '.export-info .download-link' ).length )
			{
				$( '.export-info h1' ).after( '<a class="download-link info-button">Download File</a>' );
			}

			var blob_builder = new BlobBuilder();
				blob_builder.append( $text );

			var filename = $data.id || 'myBlocks';
				filename += $file_extension;

			var filepath = window.URL.createObjectURL( blob_builder.getBlob( $mime_type ) );

			var download_link = $( '.export-info .download-link' );

			var download_link_attributes = {
				download: filename,
				href: filepath,
				'data-downloadurl': [ $mime_type, filename, filepath ].join( ':' )
			}

			download_link
				.attr( download_link_attributes )
				.click( fileDownloaded );
		}
	}

	function fileDownloaded( $event )
	{
		var target = $( $event.target );
		var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

		// gf: chrome is the only browser that suppports the a[download] attribute. :-/
		if ( ! is_chrome )
		{
			$event.preventDefault();
			$event.stopPropagation();
			window.open( target.attr( 'href' ) );
		}

		target.remove();

		

		$( '.export-info input, .export-info label, .export-info a' ).show();
	}

	_self.exportHTML = exportHTML;
	_self.exportJSON = exportJSON;
	_self.fileImported = fileImported;
	_self.load = load;
	_self.save = save;
	_self.init = init;
}
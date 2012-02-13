function Memory()
{
	var _self = this;

	function init()
	{

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

		if ( files_imported.length )
		{
			var reader = new FileReader();

				reader.readAsText( files[0] );
				reader.onload = ( function( $file ){ return function( $event ) { importJSON( $event.target.result ) }; } )( files[0] );
		}
	}

	function importJSON( $text )
	{
		editor.clear();

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
			editor.clear();
			editor.importHistory( object.history );
			editor.importBlocks( object.blocks );
		}
	}

	function exportHTML( $event )
	{
		if ( $( '#blocks' ).length )
		{
			var blocks_stylesheet = document.styleSheets[1];
			var html = $( '#blocks' ).html();
			var css = '';

			var data = {
				id: editor.stringToSlug( $( '#export-sketch' ).val() ),
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
				blocks: editor.getBlocks(),
				history: editor.getHistory(),
				id: editor.stringToSlug( $( '#export-sketch' ).val() ),
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
				blocks: editor.getBlocks(),
				history: editor.getHistory(),
				id: editor.stringToSlug( $( '#save-sketch' ).val() ),
				date: date.format( 'yyyy-mm-dd HH:MM' ),
				name: $( '#save-sketch' ).val()
			};

			var store = load() || [];
				store.push( data );

			localStorage.setItem( 'blocks_data', JSON.stringify( store ) );
		}

		editor.savedToLocal();
	}

	function load()
	{
		var data = [];
			data = jQuery.parseJSON( localStorage.getItem( 'blocks_data' ) );
		
		return data;
	}

	function textToDownload( $event, $text, $data, $mime_type, $file_extension )
	{
		window.URL = window.webkitURL || window.URL;
		window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

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

	function fileDownloaded( $event )
	{
		$( $event.target ).remove();
		$( '.export-info input, .export-info label, .export-info a' ).show();
	}

	_self.exportHTML = exportHTML;
	_self.exportJSON = exportJSON;
	_self.fileImported = fileImported;
	_self.load = load;
	_self.save = save;
	_self.init = init;
}
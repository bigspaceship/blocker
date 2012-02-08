function Memory()
{
	var _self = this;

	function init()
	{

	}

	

	function exportHTML( $event )
	{
		if ( $( '#blocks' ).length )
		{
			var blocks_stylesheet = document.styleSheets[1];
			var html = $( '#blocks' ).html();
			var css = '';

			for ( var i = 0; i < blocks_stylesheet.cssRules.length; i++ )
			{
				css += blocks_stylesheet.cssRules[i].cssText + '\n';
			}

			html = '<style>' + css + '</style><div id="blocks">' + html + '</div>';

			textToDownload( $event, html, 'text/html', '.html' );
		}
	}

	function exportJSON( $event )
	{
		if ( $( '#blocks' ).length )
		{
			var data = {
				blocks: editor.getBlocks(),
				history: editor.getHistory()
			};

			var json = '';

			if (
				JSON &&
				JSON.stringify
			)
			{
				json = JSON.stringify( data );
			}

			textToDownload( $event, json, 'application/json', '.json' );
		}
	}

	function textToDownload( $event, $text, $mime_type, $file_extension )
	{
		window.URL = window.webkitURL || window.URL;
		window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

		$( '.export-info input, .export-info label, .export-info .info-button' ).hide();
		$( '.export-info h1' ).after( '<a class="download-link info-button">Download File</a>' );

		var blob_builder = new BlobBuilder();
			blob_builder.append( $text );

		var filename = $( '.export-info input' ).val() || 'myBlocks';
			filename += $file_extension;

		var filepath = window.URL.createObjectURL( blob_builder.getBlob( $mime_type ) );

		var download_link = $( '.export-info a' );

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
	_self.init = init;
}
var app;

init();

function init()
{
	var _dependencies = [
		'javascript/libraries/jquery-1.7.1.min.js',
		'javascript/libraries/jquery.address-1.4.min.js',
		'javascript/application/gallery.js',
		'javascript/application/application.js',
		'javascript/application/helpers.js'
	];

	yepnope( { load: _dependencies, complete: depencenciesLoaded } );

	function depencenciesLoaded( $url, $result, $key )
	{
		app = new Application();
		app.init();
	}
}
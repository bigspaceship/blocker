var app;

init();

function init()
{
	var _dependencies = [
		'javascript/libraries/jquery-1.7.1.min.js',
		'javascript/libraries/jquery-ui-1.8.17.custom.min.js',
		'javascript/libraries/jquery.mousewheel.js',
		'javascript/libraries/jquery.event.drag-2.0.js',
		'javascript/libraries/date.format.js',
		'javascript/application/navigation.js',
		'javascript/application/canvas.js',
		'javascript/application/history.js',
		'javascript/application/memory.js',
		'javascript/application/help.js',
		'javascript/application/application.js',
		'javascript/application/editor.js',
		'javascript/application/helpers.js'
	];

	yepnope( { load: _dependencies, complete: depencenciesLoaded } );

	function depencenciesLoaded( $url, $result, $key )
	{
		app = new Application();
		app.init();
	}
}
// shim layer with setTimeout fallback
window.requestAnimFrame = (
	function()
	{
		return  window.requestAnimationFrame       || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function(/* function */ callback /*, DOMElement  element*/){
			window.setTimeout(callback, 1000 / 60);
		};
	}
)();

$(document).ready(
	function()
	{
		var animation = false;
		var selector = {x: 0, y: 0, target: {x: 0, y: 0}};
		var cubes = [];
		
		var cubes_preview = [];
		
		var colors = ['yellow', 'blue', 'pink', 'orange', 'green', 'red', 'transparent'];
		var color_active = 'green';
		
		var mode = 'single-block';
		var cube_index = 0;
		var cube_size = {width: 28, height: 14}
		
		var actions = [];
		var action_current = -1;
		
		var wall_preview = [];
		
		var preview_debug_switch = true;
		var shift_pressed = false;
		
		init();
		
		function init()
		{
			$('body').mousemove(function ($event) { if($event.shiftKey) { shift_pressed = true;} else { shift_pressed = false; }});
			//$('body').keyup(function($event){ shift_pressed = false; });
			
			$('body').click(clicked);
			//$('body').mousewheel(mouseWheeled);
						
			$('body').bind('dragstart', dragStart);
			$('body').bind('drag', dragged);
			$('body').bind('dragend', dragEnd);
			
			$('body').mousemove(mouseMoved);
			
			$('body').append('<div id="selector"></div>');
			$('body').append('<div id="cubes"></div>');
			
			$('nav').append('<ul></ul>');
			$('nav').append('<div id="undoredo"><p id="undo">Undo</p></div>');
			
			$('#undo').click(actionUndo);
			
			$('form').submit(formSave);
			
			for(var i = 0; i < colors.length; i++)
			{
				var color = colors[i];
				
				$('nav ul').append('<li id="color-button-' + color + '" class="color-nav">' + color + '</li>');
				$('#color-button-' + color).click(colorClicked);
				$('#color-button-' + color).addClass('color-' + color);
				//$('#color-' + color).css({backgroundImage: 'url(images/blocks.png)'});
			}
			
			$('#color-button-' + color_active).addClass('active');
			
			$('nav ul').append('<li id="mode-single-block" class="mode active">single-block</li>');
			$('nav ul').append('<li id="mode-wall" class="mode">bigger</li>');
			$('nav ul').append('<li id="mode-delete" class="mode">delete</li>');
			$('.mode').click(modeClicked);
			
			var slider_types = ['width', 'depth'];
			
			$('nav').append('<div id="wall-sliders"></div>');
			
			for(var i = 0; i < slider_types.length; i++)
			{
				var type = slider_types[i];
				$('#wall-sliders').append('<div class="slider-container"><p id="value-' + type + '">1</p><div id="slider-' + type + '" class="slider"></div></div>');
			}
			
			$('nav').append('<div id="cube-count">' + getCubes().length + ' cubes</div>');
			
			$( ".slider" ).slider(
				{
					min: 0,
					max: 21,
					value: 4,
					slide: function()
					{
						var id = $(this).attr('id').replace('slider-', '');
						$('#value-' + id).text(id + ': ' + $(this).slider('option', 'value'));
						cubePreview();
					},
					create: function()
					{
						var id = $(this).attr('id').replace('slider-', '');
						$('#value-' + id).text(id + ': ' + $(this).slider('option', 'value'));
					}
				}
			);
			
			$('#wall-sliders').hide();
		}
		
		function actionAdd($cube, $type)
		{
			//	gf: $type = add or delete
			
			$cube.action = $type;	
			actions[actions.length] = $cube;
			action_current++
		}
		
		function actionUndo(event)
		{
			if(action_current >= 0 && actions.length >= 0)
			{
				var cube = actions[action_current];
				
				if(cube.action == 'add')
				{
					// remove;
					cubeRemoveSingle(cube, 'undo');
				}
				
				if(cube.action == 'delete')
				{
					// add
					cubeAdd('solid', cube.position, 'undo');				
				}

				actions.splice(action_current, 1);
				action_current--;
			}		
		}
				
		function formSave($event)
		{
			//$event.preventDefault();
			$('#cubes .color-transparent').remove();
			formUpdateValue();
			
			if( $('#title').get(0).value == '' )
	        {
	           $event.preventDefault();
	            alert('dude, what the f**k. add a title, man!');
	            $("#title").focus();
	        }	        
		}
		
		function formUpdateValue()
		{
			var html_text = '';
			
			cubePreviewRemove();
			
			$('.cube').each(
				function()
	        	{
	           		//var html = $(this).html();
	           		//P.446.435.640.599|
					//COLOR.ID.TOP.LEFT.ZED
	           		var color = $(this).attr('class').replace('cube ', '').replace('color-', '').charAt(0).toUpperCase();
	           		var id = $(this).attr('id').replace('cube-', '');
	           		var top = $(this).css('top').replace('px', '');
	           		var left = $(this).css('left').replace('px', '');
	           		var zed = $(this).css('z-index');
	           		
	           		html_text += color + '.' + id + '.' + top + '.' + left + '.' + zed + '|';
	        	}
	        );
	        
	        $("#cubes_text").val(escape(html_text));
		}
		
		function mouseMoved(event)
		{
			if(event.pageY > 100)
			{
				selector.target.x = gridPosition(event.pageX, event.pageY).x;
				selector.target.y = gridPosition(event.pageX, event.pageY).y;
				
				update();
			}
		}
		
		function colorClicked(event)
		{
			$('.cube-preview').removeClass('color-' + color_active);
			color_active = $(event.target).attr('id').replace('color-button-', '');
			$('nav .color-nav.active').removeClass('active');
			$(event.target).addClass('active');
			
			//$('.cube-preview').css({backgroundImage: 'url(images/cube-' + color_active + '.png)'});
			$('.cube-preview').addClass('color-' + color_active);
			$('#selector').css({backgroundPosition: '0 0', marginTop: 15});
			
		}
		
		function modeClicked(event)
		{
			$('nav .mode.active').removeClass('active');
			$(event.target).addClass('active');
			mode = $(event.target).attr('id').replace('mode-', '');
			
			cubePreviewRemove();
			
			if(mode === 'delete')
			{
				$('#selector').css({backgroundPosition: '0 -8px', marginTop: 7});
			}
			
			else
			{
				$('#selector').css({backgroundPosition: '0 0', marginTop: 15});
			}
			
			if(mode === 'wall')
			{
				cube_preview = [];
				
				$('#wall-sliders').show();
			}
			
			else
			{
				$('#wall-sliders').hide();
			}
		}
		
		function clicked(event)
		{
			if(event.pageY > 100)
			{
				if(mode === 'single-block' && !shift_pressed)
				{
					cubeAdd('solid');
				}
				
				if(mode === 'wall' && !shift_pressed)
				{
					wallSave();
				}
				
				if(mode === 'delete')
				{
					cubeRemove();
				}
				
				update();
			}
		}
		
		function dragStart($event, $object)
		{
			if(shift_pressed)
			{
				$('body').append('<div id="dragged"></div>');
				var width = $object.deltaX;
				var height = $object.deltaY;
				var x = $object.startX;
				var y = $object.startY;
				
				if($object.deltaX < 0)
				{
					width =  $object.deltaX;
					x = $object.startX + $object.deltaX
				}
				
				if($object.deltaY < 0)
				{
					height = $object.deltaY;
					y = $object.startY + $object.deltaY
				}
				
				$('#dragged').css({left: x, top: y, width: width, height: height});			
				$('#dragged').css({position: 'absolute', background: 'rgba(0, 0, 0, 0.2)'});
			}
		}
		
		function dragged($event, $object)
		{
			if($event.shiftKey)
			{
				var width = $object.deltaX;
				var height = $object.deltaY;
				var x = $object.startX;
				var y = $object.startY;
				
				if($object.deltaX < 0)
				{
					width = $object.deltaX * -1;
					x = $object.startX + $object.deltaX
				}
				
				if($object.deltaY < 0)
				{
					height = $object.deltaY * -1;
					y = $object.startY + $object.deltaY
				}
				
				$('#dragged').css({left: x, top: y, width: width, height: height});
			}
		}
		
		function dragEnd($event, $object)
		{
			if($event.shiftKey)
			{
				$('#dragged').remove();
			}
		}
		
		function mouseWheeled($event, $delta)
		{
			if(mode === 'wall' && $event.pageY > 60)
			{
				//console.log($event);
				var code = ($event.keyCode ? $event.keyCode : $event.which);
				//console.log(code);
				
 				if(code == 51)
 				{
 					//console.log('1 Pressed');
				}
			}
		}
		
		function update()
		{
			if(
				selector.x != selector.target.x ||
				selector.y != selector.target.y
			)
			{
				selector.x += (selector.target.x - selector.x);
				selector.y += (selector.target.y - selector.y);
				
				if(mode === 'delete')
				{
					cubeHover();
					//opacity();
				}
				
				else
				{
					cubePreview();
				}
				
				if(mode === 'single-block' || mode === 'wall')
				{
					$('#selector').css({top: selector.y + (cube_size.height / 2) , left: selector.x - (cube_size.height / 2)});
				}
				
				else if(mode === 'delete')
				{
					$('#selector').css({top: selector.y + (cube_size.height / 2) , left: selector.x - (cube_size.height / 2)});
				}				
			}
			
			if(mode === 'delete')
			{
				
			}
			
			cubeCount();
						
			zIndex();
		}
		
		function cubeCount()
		{
			var count = getCubes().length;
			var text_1 = '';
			var text_2 = ' cubes';
			
			if(count > 40)
			{
				text_1 = "that's just ";
			}
			
			if(count > 80)
			{
				text_1 = "not bad. that's ";
			}
			
			if(count > 120)
			{
				text_1 = "good. that's ";
			}
			
			if(count > 160)
			{
				text_1 = "WOW. ";
			}
			
			if(count > 200)
			{
				text_1 = "amazing. ";
				text_2 = " cubes. that's a lot."
			}
			
			if(count > 240)
			{
				text_1 = "";
				text_2 = " cubes. maybe slow down a little..."
			}
			
			if(count > 280)
			{
				text_1 = "OMFG. ";
				text_2 = " cubes. It's time to stop, don't you think?"
			}
			
			if(count > 320)
			{
				text_1 = "";
				text_2 = " cubes. I AM SERIOUS, MAN! THIS IS TOO MUCH. STOP IT."
			}
			
			if(count > 360)
			{
				text_1 = "";
				text_2 = " cubes. NOOOOOOOooooo..."
			}
			
			$('#cube-count').text(text_1 + count + text_2);
		}
		
		function zIndex()
		{
			cubes.sort(function(a, b){return (a.position.x, a.position.y + a.position.z) - (b.position.x, b.position.y + b.position.z);});
			
			for (var i = 0; i < cubes.length; i++)
			{
				var cube = cubes[i];
				cube.z_index = i + cube.position.z;
				
				$('#cube-' + cube.id).css({zIndex: i});
			}
		}
		
		function cubeAdd($type, $position, $undo)
		{
			var index = cube_index;
			var color = color_active;
			var position = {x: selector.x, y: selector.y, z: gridZ(selector.x, selector.y)};
			var cube = {id: index, color: color, position: position, type: $type};
			
			if($position !== undefined)
			{
				position = $position;
				cube = {id: index, color: color, position: position, type: $type};
			}
			
			cubes[cubes.length] = cube;
			
			$('#cubes').append('<div class="cube" id="cube-' + index + '"></div>');
			$('#cube-' + index).addClass('color-' + color);
			$('#cube-' + index).css({top: position.y + (-cube_size.height * position.z), left: position.x});
			
			if($type == 'preview')
			{
				$('#cube-' + index).addClass('cube-preview');
				$('#cube-' + index).css({opacity: 0.5});
			}
			
			else
			{
				if($undo !== 'undo')
				{
					actionAdd(cube, 'add');
				}
			}
						
			cube_index++;
			
			if(mode === 'single-block')
			{
				cubePreview();
			}
			
			update();
		}
		
		function wallSave()
		{
			if(mode === 'wall')
			{
				for(var i = 0; i < cubes_preview.length; i++)
				{
					cubeAdd('solid', cubes_preview[i].position);
				}
				
				cubePreviewRemove();
				cubePreview();
			}
		}
		
		function cubeRemove()
		{
			var removed;
			
			if(cubeHover() !== -1)
			{								
				for(var i = 0; i < cubes.length; i++)
				{
					if(cubes[i].id == cubeHover())
					{
						removed = cubes[i]
					}
				}
			
				cubeRemoveSingle(removed);
			}
			
			else
			{
				console.log('empty. nothing to remove here.');
			}
			
			cubeHover();
		}
		
		function cubeRemoveSingle($cube, $undo)
		{				
			if($cube !== undefined)
			{
				if($undo !== 'undo')
				{
					actionAdd($cube, 'delete');
				}
				
				var index = cubes.length;
						
				for(var i = 0; i < cubes.length; i++)
				{
					var cube = cubes[i];
					
					if(cube.id === $cube.id)
					{
						var index = i;
					}
				}
				
				$('#cube-' + $cube.id).remove();
				cubes.splice(index, 1);
				
				var cubes_shown = getCubes();
				
				for(var i = 0; i < cubes_shown.length; i++)
				{
					var cube = cubes_shown[i];
								
					if(
						cube.position.x === $cube.position.x &&
						cube.position.y === $cube.position.y &&
						cube.position.z !== 0
					)
					{
						if(cube.position.z > $cube.position.z)
						{
							cube.position.z--;
							$('#cube-' + cube.id).css({top: cube.position.y + (-cube_size.height * cube.position.z), left: cube.position.x});
						}
					}
				}
			}	
		}
		
		function cubePreview()
		{
			if(mode === 'single-block')
			{			
				if($('.cube-preview').length !== 1)
				{
					cubePreviewRemove();					
					cubes_preview[cubes_preview.length] = {id: cube_index, color: color_active, position: {x: selector.x, y: selector.y}, type: 'preview', offset: {right: 0, top: 0, back: 0}};
					cubeAdd('preview');
				}
				
				for(var i = 0; i < cubes_preview.length; i++)
				{
					var cube = cubes_preview[i];
					
					cube.position.x = selector.x;
					cube.position.y = selector.y;
					cube.position.z = gridZ(selector.x, selector.y);
					$('#cube-' + cube.id).css({left: cube.position.x, top: cube.position.y + (-cube_size.height * cube.position.z)});
					$('#cube-' + cube.id).css({backgroundImage: 'url(images/blocks.png)'});
					//$('#cube-' + cube.id).css({backgroundImage: 'url(images/cube-' + color_active + '.png)'});
				}
			}
			
			else if(mode === 'wall')
			{
				var preview_size = {};
				preview_size.width = Number($('#value-width').text().replace('width: ', ''));
				preview_size.height = 1;
				preview_size.depth = Number($('#value-depth').text().replace('depth: ', ''));
				
				if($('.cube-preview').length !== preview_size.width * preview_size.height * preview_size.depth)
				{	
					cubePreviewRemove();
									
					var index = cubes_preview.length;
					var cube_new = {};
					var offsets = [];
					
					for(var i = 0; i < preview_size.width; i++)
					{							
						for(var j = 0; j < preview_size.height; j++)
						{				
							for(var k = 0; k < preview_size.depth; k++)
							{
								offsets[offsets.length] = {right: i, top: j, back: k};
							}
						}
					}
					
					for(var i = 0; i < offsets.length; i++)
					{
						var offset = offsets[i];
						var cube_new = cubeOffsetPosition({x: selector.x, y: selector.y}, offset);
						
						cubes_preview[index] = {id: cube_index, color: color_active, position: cube_new, type: 'preview', offset: offset};						
						cubeAdd('preview', cube_new);
						index++;
					}
				}

					// ! gf: make sure not all blocks get y+1 but only the ones above another stack of cubes.
					for(var i = 0; i < cubes_preview.length; i++)
					{
						var cube = cubes_preview[i];					
						cube.position = cubeOffsetPosition({x: selector.x, y: selector.y}, cube.offset, getCubes());
						//cube.position.z = gridPreviewZ(cube, cubes_preview);
						cube.position.z += gridPreviewZ(cube, getCubes());
						$('#cube-' + cube.id).css({left: cube.position.x, top: cube.position.y + (-cube_size.height * cube.position.z)});
					}
				
			}
		}
		
		function cubeOffsetPosition($position, $offset, $cubes)
		{
			return_value = $position;
			
			if($cubes === undefined)
			{
				$cubes = getCubes();
			}
			
			if($offset.right > 0)
			{				
				return_value.x += cube_size.height * $offset.right;
				return_value.y += cube_size.height * $offset.right / 2;
			}
			
			if($offset.back > 0)
			{				
				return_value.x += cube_size.height * $offset.back;
				return_value.y -= cube_size.height * $offset.back / 2;
			}
			
			return_value.z = $offset.top;
			
			return return_value;
		}
				
		function cubePreviewRemove()
		{
			cubes_preview = [];
			$('.cube-preview').remove();
			
			for(var i = 0; i < cubes.length; i++)
			{
				var cube = cubes[i];
				
				if(cube.type == 'preview')
				{
					cubes.splice(i, 1);
				}
			}
		}
		
		function loop()
		{
			if(animation)
			{
				update();
				requestAnimFrame(loop);
			}
		}
		
		function gridPosition(mouseX, mouseY)
		{
			var grid_x = (Math.round((mouseX - cube_size.width)/ cube_size.height) * cube_size.height) - cube_size.height;
			var grid_y = Math.round((mouseY - cube_size.height) / cube_size.height) * cube_size.height;
			
			if((grid_x / cube_size.height) % 2 == 0)
			{
				grid_y += (cube_size.height / 2);
			}
			
			return {x: grid_x, y: grid_y};
		}
		
		function gridZ($grid_x, $grid_y, $cubes)
		{			
			var return_value = 0;
			
			if($cubes === undefined)
			{
				$cubes = cubes;
			}
			
			var count = 0;
			
			for(var i = 0; i < $cubes.length; i++)
			{
				var cube = $cubes[i];
							
				if(
					cube.position.x == $grid_x && 
					cube.position.y == $grid_y
				)
				{
					return_value++;
				}
			}
			
			return return_value;
		}
		
		//function gridZ($grid_x, $grid_y, $cubes)
		function gridPreviewZ($cube, $cubes)
		{			
			var return_value = 0;			
			
			if($cubes === undefined)
			{
				$cubes = getCubes();
			}
			
			for(var i = 0; i < $cubes.length; i++)
			{
				var cube = $cubes[i];
										
				if(
					cube.position.x === $cube.position.x && 
					cube.position.y === $cube.position.y 
				)
				{
					return_value++;
				}		
			}		
			
			return return_value;
		}
				
		function cubeHover()
		{
			var return_value = -1;
			var cubes_hovered = [];
			
			for(var i = 0; i < cubes.length; i++)
			{
				var cube = cubes[i];
				
				if(
					selector.x == cube.position.x &&
					selector.y == cube.position.y + (-cube_size.height * cube.position.z)
				)
				{
					cubes_hovered[cubes_hovered.length] = cube;
				}
				
				else
				{
					$('#cube-' + cube.id).removeClass('active');
				}
			}
			
			if(cubes_hovered.length > 0)
			{
				if(cubes_hovered.length > 2)
				{
					cubes_hovered.sort(
						function(a, b)
						{
							return (a.position.x, a.position.y + a.position.z) - (b.position.x, b.position.y + b.position.z);
						}
					);
				}
							
				cube = cubes_hovered[cubes_hovered.length - 1];
				$('#cube-' + cube.id).addClass('active');
				return_value = cube.id;
			}
			
			return return_value;
		}
		
		function getCubes()
		{
			var return_value = [];
			
			for(var i = 0; i < cubes.length; i++)
			{
				var cube = cubes[i];
				
				if(cube.type !== 'preview')
				{
					return_value[return_value.length] = cube;
				}
			}
			
			return return_value;
		}
		
		function map_range(value, low1, high1, low2, high2)
		{
    		return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
		}
		
		function opacity()
		{
			for (var i = 0; i < cubes.length; i++)
			{
				var cube = cubes[i];
				
				$('#cube-' + cube.id).css({opacity: map_range(cube.position.y, 100, $(window).height(), 0.6, 1)});
			}
		}
	}
);
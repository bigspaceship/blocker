$( document ).ready(
	function()
	{
		function init()
		{
			

			sketchesLoad();
		}

		function sketchesLoad()
		{
			$.ajax(
				{
					dataType: 'json',
					url: 'api.php?action=get-all-sketch-meta',
					success: sketchIDsLoaded
				}
			);
		}

		function sketchIDsLoaded( $data )
		{
			for ( var i = 0; i < $data.length; i++ )
			{
				listAddItem( $data[i], i );
			}

			listAddTitle();
			listAddTextEdit();
		}

		function sketchDelete( $id )
		{
			if ( $( '#sketch-' + $id ).length )
			{
				$.ajax(
					{
						dataType: 'json',
						url: 'api.php?action=sketch-delete&value=' + $id,
						success: sketchDeleted
					}
				);
			}
		}

		function sketchDeleted( $id )
		{
			if ( $( '#sketch-' + $id ).length )
			{
				$( '#sketch-' + $id ).slideUp(
					function()
					{
						$( this ).remove();
					}
				);
			}	
		}

		function sketchAccept( $id )
		{
			if ( $( '#sketch-' + $id ).length )
			{
				$.ajax(
					{
						dataType: 'json',
						url: 'api.php?action=sketch-accept&value=' + $id,
						success: sketchAccepted
					}
				);
			}
		}

		function sketchAccepted( $id )
		{
			$( '#sketch-' + $id )
				.addClass( 'sketch-accepted' )
				.removeClass( 'sketch-not-moderated' )
				.addClass( 'sketch-moderated' )
				.appendTo( '.sketches-old' );

			$( '.sketch-list' ).tsort( '.date', { order: 'desc' } );
		}

		function sketchDecline( $id )
		{
			if ( $( '#sketch-' + $id ).length )
			{
				$.ajax(
					{
						dataType: 'json',
						url: 'api.php?action=sketch-decline&value=' + $id,
						success: sketchDeclined
					}
				);
			}
		}

		function sketchDeclined( $id )
		{
			$( '#sketch-' + $id )
				.removeClass( 'sketch-accepted' )
				.removeClass( 'sketch-not-moderated' )
				.addClass( 'sketch-moderated' )
				.appendTo( '.sketches-old' );

			$( '.sketch-list' ).tsort( '.date', { order: 'desc' } );
		}

		function sketchPreview( $id )
		{
			window.open( 'preview.php?id=' + $id );
		}

		function sketchEdit( $id )
		{
			var sketch = $( '#sketch-' + $id );
			
			if ( ! sketch.hasClass( 'editing' ) )
			{
				sketch
					.addClass( 'editing' )
					.find( '.sketch-name, .sketch-author, .sketch-email, .sketch-twitter, .sketch-website' ).each(
						function()
						{
							var text = $( this ).text();

							if ( text === '-' )
							{
								text = '';
							}

							if (
								$( this ).is( '.sketch-website' ) &&
								text !== ''
							)
							{
								text =  $( this ).find( 'a' ).attr( 'href' );
							}

							$( this ).wrapInner( '<div class="original-text" />' );
							$( this ).append( '<input type="text" value="' + text+ '" />' );
							$( this ).find( '.original-text' ).hide();
							$( this ).find( '.sketch-save' ).addClass( 'active' );	
						}
					);
			}

			else
			{
				sketch
					.removeClass( 'editing' )
					.find( '.sketch-name, .sketch-author, .sketch-email, .sketch-twitter, .sketch-website' ).each(
						function()
						{
							var item = $( this );
							var text = item.find( '.original-text' ).text();

							if ( text == '' )
							{
								text = '-';
							}

							if (
								item.is( '.sketch-website' ) &&
								text !== '-'
							)
							{
								text =  item.find( '.original-text a' ).attr( 'href' );
								item.html( '<a href="' + text + '">' + text + '</a>' );
							}

							else
							{
								item.html( text );
							}
						}
					);
			}			
		}

		function sketchReset( $id )
		{
			var sketch = $( '#sketch-' + $id );

			sketch
				.removeClass( 'editing' )
				.find( '.sketch-name, .sketch-author, .sketch-email, .sketch-twitter, .sketch-website' ).each(
					function()
					{
						var item = $( this );
						var text = item.find( '.original-text' ).text();

						if ( text == '' )
						{
							text = '-';
						}

						if (
							item.is( '.sketch-website' ) && 
							text !== ''
						)
						{
							text =  item.find( '.original-text a' ).attr( 'href' );

							item.html( '<a href="' + text + '">' + text + '</a>' );
						}

						else
						{
							item.html( text );
						}
					}
				);
		}

		function sketchSave( $id )
		{
			var sketch = $( '#sketch-' + $id );
			var update_data = {};

			sketch
				.removeClass( 'editing' )
				.find( '.sketch-name, .sketch-author, .sketch-email, .sketch-twitter, .sketch-website' ).each(
					function()
					{
						var item = $( this );
						var text = item.find( 'input' ).val();

						if ( text === '' )
						{
							text = '-';
						}

						if (
							item.is( '.sketch-website' ) &&
							text !== '-'
						)
						{
							text = item.find( 'a' ).attr( 'href' );
						}

						var key = item.attr( 'class' ).replace( 'sketch-', '' );

						if ( $( this ).find( '.original-text' ).length )
						{
							if ( text != $( this ).find( '.original-text' ).text() )
							{
								update_data[key] = text;
							}
						}						

						if (
							item.is( '.sketch-website' ) &&
							text !== '-'
						)
						{
							item.html( '<a href="' + text + '">' + text.replace( 'http://', '' ).replace( 'www.', '' ) + '</a>' );
						}

						else
						{
							item.html( text );
						}
					}
				);

			sketch.addClass( 'saving' );
			$.post( 'api.php?action=sketch-update&value=' + $id, update_data, sketchSaved );
		}

		function sketchSaved( $id )
		{
			$( '#sketch-' + $id ).removeClass( 'saving' );
		}

		function listAddItem( $item, $index )
		{
			var moderated_class = parseInt( $item.moderated ) > 0 ? 'sketch-moderated' : 'sketch-not-moderated';

			var item_html = '';
				
				if ( $item.accepted == 1 )
				{
					item_html += '<li class="' + moderated_class + ' sketch-accepted" id="sketch-' + $item.id + '">';		
				}
				
				else
				{
					item_html += '<li class="' + moderated_class + '" id="sketch-' + $item.id + '">';
				}				
								
				if ( $item.name )
				{
					item_html += 	'<p class="sketch-name">' + $item.name + '</p>';
				}

				else
				{
					item_html += 	'<p class="sketch-name">untitled</p>';
				}

				if ( $item.author )
				{	

					item_html += 	'<p class="sketch-author">' + $item.author + '</p>';
				}

				else
				{
					item_html += 	'<p class="sketch-author">-</p>';
				}

				if ( $item.email )
				{	

					item_html += 	'<p class="sketch-email">' + $item.email + '</p>';
				}

				else
				{
					item_html += 	'<p class="sketch-email">-</p>';
				}

				if ( $item.website )
				{
					item_html += 	'<p class="sketch-website"><a href="' + $item.website + '">' + $item.website.replace( 'http://', '' ).replace( 'www.', '' ) + '</a></p>';
				}

				else
				{
					item_html += 	'<p class="sketch-website">-</p>';
				}

				if ( $item.twitter )
				{
					item_html += 	'<p class="sketch-twitter"><a href="http://www.twitter.com/' + $item.twitter + '">' + $item.twitter + '</a></p>';
				}

				else
				{
					item_html += 	'<p class="sketch-twitter">-</p>';
				}

				if ( $item.date )
				{
					item_html += 	'<p class="sketch-date" data-date="' + $item.date + '">' + dateFormat( $item.date ) + '</p>';
				}

				item_html += 	'<p class="sketch-options">';
				item_html += 		'<a href="#" class="sketch-delete"><span>delete</span></a>';
				item_html += 		'<a href="#" class="sketch-accept"><span>accept</span></a>';
				item_html += 		'<a href="#" class="sketch-decline"><span>decline</span></a>';
				item_html += 		'<a href="#" class="sketch-preview"><span>preview</span></a>';
				item_html += 		'<a href="#" class="sketch-save"><span>save</span></a>';
				item_html += 		'<a href="#" class="sketch-edit"><span>edit</span></a>';
				item_html += 		'<a href="#" class="sketch-reset"><span>reset</span></a>';
				item_html += 	'</p>';				
				item_html += '</li>';
			
			if ( parseInt( $item.moderated ) > 0 )
			{
				$( '.sketches-old' ).append( item_html );
			}

			else
			{
				$( '.sketches-new' ).append( item_html );
			}

			
			$( '#sketch-' + $item.id + ' .sketch-options' ).click( optionsClicked );
			$( '.sketch-list' ).tsort( '.date', { order: 'desc' } );
		}

		function listAddTitle()
		{
			var title_html = '';
				title_html += '<li class="title">';
				title_html += 	'<p class="sketch-name">Title</p>';
				title_html += 	'<p class="sketch-author">Author</p>';
				title_html += 	'<p class="sketch-email">Email</p>';
				title_html += 	'<p class="sketch-website">Website</p>';
				title_html += 	'<p class="sketch-twitter">Twitter</p>';
				title_html += 	'<p class="sketch-date">Date</p>';
				title_html += '</li>';

			$( '.sketch-list' ).prepend( title_html );
		}

		function listAddTextEdit()
		{
		//{
		//	$( '.sketch-list > li' ).each(
		//		function( $index, $item )
		//		{
		//			$( this ).find( '.sketch-name' ).click( sketchNameClicked );
		//			$( this ).find( '.sketch-author' ).click( sketchAuthorClicked );
		//			$( this ).find( '.sketch-email' ).click( sketchEmailClicked );
		//			$( this ).find( '.sketch-website, .sketch-website ' ).click( sketchWebsiteClicked );
		//		}
		//	);
		}

		function optionsClicked( $event )
		{
			var target = $( $event.target );

			if ( ! target.is( 'a' ) )
			{
				target = $( $event.target ).closest( 'a' );
			}

			var action = target.attr( 'class' ).replace( 'sketch-', '' );
			var item_id = target.closest( 'li' ).attr( 'id' ).replace( 'sketch-', '' );

			if ( action === 'delete' )
			{
				sketchDelete( item_id );
			}

			if ( action === 'accept' )
			{
				sketchAccept( item_id );
			}

			if ( action === 'decline' )
			{
				sketchDecline( item_id );
			}

			if ( action === 'preview' )
			{
				sketchPreview( item_id );
			}

			if ( action === 'edit' )
			{
				sketchEdit( item_id );
			}

			if ( action === 'reset' )
			{
				sketchReset( item_id );
			}

			if ( action === 'save' )
			{
				sketchSave( item_id );
			}
		}

		function dateFormat( $date )
		{
			return $date.split( ' ' )[0];
		}

		init();
	}
);
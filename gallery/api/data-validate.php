<?php
function dataValidate( $data )
{
	$return_value = array();
	$return_value['valid'] = false;
	$return_value['messages'] = array();

	$json = array();

	if ( isset( $data ) )
	{
		if ( isset( $data['blocks'] ) )
		{
			if ( isset( $data['name'] ) )
			{
				if ( gettype( $data['blocks'] ) != 'array' )
				{
					$data['blocks'] = json_decode( $data['blocks'], true );
				}				

				if ( $data['blocks'] )
				{
					if ( count( $data['blocks'] ) < 3000 )
					{
						date_default_timezone_set( 'America/New_York' );

						$json['name'] = $data['name'];
						$json['blocks'] = $data['blocks'];
						$json['date'] = isset( $data['date'] ) ? date( 'Y-m-d H:i', strtotime( $data['date'] ) ) : date( 'Y-m-d H:i' );
						$json['id'] = date( 'Y-m-d-H-i-s' ) . '_' . slug( $json['name'] );
						
						if ( isset( $data[ 'author' ] ) )
						{
							$json['author'] = $data['author'];
						}

						if (
							isset( $data[ 'email' ] ) &&
							validEmail( $data[ 'email' ] ) 
						)
						{
							$json['email'] = $data['email'];
						}

						if (
							isset( $data[ 'website' ] ) &&
							filter_var( $data[ 'website' ], FILTER_VALIDATE_URL )
						)
						{
							$json['website'] = $data['website'];
						}

						if ( isset( $data[ 'twitter' ] ) )
						{
							preg_match_all( '/@([A-Za-z0-9_]+)/', $data['twitter'], $twitter_handles );

							if (
								isset( $twitter_handles[1] ) &&
								count( $twitter_handles[1] ) > 0
							)
							{
								$json['twitter'] = $twitter_handles[1][0];
							}
						}

						if ( isset( $data['history'] ) )
						{
							if ( gettype( $data['history'] ) != 'array' )
							{
								$data['history'] = json_decode( $data['history'], true );
							}

							if ( count( $data['history'] ) > 3000 )
							{
								$json['history'] = array_slice( $data['history'], 0, 3000 );
								$return_value['messages'][] = 'History was too long. Shortened to 3000 entries';
							}

							else
							{
								$json['history'] = $data['history'];
							}
						}

						$return_value['data'] = $json;
						$return_value['valid'] = true;
					}

					else
					{
						$return_value['messages'][] = 'too many blocks. (uploaded ' . count( $data['blocks'] ) . ' / 3000)';
					}
				}

				else
				{
					$return_value['messages'][] = 'failed decoding blocks from JSON.';	
				}
			}

			else
			{
				$return_value['messages'][] = 'no sketch name provided.';
			}
		}

		else
		{
			$return_value['messages'][] = 'no block data provided.';
		}
	}

	else
	{
		$return_value['messages'][] = 'no data provided.';
	}

	return $return_value;
}
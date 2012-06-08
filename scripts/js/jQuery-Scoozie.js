(function($) {
	$.ScoozyActions = [];
	(function(b) {
		if( b.mozilla ) {
			$.browserPrefix = '-moz-'
		} else if( b.webkit ) {
			$.browserPrefix = '-webkit-'
		} else if( b.opera ) {
			$.browserPrefix = '-o-'
		} else if( b.msie ) {
			$.browserPrefix = '-ms-'
		} else {
			$.browserPrefix = ''
		}
	})($.browser)

	$.fn.Scoozy = function( data ) {
		var $this = $(this),

			curPos = $this.position(),
			curTransformations = $this.css( $.browserPrefix + 'transform' ) || $this.css( 'transform' ),
			values = curTransformations != 'none' ? curTransformations.split('(')[1].split(')')[0].split(',') : 0,
			curTransformations = {
				scale: curTransformations != 'none' ? Math.sqrt(values[0]*values[0] + values[1]*values[1]) : 1,
				rotate: curTransformations != 'none' ? Math.round(Math.atan2( values[1],values[0] ) * (180/Math.PI)) : 0,
				rotate3d: {
					x:0,
					y:0
				},
				opacity: +$this.css('opacity'),
				translate: {
					x: values[4] || 0,
					y: values[5] || 0
				}
			},

			action = $.extend(true,{},{									////////////		ACTION DEFINITIONS
				elem:$this,
				startPos:{
					x:curPos.left,
					y:curPos.top
				},
				endPos:{
					x:curPos.left,
					y:curPos.top
				},
				startTrans: curTransformations,
				endTrans: curTransformations,
				startTime: 0,
				endTime: 1,
				duration:null,
				centerTime:false // need to implement
							// if true, startTime -= (duration / 2)
				/* hide */ // Hides when inactive
			},data);

		$.ScoozyActions.push(action);
		return $this
	}

	function renderAction( a,when ) {
		var map = {},trans = $.browserPrefix + 'transform';

		if( a.changes.indexOf('left') != -1 ) map.left = a[when + 'Pos'].x
		if( a.changes.indexOf('top') != -1 ) map.top = a[when + 'Pos'].y
		if( a.changes.indexOf('rotate') != -1 ) map[trans] = 'scale(' + a[when + 'Trans'].scale + ')'
		if( a.changes.indexOf('scale') != -1 ) map[trans] = map[trans] ? map[trans] + ' rotate(' + a[when + 'Trans'].rotate + 'deg)' : map[trans]
		if( a.changes.indexOf('transX') != -1 || a.changes.indexOf('transX') != -1 )
			map[trans] = map[trans] ? map[trans] +
				' translate(' + a[when + 'Trans'].translate.x + 'px,' + a[when + 'Trans'].translate.y + 'px)' : map[trans]
		if( a.changes.indexOf('opacity') != -1 ) map.opacity = a[when + 'Trans'].opacity

		$(a.elem).css(map)
	}

	function getChanges( a ) {
		var changes = [],
			sT = a.startTrans,
			eT = a.endTrans;

		if( a.startPos.x != a.endPos.x ) changes.push('left')
		if( a.startPos.y != a.endPos.y ) changes.push('top')
		if( sT.scale != eT.scale ) changes.push('scale')
		if( sT.rotate != eT.rotate ) changes.push('rotate')
		if( sT.opacity != eT.opacity ) changes.push('opacity')
		if( sT.translate.x != eT.translate.x ) changes.push('transX')
		if( sT.translate.y != eT.translate.y ) changes.push('transY')

		return changes
	}

	function calculate( map,type,a,time ) {
		var distance,start,calc,
			pre = '',post = '',
			attr = type;

		switch( type ) {
			case 'left':
				start = a.startPos.x;
				distance = a.endPos.x - start;
				break;
			case 'top':
				start = a.startPos.y;
				distance = a.endPos.y - start;
				break;
			case 'rotate':
				start = a.startTrans.rotate;
				distance = a.endTrans.rotate - start;
				attr = $.browserPrefix + 'transform';
				pre = 'rotate(';
				post = 'deg)';
				break;
			case 'scale':
				start = a.startTrans.scale;
				distance = a.endTrans.scale - start;
				attr = $.browserPrefix + 'transform';
				pre = 'scale(';
				post = ')';
				break;
			case 'opacity':
				start = a.startTrans.opacity;
				distance = a.endTrans.opacity - start;
				break;
			case 'transX':
				start = a.startTrans.translate.x;
				distance = a.endTrans.translate.x - start;
				attr = $.browserPrefix + 'transform';
				pre = 'translateX(';
				post = 'px)';
				break;
			case 'transY':
				start = a.startTrans.translate.y;
				distance = a.endTrans.translate.y - start;
				attr = $.browserPrefix + 'transform';
				pre = 'translateY(';
				post = 'px)'
		}
		calc = ((((time - a.startTime) || .00001) / a.duration) * distance) + start;
		calc = pre ? pre + calc + post : calc;

		map[attr] = map[attr] ? map[attr] + ' ' + calc : calc
	}

	$(document).scroll(function(e) {
		if( !$.ScoozyActions ) return false

		var offset = window.pageYOffset,	// page scroll offset
			time = offset/( $('body').height() - W.bh ),
			time = time || .000001; // current time
			wWidth = $(window).width(),
			wHeight = $(window).height();


		function parsePercentages( num, dir ) {
			dir = dir == 'y' ? wHeight : wWidth
			return String(num).replace(/%/,'') / 100 * dir
		}

		$.each( $.ScoozyActions, function(i,v) {
			v.changes = v.changes || getChanges(v);

			if( time < v.startTime ) renderAction( v,'start' )
			else if( time > v.endTime ) renderAction( v,'end' )
			if( time < v.startTime || time > v.endTime ) return true	// if it's not active, continue loop

			var $this = v.elem,map = {};
			v.duration = v.duration || (v.endTime - v.startTime);

			// parse all percentages into pixels
			var p = /%/;
			if( p.test(v.startPos.x) ) v.startPos.x = parsePercentages( v.startPos.x,'x' )
			if( p.test(v.endPos.x) ) v.endPos.x = parsePercentages( v.endPos.x,'x' )
			if( p.test(v.startPos.y) ) v.startPos.y = parsePercentages( v.startPos.y,'y' )
			if( p.test(v.endPos.y) ) v.endPos.y = parsePercentages( v.endPos.y,'y' )


			$.each( v.changes,function(_i,_v) {
				calculate(map,_v,v,time);
			})

			$this.css( map )
		})
	})
})(jQuery)
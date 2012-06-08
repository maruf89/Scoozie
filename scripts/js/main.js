var W = {

}

$(document).ready(function() {
    getWindow(1);
})

function getWindow(i) {
	W.bw = $(window).width();
	W.bh = $(window).height();
	$(window).resize(getWindow);

	if( i === 1 ) init();
}

function init() {
	$('img.top').Scoozy({
		endTime:.4,
		startPos:{x:'-10%',y:'30%'},
		endPos:{x:'30%',y:'40%'}
	}).Scoozy({
		startTime:.1,
		endTime:.3,
		endTrans:{
			opacity:.5,
			rotate:0,
			scale:2
		}
	})

	$('img.mid').Scoozy({
		startTime:.35,
		endTime:.7,
		startPos:{x:'100%'},
		endPos:{x:'30%'},
		endTrans:{
			translate: {
				y:400
			}
		}
	})

	$('img.bot').Scoozy({
		startTime:.55,
		startTrans:{
			rotate:-360,
			opacity:0
		},
		startPos:{x:'30%',y:'100%'},
		endPos:{x:'70%',y:'10%'}
	})

	$(document).trigger('scroll');

	jqmAlert('Scroll Down',2500);
}

function jqmAlert(message,time) {
	time = time || 1200;
    $("<div class='alert rounded bold' id='jqmAlert'>" + message + "</div>")
    .css({ opacity: 0.96 }).appendTo($('body')).delay(time).fadeOut(600,function(){ $(this).remove() })
		.one(W.touch,function() { $(this).remove() });
	$('#jqmAlert').css({ left: (W.bw - $('#jqmAlert').outerWidth()) / 2, top: (W.bh - $('#jqmAlert').outerHeight()) * .5 - 50 })
}

/**
 * WKHTMLTOPDF-RESET
 * 
 * Attempts to make a wkhtmltopdf-friendly page.
 * 
 *		As we only have to work with a single static binary I'm considering hacks to be A-OK
 *		Created for personal use, thus there is some extraneous "design" parts (rather than just layout fixes)
 * 
 * @author	David "oodavid" King
 * @url		github.com/oodavid/wkhtmltopdf-reset
 */

wk = {};
wk.page_sizes = {
	'a4-landscape':	{ width: 900, height: 613 },
	'a4-portrait':	{ width: 613, height: 893 },
};
// Default to landscape
wk.page = wk.page_sizes['a4-landscape'];
//
// Automatically breaks up tables...
//
wk.table = function(){
	// Pull out the height
	var page_height = wk.page.height
	// Find all tables that need fixing
	$('.wk-table').each(function(k,v){
		// Reference the header, note it's height, set the "top" to be the top of the table
		var header			= $(this).find('.header');
		var header_height	= header.height();
		var header_top		= header.position().top;
		// header.find('th:first').html('T:' + header_top + ', H: ' + header_height);
		// Loop the table-rows
		$(this).find('tr').each(function(){
			// We need to know the top and bottom of this element
			var top		= $(this).position().top - header_top;
			var bottom	= top + $(this).height();
			// If it's more than the table height, then insert a header
			if(bottom > page_height){
				header = header.clone();
				header.insertBefore($(this));
				header_top = header.position().top;
				// header.find('th:first').html('T:' + header_top + ', H: ' + header_height);
			}
			// Insert the position...
			/*
			top		= $(this).position().top - header_top;
			bottom	= top + $(this).height();
			$(this).find('td:first').html('T: ' + top + ', B:' + bottom);
			*/
		});
		// Now we manually page-break before each header
		var brk = $('<tr style="display: block; page-break-before: always;"></tr>');
		brk.clone().insertBefore($(this).find('.header'));
	});
};
//
// When yer ready
//		it's wise to use window.load (rather than document.ready) as images will be loaded etc
//
$(window).load(function(e){
	// Figure out the page-size
	var klass = $('body').attr('class');
	if(klass) {
		klass = klass.split(' ');
		if(klass.length > 1) {
			var size = klass[0] + '-' + klass[1];
			if(wk.page_sizes[size]){
				wk.page = wk.page_sizes[size];
			}
		}
	}
	// Trigger the table-fix
	wk.table();
});
//
// Loading a datafile via a cookie parameter
//
wk.loaddatafile = function(success, error){
	// Grab the cookies http://www.quirksmode.org/js/cookies.html#script
	var datafile = readCookie('datafile');
	if(datafile){
		// Load it
		$.ajax({
			url:		datafile,
			dataType:	'json',
			success:	success, 
			error:		error
		});
	} else {
		error(null, 'the cookie "datafile" is not set', null);
	}
};
function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
};
//
// Convert regular paths to an absolute path
//
wk.base = false;
wk.abspath = function(path){
	// Make sure the base is in place
	if(!wk.base && readCookie('base')){
		wk.base = readCookie('base');
	} else {
		wk.base = '';
	}
	// Convert and return
	return wk.base + path;
};
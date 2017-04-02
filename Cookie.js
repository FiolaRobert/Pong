class Cookie
{
	constructor()
	{

	}
	setCookie(cname, cvalue, exdays)
	{
		//console.log("setCookie: "+cname+","+cvalue+","+exdays);
		var d = new Date();
	    d.setTime(d.getTime());
	    var expires = "expires="+ d.toUTCString();
	    var cookieStr=cname+"="+cvalue+";"+expires+";path=/";
	    //console.log(cookieStr);
		document.cookie=cookieStr;
	}

	getCookie(cname) {
	    var name = cname + "=";
	    var decodedCookie = document.cookie;
	    var ca = decodedCookie.split(';');
	    for(var i = 0; i <ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0) == ' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(name) == 0) {
	            return c.substring(name.length, c.length);
	        }
	    }
	    return "";
	}
	deleteCookie(cname)
	{
		//console.log("deleteCookie");
	    this.setCookie(cname, "", -1);
	}
}
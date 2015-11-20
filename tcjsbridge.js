/*
 * 
 * 依赖于 Zepto/JQuery
*/

(function($){
	if (window.TCJsBridge) {
		return;
	};

	var TCJsBridge = window.TCJsBridge = (function(){
		// 发送器
		var senderFrame = document.createElement('iframe');
        senderFrame.id = '__TCJSBridgeIFrame_Sender';
        senderFrame.style.display = 'none';
        document.documentElement.appendChild(senderFrame);
        // 数据通知
        var resultFrame = document.createElement('iframe');
        resultFrame.id = '__TCJSBridgeIFrame_Result';
        resultFrame.style.display = 'none';
        document.documentElement.appendChild(resultFrame);
        // eventsHolder
        $(document.body).append("<div id='__TCJSBridgeDiv_EventsHolder' style='display:none'></div>");

        // 发送队列
        var sendMessageQueue = [];

	    var base64encodechars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	    function base64encode(str) {
	        if (str === undefined) {
	            return str;
	        }

	        var out, i, len;
	        var c1, c2, c3;
	        len = str.length;
	        i = 0;
	        out = "";
	        while (i < len) {
	            c1 = str.charCodeAt(i++) & 0xff;
	            if (i == len) {
	                out += base64encodechars.charAt(c1 >> 2);
	                out += base64encodechars.charAt((c1 & 0x3) << 4);
	                out += "==";
	                break;
	            }
	            c2 = str.charCodeAt(i++);
	            if (i == len) {
	                out += base64encodechars.charAt(c1 >> 2);
	                out += base64encodechars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
	                out += base64encodechars.charAt((c2 & 0xf) << 2);
	                out += "=";
	                break;
	            }
	            c3 = str.charCodeAt(i++);
	            out += base64encodechars.charAt(c1 >> 2);
	            out += base64encodechars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
	            out += base64encodechars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
	            out += base64encodechars.charAt(c3 & 0x3f);
	        }
	        return out;
	    }

	    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	    function base64decode(data) {
	    	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
			ac = 0,
			dec = '',
			tmp_arr = [];

			if (!data) {
				return data;
			}

			data += '';

			do { // unpack four hexets into three octets using index points in b64
				h1 = b64.indexOf(data.charAt(i++));
				h2 = b64.indexOf(data.charAt(i++));
				h3 = b64.indexOf(data.charAt(i++));
				h4 = b64.indexOf(data.charAt(i++));

				bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

				o1 = bits >> 16 & 0xff;
				o2 = bits >> 8 & 0xff;
				o3 = bits & 0xff;

				if (h3 == 64) {
				  tmp_arr[ac++] = String.fromCharCode(o1);
				} else if (h4 == 64) {
				  tmp_arr[ac++] = String.fromCharCode(o1, o2);
				} else {
				  tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
				}
			} while (i < data.length);

			dec = tmp_arr.join('');

			return dec.replace(/\0+$/, '');
	    }

	    var Base64 = {

		// private property
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		// public method for encoding
		encode : function (input) {
		    var output = "";
		    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		    var i = 0;

		    input = Base64._utf8_encode(input);

		    while (i < input.length) {

		        chr1 = input.charCodeAt(i++);
		        chr2 = input.charCodeAt(i++);
		        chr3 = input.charCodeAt(i++);

		        enc1 = chr1 >> 2;
		        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		        enc4 = chr3 & 63;

		        if (isNaN(chr2)) {
		            enc3 = enc4 = 64;
		        } else if (isNaN(chr3)) {
		            enc4 = 64;
		        }

		        output = output +
		        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
		        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		    }

		    return output;
		},

		// public method for decoding
		decode : function (input) {
		    var output = "";
		    var chr1, chr2, chr3;
		    var enc1, enc2, enc3, enc4;
		    var i = 0;

		    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		    while (i < input.length) {

		        enc1 = this._keyStr.indexOf(input.charAt(i++));
		        enc2 = this._keyStr.indexOf(input.charAt(i++));
		        enc3 = this._keyStr.indexOf(input.charAt(i++));
		        enc4 = this._keyStr.indexOf(input.charAt(i++));

		        chr1 = (enc1 << 2) | (enc2 >> 4);
		        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		        chr3 = ((enc3 & 3) << 6) | enc4;

		        output = output + String.fromCharCode(chr1);

		        if (enc3 != 64) {
		            output = output + String.fromCharCode(chr2);
		        }
		        if (enc4 != 64) {
		            output = output + String.fromCharCode(chr3);
		        }

		    }

		    output = Base64._utf8_decode(output);
		    return output;

		},

		// private method for UTF-8 encoding
		_utf8_encode : function (string) {
		    string = string.replace(/\r\n/g,"\n");
		    var utftext = "";

		    for (var n = 0; n < string.length; n++) {

		        var c = string.charCodeAt(n);

		        if (c < 128) {
		            utftext += String.fromCharCode(c);
		        }
		        else if((c > 127) && (c < 2048)) {
		            utftext += String.fromCharCode((c >> 6) | 192);
		            utftext += String.fromCharCode((c & 63) | 128);
		        }
		        else {
		            utftext += String.fromCharCode((c >> 12) | 224);
		            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
		            utftext += String.fromCharCode((c & 63) | 128);
		        }

		    }

		    return utftext;
		},

		// private method for UTF-8 decoding
		_utf8_decode : function (utftext) {
		    var string = "";
		    var i = 0;
		    var c = c1 = c2 = 0;

		    while ( i < utftext.length ) {

		        c = utftext.charCodeAt(i);

		        if (c < 128) {
		            string += String.fromCharCode(c);
		            i++;
		        }
		        else if((c > 191) && (c < 224)) {
		            c2 = utftext.charCodeAt(i+1);
		            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
		            i += 2;
		        }
		        else {
		            c2 = utftext.charCodeAt(i+1);
		            c3 = utftext.charCodeAt(i+2);
		            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
		            i += 3;
		        }

		    }

		    return string;
		}

		}

	    function _setResultValue(scene, result) {
	        if (result === undefined) {
	            result = 'dummy';
	        }
	        resultFrame.src = 'tcapp://result.to.app/' + scene + '&' + base64encode(encodeURIComponent(result));
	    }

	    var jsBridge = {};
	    jsBridge.sendToApp = function(msg) {
	    	sendMessageQueue.push(msg);
	    	senderFrame.src = "tcapp://message.for.app";
	    };
	    jsBridge.fetchMessages = function() {
	    	var messageQueueString = JSON.stringify(sendMessageQueue);

        	sendMessageQueue = [];
        	_setResultValue('fetchMessages', messageQueueString);

        	$('#tcapp_debugger').append('<p>' + messageQueueString + '</p>');
        	return messageQueueString;
	    };
	    jsBridge.sendToWeb = function(msg) { // msg 为 base64encode 过的 JSON.stringify 字符串
	    	try {
	    		var json = $.parseJSON(Base64.decode(msg));
	    		$('#__TCJSBridgeDiv_EventsHolder').trigger('message_from_app', json);
		    }catch(e){
		    	console.log('sendToWeb msg error : ', e);
		    	alert('sendToWeb msg error : ' + e.message);
		    }
	    };
	    jsBridge.on = function(event, callback) {
		    $(document).on(event, '#__TCJSBridgeDiv_EventsHolder', callback);
	    };
	    jsBridge.off = function(event, callback) {
	    	$(document).off(event, '#__TCJSBridgeDiv_EventsHolder', callback);
	    };

	    return jsBridge;
	})();
	
})(Zepto||JQuery);

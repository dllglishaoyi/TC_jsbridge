# TC_jsbridge
a native javascirpt bridge

##Useage
###in javascript

TCJsBridge.sendToApp({action:'XXX',data:''});

TCJsBridge.on('message_from_app', function(evt, msg) {
   
});

###in native(JAVA)

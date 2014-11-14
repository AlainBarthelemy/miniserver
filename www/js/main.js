var socket;



$( document ).ready(function() {
  
		$("#name-textfield").keypress(function(e) {
				if(e.which == 13) {
						 initSocket();
						 $("#name-textfield").fadeOut();
				}
		});
		
});

function initSocket(){
	
	socket = io();
	
	// send our name when the connection is ok
	socket.on('connect', function (data) {
			socket.emit('setName',$("#name-textfield").val());
	});
	
	// a listener for the blabla
	socket.on('message',function(data){
		console.log(data);
	});
}
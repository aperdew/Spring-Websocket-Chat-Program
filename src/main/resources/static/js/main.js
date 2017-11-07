'use strict';

var usernamePage = $('#username-page');
var roomSelectionPage = $('#room-selection-page');
var chatPage = $('#chat-page');
var usernameForm = $('#usernameForm');
var messageForm = $('#messageForm');
var messageInput = $('#message');
var messageArea = $('#messageArea');
var connectingElement = $('.connecting');

var stompClient = null;
var username = null;
var roomId =-1;
var socket =null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

var roomList=[];
var currentRoom={};
var currentRoomIndex;

roomSelectionPage.hide();
chatPage.hide();

chatPage.css("height",$(window).height());
roomSelectionPage.css("height",$(window).height());

function login(event) {
    username = $("#name").val().trim();
    console.log("working");

    if(username) {

        usernamePage.hide();
        roomSelectionPage.show();
        getChatRooms();

        
    }
}

function selectRoom(roomNumber){
	currentRoomIndex=getRoomIndex(roomNumber)
	currentRoom=roomList[currentRoomIndex];
	console.log("connecting to roomIndex: "+currentRoomIndex);
	roomId = currentRoom.id;	
	roomSelectionPage.hide();
	$(".chat-header").text(currentRoom.topic);
	$.ajax({
		type:"GET",
		url:"GetMessages/"+currentRoomIndex,
	}).then(function(data){
		data.forEach(function(message){
			processMessage(message);
		});
		chatPage.show();
		connect();
	});	
}

function backToRoomSelection(){
	 stompClient.send("/app/chat.addUser/"+roomId+"/"+currentRoomIndex,
		        {},
		        JSON.stringify({sender: username, type: 'LEAVE'})
		    )
	stompClient.disconnect();
	messageArea.empty();
	messageInput.val("");
	roomId=-1;
	chatPage.hide();
	roomSelectionPage.show()
	getChatRooms();
}

function connect(event){
	//roomId = roomNumber;
	if(roomId != -1){
		console.log("before connect["+roomId+"]");
		socket = new SockJS('/ws');
	    stompClient = Stomp.over(socket);

	    stompClient.connect({}, onConnected, onError);
	}
}


function onConnected() {
	console.log("["+roomId+"]");
    // Subscribe to the Public Channel
    stompClient.subscribe('/channel/'+roomId, onMessageReceived);
    // Tell your username to the server
    stompClient.send("/app/chat.addUser/"+roomId+"/"+currentRoomIndex,
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.hide();
}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.val().trim();

    if(messageContent && stompClient) {
    	var date = new Date();
    	var currentTime = date.toLocaleTimeString();
        var chatMessage = {
            sender: username,
            content: messageInput.val(),
            type: 'CHAT',
            time: currentTime
            
        };
        stompClient.send("/app/chat.sendMessage/"+roomId+"/"+currentRoomIndex, {}, JSON.stringify(chatMessage));
        messageInput.val("");
    }
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);  
    processMessage(message);
}

function processMessage(message){
	var messageElement = document.createElement('li');
    if(message.type === 'JOIN') {
    	message.content = message.sender + ' joined!';
    	messageArea.append(`
    		<li class="text-center ChatPage--EventMessageContainer">
    			<p class="ChatPage--EventMessage">${message.content}</p>
    		</li>`);        
    } else if (message.type === 'LEAVE') {
    	message.content = message.sender + ' left!';
    	messageArea.append(`
    		<li class="text-center ChatPage--EventMessageContainer">
    			<p class="ChatPage--EventMessage">${message.content}</p>
    		</li>`);
    } else {
    	var backgroundColor = getAvatarColor(message.sender);
    	messageArea.append(`
    			<li class="chat-message ChatPage--MessageContainer">
    				<i style="background-color: ${backgroundColor}" class="ChatPage--AvatarIcon">${message.sender[0]}</i>
					<div class="ChatPage--ContentContainer">
						<div class="ChatPage--InnerContentContainer">
	    					<span class="ChatPage--Username">${message.sender}</span>    				
	    					<p class="ChatPage--Message">${message.content}</p>
    					</div>
    					<p class="ChatPage--MessageTime">${message.time}</p>
					</div>
    			</li>`);
    }
    
    $('#messageArea')[0].scrollTop = $('#messageArea')[0].scrollHeight;
}

function getChatRooms(){
	$(".roomList").empty();
	roomList =[];
	$.get("GetRooms",function(data){
		console.log(data);
		if(data !=null){
			data.forEach(function(item){
				roomList.push(item);
				$(".roomList").append(`
					<button class="btn btn-default" onclick="selectRoom(${item.id})">${item.topic}</button>
				`);
			});	
		}
	});
}


function addRoom(){
	var topic = $(".topicInput").val();
	$(".topicInput").val("");
	$.ajax({
		type:"POST",
		url:"AddRoom",
		data:{topic: topic},
	}).then(function(){
		$('#newRoomModal').modal('toggle');
		getChatRooms();
	});
}

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

function getRoomIndex(id){
	var index =-1;
	for(var i =0; i<roomList.length; i++){
		if(roomList[i].id == id){
			index = i;
		}
	}
	console.log(roomList[index]);
	return index;
}

$("#messageForm").bind("keypress", function(e) {
	   if (e.keyCode == 13) {
		   sendMessage();
		   return false;
	   }
});

$("form").bind("keypress", function(e) {
	   if (e.keyCode == 13) {
	     return false;
	   }
});





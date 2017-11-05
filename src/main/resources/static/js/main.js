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

        
    }
}

function selectRoom(roomNumber){
	roomId = roomNumber;	
	roomSelectionPage.hide();
	chatPage.show();
	connect();
}

function backToRoomSelection(){
	stompClient.disconnect();
	messageArea.empty();
	messageInput.val("");
	roomId=-1;
	chatPage.hide();
	roomSelectionPage.show()
}

function connect(event){
	//roomId = roomNumber;
	if(roomId != -1){
		console.log("before connect["+roomId+"]");
		socket = new SockJS('/ws');
	    stompClient = Stomp.over(socket);

	    stompClient.connect({}, onConnected, onError);
	}
	
    event.preventDefault();
}


function onConnected() {
	console.log("["+roomId+"]");
    // Subscribe to the Public Channel
    stompClient.subscribe('/channel/'+roomId, onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser/"+roomId,
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
        var chatMessage = {
            sender: username,
            content: messageInput.val(),
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage/"+roomId, {}, JSON.stringify(chatMessage));
        messageInput.val("");
    }
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    
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
    				<span class="ChatPage--Username">${message.sender}</span>
    				<p class="ChatPage--Message">${message.content}</p>
    			</li>`);
    }
    
    $('#messageArea')[0].scrollTop = $('#messageArea')[0].scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
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





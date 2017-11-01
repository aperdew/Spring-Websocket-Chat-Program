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

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

roomSelectionPage.hide();
chatPage.hide();

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

function connect(event){
	//roomId = roomNumber;
	if(roomId != -1){
		console.log("before connect["+roomId+"]");
		var socket = new SockJS('/ws');
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
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    
    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.append(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.append(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.append(usernameText);
        messageElement.append(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.append(messageText);

    messageElement.appendChild(textElement);

    messageArea.append(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}



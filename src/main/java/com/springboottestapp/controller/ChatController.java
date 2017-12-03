package com.springboottestapp.controller;

import com.springboottestapp.model.ChatMessage;
import com.springboottestapp.model.ChatRoom;

import java.util.ArrayList;
import java.util.List;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
public class ChatController {
	

	private List<ChatRoom> listOfRooms = new ArrayList<ChatRoom>();

    @MessageMapping("/chat.sendMessage/{roomId}/{currentRoomIndex}")
    @SendTo("/channel/{roomId}")
    public ChatMessage sendMessage(@DestinationVariable int roomId,@DestinationVariable int currentRoomIndex,
    		@Payload ChatMessage chatMessage) {
    	addToMessageList(chatMessage, currentRoomIndex);
        return chatMessage;
    }

    @MessageMapping("/chat.addUser/{roomId}/{currentRoomIndex}")
    @SendTo("/channel/{roomId}")
    public ChatMessage addUser(@DestinationVariable int roomId,@DestinationVariable int currentRoomIndex,
    		@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        //addToMessageList(chatMessage, currentRoomIndex);
        System.out.println("working");
        return chatMessage;
    }
    
    @RequestMapping(value="/GetRooms",method=RequestMethod.GET)
    @ResponseBody
    public List<ChatRoom> getRooms(){
    	/*ChatRoom room1 = new ChatRoom("Stacks");
    	room1.setId(1);
    	listOfRooms.add(room1);
    	ChatRoom room2 = new ChatRoom("Queues");
    	room2.setId(2);
    	listOfRooms.add(room2);*/
    	return listOfRooms;
    }
    
    @RequestMapping(value="/AddRoom", method=RequestMethod.POST)
    @ResponseBody
    public void addRoom(@RequestParam String topic){
    	ChatRoom newChatRoom = new ChatRoom(topic);
    	newChatRoom.setId(listOfRooms.size());
    	listOfRooms.add(newChatRoom);
    }
    
    @RequestMapping(value="/GetMessages/{currentRoomIndex}",method=RequestMethod.GET)
    @ResponseBody
    public List<ChatMessage> getMessages(@PathVariable int currentRoomIndex){
    	List<ChatMessage> listOfMessages = new ArrayList<ChatMessage>();
    	listOfMessages = listOfRooms.get(currentRoomIndex).getListOfMessages();
    	return listOfMessages;
    }
    
    
    
    public void addToMessageList(ChatMessage chatMessage, int currentRoomIndex){
    	List<ChatMessage> messageList = new ArrayList<ChatMessage>();
    	messageList = listOfRooms.get(currentRoomIndex).getListOfMessages();
    	messageList.add(chatMessage);
    	listOfRooms.get(currentRoomIndex).setListOfMessages(messageList);
    }

}

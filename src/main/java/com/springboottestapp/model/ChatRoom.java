package com.springboottestapp.model;

import java.util.ArrayList;
import java.util.List;

public class ChatRoom {
	private String topic ="";
	private int numOfUsers =0;
	private List<ChatMessage> listOfMessages = new ArrayList<ChatMessage>();
	private int id =-1;
	
	public ChatRoom(String topic){
		setTopic(topic);
	}
	
	public String getTopic(){
		return topic;
	}
	
	public void setTopic(String topic){
		this.topic =topic;
	}
	
	public int getNumOfUsers() {
		return numOfUsers;
	}

	public void setNumOfUsers(int numOfUsers) {
		this.numOfUsers = numOfUsers;
	}

	public List<ChatMessage> getListOfMessages() {
		return listOfMessages;
	}

	public void setListOfMessages(List<ChatMessage> listOfMessages) {
		this.listOfMessages = listOfMessages;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	
}

package com.springboottestapp.sql;

import java.util.List;

import com.springboottestapp.accessor.Accessor;
import com.springboottestapp.model.ChatRoom;



public class SQLStatements {
	private Accessor accessor = new Accessor();
	
	public List<ChatRoom> create(String topic){
		String sqlStatement = "insert into chatrooms(topic) values('"+topic+"');";
		accessor.access(sqlStatement);
		return getAll();
	}
	
	public List<ChatRoom> getAll(){
		String sqlStatement = "select * from chatrooms;";
		List<ChatRoom> listOfChatRooms = accessor.access(sqlStatement);
		return listOfChatRooms;
	}
	public void update(int id){
		String sqlStatement = "update chatrooms where id ="+id+";";
		accessor.access(sqlStatement);
	}
}



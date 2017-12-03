package com.springboottestapp.accessor;

import java.sql.Connection;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.springboottestapp.model.ChatRoom;

public class Accessor {
	private static final long serialVersionUID = 1L;
	static String             url              = "jdbc:mysql://aaronperdew.ddns.net:3306/chatroom";
	static String             user             = "aperdew";
	static String             password         = "Ap161009";
	static Connection         connection       = null;
	
	public List<ChatRoom> access(String sqlStatement){
		int id = -1;
		String topic ="";
		List<ChatRoom> listOfChatRooms = new ArrayList<ChatRoom>();
		
		try {
	    	  Class.forName("com.mysql.jdbc.Driver");
	      } catch (ClassNotFoundException e) {
	    	  e.printStackTrace();
	      }
    		connection = null;
	      try {
	         connection = DriverManager.getConnection(url, user, password);
	      } catch (SQLException e) {
	    	  System.out.print("Bad URL");
	         e.printStackTrace();
	      }
	      if (connection != null) {
	      } else {
	         System.out.println("Failed to make connection!");
	      }
	      try {
	         String selectSQL = sqlStatement;
	         		
	         PreparedStatement preparedStatement = connection.prepareStatement(selectSQL);
	         ResultSet rs = preparedStatement.executeQuery();
	         while (rs.next()) {
	        	ChatRoom chatroom = new ChatRoom(rs.getString("topic"));	        	
	        	chatroom.setId(rs.getInt(id));
	        	listOfChatRooms.add(chatroom);
	         }
	      } catch (SQLException e) {
		         e.printStackTrace();
	      }
		
		return listOfChatRooms;
	}

}

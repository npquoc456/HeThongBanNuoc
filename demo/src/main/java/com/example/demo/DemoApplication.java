package com.example.demo;

import org.springframework.boot.autoconfigure.SpringBootApplication;

import javafx.application.Application; // <-- Dòng này đã được thêm vào

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		Application.launch(MainApp.class, args);
	}

}

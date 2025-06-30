package com.dermaCare.customerService.service;

public interface FirebaseMessagingService {
	
	public String sendPushNotification(String fcmToken, String title, String body);

}

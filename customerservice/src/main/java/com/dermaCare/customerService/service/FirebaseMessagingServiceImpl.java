package com.dermaCare.customerService.service;

import org.springframework.stereotype.Service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

@Service
public class FirebaseMessagingServiceImpl implements FirebaseMessagingService  {
	
	public String sendPushNotification(String fcmToken, String title, String body) {
        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        Message message = Message.builder()
                .setToken(fcmToken)
                .setNotification(notification)
                .build();

        try {
            return FirebaseMessaging.getInstance().send(message);
        } catch (FirebaseMessagingException e) {
            e.printStackTrace();
            return "Failed to send FCM message";
        }
    }


}

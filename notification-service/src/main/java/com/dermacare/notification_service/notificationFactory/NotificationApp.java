package com.dermacare.notification_service.notificationFactory;

import org.springframework.stereotype.Service;

import com.dermacare.notification_service.entity.Booking;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

@Service
public class NotificationApp implements SendAppNotification{

	@Override
	public String sendPushAppNotification(String token , String title, String body) {
		 Message message = Message.builder()
		            .setToken(token)
		            .setNotification(Notification.builder()
		                .setTitle(title)
		                .setBody(body)
		                .build())
		            .build();

		        try {
		            String response = FirebaseMessaging.getInstance().send(message);
		            return response;
		        } catch (FirebaseMessagingException e) {
		            throw new RuntimeException("FCM send failed", e);
		        }
		    }
	

}

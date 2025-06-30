package com.dermacare.notification_service.notificationFactory;

public interface SendAppNotification {

	public String sendPushAppNotification(String token , String title, String body);
}

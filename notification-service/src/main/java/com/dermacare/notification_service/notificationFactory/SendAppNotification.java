package com.dermacare.notification_service.notificationFactory;

public interface SendAppNotification {

public void sendPushNotification(String deviceToken, String title, String body, String type, String screen, String sound);

}

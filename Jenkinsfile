pipeline {
  agent any

  environment {
    REMOTE_HOST = '13.233.9.23'             // ✅ Replace with your actual Lightsail IP
    SSH_CRED_ID = 'lightsail-ssh'            // ✅ Your Jenkins SSH credentials ID
    APP_DIR = 'dermacare-app'                // ✅ Root app folder on Lightsail
  }

  stages {
    stage('Pull Code to Lightsail') {
      steps {
        sshagent (credentials: [SSH_CRED_ID]) {
          sh """
            scp -o StrictHostKeyChecking=no -r * ubuntu@${REMOTE_HOST}:~/${APP_DIR}
          """
        }
      }
    }

    stage('Copy Secret JSON Files') {
      steps {
        sshagent (credentials: [SSH_CRED_ID]) {
          sh """
            # ✅ Copy firebase-key.json to notification-service
            scp -o StrictHostKeyChecking=no /home/spandana/jenkins-secrets/firebase-key.json \\
              ubuntu@${REMOTE_HOST}:~/${APP_DIR}/notification-service/src/main/resources/

            # ✅ Copy dermacare.json to customerservice
            scp -o StrictHostKeyChecking=no /home/spandana/jenkins-secrets/dermacare.json \\
              ubuntu@${REMOTE_HOST}:~/${APP_DIR}/customerservice/src/main/resources/
          """
        }
      }
    }

    stage('Build & Restart Docker Containers') {
      steps {
        sshagent (credentials: [SSH_CRED_ID]) {
          sh """
            ssh -o StrictHostKeyChecking=no ubuntu@${REMOTE_HOST} '
              cd ~/${APP_DIR} &&
              docker-compose down &&
              docker-compose build &&
              docker-compose up -d
            '
          """
        }
      }
    }
  }

  post {
    success {
      echo '✅ Deployment Completed Successfully!'
    }
    failure {
      echo '❌ Deployment Failed!'
    }
  }
}

pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    docker run --rm \
                    -v "$WORKSPACE:/app" \
                    -w /app \
                    node:22-alpine \
                    npm ci
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    docker run --rm \
                    -v "$WORKSPACE:/app" \
                    -w /app \
                    node:22-alpine \
                    npm test
                '''
            }
        }
    }
}
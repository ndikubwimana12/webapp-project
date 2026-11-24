
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
                    --volumes-from jenkins \
                    -w "$WORKSPACE" \
                    node:22-alpine \
                    npm ci
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    docker run --rm \
                    --volumes-from jenkins \
                    -w "$WORKSPACE" \
                    node:22-alpine \
                    npm test
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t webapp-project:latest .'
            }
        }

        stage('Deploy Container') {
            steps {
                sh '''
                    docker rm -f webapp-container || true
                    docker run -d \
                        --name webapp-container \
                        --restart unless-stopped \
                        -p 3000:3000 \
                        webapp-project:latest
                '''
            }
        }
    }
}

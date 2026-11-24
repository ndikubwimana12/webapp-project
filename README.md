# Practical DevOps Activity

## Project Overview

This project demonstrates a complete DevOps workflow using a Node.js web application.

The activity covers project management, version control, collaboration, containerization, continuous integration, continuous deployment, and Kubernetes orchestration.

### Technologies Used

- Jira – Agile project management
- Git – Version control
- GitHub – Source code hosting and collaboration
- Node.js – Application runtime
- Express.js – Backend framework
- Docker – Application containerization
- Jenkins – CI/CD automation
- Kubernetes – Container orchestration
- GitHub Actions – Automated testing
- Ubuntu on WSL – Development environment

---

# Q1. Create a Jira Scrum Project

1. Sign in to Jira.
2. Create a new project.
3. Select the Scrum project template.
4. Choose a project name, such as `Web Application Project`.
5. Create the project.

### Create Jira Issues

Create the following issues:

| Issue type | Example summary |
|---|---|
| Story | Develop a web application |
| Task | Configure the development environment |
| Bug | Fix application errors |

Record the project key because it will be used when linking Git commits to Jira.

---

# Q2. Create and Start a Sprint

1. Open the Jira Scrum project.
2. Navigate to the Backlog.
3. Create a sprint.
4. Add at least three issues to the sprint.
5. Start the sprint.
6. Open the Active Sprint board.
7. Verify that the sprint and its issues are visible.

---

# Q3. Initialize a Git Repository

Open the Ubuntu terminal and create the project directory.

```bash
mkdir webapp-project
cd webapp-project
```

Initialize Git:

```bash
git init -b main
```

Create the application files and directories.

```bash
mkdir public tests
touch server.js
touch public/index.html
touch public/login.html
touch public/register.html
touch public/dashboard.html
```

Add the project files:

```bash
git add .
```

Create the initial commit:

```bash
git commit -m "Initial commit"
```

Verify the repository:

```bash
git status
git log --oneline
```

---

# Q4. Create a Feature Branch and Merge It

Create and switch to the feature branch:

```bash
git switch -c feature-login
```

Create the login page:

```bash
nano public/login.html
```

Add the login page HTML and save the file.

Stage and commit the changes:

```bash
git add public/login.html
git commit -m "Create login page"
```

Switch back to the main branch:

```bash
git switch main
```

Merge the feature branch:

```bash
git merge feature-login
```

Verify the branches and commits:

```bash
git branch
git log --oneline --graph --all
```

---

# Q5. Create a GitHub Pull Request

1. Create a GitHub repository named `webapp-project`.
2. Connect your local repository to GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/webapp-project.git
```

3. Push the main branch:

```bash
git push -u origin main
```

4. Push the feature branch:

```bash
git push -u origin feature-login
```

5. Open the GitHub repository.
6. Select Pull Requests.
7. Click New Pull Request.
8. Select:
   - Base: `main`
   - Compare: `feature-login`
9. Create the pull request.
10. Review the changes and check the files.
11. Merge the pull request.

Verify the updated main branch locally:

```bash
git switch main
git pull origin main
```

---

# Q6. Integrate GitHub with Jira

1. Open Jira.
2. Navigate to the administration or application integration settings.
3. Locate the GitHub integration.
4. Connect the GitHub account and authorize access.
5. Link the GitHub repository to the Jira project if required.

### Reference Jira Issues in Git Commits

Use your actual Jira project key and issue number in commit messages.

Example:

```bash
git add .
git commit -m "WEB-1 Implement login functionality"
git push origin main
```

Replace `WEB-1` with an actual issue key from your Jira project.

Check the Jira issue to verify that the development activity is linked.

---

# Q7. Build and Run the Node.js Application Using Docker

## 7.1 Create the Node.js Application

Initialize the Node.js project:

```bash
npm init -y
```

Install Express:

```bash
npm install express
```

Install the test dependencies if they are not already configured. This project uses Node.js's built-in test runner, so no additional test package is required.

## 7.2 Configure package.json

Ensure the scripts section contains:

```json
"scripts": {
  "start": "node server.js",
  "test": "node --test"
}
```

Keep Express in the dependencies section.

## 7.3 Create the Dockerfile

Create the file:

```bash
nano Dockerfile
```

Add:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

Save the file.

## 7.4 Create .dockerignore

```bash
nano .dockerignore
```

Add:

```text
node_modules
.git
.env
```

## 7.5 Build the Docker Image

```bash
docker build -t webapp-project:latest .
```

Verify the image:

```bash
docker images
```

## 7.6 Run the Container

```bash
docker run -d \
  --name webapp-container \
  --restart unless-stopped \
  -p 3000:3000 \
  webapp-project:latest
```

Check the container:

```bash
docker ps
```

Test the application:

```bash
curl -I http://localhost:3000
```

Open:

http://localhost:3000

Useful Docker commands:

```bash
docker logs webapp-container
docker stop webapp-container
docker start webapp-container
docker rm -f webapp-container
```

---

# Q8. Configure Jenkins Continuous Integration

## 8.1 Run Jenkins with Docker

Example Jenkins container configuration:

```bash
docker run -d \
  --name jenkins \
  --restart unless-stopped \
  -p 8082:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins-docker:lts
```

This command assumes that the custom `jenkins-docker:lts` image has already been built with Docker CLI and Docker Compose CLI installed.

If Jenkins is already running, do not create another container with the same name.

Open:

http://localhost:8082

## 8.2 Allow Jenkins to Access Docker

On the Docker Desktop/WSL setup used in this project, the Docker socket group ID was 106.

Configure the Jenkins user:

```bash
docker exec -u root jenkins sh -c 'getent group 106 >/dev/null || groupadd -g 106 docker; usermod -aG 106 jenkins'
```

Restart Jenkins:

```bash
docker restart jenkins
```

Verify Docker access:

```bash
docker exec jenkins docker ps
```

## 8.3 Create Tests

Create the test directory:

```bash
mkdir -p tests
nano tests/app.test.js
```

The application test file should contain tests for the homepage and health endpoint.

Example:

```javascript
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../server');

test('Homepage should load successfully', async () => {
  const server = app.listen(0);

  try {
    const port = server.address().port;

    const response = await fetch(`http://localhost:${port}/`);

    assert.strictEqual(response.status, 200);
  } finally {
    server.close();
  }
});

test('Health API should return OK', async () => {
  const server = app.listen(0);

  try {
    const port = server.address().port;

    const response = await fetch(`http://localhost:${port}/api/health`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.status, 'OK');
  } finally {
    server.close();
  }
});
```

The application must export its Express app from `server.js` so the tests can import it.

## 8.4 Create Jenkinsfile

Create:

```bash
nano Jenkinsfile
```

Use:

```groovy
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
                    --user "$(id -u):$(id -g)" \
                    --env HOME="$WORKSPACE" \
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
                    --user "$(id -u):$(id -g)" \
                    --env HOME="$WORKSPACE" \
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
```

**Important:** This pipeline assumes the Jenkins container is named `jenkins`, has Docker CLI access, and the workspace is accessible through `--volumes-from jenkins`.

The `--user` option prevents root-owned files from being created in the Jenkins workspace.

## 8.5 Configure the Jenkins Pipeline Job

1. Open Jenkins.
2. Select New Item.
3. Enter `webapp-project-pipeline`.
4. Select Pipeline.
5. Open Configure.
6. Under Pipeline, select Pipeline script from SCM.
7. Select Git.
8. Enter your GitHub repository URL.
9. Set the branch to:

```text
*/main
```

10. Set Script Path to:

```text
Jenkinsfile
```

11. Save the job.
12. Click Build Now.
13. Open Console Output.

Verify that the build ends with:

```text
Finished: SUCCESS
```

## 8.6 Verify Deployment

```bash
docker ps --filter name=webapp-container
curl -I http://localhost:3000
```

---

# Q9. Automate Docker Deployment with Jenkins

The Docker build and deployment stages are already included in the Jenkinsfile created in Q8.

The pipeline performs these operations automatically:

1. Checks out the latest code.
2. Installs Node.js dependencies.
3. Runs application tests.
4. Builds the Docker image.
5. Removes the previous application container.
6. Starts the new container.

Run the pipeline from Jenkins using Build Now.

Verify:

```bash
docker images
docker ps --filter name=webapp-container
curl -I http://localhost:3000
```

The expected HTTP response is:

```text
HTTP/1.1 200 OK
```

---

# Q10. Deploy the Application to Kubernetes

## 10.1 Verify Kubernetes

Ensure Docker Desktop Kubernetes is enabled.

Check the cluster:

```bash
kubectl get nodes
```

Check existing deployments and services:

```bash
kubectl get deployments
kubectl get services
```

## 10.2 Create the Kubernetes Configuration

Create a directory:

```bash
mkdir -p k8s
```

Create the configuration:

```bash
nano k8s/deployment.yaml
```

Add:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
        - name: webapp
          image: webapp-project:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  type: NodePort
  selector:
    app: webapp
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30090
```

## 10.3 Apply the Configuration

```bash
kubectl apply -f k8s/deployment.yaml
```

## 10.4 Verify Deployment and Pods

```bash
kubectl get deployments
kubectl get pods
kubectl get services
```

Check the deployment status:

```bash
kubectl rollout status deployment/webapp-deployment
```

## 10.5 Test the Application

Open:

http://localhost:30090

The Kubernetes Service exposes the application through NodePort `30090`.

Useful commands:

```bash
kubectl describe deployment webapp-deployment
kubectl describe service webapp-service
kubectl logs deployment/webapp-deployment
kubectl get events --sort-by=.metadata.creationTimestamp
```

To remove only the resources created for this application:

```bash
kubectl delete -f k8s/deployment.yaml
```

---

# Q11. Configure GitHub Actions Continuous Integration

## 11.1 Create the Workflow Directory

```bash
mkdir -p .github/workflows
```

## 11.2 Create the Workflow File

```bash
nano .github/workflows/ci.yml
```

Add:

```yaml
name: Node.js CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

Save the file.

## 11.3 Commit and Push the Workflow

```bash
git add .github/workflows/ci.yml
git commit -m "Add GitHub Actions CI workflow"
git push origin main
```

If GitHub rejects the push because the token lacks permission to create workflow files, update the token permissions.

For a classic Personal Access Token, enable the `workflow` scope. For a fine-grained token, grant the required Actions repository permission.

## 11.4 Verify GitHub Actions

1. Open the GitHub repository.
2. Select Actions.
3. Open the latest Node.js CI workflow run.
4. Check the test job.
5. Confirm that it completes successfully.

GitHub Actions should run automatically on pushes to `main` and pull requests targeting `main`.

---

# Git and Repository Maintenance

## Check Repository Status

```bash
git status
git branch
git remote -v
git log --oneline --graph --all
```

## Pull Latest Changes

```bash
git pull --ff-only origin main
```

## Commit and Push New Changes

```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

Use meaningful commit messages and reference Jira issue keys where applicable.

## .gitignore

Create or update `.gitignore`:

```bash
nano .gitignore
```

Add:

```text
node_modules/
.env
```

Do not commit `node_modules`, secrets, or environment files.

If `node_modules` was previously tracked, remove it from Git tracking:

```bash
git rm -r --cached node_modules
git add .gitignore
git commit -m "Stop tracking node_modules"
git push origin main
```

This removes the directory from Git tracking without deleting your local dependencies.

---

# Important Troubleshooting

## 1. Jenkins Cannot Access Docker

Check:

```bash
docker exec jenkins docker ps
```

If permission is denied, verify the socket:

```bash
ls -l /var/run/docker.sock
```

Check the Jenkins user's groups:

```bash
docker exec jenkins id
```

On the Docker Desktop setup used in this project, the Docker socket group ID was 106. If that is still the socket's group ID, configure Jenkins as described in Q8 and restart it.

## 2. Jenkins Cannot Check Out Git Files

If Jenkins reports:

```text
unable to unlink old node_modules/... Permission denied
```

First ensure `node_modules` is no longer tracked:

```bash
git ls-files node_modules
```

The command should return no tracked files.

Then repair Jenkins workspace ownership:

```bash
docker exec -u root jenkins chown -R jenkins:jenkins /var/jenkins_home/workspace
```

Retry the Jenkins pipeline.

## 3. npm ci Reports Missing package-lock.json

Ensure both files exist:

```bash
ls -l package.json package-lock.json
```

If the lock file is missing, generate it:

```bash
npm install --package-lock-only
```

Commit the lock file:

```bash
git add package.json package-lock.json
git commit -m "Add npm lock file"
git push origin main
```

## 4. Docker Container Is Not Running

Check:

```bash
docker ps -a
docker logs webapp-container
```

If the container needs to be recreated:

```bash
docker rm -f webapp-container
docker build -t webapp-project:latest .
docker run -d \
  --name webapp-container \
  --restart unless-stopped \
  -p 3000:3000 \
  webapp-project:latest
```

## 5. Kubernetes Pods Are Not Starting

Check:

```bash
kubectl get pods
kubectl describe pods
kubectl get events --sort-by=.metadata.creationTimestamp
```

Make sure the Docker image exists in the Docker Desktop environment:

```bash
docker images
```

If you build a new image, reapply the deployment:

```bash
docker build -t webapp-project:latest .
kubectl rollout restart deployment/webapp-deployment
kubectl rollout status deployment/webapp-deployment
```

## 6. GitHub Rejects a Workflow Push

If GitHub reports that the token lacks `workflow` scope, update the Personal Access Token permissions before pushing again.

Never share your token or commit it to the repository.

---

# Final Project Verification Checklist

- [ ] Q1: Jira Scrum project created with Story, Task, and Bug.
- [ ] Q2: Sprint created, populated, and started.
- [ ] Q3: Git repository initialized and initial commit created.
- [ ] Q4: Feature branch created and merged into main.
- [ ] Q5: GitHub Pull Request reviewed and merged.
- [ ] Q6: GitHub integrated with Jira and commits linked to issues.
- [ ] Q7: Node.js application containerized and running with Docker.
- [ ] Q8: Jenkins pipeline checks out code, installs dependencies, and runs tests.
- [ ] Q9: Jenkins automatically builds and deploys the Docker container.
- [ ] Q10: Kubernetes Deployment and Service created and verified.
- [ ] Q11: GitHub Actions workflow runs tests successfully.

---

# Conclusion

This project demonstrates the practical use of DevOps tools across the software development lifecycle.

The workflow connects Jira project management, Git version control, GitHub collaboration, Docker containerization, Jenkins automation, Kubernetes orchestration, and GitHub Actions continuous integration.

**Application endpoints:**

| Service | Address |
|---|---|
| Node.js application | http://localhost:3000 |
| Jenkins | http://localhost:8082 |
| Kubernetes application | http://localhost:30090 |
| GitHub Actions | Repository → Actions |

**Repository:** `https://github.com/YOUR_USERNAME/webapp-project`

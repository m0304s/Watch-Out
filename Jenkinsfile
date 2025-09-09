pipeline{
    agent any

    environment {
        // --- ⚙️ 공통 설정 변수 ---
        GITLAB_URL         = "https://lab.ssafy.com"
        CERT_PATH          = "/etc/letsencrypt/live/j13e102.p.ssafy.io"
        
        // --- 🐳 백엔드 설정 변수 ---
        BE_IMAGE_NAME      = "watchout/backend-app"
        BE_TEST_CONTAINER  = "watchout-be-test"
        BE_PROD_BLUE_CONTAINER  = "watchout-be-prod-blue"
        BE_PROD_GREEN_CONTAINER = "watchout-be-prod-green"
        
        // --- ⚛️ 프론트엔드 설정 변수 ---
        FE_IMAGE_NAME      = "watchout/frontend-app"
        FE_TEST_CONTAINER  = "watchout-fe-test"
        FE_PROD_CONTAINER  = "watchout-fe-prod"
        
        // --- 🔄 리버스 프록시(Edge) 설정 변수 ---
        REVERSE_PROXY_IMAGE_NAME = "watchout/edge-proxy"
        REVERSE_PROXY_TEST_CONTAINER = "watchout-edge-test"
        REVERSE_PROXY_PROD_CONTAINER = "watchout-edge-prod"
        REVERSE_PROXY_TEST_PORT = "8080"
        REVERSE_PROXY_TEST_SSL_PORT = "8443"
        REVERSE_PROXY_PROD_PORT = "80"
        REVERSE_PROXY_PROD_SSL_PORT = "443"

        // --- 🌐 네트워크 설정 변수 ---
        TEST_NETWORK       = "test-network"
        PROD_NETWORK       = "prod-network"
        
        // --- 🔧 Jenkins 설정 변수 ---
        JENKINS_CONTAINER  = "jenkins"
    }
    
    stages {
        stage('Process Webhook Data') {
            steps {
                script {
                    echo "✅ Webhook triggered successfully!"
                    echo "----------------------------------"
                    echo "MR URL         : ${env.MR_URL}"
                    echo "Source Branch  : ${env.SOURCE_BRANCH}"
                    echo "Target Branch  : ${env.TARGET_BRANCH}"
                    echo "MR State       : ${env.MR_STATE}"
                    echo "Triggered by   : ${env.USER_NAME}"
                    echo "----------------------------------"
                }
            }
        }

        stage('Run PR-Agent Review') {
            when { expression { env.MR_STATE == 'opened' } }
            steps {
                script {
                    echo "🤖 Starting PR-Agent for MR: ${env.MR_URL}"
                    withCredentials([
                        string(credentialsId: 'GITLAB_ACCESS_TOKEN', variable: 'GITLAB_TOKEN'),
                        string(credentialsId: 'gemini-api-key', variable: 'GEMINI_KEY')
                    ]) {
                        sh """
                            docker run --rm \\
                                -e CONFIG__GIT_PROVIDER="gitlab" \\
                                -e GITLAB__URL="${GITLAB_URL}" \\
                                -e GITLAB__PERSONAL_ACCESS_TOKEN="${GITLAB_TOKEN}" \\
                                -e GEMINI_API_KEY="${GEMINI_KEY}" \\
                                -e CONFIG__MODEL_PROVIDER=google \\
                                -e CONFIG__MODEL="gemini/gemini-1.5-pro-latest" \\
                                -e CONFIG__FALLBACK_MODELS="[]" \\
                                -e PR_REVIEWER__EXTRA_INSTRUCTIONS="한국어로 간결하게 코멘트하고, 중요 이슈 위주로 지적해줘" \\
                                codiumai/pr-agent:latest \\
                                --pr_url "${MR_URL}" review
                        """
                    }
                }
            }
        }

        stage('Check for Changes') {
            when { expression { env.MR_STATE == 'merged' } }
            steps {
                script {
                    env.DO_BACKEND_BUILD = false
                    env.DO_FRONTEND_BUILD = false
                    env.DO_EDGE_CONFIG_CHANGE = false

                    def changedFiles = sh(script: "git diff --name-only origin/${env.TARGET_BRANCH}...origin/${env.SOURCE_BRANCH}", returnStdout: true).trim()
                    echo "Changed files in MR:\n${changedFiles}"

                    if (changedFiles.contains('backend-repo/')) {
                        echo "✅ Changes detected in backend-repo."
                        env.DO_BACKEND_BUILD = true
                    }
                    if (changedFiles.contains('frontend-repo/')) {
                        echo "✅ Changes detected in frontend-repo."
                        env.DO_FRONTEND_BUILD = true
                    }
                    if (changedFiles.contains('docker/edge/')) {
                        echo "✅ Changes detected in edge proxy configuration."
                        env.DO_EDGE_CONFIG_CHANGE = true
                    }
                }
            }
        }

        stage('Prepare Networks') {
            when { expression { env.MR_STATE == 'merged' } }
            steps {
                sh "docker network create ${TEST_NETWORK} || true && docker network create ${PROD_NETWORK} || true"
            }
        }

        stage('Connect Jenkins to Networks') {
            when { expression { env.MR_STATE == 'merged' } }
            steps {
                sh "docker network connect ${TEST_NETWORK} ${JENKINS_CONTAINER} || true && docker network connect ${PROD_NETWORK} ${JENKINS_CONTAINER} || true"
            }
        }

        stage('Deploy or Reload Edge Proxy') {
             when {
                allOf {
                    expression { env.DO_BACKEND_BUILD == 'true' || env.DO_FRONTEND_BUILD == 'true' || env.DO_EDGE_CONFIG_CHANGE == 'true' }
                    expression { env.MR_STATE == 'merged' }
                }
            }
            steps {
                script {
                    def isProd = (env.TARGET_BRANCH == 'master')
                    def proxy_tag = isProd ? "${REVERSE_PROXY_IMAGE_NAME}:prod-${BUILD_NUMBER}" : "${REVERSE_PROXY_IMAGE_NAME}:test-${BUILD_NUMBER}"
                    def proxyContainerName = isProd ? REVERSE_PROXY_PROD_CONTAINER : REVERSE_PROXY_TEST_CONTAINER
                    def envType = isProd ? "prod" : "test"
                    def httpPort = isProd ? REVERSE_PROXY_PROD_PORT : REVERSE_PROXY_TEST_PORT
                    def httpsPort = isProd ? REVERSE_PROXY_PROD_SSL_PORT : REVERSE_PROXY_TEST_SSL_PORT
                    def networkName = isProd ? PROD_NETWORK : TEST_NETWORK

                    echo "🐳 Building Edge Proxy image: ${proxy_tag}"
                    sh "docker build -t ${proxy_tag} --build-arg ENV=${envType} -f ./docker/edge/Dockerfile ."

                    def isRunning = sh(script: "docker ps -q --filter name=${proxyContainerName}", returnStdout: true).trim()
                    if (isRunning) {
                        echo "✅ Edge container is running. Reloading Nginx configuration..."
                        sh "docker cp ./docker/edge/nginx/${envType}.conf ${proxyContainerName}:/etc/nginx/nginx.conf"
                        sh "docker exec ${proxyContainerName} nginx -s reload"
                    } else {
                        echo "🚀 Edge container not found. Creating a new one..."
                        sh """
                            docker run -d --name ${proxyContainerName} --network ${networkName} \\
                                -p ${httpPort}:80 \\
                                -p ${httpsPort}:${httpsPort} \\
                                -v ${CERT_PATH}/fullchain.pem:/etc/nginx/certs/fullchain.pem:ro \\
                                -v ${CERT_PATH}/privkey.pem:/etc/nginx/certs/privkey.pem:ro \\
                                ${proxy_tag}
                        """
                    }
                }
            }
        }

        stage('Deploy Backend') {
            when {
                allOf {
                    expression { env.DO_BACKEND_BUILD == 'true' }
                    expression { env.MR_STATE == 'merged' }
                }
            }
            steps {
                dir('backend-repo') {
                    script {
                        if (env.TARGET_BRANCH == 'develop') {
                            def tag = "${BE_IMAGE_NAME}:test-${BUILD_NUMBER}"
                            echo "✅ Target is 'develop'. Deploying Backend to TEST environment..."
                            withCredentials([
                                file(credentialsId: 'application-docker.yml', variable: 'APP_YML_DOCKER'),
                                file(credentialsId: 'application.yml', variable: 'APP_YML')
                            ]) {
                                sh "mkdir -p src/main/resources && cp \$APP_YML src/main/resources/application.yml && cp \$APP_YML_DOCKER src/main/resources/application-docker.yml"
                            }
                            echo "🐳 Building TEST image: ${tag}"
                            sh "chmod +x ./gradlew && ./gradlew bootJar && docker build -t ${tag} ."
                            echo "🚀 Running TEST container: ${BE_TEST_CONTAINER}"
                            sh """
                                docker rm -f ${BE_TEST_CONTAINER} || true
                                docker run -d --name ${BE_TEST_CONTAINER} --network ${TEST_NETWORK} -e SPRING_PROFILES_ACTIVE=docker ${tag}
                            """
                        } else if (env.TARGET_BRANCH == 'master') {
                            def tag = "${BE_IMAGE_NAME}:prod-${BUILD_NUMBER}"
                            echo "✅ Target is 'master'. Deploying Backend to PRODUCTION with Blue/Green..."
                            def activeContainer = sh(script: "docker ps -q --filter name=${BE_PROD_BLUE_CONTAINER}", returnStdout: true).trim() ? BE_PROD_BLUE_CONTAINER : BE_PROD_GREEN_CONTAINER
                            def inactiveContainer = (activeContainer == BE_PROD_BLUE_CONTAINER) ? BE_PROD_GREEN_CONTAINER : BE_PROD_BLUE_CONTAINER
                            echo "Current Active: ${activeContainer}, Deploying to Inactive: ${inactiveContainer}"
                            withCredentials([
                                file(credentialsId: 'application-docker-prod.yml', variable: 'APP_YML_DOCKER_PROD'),
                                file(credentialsId: 'application-prod.yml', variable: 'APP_YML_PROD')
                            ]) {
                                sh "mkdir -p src/main/resources && cp \$APP_YML_PROD src/main/resources/application.yml && cp \$APP_YML_DOCKER_PROD src/main/resources/application-docker.yml"
                            }
                            echo "🐳 Building PROD image: ${tag}"
                            sh "chmod +x ./gradlew && ./gradlew bootJar && docker build -t ${tag} ."
                            echo "🚀 Running new PROD container: ${inactiveContainer}"
                            sh """
                                docker rm -f ${inactiveContainer} || true
                                docker run -d --name ${inactiveContainer} --network ${PROD_NETWORK} -e SPRING_PROFILES_ACTIVE=docker,prod ${tag}
                            """
                            echo "🔍 Health checking for 30 seconds..."
                            sleep(30)
                            echo "🛑 Stopping old container: ${activeContainer}"
                            sh "docker rm -f ${activeContainer} || true"
                            echo "✅ Production switched to ${inactiveContainer}"
                        }
                    }
                }
            }
        }

        stage('Deploy Frontend') {
            when {
                allOf {
                    expression { env.DO_FRONTEND_BUILD == 'true' }
                    expression { env.MR_STATE == 'merged' }
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'VITE_API_BASE_URL_TEST', variable: 'API_URL_TEST'),
                    string(credentialsId: 'VITE_API_BASE_URL_PROD', variable: 'API_URL_PROD')
                ]) {
                    script {
                        if (env.TARGET_BRANCH == 'develop') {
                            env.FINAL_API_URL = API_URL_TEST
                            def fe_tag = "${FE_IMAGE_NAME}:test-${BUILD_NUMBER}"
                            echo "✅ Target is 'develop'. Deploying Frontend to TEST env..."
                            echo "Building Frontend image..."
                            dir('frontend-repo') {
                                sh "docker build -t ${fe_tag} --build-arg ENV=test --build-arg VITE_API_BASE_URL='${env.FINAL_API_URL}' ."
                            }
                            echo "Running TEST Frontend container..."
                            sh "docker rm -f ${FE_TEST_CONTAINER} || true"
                            sh "docker run -d --name ${FE_TEST_CONTAINER} --network ${TEST_NETWORK} ${fe_tag}"
                        } else if (env.TARGET_BRANCH == 'master') {
                            env.FINAL_API_URL = API_URL_PROD
                            def fe_tag = "${FE_IMAGE_NAME}:prod-${BUILD_NUMBER}"
                            echo "✅ Target is 'master'. Deploying Frontend to PROD env..."
                            echo "Building Frontend image..."
                            dir('frontend-repo') {
                                sh "docker build -t ${fe_tag} --build-arg ENV=prod --build-arg VITE_API_BASE_URL='${env.FINAL_API_URL}' ."
                            }
                            echo "Running PROD Frontend container..."
                            sh "docker rm -f ${FE_PROD_CONTAINER} || true"
                            sh "docker run -d --name ${FE_PROD_CONTAINER} --network ${PROD_NETWORK} ${fe_tag}"
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo "📦 Pipeline finished with status: ${currentBuild.currentResult}"
        }
    }
}
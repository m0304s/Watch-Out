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

        FE_TEST_PORT       = "8080"
        FE_TEST_SSL_PORT   = "8443"
        FE_PROD_PORT       = "80"
        FE_PROD_SSL_PORT   = "443"

        // --- 🌐 네트워크 설정 변수 ---
        TEST_NETWORK       = "test-network"
        PROD_NETWORK       = "prod-network"
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
                    
                    if (env.MR_STATE == 'opened') {
                        echo "➡️ A new Merge Request has been opened."
                    } else if (env.MR_STATE == 'merged') {
                        echo "✅ The Merge Request has been merged."
                    } else if (env.MR_STATE == 'closed') {
                        echo "❌ The Merge Request has been closed without merging."
                    } else if (env.MR_STATE == null) {
                        echo "⚠️ This build was likely triggered manually, not by a webhook."
                    } else {
                        echo "ℹ️ MR status updated to: ${env.MR_STATE}"
                    }
                }
            }
        }

        stage('Check for Changes') {
            steps {
                script {
                    env.DO_BACKEND_BUILD = false
                    env.DO_FRONTEND_BUILD = false

                    // MR의 소스 브랜치와 타겟 브랜치 간의 변경 파일 목록을 가져옴
                    def changedFiles = sh(
                        script: "git diff --name-only origin/${env.TARGET_BRANCH}...origin/${env.SOURCE_BRANCH}",
                        returnStdout: true
                    ).trim()

                    echo "Changed files:\n${changedFiles}"

                    if (changedFiles.contains('backend-repo/')) {
                        echo "✅ Changes detected in backend-repo."
                        env.DO_BACKEND_BUILD = true
                    }
                    if (changedFiles.contains('frontend-repo/')) {
                        echo "✅ Changes detected in frontend-repo."
                        env.DO_FRONTEND_BUILD = true
                    }
                }
            }
        }

        stage('Deploy Frontend') {
            // frontend-repo 폴더에 변경이 있을 때만 이 스테이지를 실행
            when { expression { env.DO_FRONTEND_BUILD == 'true' } }
            steps {
                dir('frontend-repo') {
                    script {
                        // Target Branch가 develop일 경우 (테스트 환경 배포)
                        if (env.TARGET_BRANCH == 'develop') {
                            def tag = "${FE_IMAGE_NAME}:test-${BUILD_NUMBER}"
                            echo "✅ Target is 'develop'. Deploying to TEST environment..."
                            echo "🐳 Building TEST image: ${tag}"

                            sh """
                                docker build \\
                                    --build-arg ENV=test \\
                                    --build-arg VITE_API_BASE_URL="${env.VITE_API_BASE_URL}" \\
                                    -t ${tag} .
                            """

                            echo "🚀 Running TEST container: ${FE_TEST_CONTAINER}"
                            sh """
                                docker rm -f ${FE_TEST_CONTAINER} || true
                                docker run -d \\
                                    --name ${FE_TEST_CONTAINER} \\
                                    --network ${TEST_NETWORK} \\
                                    -p ${FE_TEST_PORT}:80 \\
                                    -p ${FE_TEST_SSL_PORT}:443 \\
                                    -v ${CERT_PATH}/fullchain.pem:/etc/nginx/certs/fullchain.pem:ro \\
                                    -v ${CERT_PATH}/privkey.pem:/etc/nginx/certs/privkey.pem:ro \\
                                    ${tag}
                            """
                        }
                        // Target Branch가 master일 경우 (운영 환경 배포)
                        else if (env.TARGET_BRANCH == 'master') {
                            def tag = "${FE_IMAGE_NAME}:prod-${BUILD_NUMBER}"
                            echo "✅ Target is 'master'. Deploying to PRODUCTION environment..."
                            echo "🐳 Building PROD image: ${tag}"

                            sh """
                                docker build \\
                                    --build-arg ENV=prod \\
                                    --build-arg VITE_API_BASE_URL="${env.VITE_API_BASE_URL}" \\
                                    -t ${tag} .
                            """
                            
                            echo "🚀 Running PROD container: ${FE_PROD_CONTAINER}"
                            sh """
                                docker rm -f ${FE_PROD_CONTAINER} || true
                                docker run -d \\
                                    --name ${FE_PROD_CONTAINER} \\
                                    --network ${PROD_NETWORK} \\
                                    -p ${FE_PROD_PORT}:80 \\
                                    -p ${FE_PROD_SSL_PORT}:443 \\
                                    -v ${CERT_PATH}/fullchain.pem:/etc/nginx/certs/fullchain.pem:ro \\
                                    -v ${CERT_PATH}/privkey.pem:/etc/nginx/certs/privkey.pem:ro \\
                                    ${tag}
                            """
                        }
                        else {
                            echo "⏩ Skipping deployment. Target branch is neither 'develop' nor 'master'."
                        }
                    }
                }
            }
        }
    }
}
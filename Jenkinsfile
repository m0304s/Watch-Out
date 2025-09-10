pipeline {
    agent any

    /********************  환경 변수  ********************/
    environment {
        // --- 공통 ---
        GITLAB_URL   = "https://lab.ssafy.com"
        CERT_PATH    = "/etc/letsencrypt/live/j13e102.p.ssafy.io"

        // --- Backend ---
        BE_IMAGE_NAME            = "watchout/backend-app"
        BE_TEST_CONTAINER        = "watchout-be-test"
        BE_PROD_BLUE_CONTAINER   = "watchout-be-prod-blue"
        BE_PROD_GREEN_CONTAINER  = "watchout-be-prod-green"

        // --- Frontend ---
        FE_IMAGE_NAME     = "watchout/frontend-app"
        FE_TEST_CONTAINER = "watchout-fe-test"
        FE_PROD_CONTAINER = "watchout-fe-prod"

        // --- Edge/Proxy ---
        REVERSE_PROXY_IMAGE_NAME       = "watchout/edge-proxy"
        REVERSE_PROXY_TEST_CONTAINER   = "watchout-edge-test"
        REVERSE_PROXY_PROD_CONTAINER   = "watchout-edge-prod"
        REVERSE_PROXY_TEST_PORT        = "8080"
        REVERSE_PROXY_TEST_SSL_PORT    = "8443"
        REVERSE_PROXY_PROD_PORT        = "80"
        REVERSE_PROXY_PROD_SSL_PORT    = "443"

        // --- 네트워크 ---
        TEST_NETWORK = "test-network"
        PROD_NETWORK = "prod-network"

        // --- Jenkins 컨테이너 ---
        JENKINS_CONTAINER = "jenkins"
    }

    stages {
        stage('Debug Webhook Vars') {
            steps {
                script {
                    echo "MR_STATE=${env.MR_STATE}; MR_ACTION=${env.MR_ACTION}; MR_LAST_COMMIT=${env.MR_LAST_COMMIT}; MR_IID=${env.MR_IID}; SOURCE_BRANCH=${env.SOURCE_BRANCH}; TARGET_BRANCH=${env.TARGET_BRANCH}; MR_URL=${env.MR_URL}"
                    sh 'env | sort | head -n 80'
                }
            }
        }

        /********************  PR-Agent 실행 여부 결정  ********************/
        stage('Decide PR-Review Run') {
            when { expression { (env.MR_STATE ?: '') == 'opened' } }
            steps {
                script {
                    def mrKey   = (env.MR_IID ?: env.SOURCE_BRANCH ?: 'default').replaceAll('[^A-Za-z0-9._-]','_')
                    def shaFile = ".pr_agent_last_sha_${mrKey}"
                    env.PR_AGENT_SHA_FILE = shaFile

                    def nowSha = (env.MR_LAST_COMMIT ?: '').trim()
                    env.MR_LAST_COMMIT = nowSha

                    def prevSha = ""
                    if (fileExists(shaFile)) {
                        prevSha = sh(script: "cat '${shaFile}' 2>/dev/null || true", returnStdout: true).trim()
                    }

                    def action = (env.MR_ACTION ?: '').trim()
                    def shouldRun = false
                    if (action == 'open') {
                        shouldRun = true
                    } else if (action == 'update' && nowSha && nowSha != prevSha) {
                        shouldRun = true
                    }

                    env.SKIP_REVIEW = shouldRun ? 'false' : 'true'
                    echo "PR-Agent review decide → action=${action}, prevSha=${prevSha}, nowSha=${nowSha}, shouldRun=${shouldRun}, shaFile=${shaFile}"
                }
            }
        }

        stage('Run PR-Agent Review') {
            when {
                expression {
                    (env.MR_STATE ?: '') == 'opened' && (env.SKIP_REVIEW ?: 'true') == 'false'
                }
            }
            steps {
                script {
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        withCredentials([
                            string(credentialsId: 'GITLAB_ACCESS_TOKEN', variable: 'GITLAB_TOKEN'),
                            string(credentialsId: 'gemini-api-key',    variable: 'GEMINI_KEY')
                        ]) {
                            sh """
                                docker run --rm \
                                    -e CONFIG__GIT_PROVIDER="gitlab" \
                                    -e GITLAB__URL="${GITLAB_URL}" \
                                    -e GITLAB__PERSONAL_ACCESS_TOKEN="${GITLAB_TOKEN}" \
                                    -e GEMINI_API_KEY="${GEMINI_KEY}" \
                                    -e CONFIG__MODEL_PROVIDER=google \
                                    -e CONFIG__MODEL="gemini/gemini-2.5-pro" \
                                    -e CONFIG__FALLBACK_MODELS="[]" \
                                    -e CONFIG__PUBLISH_OUTPUT_PROGRESS=false \
                                    -e PR_REVIEWER__FINAL_UPDATE_MESSAGE=false
                                    -e REVIEW__PERSISTENT_COMMENT=true \
                                    -e REVIEW__FINAL_UPDATE_MESSAGE=false \
                                    -e PR_REVIEWER__EXTRA_INSTRUCTIONS="한국어로 간결하게 코멘트하고, 중요 이슈 위주로 지적해줘" \
                                    codiumai/pr-agent:latest \
                                    --pr_url "${MR_URL}" review
                            """
                        }
                    }
                    if ((env.MR_LAST_COMMIT ?: '').trim()) {
                        writeFile file: env.PR_AGENT_SHA_FILE, text: (env.MR_LAST_COMMIT.trim() + "\n")
                    }
                }
            }
        }

        stage('Check for Changes') {
            when { expression { (env.MR_STATE ?: '') == 'merged' } }
            steps {
                script {
                    env.DO_BACKEND_BUILD      = 'false'
                    env.DO_FRONTEND_BUILD     = 'false'
                    env.DO_EDGE_CONFIG_CHANGE = 'false'

                    sh "git fetch --all >/dev/null 2>&1 || true"
                    def changed = sh(script: "git diff --name-only origin/${env.TARGET_BRANCH}...origin/${env.SOURCE_BRANCH}", returnStdout: true).trim()

                    if (changed.contains('backend-repo/'))  env.DO_BACKEND_BUILD = 'true'
                    if (changed.contains('frontend-repo/')) env.DO_FRONTEND_BUILD = 'true'
                    if (changed.contains('docker/edge/'))   env.DO_EDGE_CONFIG_CHANGE = 'true'
                }
            }
        }

        stage('Prepare Networks') {
            when { expression { (env.MR_STATE ?: '') == 'merged' } }
            steps {
                sh "docker network create ${TEST_NETWORK} || true && docker network create ${PROD_NETWORK} || true"
            }
        }

        stage('Connect Jenkins to Networks') {
            when { expression { (env.MR_STATE ?: '') == 'merged' } }
            steps {
                sh "docker network connect ${TEST_NETWORK} ${JENKINS_CONTAINER} || true && docker network connect ${PROD_NETWORK} ${JENKINS_CONTAINER} || true"
            }
        }

        stage('Deploy or Reload Edge Proxy') {
            when {
                allOf {
                    expression { (env.MR_STATE ?: '') == 'merged' }
                    expression { env.DO_EDGE_CONFIG_CHANGE == 'true' }
                }
            }
            steps {
                script {
                    def isProd   = (env.TARGET_BRANCH == 'master')
                    def tag      = isProd ? "${REVERSE_PROXY_IMAGE_NAME}:prod-${BUILD_NUMBER}" : "${REVERSE_PROXY_IMAGE_NAME}:test-${BUILD_NUMBER}"
                    def envType  = isProd ? "prod" : "test"
                    def httpPort = isProd ? REVERSE_PROXY_PROD_PORT : REVERSE_PROXY_TEST_PORT
                    def httpsPort= isProd ? REVERSE_PROXY_PROD_SSL_PORT : REVERSE_PROXY_TEST_SSL_PORT
                    def network  = isProd ? PROD_NETWORK : TEST_NETWORK
                    def name     = isProd ? REVERSE_PROXY_PROD_CONTAINER : REVERSE_PROXY_TEST_CONTAINER

                    sh "docker build -t ${tag} --build-arg ENV=${envType} -f ./docker/edge/Dockerfile ."

                    def running = sh(script: "docker ps -q --filter name=${name}", returnStdout: true).trim()
                    if (running) {
                        sh "docker cp ./docker/edge/nginx/${envType}.conf ${name}:/etc/nginx/nginx.conf"
                        sh "docker exec ${name} nginx -s reload"
                    } else {
                        sh """
                            docker rm -f ${name} || true
                            docker run -d --name ${name} --network ${network} \
                                -p ${httpPort}:80 \
                                -p ${httpsPort}:${httpsPort} \
                                -v ${CERT_PATH}/fullchain.pem:/etc/nginx/certs/fullchain.pem:ro \
                                -v ${CERT_PATH}/privkey.pem:/etc/nginx/certs/privkey.pem:ro \
                                ${tag}
                        """
                    }
                }
            }
        }

        stage('Deploy Backend') {
            when {
                allOf {
                    expression { (env.MR_STATE ?: '') == 'merged' }
                    expression { env.DO_BACKEND_BUILD == 'true' }
                }
            }
            steps {
                dir('backend-repo') {
                    script {
                        if (env.TARGET_BRANCH == 'develop') {
                            def tag = "${BE_IMAGE_NAME}:test-${BUILD_NUMBER}"
                            withCredentials([
                                file(credentialsId: 'application-docker.yml', variable: 'APP_YML_DOCKER'),
                                file(credentialsId: 'application.yml',          variable: 'APP_YML')
                            ]) {
                                sh "mkdir -p src/main/resources && cp \$APP_YML src/main/resources/application.yml && cp \$APP_YML_DOCKER src/main/resources/application-docker.yml"
                            }
                            sh "chmod +x ./gradlew && ./gradlew bootJar && docker build -t ${tag} ."
                            sh """
                                docker rm -f ${BE_TEST_CONTAINER} || true
                                docker run -d --name ${BE_TEST_CONTAINER} --network ${TEST_NETWORK} -e SPRING_PROFILES_ACTIVE=docker ${tag}
                            """
                        } else if (env.TARGET_BRANCH == 'master') {
                            def tag = "${BE_IMAGE_NAME}:prod-${BUILD_NUMBER}"
                            def active   = sh(script: "docker ps -q --filter name=${BE_PROD_BLUE_CONTAINER}", returnStdout: true).trim() ? BE_PROD_BLUE_CONTAINER : BE_PROD_GREEN_CONTAINER
                            def inactive = (active == BE_PROD_BLUE_CONTAINER) ? BE_PROD_GREEN_CONTAINER : BE_PROD_BLUE_CONTAINER
                            withCredentials([
                                file(credentialsId: 'application-docker-prod.yml', variable: 'APP_YML_DOCKER_PROD'),
                                file(credentialsId: 'application-prod.yml',        variable: 'APP_YML_PROD')
                            ]) {
                                sh "mkdir -p src/main/resources && cp \$APP_YML_PROD src/main/resources/application.yml && cp \$APP_YML_DOCKER_PROD src/main/resources/application-docker.yml"
                            }
                            sh "chmod +x ./gradlew && ./gradlew bootJar && docker build -t ${tag} ."
                            sh """
                                docker rm -f ${inactive} || true
                                docker run -d --name ${inactive} --network ${PROD_NETWORK} -e SPRING_PROFILES_ACTIVE=docker,prod ${tag}
                            """
                            sleep(30)
                            sh "docker rm -f ${active} || true"
                        }
                    }
                }
            }
        }

        stage('Deploy Frontend') {
            when {
                allOf {
                    expression { (env.MR_STATE ?: '') == 'merged' }
                    expression { env.DO_FRONTEND_BUILD == 'true' }
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
                            def tag = "${FE_IMAGE_NAME}:test-${BUILD_NUMBER}"
                            dir('frontend-repo') {
                                sh "docker build -t ${tag} --build-arg ENV=test --build-arg VITE_API_BASE_URL='${env.FINAL_API_URL}' ."
                            }
                            sh "docker rm -f ${FE_TEST_CONTAINER} || true"
                            sh "docker run -d --name ${FE_TEST_CONTAINER} --network ${TEST_NETWORK} ${tag}"
                        } else if (env.TARGET_BRANCH == 'master') {
                            env.FINAL_API_URL = API_URL_PROD
                            def tag = "${FE_IMAGE_NAME}:prod-${BUILD_NUMBER}"
                            dir('frontend-repo') {
                                sh "docker build -t ${tag} --build-arg ENV=prod --build-arg VITE_API_BASE_URL='${env.FINAL_API_URL}' ."
                            }
                            sh "docker rm -f ${FE_PROD_CONTAINER} || true"
                            sh "docker run -d --name ${FE_PROD_CONTAINER} --network ${PROD_NETWORK} ${tag}"
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

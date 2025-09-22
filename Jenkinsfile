pipeline {
    agent any

    parameters {
        booleanParam(name: 'BUILD_BACKEND', defaultValue: false, description: '백엔드를 수동으로 빌드하고 배포하려면 체크하세요.')
        booleanParam(name: 'BUILD_FRONTEND', defaultValue: false, description: '프론트엔드를 수동으로 빌드하고 배포하려면 체크하세요.')
        booleanParam(name: 'BUILD_EDGE_PROXY', defaultValue: false, description: '엣지 프록시를 수동으로 빌드하고 배포하려면 체크하세요.')
        string(name: 'BRANCH_TO_BUILD', defaultValue: 'develop', description: '수동 빌드 시 기준 브랜치를 선택하세요 (develop 또는 master).')
    }

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

        /********************  PR-Agent 리뷰  ********************/
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
                                docker run --rm \\
                                    -e CONFIG__GIT_PROVIDER="gitlab" \\
                                    -e GITLAB__URL="${GITLAB_URL}" \\
                                    -e GITLAB__PERSONAL_ACCESS_TOKEN="${GITLAB_TOKEN}" \\
                                    -e GEMINI_API_KEY="${GEMINI_KEY}" \\
                                    -e CONFIG__MODEL_PROVIDER=google \\
                                    -e CONFIG__MODEL="gemini/gemini-2.5-pro" \\
                                    -e CONFIG__FALLBACK_MODELS="[]" \\
                                    -e CONFIG__PUBLISH_OUTPUT_PROGRESS=false \\
                                    -e REVIEW__PERSISTENT_COMMENT=true \\
                                    -e REVIEW__FINAL_UPDATE_MESSAGE=false \\
                                    -e PR_REVIEWER__FINAL_UPDATE_MESSAGE=false \\
                                    -e PR_REVIEWER__EXTRA_INSTRUCTIONS="한국어로 간결하게 코멘트하고, 중요 이슈 위주로 지적해줘" \\
                                    codiumai/pr-agent:latest \\
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

        /********************  변경 파일 확인 (머지 시)  ********************/
        stage('Check for Changes') {
            when { expression { (env.MR_STATE ?: '') == 'merged' } }
            steps {
                script {
                    env.DO_BACKEND_BUILD      = 'false'
                    env.DO_FRONTEND_BUILD     = 'false'
                    env.DO_EDGE_CONFIG_CHANGE = 'false'

                    sh "git fetch --all >/dev/null 2>&1 || true"
                    def changed = sh(script: "git diff --name-only origin/${env.TARGET_BRANCH}...origin/${env.SOURCE_BRANCH}", returnStdout: true).trim()

                    echo "=== 변경된 파일 목록 ==="
                    echo changed
                    echo "========================"

                    if (changed.contains('backend-repo/'))  env.DO_BACKEND_BUILD = 'true'
                    if (changed.contains('frontend-repo/')) env.DO_FRONTEND_BUILD = 'true'
                    if (changed.contains('docker/edge/'))   env.DO_EDGE_CONFIG_CHANGE = 'true'

                    echo "=== 빌드 결정 사항 ==="
                    echo "DO_BACKEND_BUILD: ${env.DO_BACKEND_BUILD}"
                    echo "DO_FRONTEND_BUILD: ${env.DO_FRONTEND_BUILD}"
                    echo "DO_EDGE_CONFIG_CHANGE: ${env.DO_EDGE_CONFIG_CHANGE}"
                    echo "====================="
                }
            }
        }

        /********************  네트워크 준비  ********************/
        stage('Prepare Networks') {
            when {
                anyOf {
                    expression { (env.MR_STATE ?: '') == 'merged' }
                    expression { params.BUILD_BACKEND == true }
                    expression { params.BUILD_FRONTEND == true }
                    expression { params.BUILD_EDGE_PROXY == true }
                }
            }
            steps {
                sh "docker network create ${TEST_NETWORK} || true && docker network create ${PROD_NETWORK} || true"
            }
        }

        /********************  Jenkins 컨테이너 네트워크 연결  ********************/
        stage('Connect Jenkins to Networks') {
            when {
                anyOf {
                    expression { (env.MR_STATE ?: '') == 'merged' }
                    expression { params.BUILD_BACKEND == true }
                    expression { params.BUILD_FRONTEND == true }
                    expression { params.BUILD_EDGE_PROXY == true }
                }
            }
            steps {
                sh "docker network connect ${TEST_NETWORK} ${JENKINS_CONTAINER} || true && docker network connect ${PROD_NETWORK} ${JENKINS_CONTAINER} || true"
            }
        }

        /********************  엣지 프록시 배포/리로드  ********************/
        stage('Deploy or Reload Edge Proxy') {
            when {
                anyOf {
                    allOf {
                        expression { (env.MR_STATE ?: '') == 'merged' }
                        expression { env.DO_EDGE_CONFIG_CHANGE == 'true' }
                    }
                    expression { params.BUILD_EDGE_PROXY == true }
                }
            }
            steps {
                dir('frontend-repo') {
                    script {
                        def branch   = (env.MR_STATE == 'merged') ? (env.TARGET_BRANCH ?: '').trim() : (params.BRANCH_TO_BUILD ?: '').trim()
                        def isProd   = (branch == 'master')
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
                                docker run -d --name ${name} --network ${network} \\
                                    -p ${httpPort}:80 \\
                                    -p ${httpsPort}:${httpsPort} \\
                                    -v ${CERT_PATH}/fullchain.pem:/etc/nginx/certs/fullchain.pem:ro \\
                                    -v ${CERT_PATH}/privkey.pem:/etc/nginx/certs/privkey.pem:ro \\
                                    ${tag}
                            """
                        }
                    }
                }
            }
        }

        /********************  백엔드 배포 (컨테이너 빌드/실행)  ********************/
        stage('Deploy Backend') {
            when {
                anyOf {
                    expression { (env.MR_STATE ?: '') == 'merged' && env.DO_BACKEND_BUILD == 'true' }
                    expression { params.BUILD_BACKEND == true }
                }
            }
            steps {
                dir('backend-repo') {
                    script {
                        def branch = (env.MR_STATE == 'merged') ? (env.TARGET_BRANCH ?: '').trim() : (params.BRANCH_TO_BUILD ?: '').trim()
                        echo "[Deploy Backend] TARGET_BRANCH=${branch}"

                        if (!branch) {
                            error "[Deploy Backend] TARGET_BRANCH가 비어 있습니다."
                        }

                        sh '''
                          set -eux
                          rm -rf _docker_ctx _run_config
                          mkdir -p _docker_ctx _run_config
                          # 소스(.git 제외)만 컨텍스트에 복사
                          tar -cf - --exclude=.git . | (cd _docker_ctx && tar -xf -)
                        '''

                        if (branch == 'develop') {
                            def tag = "${BE_IMAGE_NAME}:test-${BUILD_NUMBER}"
                            echo "[Deploy Backend] TEST 이미지 빌드 시작: ${tag}"

                            withCredentials([
                                file(credentialsId: 'APP_YML',        variable: 'APP_YML'),
                                file(credentialsId: 'APP_YML_DOCKER', variable: 'APP_YML_DOCKER'),
                                file(credentialsId: 'APP_YML_TEST',   variable: 'APP_YML_TEST'),
                                file(credentialsId: 'watchout-firebase-key', variable: 'FIREBASE_KEY')
                            ]) {
                                sh '''
                                  set -eux
                                  cp "$APP_YML"        _run_config/application.yml
                                  cp "$APP_YML_DOCKER" _run_config/application-docker.yml
                                  cp "$APP_YML_TEST"   _run_config/application-test.yml
                                  cp "$FIREBASE_KEY"   _run_config/watchout-firebase-key.json
                                '''
                            }

                            sh "docker build -t ${tag} -f _docker_ctx/Dockerfile _docker_ctx"

                            sh """
                              set -eux

                              docker volume create watchout_be_test || true

                              docker rm -f cfgseed || true
                              docker run -d --name cfgseed -v watchout_be_test:/app/config alpine:3.20 sleep 300
                              docker exec cfgseed sh -lc 'rm -rf /app/config/*'
                              docker cp _run_config/. cfgseed:/app/config/
                              docker exec cfgseed sh -lc 'chown -R 1000:1000 /app/config && find /app/config -type d -exec chmod 750 {} \\; && find /app/config -type f -exec chmod 640 {} \\;'
                              docker rm -f cfgseed || true

                              docker rm -f ${BE_TEST_CONTAINER} || true
                              docker run -d --name ${BE_TEST_CONTAINER} \
                                --network ${TEST_NETWORK} \
                                -v watchout_be_test:/app/config:ro \
                                --user 1000:1000 \
                                -e SPRING_PROFILES_ACTIVE=docker,test \
                                -e SPRING_CONFIG_ADDITIONAL_LOCATION=file:/app/config/ \
                                -e FIREBASE_SERVICE_ACCOUNT_FILE=/app/config/watchout-firebase-key.json \
                                ${tag}
                            """
                        } else if (branch == 'master') {
                            def tag = "${BE_IMAGE_NAME}:prod-${BUILD_NUMBER}"
                            echo "[Deploy Backend] PROD 이미지 빌드 시작: ${tag}"

                            withCredentials([
                                file(credentialsId: 'APP_YML',        variable: 'APP_YML'),
                                file(credentialsId: 'APP_YML_DOCKER', variable: 'APP_YML_DOCKER'),
                                file(credentialsId: 'APP_YML_PROD',   variable: 'APP_YML_PROD'),
                                file(credentialsId: 'watchout-firebase-key', variable: 'FIREBASE_KEY')
                            ]) {
                                sh '''
                                  set -eux
                                  cp "$APP_YML"        _run_config/application.yml
                                  cp "$APP_YML_DOCKER" _run_config/application-docker.yml
                                  cp "$APP_YML_PROD"   _run_config/application-prod.yml
                                  cp "$FIREBASE_KEY"   _run_config/watchout-firebase-key.json
                                '''
                            }

                            sh "docker build -t ${tag} -f _docker_ctx/Dockerfile _docker_ctx"

                            sh """
                              set -eux

                              if docker ps -q --filter name=${BE_PROD_BLUE_CONTAINER} | grep -q . ; then
                                ACTIVE=${BE_PROD_BLUE_CONTAINER}
                                INACTIVE=${BE_PROD_GREEN_CONTAINER}
                              else
                                ACTIVE=${BE_PROD_GREEN_CONTAINER}
                                INACTIVE=${BE_PROD_BLUE_CONTAINER}
                              fi

                              docker volume create watchout_be_prod || true

                              docker rm -f cfgseed-prod || true
                              docker run -d --name cfgseed-prod -v watchout_be_prod:/app/config alpine:3.20 sleep 300
                              docker exec cfgseed-prod sh -lc 'rm -rf /app/config/*'
                              docker cp _run_config/. cfgseed-prod:/app/config/
                              docker exec cfgseed-prod sh -lc 'chown -R 1000:1000 /app/config && find /app/config -type d -exec chmod 750 {} \\; && find /app/config -type f -exec chmod 640 {} \\;'
                              docker rm -f cfgseed-prod || true

                              docker rm -f \$INACTIVE || true
                              docker run -d --name \$INACTIVE \
                                --network ${PROD_NETWORK} \
                                -v watchout_be_prod:/app/config:ro \
                                --user 1000:1000 \
                                -e SPRING_PROFILES_ACTIVE=docker,prod \
                                -e SPRING_CONFIG_ADDITIONAL_LOCATION=file:/app/config/ \
                                -e FIREBASE_SERVICE_ACCOUNT_FILE=/app/config/watchout-firebase-key.json \
                                ${tag}

                              sleep 30
                              docker rm -f \$ACTIVE || true
                            """
                        } else {
                            error "[Deploy Backend] 지원하지 않는 TARGET_BRANCH='${branch}'. (develop/master 만 지원)"
                        }
                    }
                }
            }
        }

        /******************** 프론트엔드 배포  ********************/
        stage('Deploy Frontend') {
            when {
                anyOf {
                    expression { (env.MR_STATE ?: '') == 'merged' && env.DO_FRONTEND_BUILD == 'true' }
                    expression { params.BUILD_FRONTEND == true }
                }
            }
            steps {
                script {
                    def branch = (env.MR_STATE == 'merged') ? (env.TARGET_BRANCH ?: '').trim() : (params.BRANCH_TO_BUILD ?: '').trim()

                    if (branch == 'develop') {
                        withCredentials([file(credentialsId: '.env.development', variable: 'ENV_FILE')]) {
                            def tag = "${FE_IMAGE_NAME}:test-${BUILD_NUMBER}"

                            dir('frontend-repo') {
                                sh """
                                set -eux
                                rm -rf _docker_ctx
                                mkdir -p _docker_ctx
                                tar --no-same-owner -cf - --exclude=.git --exclude=_docker_ctx . | (cd _docker_ctx && tar -xf -)
                                chmod -R 755 _docker_ctx
                                cp "$ENV_FILE" _docker_ctx/.env
                                ls -la _docker_ctx/.env
                                cat _docker_ctx/.env
                                docker build -t ${tag} --build-arg ENV=test _docker_ctx
                                """
                            }
                            sh "docker rm -f ${FE_TEST_CONTAINER} || true"
                            sh "docker run -d --name ${FE_TEST_CONTAINER} --network ${TEST_NETWORK} ${tag}"
                        }
                    } else if (branch == 'master') {
                        withCredentials([file(credentialsId: '.env.production', variable: 'ENV_FILE')]) {
                            def tag = "${FE_IMAGE_NAME}:prod-${BUILD_NUMBER}"

                            dir('frontend-repo') {
                                sh """
                                set -eux
                                rm -rf _docker_ctx
                                mkdir -p _docker_ctx
                                tar --no-same-owner -cf - --exclude=.git --exclude=_docker_ctx . | (cd _docker_ctx && tar -xf -)
                                chmod -R 755 _docker_ctx
                                cp "$ENV_FILE" _docker_ctx/.env
                                ls -la _docker_ctx/.env
                                cat _docker_ctx/.env
                                docker build -t ${tag} --build-arg ENV=prod _docker_ctx
                                """
                            }
                            sh "docker rm -f ${FE_PROD_CONTAINER} || true"
                            sh "docker run -d --name ${FE_PROD_CONTAINER} --network ${PROD_NETWORK} ${tag}"
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

pipeline{
    agent any

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

        MM_HOOK_MR_REVIEWS_ID = "MM_HOOK_MR_REVIEWS_ID"
        MM_HOOK_GENERAL_ID    = "MM_HOOK_GENERAL_ID"
    }

    stages {

        stage('Init MM Helpers') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: env.MM_HOOK_MR_REVIEWS_ID, variable: 'MM_HOOK_MR_REVIEWS_SEC'),
                        string(credentialsId: env.MM_HOOK_GENERAL_ID,  variable: 'MM_HOOK_GENERAL_SEC')
                    ]) {
                        env.MM_HOOK_MR_REVIEWS = MM_HOOK_MR_REVIEWS_SEC
                        env.MM_HOOK_GENERAL    = MM_HOOK_GENERAL_SEC
                    }

                    shortSha = { String sha -> (sha ?: '').take(8) }
                    link     = { String text, String url -> url ? "[${text}](${url})" : text }
                    sinceStart = { try { (currentBuild.durationString ?: '').replaceAll('and counting','').trim() } catch (ignored) { '' } }
                    detectVcsInfo = {
                        [
                            branch     : (env.CHANGE_BRANCH ?: env.BRANCH_NAME ?: env.GIT_BRANCH ?: env.SOURCE_BRANCH ?: ''),
                            target     : (env.CHANGE_TARGET ?: env.TARGET_BRANCH ?: ''),
                            commit     : (env.GIT_COMMIT ?: ''),
                            changeUrl  : (env.CHANGE_URL ?: env.MR_URL ?: ''),
                            changeTitle: (env.CHANGE_TITLE ?: ''),
                            author     : (env.CHANGE_AUTHOR ?: env.USER_NAME ?: '')
                        ]
                    }
                    whoOpened = { (env.GITLAB_USER_NAME ?: env.gitlabUserName ?: env.CHANGE_AUTHOR ?: env.USER_NAME ?: 'unknown') }
                    whoOpenedId = { (env.GITLAB_USER_LOGIN ?: env.gitlabUserId ?: env.CHANGE_AUTHOR_DISPLAY_NAME ?: '') }

                    mmInitBuffer = {
                        mm_sections = []   // 섹션 문자열 배열
                        mm_title    = null // 최종 타이틀
                        mm_result   = null // 최종 결과
                        mm_endpoint = null // 최종 endpoint (없으면 MR_STATE로 자동 선택)
                    }
                    mmAddSection = { String header, String body ->
                        if (!mm_sections) { mm_sections = [] }
                        def h = header?.trim()
                        def b = (body ?: "").trim()
                        def section = h ? "**${h}**\n${b}" : b
                        if (section?.trim()) mm_sections << section
                    }
                    mmSetTitle    = { String title -> mm_title = title }
                    mmSetResult   = { String result -> mm_result = result }
                    mmSetEndpoint = { String ep    -> mm_endpoint = ep }

                    mmFlush = {
                        def vcs = detectVcsInfo()
                        def kv = []
                        kv << (env.JOB_NAME && env.BUILD_NUMBER ? "- **Job**: ${link("${env.JOB_NAME} #${env.BUILD_NUMBER}", env.BUILD_URL)}" : null)
                        if (vcs.branch)    kv << "- **Branch**: `${vcs.branch}`"
                        if (vcs.target)    kv << "- **Target**: `${vcs.target}`"
                        if (vcs.commit)    kv << "- **Commit**: `${shortSha(vcs.commit)}`"
                        if (vcs.changeUrl) kv << "- **MR**: ${link(vcs.changeTitle ?: 'Merge Request', vcs.changeUrl)}"
                        def duration = sinceStart()
                        if (duration)      kv << "- **Duration**: ${duration}"

                        def lines = []
                        lines << "**${mm_title ?: '파이프라인 알림'}** (${mm_result ?: (currentBuild.currentResult ?: 'UNKNOWN')})"
                        if (mm_sections && mm_sections.size()>0) {
                            lines << ""
                            lines << mm_sections.join("\n\n")
                        }
                        if (kv.any{ it }) {
                            lines << ""
                            lines.addAll(kv.findAll{ it })
                        }
                        lines << ""
                        lines << "_Jenkins • " + new Date().format('yyyy-MM-dd HH:mm:ss', TimeZone.getTimeZone('Asia/Seoul')) + "_"

                        def endpoint = mm_endpoint ?: ((env.MR_STATE == 'opened') ? env.MM_HOOK_MR_REVIEWS : env.MM_HOOK_GENERAL)
                        mattermostSend(message: lines.join("\n"), endpoint: endpoint)
                    }

                    mmInitBuffer()
                }
            }
        }

        stage('Process Webhook Data') {
            steps {
                script {
                    // 타이틀/채널 기본값
                    if (env.MR_STATE == 'opened') {
                        mmSetTitle("🆕 MR Opened & 초기 정보")
                        mmSetEndpoint(env.MM_HOOK_MR_REVIEWS)
                    } else if (env.MR_STATE == 'merged') {
                        mmSetTitle("🔁 Merge 후 배포 파이프라인")
                        mmSetEndpoint(env.MM_HOOK_GENERAL)
                    } else {
                        mmSetTitle("🚀 파이프라인 시작")
                        mmSetEndpoint(env.MM_HOOK_GENERAL)
                    }
                    mmSetResult('STARTED')

                    // 웹훅 요약
                    mmAddSection("웹훅", """
MR State: `${env.MR_STATE ?: 'N/A'}`
From → To: `${env.SOURCE_BRANCH ?: 'N/A'}` → `${env.TARGET_BRANCH ?: 'N/A'}`
트리거: `${env.USER_NAME ?: 'unknown'}`
""".trim())

                    // opened일 때 작성자
                    if (env.MR_STATE == 'opened') {
                        def opener = whoOpened()
                        def openerId = whoOpenedId()
                        mmAddSection("MR 작성자", """작성자: `${opener}`${openerId ? " (`${openerId}`)" : ""}${env.MR_URL ? "\n링크: ${env.MR_URL}" : ""}""".trim())
                    }
                }
            }
        }

        stage('Run PR-Agent Review') {
            when { expression { env.MR_STATE == 'opened' } }
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
                                    -e PR_REVIEWER__EXTRA_INSTRUCTIONS="한국어로 간결하게 코멘트하고, 중요 이슈 위주로 지적해줘" \
                                    codiumai/pr-agent:latest \
                                    --pr_url "${MR_URL}" review
                            """
                        }
                    }
                    def prOk = (currentBuild.currentResult != 'FAILURE')
                    mmAddSection("PR-Agent 리뷰 결과", prOk ? "자동 리뷰가 정상 완료되었습니다." : "자동 리뷰 실행 중 오류가 발생했습니다. 콘솔 로그를 확인하세요.")
                }
            }
        }

        stage('Check for Changes') {
            when { expression { env.MR_STATE == 'merged' } }
            steps {
                script {
                    env.DO_BACKEND_BUILD = 'false'
                    env.DO_FRONTEND_BUILD = 'false'
                    env.DO_EDGE_CONFIG_CHANGE = 'false'

                    sh "git fetch --all >/dev/null 2>&1 || true"
                    def changed = sh(script: "git diff --name-only origin/${env.TARGET_BRANCH}...origin/${env.SOURCE_BRANCH}", returnStdout: true).trim()

                    if (changed.contains('backend-repo/'))  env.DO_BACKEND_BUILD = 'true'
                    if (changed.contains('frontend-repo/')) env.DO_FRONTEND_BUILD = 'true'
                    if (changed.contains('docker/edge/'))   env.DO_EDGE_CONFIG_CHANGE = 'true'

                    mmAddSection("변경 파일 분석", """
Backend: `${env.DO_BACKEND_BUILD}`
Frontend: `${env.DO_FRONTEND_BUILD}`
Edge(Proxy): `${env.DO_EDGE_CONFIG_CHANGE}`
""".trim())
                }
            }
        }

        stage('Prepare Networks') {
            when { expression { env.MR_STATE == 'merged' } }
            steps { sh "docker network create ${TEST_NETWORK} || true && docker network create ${PROD_NETWORK} || true" }
        }

        stage('Connect Jenkins to Networks') {
            when { expression { env.MR_STATE == 'merged' } }
            steps { sh "docker network connect ${TEST_NETWORK} ${JENKINS_CONTAINER} || true && docker network connect ${PROD_NETWORK} ${JENKINS_CONTAINER} || true" }
        }

        stage('Deploy or Reload Edge Proxy') {
            when {
                allOf {
                    expression { env.MR_STATE == 'merged' }
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
                        mmAddSection("Edge Proxy", "리로드 완료\n- Image: `${tag}`\n- Env: `${envType}`\n- Target: `edge:${httpPort}/${httpsPort}`")
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
                        mmAddSection("Edge Proxy", "신규 배포 완료\n- Image: `${tag}`\n- Env: `${envType}`\n- Target: `edge:${httpPort}/${httpsPort}`")
                    }
                }
            }
        }

        stage('Deploy Backend') {
            when {
                allOf {
                    expression { env.MR_STATE == 'merged' }
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
                            mmAddSection("Backend(TEST)", "배포 완료\n- Image: `${tag}`")
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
                            mmAddSection("Backend(PROD Blue/Green)", "전환 완료\n- New Active: `${inactive}`\n- Image: `${tag}`")
                        }
                    }
                }
            }
        }

        stage('Deploy Frontend') {
            when {
                allOf {
                    expression { env.MR_STATE == 'merged' }
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
                            mmAddSection("Frontend(TEST)", "배포 완료\n- Image: `${tag}`\n- API: `${env.FINAL_API_URL}`")
                        } else if (env.TARGET_BRANCH == 'master') {
                            env.FINAL_API_URL = API_URL_PROD
                            def tag = "${FE_IMAGE_NAME}:prod-${BUILD_NUMBER}"
                            dir('frontend-repo') {
                                sh "docker build -t ${tag} --build-arg ENV=prod --build-arg VITE_API_BASE_URL='${env.FINAL_API_URL}' ."
                            }
                            sh "docker rm -f ${FE_PROD_CONTAINER} || true"
                            sh "docker run -d --name ${FE_PROD_CONTAINER} --network ${PROD_NETWORK} ${tag}"
                            mmAddSection("Frontend(PROD)", "배포 완료\n- Image: `${tag}`\n- API: `${env.FINAL_API_URL}`")
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            script { mmSetResult('SUCCESS'); mmFlush() }
        }
        unstable {
            script { mmSetResult('UNSTABLE'); mmFlush() }
        }
        failure {
            script { mmSetResult('FAILURE'); mmFlush() }
        }
        aborted {
            script { mmSetResult('ABORTED'); mmFlush() }
        }
        always {
            echo "📦 Pipeline finished with status: ${currentBuild.currentResult}"
        }
    }
}

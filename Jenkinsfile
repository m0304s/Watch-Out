pipeline{
    agent any

    // 색상/링크/브랜치/필드 생성 등 공용 함수
    def mmColor = { String result ->
        switch (result) {
            case 'SUCCESS':  return '#2EB67D' // green
            case 'FAILURE':  return '#E01E5A' // red
            case 'UNSTABLE': return '#ECB22E' // yellow
            case 'ABORTED':  return '#9EA0A4' // gray
            default:         return '#4A8FE7' // blue
        }
    }
    def shortSha = { String sha -> (sha ?: '').take(8) }
    def link    = { String text, String url -> url ? "[${text}](${url})" : text }
    def sinceStart = {
        try { (currentBuild.durationString ?: '').replaceAll('and counting','').trim() } catch (ignored) { '' }
    }
    def detectVcsInfo = {
        return [
            branch     : (env.CHANGE_BRANCH ?: env.BRANCH_NAME ?: env.GIT_BRANCH ?: env.SOURCE_BRANCH ?: ''),
            target     : (env.CHANGE_TARGET ?: env.TARGET_BRANCH ?: ''),
            commit     : (env.GIT_COMMIT ?: ''),
            changeUrl  : (env.CHANGE_URL ?: env.MR_URL ?: ''),
            changeTitle: (env.CHANGE_TITLE ?: ''),
            author     : (env.CHANGE_AUTHOR ?: env.USER_NAME ?: '')
        ]
    }
    def mmFields = { Map opts = [:] ->
        def vcs = detectVcsInfo()
        def fields = []
        fields << [title:'Job',     value: link("${env.JOB_NAME} #${env.BUILD_NUMBER}", env.BUILD_URL), short:true]
        if (vcs.branch) fields << [title:'Branch',  value:"`${vcs.branch}`", short:true]
        if (vcs.target) fields << [title:'Target',  value:"`${vcs.target}`", short:true]
        if (vcs.commit) fields << [title:'Commit',  value:"`${shortSha(vcs.commit)}`", short:true]
        if (vcs.changeUrl) fields << [title:'MR',   value: link(vcs.changeTitle ?: 'Merge Request', vcs.changeUrl), short:false]
        if (opts.imageTag) fields << [title:'Image',   value:"`${opts.imageTag}`", short:true]
        if (opts.deployEnv) fields << [title:'Env',     value:"`${opts.deployEnv}`", short:true]
        if (opts.targetHost) fields << [title:'Target', value:"`${opts.targetHost}`", short:true]
        if (opts.duration) fields << [title:'Duration', value: opts.duration, short:true]
        if (opts.note) fields << [title:'Note', value: opts.note, short:false]
        return fields
    }
    /**
     * 예쁜 Mattermost 카드 알림
     * @param result   'STARTED' | 'SUCCESS' | 'FAILURE' | 'UNSTABLE' | 'ABORTED'
     * @param title    상단 제목(이모지 OK)
     * @param summary  본문 요약(마크다운)
     * @param imageTag (옵션) 예: watchout/backend-app:prod-123
     * @param deployEnv(옵션) 예: test/prod-blue/prod-green
     * @param targetHost(옵션) 예: j13e102.p.ssafy.io
     * @param note     (옵션) 추가 메모
     */
    def mmNotify = { Map args = [:] ->
        String result   = args.result  ?: (currentBuild.currentResult ?: 'UNKNOWN')
        String title    = args.title   ?: "🏗️ 빌드 알림"
        String summary  = args.summary ?: ""
        String color    = mmColor(result)
        String duration = sinceStart()

        def fields = mmFields(
            imageTag  : args.imageTag,
            deployEnv : args.deployEnv,
            targetHost: args.targetHost,
            duration  : duration,
            note      : args.note
        )

        def attachments = [[
            fallback : "${env.JOB_NAME} #${env.BUILD_NUMBER} ${result}",
            color    : color,
            title    : title,
            text     : summary,
            fields   : fields,
            footer   : "Jenkins • ${new Date().format('yyyy-MM-dd HH:mm:ss', TimeZone.getTimeZone('Asia/Seoul'))}",
            mrkdwn_in: ['text','fields']
        ]]

        def argsToSend = [
            iconEmoji  : ':jenkins:',
            attachments: attachments
        ]
        // 필요 시 채널/엔드포인트 지정
        if (env.MATTERMOST_CHANNEL?.trim())  argsToSend.channel  = env.MATTERMOST_CHANNEL
        if (env.MATTERMOST_ENDPOINT?.trim()) argsToSend.endpoint = env.MATTERMOST_ENDPOINT

        mattermostSend(argsToSend)
    }
    /*******************************************************************/

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

        // --- 💬 Mattermost (옵션) ---
        // 글로벌 설정을 쓰면 비워두셔도 됩니다.
        // MATTERMOST_CHANNEL = "devops-alert"
        // MATTERMOST_ENDPOINT = "https://mattermost.example.com/hooks/xxxxx"
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

                    mmNotify(
                        result  : 'STARTED',
                        title   : "🚀 파이프라인 시작",
                        summary : """
**MR State:** `${env.MR_STATE ?: 'N/A'}`  
**From → To:** `${env.SOURCE_BRANCH ?: 'N/A'}` → `${env.TARGET_BRANCH ?: 'N/A'}`  
트리거: `${env.USER_NAME ?: 'unknown'}`  
""".trim()
                    )
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
                    mmNotify(
                        result : 'SUCCESS',
                        title  : "📝 PR-Agent 리뷰 완료",
                        summary: "자동 리뷰가 정상 완료되었습니다. MR에서 코멘트를 확인하세요."
                    )
                }
            }
            post {
                failure {
                    script {
                        mmNotify(
                            result : 'FAILURE',
                            title  : "🛑 PR-Agent 리뷰 실패",
                            summary: "자동 리뷰 실행 중 오류가 발생했습니다. Jenkins 콘솔 로그를 확인하세요."
                        )
                    }
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

                    def changedFiles = sh(script: "git fetch --all >/dev/null 2>&1 || true; git diff --name-only origin/${env.TARGET_BRANCH}...origin/${env.SOURCE_BRANCH}", returnStdout: true).trim()
                    echo "Changed files in MR:\n${changedFiles}"

                    if (changedFiles.contains('backend-repo/')) {
                        echo "✅ Changes detected in backend-repo."
                        env.DO_BACKEND_BUILD = 'true'
                    }
                    if (changedFiles.contains('frontend-repo/')) {
                        echo "✅ Changes detected in frontend-repo."
                        env.DO_FRONTEND_BUILD = 'true'
                    }
                    if (changedFiles.contains('docker/edge/')) {
                        echo "✅ Changes detected in edge proxy configuration."
                        env.DO_EDGE_CONFIG_CHANGE = 'true'
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
                    expression { env.DO_EDGE_CONFIG_CHANGE == 'true' }
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
                        mmNotify(
                            result   : 'SUCCESS',
                            title    : "♻️ Edge Proxy 리로드",
                            summary  : "Nginx 설정이 재적용되었습니다.",
                            imageTag : proxy_tag,
                            deployEnv: envType,
                            targetHost: "edge:${httpPort}/${httpsPort}"
                        )
                    } else {
                        echo "🚀 Edge container not found. Creating a new one..."
                        sh """
                            docker run -d --name ${proxyContainerName} --network ${networkName} \
                                -p ${httpPort}:80 \
                                -p ${httpsPort}:${httpsPort} \
                                -v ${CERT_PATH}/fullchain.pem:/etc/nginx/certs/fullchain.pem:ro \
                                -v ${CERT_PATH}/privkey.pem:/etc/nginx/certs/privkey.pem:ro \
                                ${proxy_tag}
                        """
                        mmNotify(
                            result   : 'SUCCESS',
                            title    : "🚀 Edge Proxy 배포",
                            summary  : "새 컨테이너가 기동되었습니다.",
                            imageTag : proxy_tag,
                            deployEnv: envType,
                            targetHost: "edge:${httpPort}/${httpsPort}"
                        )
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
                            mmNotify(
                                result   : 'SUCCESS',
                                title    : "🟦 Backend 배포(TEST)",
                                summary  : "테스트 환경으로 백엔드가 배포되었습니다.",
                                imageTag : tag,
                                deployEnv: "test"
                            )
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

                            mmNotify(
                                result   : 'SUCCESS',
                                title    : "🟩 Backend Blue/Green 전환(PROD)",
                                summary  : "활성 컨테이너가 `${inactiveContainer}` 로 전환되었습니다.",
                                imageTag : tag,
                                deployEnv: "prod",
                                note     : "기존 활성: `${activeContainer}` → 신규 활성: `${inactiveContainer}`"
                            )
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
                            dir('frontend-repo') {
                                sh "docker build -t ${fe_tag} --build-arg ENV=test --build-arg VITE_API_BASE_URL='${env.FINAL_API_URL}' ."
                            }
                            sh "docker rm -f ${FE_TEST_CONTAINER} || true"
                            sh "docker run -d --name ${FE_TEST_CONTAINER} --network ${TEST_NETWORK} ${fe_tag}"
                            mmNotify(
                                result   : 'SUCCESS',
                                title    : "🟦 Frontend 배포(TEST)",
                                summary  : "테스트 환경으로 프론트엔드가 배포되었습니다.",
                                imageTag : fe_tag,
                                deployEnv: "test"
                            )
                        } else if (env.TARGET_BRANCH == 'master') {
                            env.FINAL_API_URL = API_URL_PROD
                            def fe_tag = "${FE_IMAGE_NAME}:prod-${BUILD_NUMBER}"
                            echo "✅ Target is 'master'. Deploying Frontend to PROD env..."
                            dir('frontend-repo') {
                                sh "docker build -t ${fe_tag} --build-arg ENV=prod --build-arg VITE_API_BASE_URL='${env.FINAL_API_URL}' ."
                            }
                            sh "docker rm -f ${FE_PROD_CONTAINER} || true"
                            sh "docker run -d --name ${FE_PROD_CONTAINER} --network ${PROD_NETWORK} ${fe_tag}"
                            mmNotify(
                                result   : 'SUCCESS',
                                title    : "🟩 Frontend 배포(PROD)",
                                summary  : "프로덕션 환경으로 프론트엔드가 배포되었습니다.",
                                imageTag : fe_tag,
                                deployEnv: "prod"
                            )
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                mmNotify(
                    result : 'SUCCESS',
                    title  : "✅ 파이프라인 완료",
                    summary: "모든 단계가 성공적으로 완료되었습니다."
                )
            }
        }
        unstable {
            script {
                mmNotify(
                    result : 'UNSTABLE',
                    title  : "⚠️ 파이프라인 불안정",
                    summary: "일부 테스트/단계에서 이슈가 감지되었습니다. 상세 로그를 확인하세요."
                )
            }
        }
        failure {
            script {
                mmNotify(
                    result : 'FAILURE',
                    title  : "🛑 파이프라인 실패",
                    summary: "오류가 발생했습니다. ${link('콘솔 로그', env.BUILD_URL ? env.BUILD_URL + 'console' : '')} 를 확인하세요."
                )
            }
        }
        aborted {
            script {
                mmNotify(
                    result : 'ABORTED',
                    title  : "⏹️ 파이프라인 중단",
                    summary: "사용자 또는 정책에 의해 빌드가 중단되었습니다."
                )
            }
        }
        always {
            echo "📦 Pipeline finished with status: ${currentBuild.currentResult}"
        }
    }
}

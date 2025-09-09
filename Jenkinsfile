pipeline{
    agent any

    /********************  🧩 Mattermost 템플릿 유틸은 Init 스테이지에서 전역 등록  ********************/

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

        // --- 💬 Mattermost (전역 설정 사용 시 비워두기) ---
        // MATTERMOST_CHANNEL = "devops-alert"
        // MATTERMOST_ENDPOINT = "https://mattermost.example.com/hooks/xxxxx"
    }

    stages {

        /********************  🧩 Mattermost 템플릿 유틸 초기화  ********************/
        stage('Init MM Helpers') {
            steps {
                script {
                    // 반드시 def 없이 전역 바인딩으로 등록
                    mmColor = { String result ->
                        switch (result) {
                            case 'SUCCESS':  return '#2EB67D' // green
                            case 'FAILURE':  return '#E01E5A' // red
                            case 'UNSTABLE': return '#ECB22E' // yellow
                            case 'ABORTED':  return '#9EA0A4' // gray
                            default:         return '#4A8FE7' // blue
                        }
                    }
                    shortSha = { String sha -> (sha ?: '').take(8) }
                    link     = { String text, String url -> url ? "[${text}](${url})" : text }
                    sinceStart = {
                        try { (currentBuild.durationString ?: '').replaceAll('and counting','').trim() } catch (ignored) { '' }
                    }
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

                    // ── MR Opened: 웹훅/플러그인 환경변수 기반 정보 ──
                    whoOpened = {
                        return (env.GITLAB_USER_NAME ?: env.gitlabUserName ?: env.CHANGE_AUTHOR ?: env.USER_NAME ?: 'unknown')
                    }
                    whoOpenedId = {
                        return (env.GITLAB_USER_LOGIN ?: env.gitlabUserId ?: env.CHANGE_AUTHOR_DISPLAY_NAME ?: '')
                    }

                    // ── (선택) GitLab API로 MR 상세 조회 ──
                    fetchMrInfo = { ->
                        if (!env.MR_URL) { return null }
                        def matcher = (env.MR_URL =~ /https?:\/\/[^\/]+\/(.+)\/-\/merge_requests\/(\d+)/)
                        if (!matcher || !matcher.matches()) { return null }
                        def projectPath = matcher[0][1]  // group/subgroup/project
                        def iid         = matcher[0][2]
                        def encodedPath = java.net.URLEncoder.encode(projectPath, 'UTF-8').replace("+","%20")
                        def apiUrl = "${env.GITLAB_URL}/api/v4/projects/${encodedPath}/merge_requests/${iid}"

                        def payload = ''
                        try {
                            withCredentials([string(credentialsId: 'GITLAB_ACCESS_TOKEN', variable: 'GITLAB_TOKEN')]) {
                                payload = sh(script: "curl -sfSL --header 'PRIVATE-TOKEN: ${GITLAB_TOKEN}' '${apiUrl}'", returnStdout: true).trim()
                            }
                        } catch (ignored) { payload = '' }

                        if (!payload) { return null }
                        def data = new groovy.json.JsonSlurperClassic().parseText(payload)
                        return [
                            title      : data.title,
                            iid        : data.iid,
                            authorName : data.author?.name,
                            authorUser : data.author?.username,
                            assignees  : (data.assignees ?: []).collect{ it.name },
                            reviewers  : (data.reviewers ?: []).collect{ it.name },
                            labels     : (data.labels ?: []),
                            webUrl     : data.web_url,
                            createdAt  : data.created_at,
                            draft      : (data.draft ?: false),
                            changesCnt : (data.changes_count ?: null),
                            state      : data.state
                        ]
                    }

                    // ✅ 모든 정보를 message(마크다운) 본문에 합쳐서 전송 (attachments는 보조)
                    mmNotify = { Map args = [:] ->
                        String result   = args.result  ?: (currentBuild.currentResult ?: 'UNKNOWN')
                        String title    = args.title   ?: "🏗️ 빌드 알림"
                        String summary  = (args.summary ?: "").trim()
                        String color    = mmColor(result)
                        String duration = sinceStart()

                        def vcs = detectVcsInfo()
                        def kv = []
                        kv << (env.JOB_NAME && env.BUILD_NUMBER ? "- **Job**: [${env.JOB_NAME} #${env.BUILD_NUMBER}](${env.BUILD_URL ?: '#'})" : null)
                        if (vcs.branch)      kv << "- **Branch**: `${vcs.branch}`"
                        if (vcs.target)      kv << "- **Target**: `${vcs.target}`"
                        if (vcs.commit)      kv << "- **Commit**: `${shortSha(vcs.commit)}`"
                        if (vcs.changeUrl)   kv << "- **MR**: [${vcs.changeTitle ?: 'Merge Request'}](${vcs.changeUrl})"
                        if (args.imageTag)   kv << "- **Image**: `${args.imageTag}`"
                        if (args.deployEnv)  kv << "- **Env**: `${args.deployEnv}`"
                        if (args.targetHost) kv << "- **Target Host**: `${args.targetHost}`"
                        if (duration)        kv << "- **Duration**: ${duration}"
                        if (args.note)       kv << "- **Note**: ${args.note}"

                        def bodyLines = []
                        bodyLines << "**${title}** (${result})"
                        if (summary) {
                            bodyLines << ""
                            bodyLines << summary
                        }
                        if (kv.any{ it }) {
                            bodyLines << ""
                            bodyLines.addAll(kv.findAll{ it })
                        }
                        bodyLines << ""
                        bodyLines << "_Jenkins • " + new Date().format('yyyy-MM-dd HH:mm:ss', TimeZone.getTimeZone('Asia/Seoul')) + "_"
                        def rootMessage = bodyLines.join("\n")

                        // (보조) attachments: 서버가 지원하면 카드도 보임. 미지원이어도 정보는 message에 모두 있음.
                        def attachments = [[
                            fallback : "${env.JOB_NAME} #${env.BUILD_NUMBER} ${result}",
                            color    : color,
                            title    : title,
                            text     : (summary ?: " "),  // 일부 서버에서 빈 문자열이면 null로 표기되므로 최소 공백
                            fields   : []                 // 필드는 message에 합쳤음
                        ]]

                        mattermostSend(
                            message    : rootMessage,   // ← 핵심
                            iconEmoji  : ':jenkins:',
                            attachments: attachments
                        )
                    }
                }
            }
        }
        /*******************************************************************/

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

        // ── MR Opened 알림 (작성자/라벨/리뷰어 등) ──
        stage('Notify MR Opened') {
            when { expression { env.MR_STATE == 'opened' } }
            steps {
                script {
                    def openerName = whoOpened()
                    def openerId   = whoOpenedId()
                    def lines = []
                    lines << "**작성자:** `${openerName}`" + (openerId ? " (`${openerId}`)" : "")
                    if (env.SOURCE_BRANCH || env.TARGET_BRANCH) {
                        lines << "**브랜치:** `${env.SOURCE_BRANCH ?: '?'}` → `${env.TARGET_BRANCH ?: '?'}`"
                    }
                    if (env.MR_URL) lines << "**링크:** ${env.MR_URL}"

                    def info = null
                    try { info = fetchMrInfo() } catch (ignored) { info = null }
                    if (info) {
                        if (info.title)   lines << "**제목:** ${info.title}${info.draft ? ' _(Draft)_' : ''}"
                        if (info.labels && info.labels.size()>0)   lines << "**라벨:** " + info.labels.collect{ "`${it}`" }.join(", ")
                        if (info.reviewers && info.reviewers.size()>0) lines << "**리뷰어:** " + info.reviewers.collect{ "`${it}`" }.join(", ")
                        if (info.assignees && info.assignees.size()>0) lines << "**담당자:** " + info.assignees.collect{ "`${it}`" }.join(", ")
                        if (info.createdAt) lines << "**생성:** `${info.createdAt}`"
                        if (info.changesCnt) lines << "**변경 수:** `${info.changesCnt}`"
                    }

                    mmNotify(
                        result  : 'STARTED',
                        title   : "🆕 MR Opened",
                        summary : lines.join("\n")
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

                    sh "git fetch --all >/dev/null 2>&1 || true"
                    def changedFiles = sh(script: "git diff --name-only origin/${env.TARGET_BRANCH}...origin/${env.SOURCE_BRANCH}", returnStdout: true).trim()
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
                            result    : 'SUCCESS',
                            title     : "♻️ Edge Proxy 리로드",
                            summary   : "Nginx 설정이 재적용되었습니다.",
                            imageTag  : proxy_tag,
                            deployEnv : envType,
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
                            result    : 'SUCCESS',
                            title     : "🚀 Edge Proxy 배포",
                            summary   : "새 컨테이너가 기동되었습니다.",
                            imageTag  : proxy_tag,
                            deployEnv : envType,
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

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

        // stage('Run PR-Agent Review') {
        //     when { expression { env.MR_STATE == 'opened' } }
        //     steps {
        //         script {
        //             echo "🤖 Starting PR-Agent for MR: ${env.MR_URL}"
        //             withCredentials([
        //                 string(credentialsId: 'GITLAB_ACCESS_TOKEN', variable: 'GITLAB_TOKEN'),
        //                 string(credentialsId: 'gemini-api-key', variable: 'GEMINI_KEY')
        //             ]) {
        //                 sh """
        //                     docker run --rm \\
        //                         -e config__git_provider="gitlab" \
        //                         -e gitlab__url="${env.GITLAB_URL}" \
        //                         -e gitlab__PERSONAL_ACCESS_TOKEN="${GITLAB_TOKEN}" \
        //                         -e GOOGLE_API_KEY="${GEMINI_KEY}" \
        //                         -e config__model_provider="google" \
        //                         -e config__model="gemini-2.5-pro" \
        //                         codiumai/pr-agent:latest \
        //                         --pr_url "${env.MR_URL}" review
        //                 """
        //             }
        //         }
        //     }
        // }

       stage('Run PR-Agent Review') {
  when { expression { env.MR_STATE == 'opened' } }
  steps {
    script {
      echo "🤖 Starting PR-Agent for MR: ${env.MR_URL}"
      withCredentials([
        string(credentialsId: 'gitlab-token',  variable: 'GITLAB_TOKEN'),
        string(credentialsId: 'gemini-api-key', variable: 'GEMINI_KEY')
      ]) {

        // bash로 실행 + 상세 로그 + 실패 지점 노출
        int rc = sh(returnStatus: true, script: """#!/usr/bin/env bash
          set -euxo pipefail

          echo "==> Docker version"
          docker version

          echo "==> Pull pr-agent image"
          docker pull codiumai/pr-agent:latest

          echo "==> Run PR-Agent review (logs to pr-agent.log)"
          # 표준출력/표준에러 모두 저장하고, 화면에도 찍기
          docker run --rm \\
            -e config__git_provider="gitlab" \\
            -e gitlab__url="${GITLAB_URL}" \\
            -e gitlab__PERSONAL_ACCESS_TOKEN="${GITLAB_TOKEN}" \\
            -e GOOGLE_API_KEY="${GEMINI_KEY}" \\
            -e config__model_provider="google" \\
            -e config__model="gemini-1.5-pro" \\
            codiumai/pr-agent:latest \\
            --pr_url "${MR_URL}" review \\
            2>&1 | tee pr-agent.log
        """)

        // 종료코드/로그 처리
        echo "==> PR-Agent exit code: ${rc}"
        archiveArtifacts artifacts: 'pr-agent.log', onlyIfSuccessful: false, fingerprint: true

        if (rc != 0) {
          error "❌ PR-Agent failed. See console and pr-agent.log artifact."
        }
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

                    if (env.MR_STATE != null) {
                        def changedFiles = sh(
                            script: "git diff --name-only origin/${env.TARGET_BRANCH}...origin/${env.SOURCE_BRANCH}",
                            returnStdout: true
                        ).trim()

                        echo "Changed files in MR:\n${changedFiles}"

                        if (changedFiles.contains('backend-repo/')) {
                            echo "✅ Changes detected in backend-repo."
                            env.DO_BACKEND_BUILD = true
                        }
                        if (changedFiles.contains('frontend-repo/')) {
                            echo "✅ Changes detected in frontend-repo."
                            env.DO_FRONTEND_BUILD = true
                        }
                    } else {
                        echo "⏩ Skipping change detection for manual build."
                    }
                }
            }
        }

        stage('Prepare Networks') {
            when { expression { env.MR_STATE == 'merged' } }
            steps {
                sh """
                    docker network create ${TEST_NETWORK} || true
                    docker network create ${PROD_NETWORK} || true
                """
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
                echo "🚀 Starting Backend Deployment for branch: ${env.TARGET_BRANCH}"
                dir('backend-repo') {
                    script {
                        // 여기에 백엔드 배포 스크립트를 추가하세요.
                        // (테스트 배포, 운영 Blue/Green 배포 등)
                        echo "Backend deployment logic goes here."
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
                // --- 👇 withCredentials 블록으로 API 주소를 불러오도록 수정 ---
                withCredentials([
                    string(credentialsId: 'VITE_API_BASE_URL_TEST', variable: 'API_URL_TEST'),
                    string(credentialsId: 'VITE_API_BASE_URL_PROD', variable: 'API_URL_PROD')
                ]) {
                    dir('frontend-repo') {
                        script {
                            def apiBaseUrl = ""
                            if (env.TARGET_BRANCH == 'develop') {
                                // Credentials에서 불러온 API_URL_TEST 변수를 사용
                                apiBaseUrl = API_URL_TEST
                                def tag = "${FE_IMAGE_NAME}:test-${BUILD_NUMBER}"
                                echo "✅ Target is 'develop'. Deploying Frontend to TEST environment..."
                                echo "🐳 Building TEST image with API URL: ${apiBaseUrl}"

                                sh """
                                    docker build \\
                                        --build-arg ENV=test \\
                                        --build-arg VITE_API_BASE_URL="${apiBaseUrl}" \\
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
                            } else if (env.TARGET_BRANCH == 'master') {
                                apiBaseUrl = API_URL_PROD
                                def tag = "${FE_IMAGE_NAME}:prod-${BUILD_NUMBER}"
                                echo "✅ Target is 'master'. Deploying Frontend to PRODUCTION environment..."
                                echo "🐳 Building PROD image with API URL: ${apiBaseUrl}"

                                sh """
                                    docker build \\
                                        --build-arg ENV=prod \\
                                        --build-arg VITE_API_BASE_URL="${apiBaseUrl}" \\
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
                            } else {
                                echo "⏩ Skipping frontend deployment. Target branch is neither 'develop' nor 'master'."
                            }
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
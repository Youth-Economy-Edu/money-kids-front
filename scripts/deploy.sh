#!/bin/bash

# Money Kids 프론트엔드 배포 스크립트
# 사용법: ./scripts/deploy.sh [platform]
# 예시: ./scripts/deploy.sh aws-ec2

set -e  # 에러 발생 시 스크립트 중단

PLATFORM=${1:-vercel}  # 기본값: vercel
COMMIT_MSG=${2:-"Deploy: $(date +'%Y-%m-%d %H:%M:%S')"}

echo "🚀 Money Kids 프론트엔드 배포 시작..."
echo "📋 배포 플랫폼: $PLATFORM"
echo "💬 커밋 메시지: $COMMIT_MSG"

# 1. 의존성 확인
echo "📦 의존성 설치 중..."
npm ci

# 2. 린트 검사
echo "🔍 코드 검사 중..."
npm run lint --if-present

# 3. 빌드
echo "🔨 프로덕션 빌드 중..."
npm run build

# 4. Git 커밋 (변경사항이 있는 경우)
if [[ `git status --porcelain` ]]; then
  echo "📝 변경사항 커밋 중..."
  git add .
  git commit -m "$COMMIT_MSG"
  git push origin $(git branch --show-current)
fi

# 5. 플랫폼별 배포
case $PLATFORM in
  vercel)
    echo "☁️ Vercel 배포 중..."
    npx vercel --prod
    ;;
  netlify)
    echo "🌐 Netlify 배포 중..."
    npx netlify deploy --prod
    ;;
  gh-pages)
    echo "📄 GitHub Pages 배포 중..."
    npm run deploy:gh-pages
    ;;
  aws-ec2)
    echo "🖥️ AWS EC2 배포 중..."
    # EC2 환경변수 확인
    if [ -z "$EC2_HOST" ] || [ -z "$EC2_USER" ] || [ -z "$EC2_KEY_PATH" ]; then
      echo "❌ EC2 환경변수가 설정되지 않았습니다!"
      echo "다음 환경변수를 설정해주세요:"
      echo "export EC2_HOST='your-ec2-public-ip'"
      echo "export EC2_USER='ubuntu'  # 또는 ec2-user"
      echo "export EC2_KEY_PATH='~/.ssh/your-key.pem'"
      echo "export EC2_PROJECT_PATH='/var/www/money-kids-front'  # 선택사항"
      exit 1
    fi
    
    EC2_PROJECT_PATH=${EC2_PROJECT_PATH:-"/home/$EC2_USER/money-kids-front"}
    
    echo "📤 EC2 서버로 파일 전송 중..."
    # dist 폴더를 EC2로 전송
    scp -i "$EC2_KEY_PATH" -r dist/ "$EC2_USER@$EC2_HOST:$EC2_PROJECT_PATH/"
    
    echo "🔄 EC2 서버에서 배포 중..."
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << EOF
      cd $EC2_PROJECT_PATH
      
      # Git pull (코드 동기화)
      git pull origin $(git branch --show-current) || echo "Git pull 실패 - 수동으로 코드를 전송했습니다"
      
      # Nginx 또는 Apache 재시작 (필요한 경우)
      if command -v nginx &> /dev/null; then
        sudo systemctl reload nginx || echo "Nginx 재로드 실패"
      fi
      
      if command -v apache2 &> /dev/null; then
        sudo systemctl reload apache2 || echo "Apache 재로드 실패"
      fi
      
      # PM2 재시작 (Node.js 서버인 경우)
      if command -v pm2 &> /dev/null; then
        pm2 restart money-kids-front || echo "PM2 앱 없음"
      fi
      
      echo "✅ EC2 배포 완료!"
EOF
    ;;
  aws-ec2-git)
    echo "🖥️ AWS EC2 Git 배포 중..."
    # Git을 통한 EC2 배포
    if [ -z "$EC2_HOST" ] || [ -z "$EC2_USER" ] || [ -z "$EC2_KEY_PATH" ]; then
      echo "❌ EC2 환경변수가 설정되지 않았습니다!"
      exit 1
    fi
    
    EC2_PROJECT_PATH=${EC2_PROJECT_PATH:-"/home/$EC2_USER/money-kids-front"}
    
    echo "🔄 EC2 서버에서 Git 배포 중..."
    ssh -i "$EC2_KEY_PATH" "$EC2_USER@$EC2_HOST" << EOF
      cd $EC2_PROJECT_PATH
      
      # Git pull
      git pull origin $(git branch --show-current)
      
      # 의존성 설치
      npm ci
      
      # 빌드
      npm run build
      
      # 웹 서버 재시작
      if command -v nginx &> /dev/null; then
        sudo systemctl reload nginx
      fi
      
      if command -v pm2 &> /dev/null; then
        pm2 restart money-kids-front || pm2 serve dist/ 3000 --name money-kids-front
      fi
      
      echo "✅ EC2 Git 배포 완료!"
EOF
    ;;
  aws-s3)
    echo "🪣 AWS S3 배포 중..."
    # S3 버킷명을 환경변수 또는 직접 설정
    S3_BUCKET=${S3_BUCKET:-"money-kids-frontend"}
    aws s3 sync dist/ s3://$S3_BUCKET --delete
    # CloudFront 캐시 무효화 (선택사항)
    if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
      echo "🔄 CloudFront 캐시 무효화 중..."
      aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
    fi
    ;;
  aws-amplify)
    echo "⚡ AWS Amplify 배포 중..."
    # Amplify CLI가 설치되어 있어야 함
    amplify push --yes
    ;;
  aws-eb)
    echo "🌱 AWS Elastic Beanstalk 배포 중..."
    # EB CLI가 설치되어 있어야 함
    eb deploy
    ;;
  *)
    echo "❌ 지원하지 않는 플랫폼: $PLATFORM"
    echo "사용 가능한 플랫폼: vercel, netlify, gh-pages, aws-ec2, aws-ec2-git, aws-s3, aws-amplify, aws-eb"
    exit 1
    ;;
esac

echo "✅ 배포 완료!"
echo "�� 배포된 사이트를 확인해보세요."
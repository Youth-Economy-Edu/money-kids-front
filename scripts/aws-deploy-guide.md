# AWS 배포 및 업데이트 가이드

Money Kids 프론트엔드를 AWS에서 배포하고 업데이트하는 방법을 설명합니다.

## 🎯 AWS 배포 방법별 가이드

### 1. AWS S3 + CloudFront (추천)

가장 일반적이고 비용 효율적인 정적 웹사이트 호스팅 방법입니다.

#### 초기 설정
```bash
# AWS CLI 설치 및 설정
aws configure
# Access Key ID, Secret Access Key, Region 입력

# S3 버킷 생성 (웹 콘솔에서 미리 생성)
# 버킷명: money-kids-frontend (또는 원하는 이름)
```

#### 환경변수 설정
```bash
# 터미널에서 설정하거나 ~/.bashrc, ~/.zshrc에 추가
export S3_BUCKET="your-bucket-name"
export CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"  # 선택사항
```

#### 배포 및 업데이트
```bash
# 방법 1: npm 스크립트 사용
npm run deploy:aws-s3

# 방법 2: 직접 스크립트 실행
./scripts/deploy.sh aws-s3

# 방법 3: 수동 배포
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
```

### 2. AWS Amplify

가장 간단한 배포 방법으로 Git과 연동됩니다.

#### 초기 설정
```bash
# Amplify CLI 설치
npm install -g @aws-amplify/cli
amplify configure

# 프로젝트 초기화
amplify init
amplify add hosting
amplify publish
```

#### 업데이트
```bash
# 방법 1: npm 스크립트 사용
npm run deploy:aws-amplify

# 방법 2: 직접 명령어
amplify push --yes

# 자동 배포 (Git push 시 자동)
git add .
git commit -m "업데이트 내용"
git push origin main
```

### 3. AWS Elastic Beanstalk

서버 사이드 렌더링이 필요한 경우 사용합니다.

#### 초기 설정
```bash
# EB CLI 설치
pip install awsebcli

# 프로젝트 초기화
eb init
eb create production
```

#### 업데이트
```bash
# 방법 1: npm 스크립트 사용
npm run deploy:aws-eb

# 방법 2: 직접 명령어
eb deploy
```

## 🔄 빠른 업데이트 방법

### 코드 수정 후 바로 배포
```bash
# 1. 코드 수정 완료 후
git add .
git commit -m "기능 수정: 설명"

# 2. 배포 (사용하는 AWS 서비스에 따라 선택)
npm run deploy:aws-s3        # S3 배포
npm run deploy:aws-amplify   # Amplify 배포
npm run deploy:aws-eb        # Elastic Beanstalk 배포
```

### 자동화된 배포
```bash
# 원클릭 배포 (자동 커밋 + 배포)
./scripts/deploy.sh aws-s3 "수정사항 설명"
```

## 📋 배포 전 체크리스트

### 1. 환경 설정 확인
- [ ] AWS CLI 설정 완료
- [ ] 필요한 권한 설정 (S3, CloudFront 등)
- [ ] 환경변수 설정 (버킷명, 배포 ID 등)

### 2. 코드 준비
- [ ] 모든 변경사항 커밋
- [ ] 린트 오류 해결
- [ ] 빌드 테스트 완료

### 3. 배포 후 확인
- [ ] 웹사이트 접속 확인
- [ ] 새 기능 동작 테스트
- [ ] 모바일 반응형 확인

## 🐛 문제 해결

### S3 배포 실패
```bash
# 권한 오류 시
aws s3api put-bucket-policy --bucket your-bucket-name --policy file://bucket-policy.json

# 캐시 문제 시 CloudFront 무효화
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Amplify 배포 실패
```bash
# 캐시 정리
amplify env remove dev
amplify env add dev

# 재배포
amplify push --yes
```

### 일반적인 문제
- **빌드 실패**: `npm run build`로 로컬 테스트
- **권한 오류**: AWS IAM 권한 확인
- **캐시 문제**: 브라우저 하드 새로고침 (Ctrl+F5)

## 💡 배포 최적화 팁

### 1. 빌드 최적화
```bash
# 빌드 사이즈 확인
npm run build
ls -la dist/

# 불필요한 파일 제거
rm -rf dist/assets/*.map  # 소스맵 제거
```

### 2. CDN 캐시 설정
CloudFront 사용 시 적절한 캐시 정책 설정:
- HTML: 짧은 캐시 (1시간)
- JS/CSS: 긴 캐시 (1년)
- 이미지: 중간 캐시 (1개월)

### 3. 자동 배포 설정
GitHub Actions 또는 AWS CodePipeline을 통한 CI/CD 구축

---

## 📞 지원

배포 관련 문제가 있으면 다음을 확인해주세요:
1. AWS 콘솔에서 서비스 상태 확인
2. CloudWatch 로그 확인
3. 네트워크 및 권한 설정 확인 
# AWS EC2 배포 및 업데이트 가이드

Money Kids 프론트엔드를 AWS EC2에서 배포하고 업데이트하는 방법을 설명합니다.

## 🎯 EC2 배포 방식

### 1. **파일 전송 방식** (aws-ec2)
로컬에서 빌드 후 EC2로 파일 전송

### 2. **Git 동기화 방식** (aws-ec2-git) ⭐ 추천
EC2에서 직접 Git pull 후 빌드

---

## 🔧 초기 설정

### 1. 환경변수 설정
```bash
# ~/.bashrc 또는 ~/.zshrc에 추가
export EC2_HOST="your-ec2-public-ip"           # EC2 퍼블릭 IP
export EC2_USER="ubuntu"                       # EC2 사용자명 (ubuntu 또는 ec2-user)
export EC2_KEY_PATH="~/.ssh/your-key.pem"     # SSH 키 경로
export EC2_PROJECT_PATH="/home/ubuntu/money-kids-front"  # 프로젝트 경로 (선택사항)
```

### 2. SSH 키 권한 설정
```bash
chmod 400 ~/.ssh/your-key.pem
```

### 3. EC2 서버 초기 세팅
```bash
# EC2 서버에 접속
ssh -i ~/.ssh/your-key.pem ubuntu@your-ec2-ip

# Node.js 설치 (없는 경우)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (프로세스 관리용)
sudo npm install -g pm2

# Nginx 설치 (웹 서버용)
sudo apt update
sudo apt install -y nginx

# 프로젝트 클론
git clone https://github.com/your-username/money-kids-front.git
cd money-kids-front
npm install
```

---

## 🚀 배포 및 업데이트 방법

### **방법 1: Git 동기화 배포** ⭐ 추천

코드 수정 후 가장 간단한 업데이트:

```bash
# 로컬에서 코드 수정 후
git add .
git commit -m "기능 수정: 설명"
git push origin dev1

# 배포 실행
npm run deploy:aws-ec2-git
```

**이 방법의 장점:**
- ✅ 가장 안전하고 확실
- ✅ EC2에서 직접 빌드하므로 환경 일치
- ✅ Git 히스토리 유지

### **방법 2: 파일 전송 배포**

로컬에서 빌드 후 전송:

```bash
# 배포 실행
npm run deploy:aws-ec2
```

---

## 🔄 실제 업데이트 시나리오

### **일반적인 기능 수정 후 업데이트**

```bash
# 1. 코드 수정 완료
# 2. 커밋 및 푸시
git add .
git commit -m "경제학습 24시간 초기화 기능 수정"
git push origin dev1

# 3. EC2 배포 (30초 내 완료)
npm run deploy:aws-ec2-git
```

### **긴급 수정 (핫픽스)**

```bash
# 빠른 배포 (Git 동기화)
./scripts/deploy.sh aws-ec2-git "긴급수정: 설명"
```

### **수동 배포 (직접 제어)**

```bash
# EC2에 직접 접속
ssh -i ~/.ssh/your-key.pem ubuntu@your-ec2-ip

cd /home/ubuntu/money-kids-front
git pull origin dev1
npm ci
npm run build

# 웹 서버 재시작
sudo systemctl reload nginx
pm2 restart money-kids-front
```

---

## 🌐 웹 서버 설정

### **Nginx 설정** (정적 파일 서빙)

```bash
# /etc/nginx/sites-available/money-kids-front
server {
    listen 80;
    server_name your-domain.com;
    
    root /home/ubuntu/money-kids-front/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 프록시 (백엔드 연결)
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Nginx 설정 활성화
sudo ln -s /etc/nginx/sites-available/money-kids-front /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **PM2로 정적 파일 서빙**

```bash
# PM2로 정적 서버 실행
pm2 serve dist/ 3000 --name money-kids-front
pm2 save
pm2 startup
```

---

## 🔧 문제 해결

### **배포 실패 시**

```bash
# 1. SSH 연결 확인
ssh -i ~/.ssh/your-key.pem ubuntu@your-ec2-ip "echo 'Connection OK'"

# 2. 권한 확인
ls -la ~/.ssh/your-key.pem  # 400 권한 확인

# 3. EC2 보안 그룹 확인
# - SSH (22번 포트) 허용
# - HTTP (80번 포트) 허용
# - 백엔드 포트 (8080) 허용
```

### **일반적인 문제들**

**Q: "Permission denied" 오류**
```bash
chmod 400 ~/.ssh/your-key.pem
```

**Q: "Host key verification failed"**
```bash
ssh-keyscan -H your-ec2-ip >> ~/.ssh/known_hosts
```

**Q: 배포 후 사이트가 안 보임**
```bash
# EC2에서 확인
sudo systemctl status nginx
pm2 status
```

**Q: API 연결 안됨**
```bash
# EC2 보안 그룹에서 8080 포트 허용 확인
# 백엔드 서버 실행 상태 확인
```

---

## 💡 배포 최적화 팁

### **1. 자동 배포 설정**

GitHub Actions를 통한 자동 배포:

```yaml
# .github/workflows/deploy-ec2.yml
name: Deploy to EC2
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v0.1.4
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/money-kids-front
            git pull origin main
            npm ci
            npm run build
            pm2 restart money-kids-front
```

### **2. 무중단 배포**

```bash
# Blue-Green 배포 스크립트
# 새 버전을 다른 포트에서 실행 후 전환
```

### **3. 로그 모니터링**

```bash
# PM2 로그 확인
pm2 logs money-kids-front

# Nginx 로그 확인
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 📋 체크리스트

### **배포 전**
- [ ] 코드 테스트 완료
- [ ] 환경변수 설정 확인
- [ ] SSH 키 권한 확인 (400)
- [ ] EC2 보안 그룹 설정 확인

### **배포 후**
- [ ] 웹사이트 접속 확인
- [ ] API 연결 확인
- [ ] 모바일 반응형 확인
- [ ] 로그 에러 없는지 확인

---

## 🚨 중요 사항

1. **백업**: 배포 전 항상 데이터베이스 백업
2. **롤백**: 문제 시 이전 Git 커밋으로 롤백 가능
3. **모니터링**: PM2, Nginx 로그 정기 확인
4. **보안**: SSH 키 관리, 보안 그룹 최소 권한

현재 EC2 설정 상황을 알려주시면 더 구체적인 가이드를 제공할 수 있습니다! 
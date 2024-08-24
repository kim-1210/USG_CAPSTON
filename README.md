# USG_CAPSTON

이 프로젝트는 기업의 출근 관리 및 안전 관리 시스템을 구축하기 위해 진행된 USG_CAPSTON 프로젝트입니다. 이 프로젝트는 프론트엔드와 백엔드, AI 모델을 활용하여 인부들의 출근 관리, 안전장비 확인, 건의사항 관리 등을 수행합니다.

## 팀 구성

| 백엔드 With AI | 프론트엔드 | 프론트엔드 | 프론트엔드 |
|:--------------:|:----------:|:----------:|:----------:|
| [김대영](https://github.com/kim-1210) | [윤도훈](https://github.com/DurianCream) | [류영진](https://github.com/Ppemppu) | [김규빈](https://github.com/Gubpi) |
|![140900130](https://github.com/user-attachments/assets/f357af14-9131-4766-9dde-1ed93c055037)|![54353132](https://github.com/user-attachments/assets/e03e7269-8540-4030-9497-2d2d312515ce)|![160209917](https://github.com/user-attachments/assets/875ddb8f-bdbd-4463-a45a-ff4dfc1e7e08)|![60918781](https://github.com/user-attachments/assets/d70f280d-c960-44cf-8142-d2a88822978d)|

## 아키텍처
![image](https://github.com/user-attachments/assets/eda5e081-8f86-41a5-b920-1799fd86b8f0)

## 프로젝트 구조

### View (프론트엔드)

- **detector/**: 관리자 페이지

  ![image](https://github.com/user-attachments/assets/31a7383d-4262-407a-9302-6c134c3eaee5)
  - **login**: 관리자 로그인 페이지
  - **main**: 건의사항 확인 및 직원 출근 확인 및 관리

- **safe_detector/**: 안전관리자 페이지

  ![image](https://github.com/user-attachments/assets/c174c350-522d-413e-8b36-ec079be214d6)
  - **detailview**: 본인의 건의사항을 세부적으로 확인
  - **list**: 본인의 건의사항 목록을 확인
  - **main**: 건의하기 및 건의사항 확인을 위한 메인 페이지
  - **photoSuggest**: 이미지와 함께 건의사항을 제시하는 페이지

- **user/**: 인부 페이지
  
  ![image](https://github.com/user-attachments/assets/6819d405-4d15-4fb3-9adf-fa0d1471262e)
  - **check_safe_cloth**: 실시간 안전복 확인을 통한 출근 인증
  - **main**: 출근 및 자신의 출근 현황을 확인하는 페이지
  - **publiclogin**: 인부 로그인 페이지
  - **record**: 본인의 출근 기록을 확인하는 페이지

(모든 통신 기능은 `static/`에 위치)

### Controller (백엔드)

- **server**: 페이지와 서버 간의 통신을 담당
- **firebase_storage**: 파이어베이스를 활용한 엑셀 파일 정보 수정 및 저장
- **face_check**: 얼굴 인식 기능 제공
- **certificate_file**: 서버 장치 내부의 SSH 인증서 제공
- **ai_cal / ai_cal2**: 실시간 안전복 확인 및 출근 허가 기능 제공

### 데이터베이스 (DB)

- **corporation_excel/**: 회사별 출근 기록 및 출근 여부 확인 파일 저장
  - **today.xlsx**: 금일 출근 여부를 확인하는 파일
  - **년도.xlsx**: 해당 년도의 모든 직원 출근 일지

- **suggests/**: 각 회사별 건의사항 저장
  - 회사명별 폴더 내 **xlsx** 형식의 건의사항 파일과 관련 이미지 저장

- **corporation_face/**: 회사별 직원 얼굴 정보 저장
  - **npy** 파일로 저장된 직원 얼굴 정보
  - **class5_protective_model/**: 안전장비 인식 AI 모델 저장
  - **best.pt**: 안전장비 인식을 위한 AI 모델 파일

## 제작 기간
24.03~24.05

# การออกแบบ Pipeline และ Environment สำหรับ Kubernetes (Dev -> SIT -> UAT -> Prod)

> **บทนำ:** คุณจับประเด็นได้เฉียบคมมากครับ และนี่คือ **จุดเปลี่ยนสำคัญ** ระหว่าง "การทดสอบทางเทคนิค (POC)" กับ "การทำงานจริง (Production Grade SDLC)"

คำตอบคือ: แบบที่อธิบายไปก่อนหน้า (Shared PV ก้อนเดียวใช้ร่วมกัน 3 Env) **"ไม่เหมาะ"** กับ Flow การทำงานที่คุณต้องการ (Dev -> SIT -> UAT -> Prod) ครับ

ถ้าคุณต้องการ Flow ที่ Dev แก้กี่รอบก็ได้ แต่ SIT ต้องนิ่งจนกว่า Dev จะ "ส่งงาน" และ UAT ต้องเป๊ะเหมือน Prod... **เราห้ามใช้ Storage ก้อนเดียวกันเก็บ Code หรือ Application ครับ**

ผมจะขออธิบายใหม่โดยรื้อโครงสร้างให้เข้ากับ **CI/CD Pipeline** และ **Release Management** ที่เป็นมาตรฐานโลก (Best Practices) ดังนี้ครับ

## 1. ทำไม Shared Storage ถึง "ผิด" ใน Context นี้?

ถ้าคุณใช้ PV ก้อนเดียว (NFS) เก็บ Code/File ของโปรแกรม:

* **ปัญหา:** เมื่อ Dev แก้ไฟล์ `index.html` หรือ Code แล้ว Save ปุ๊บ -> SIT และ UAT เปลี่ยนตามทันที
* **ผลกระทบ:** Tester ใน SIT กำลังเทสอยู่ดีๆ ระบบเปลี่ยนกลางอากาศ (Testing Environment ไม่ Stable) และ UAT ก็พังตามไปด้วยถ้า Code ของ Dev มีบั๊ก

## 2. วิธีการ "ส่งงาน" ที่ถูกต้อง (The Artifact Promotion Flow)

ในโลกของ Kubernetes และ Container เราไม่ได้ส่งงานโดยการ Copy ไฟล์ใส่ Folder แต่เราส่งงานด้วย **"Docker Image"** และ **"Version Tag"** ครับ

สิ่งที่ต้อง **แยกกัน** อย่างเด็ดขาดในแต่ละ Namespace (Env) คือ:

1. **PVC (Storage):** แยกกัน (Data ใคร Data มัน) เพื่อให้ Dev ลบข้อมูลเล่นได้โดยไม่กระทบ SIT
2. **ConfigMap/Secret:** แยกกัน (เช่น Dev ต่อ Database Dev, SIT ต่อ Database SIT)
3. **Application Version:** แยกกัน (Dev ใช้เวอร์ชันใหม่ล่าสุด, SIT ใช้เวอร์ชันที่เสถียร)

### แผนผังการทำงาน (Workflow)

#### Stage 1: Dev (Development) - "บ่อทรายของ Developer"

* **การทำงาน:** เขียน Code -> Commit -> CI Tool (Jenkins/GitLab) สร้าง Docker Image ชื่อ `app:v1.0-dev-build-001`
* **การ Deploy:** ระบบ Auto Deploy ลง Namespace `dev` ทันที
* **สถานะ:** พังได้ตลอดเวลา เปลี่ยนแปลงวันละหลายรอบ
* **PV/PVC:** มีของตัวเอง (เช่น เอาไว้เก็บ Log หรือไฟล์อัปโหลดมั่วๆ ของ Dev)

#### Stage 2: SIT (System Integration Test) - "จุดตรวจคนเข้าเมือง"

* **การส่งงาน:** เมื่อ Dev มั่นใจแล้วว่าฟีเจอร์ครบ จะทำการ "Promote"
* **การกระทำ:** CI/CD จะนำ Image ตัวที่ Dev เทสผ่านแล้ว มาแปะป้ายใหม่ หรือใช้ตัวเดิม (เช่น `app:v1.0-rc1`) แล้ว Deploy ลง Namespace `sit`
* **ความสำคัญ:** Environment นี้ต้อง **"นิ่ง"** (Freeze) ห้ามมี Code ใหม่เข้ามาจนกว่า Tester จะเทสรอบนี้เสร็จ
* **PV/PVC:** มีของตัวเอง แยกจาก Dev (Tester สร้างข้อมูลเทสจำลองไว้ ไม่ควรโดน Dev มาลบ)

#### Stage 3: UAT (User Acceptance Test) - "เหมือน Prod 99%"

* **การส่งงาน:** เมื่อ SIT ผ่านหมด Tester ให้ไฟเขียว
* **การกระทำ:** Deploy Image ตัวเดิม (`app:v1.0-rc1`) ลง Namespace `uat`
* **Data:** ข้อมูลใน Database และ PV ควรเป็นข้อมูลเสมือนจริง (Masked Production Data)
* **Ingress:** URL ต้องคล้ายจริง เช่น `uat-app.company.com`

#### Stage 4: Production - "ของจริง"

* **การส่งงาน:** ผู้บริหารเซ็นผ่าน UAT
* **การกระทำ:** Deploy Image ตัวเดิมนั้นแหละ (`app:v1.0-rc1` -> อาจจะ Tag ใหม่เป็น `app:v1.0-stable`) ขึ้น Prod

## 3. ตัวอย่าง YAML ที่ "ถูกต้อง" สำหรับการแยก Env

เราจะไม่ Hardcode `volumeName` ให้ชี้ไปที่เดียวกันแล้ว แต่เราจะให้แต่ละ Env สร้าง PV ของใครของมัน (Dynamic Provisioning) หรือชี้ไปคนละ Folder

### ตัวอย่างการแยก Config และ Version (Concept)

**Environment: DEV**

```yaml
# dev-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: dev
spec:
  template:
    spec:
      containers:
      - image: my-app:dev-latest  # <--- ใช้ตัวล่าสุดเสมอ
        env:
        - name: DB_HOST
          value: "db-dev.local"

```

**Environment: SIT**

```yaml
# sit-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: sit
spec:
  template:
    spec:
      containers:
      - image: my-app:v1.0.2      # <--- LOCKED version (Dev แก้ dev-latest ไปก็ไม่กระทบตัวนี้)
        env:
        - name: DB_HOST
          value: "db-sit.local"

```

## 4. เรื่อง Ingress และ PV/PVC ที่คุณถาม

### Ingress (ยังใช้ concept เดิมได้ไหม?)

**ได้ครับ และควรทำด้วย** Ingress คือประตูบ้าน

* `dev.myapp.com` -> ชี้ไป Service `dev`
* `sit.myapp.com` -> ชี้ไป Service `sit`
* `app.com` (Prod) -> ชี้ไป Service `prod`

การแยก Ingress Resource ต่อ Namespace เป็นวิธีที่ถูกต้องแล้ว เพื่อให้ Config ไม่ตีกัน

### PV/PVC (Persistent Storage)

* **Dev:** ใช้ PVC Class ทั่วไป (เช่น `standard`) ขนาดเล็กๆ ก็พอ
* **SIT/UAT:** ควรใช้ PVC Class ที่ประสิทธิภาพดีขึ้น หรือถ้าเป็นการแชร์ไฟล์ (เช่น รูปภาพสินค้าที่อัปโหลด) ควรแยก Bucket (S3/MinIO) หรือแยก Folder ใน NFS:
* NFS `/data/dev`
* NFS `/data/sit`
* NFS `/data/uat`


* **ห้ามใช้ PV ก้อนเดียวกัน** เว้นแต่จะเป็นข้อมูล Read-only ที่ใช้ร่วมกันจริงๆ (เช่น Master Data ไฟล์ Zip รหัสไปรษณีย์ทั่วโลก ที่ไม่อัปเดตบ่อย)

## 5. ความพร้อมก่อนลง Production (Production Readiness)

คำถามที่คุณถามว่า **"ต้องเป๊ะมากแค่ไหนถึงจะลง Prod ได้"** นี่คือ Checklist มาตรฐานครับ:

1. **Image Immutability (ห้ามแก้ไส้ใน):**
* Image ที่ขึ้น Prod **ต้องเป็น Image hash เดียวกัน** กับที่เทสผ่านใน UAT (ห้าม Re-build ใหม่ตอนจะขึ้น Prod เพราะอาจมี Library บางตัวเปลี่ยนเวอร์ชันโดยไม่รู้ตัว)


2. **Config Separated from Code:**
* ต้องไม่มี Hardcode IP หรือ Password ใน Docker Image ทุกอย่างต้องดึงผ่าน ConfigMap หรือ Secret ของ K8s เท่านั้น


3. **Zero Downtime Deployment:**
* ใน Kubernetes บน Prod ต้องตั้งค่า `RollingUpdate`
* ต้องมี `LivenessProbe` และ `ReadinessProbe` (เพื่อให้ K8s รู้ว่า Pod พร้อมรับงานจริงหรือยัง ถ้ายังไม่พร้อม ห้ามยิง Traffic เข้าไป)


4. **Resource Limits:**
* Prod Pod ต้องระบุ CPU/Memory Request & Limit ชัดเจน ป้องกันการกินทรัพยากรจน Node ล่ม


5. **Rollback Plan:**
* ถ้าขึ้น Prod แล้วพัง ต้องมีคำสั่งเดียว (เช่น `helm rollback`) เพื่อย้อนกลับไปเวอร์ชันก่อนหน้าได้ภายใน 1 นาที



## สรุปคำแนะนำสำหรับคุณ

สิ่งที่ผมแนะนำในตอนแรก (Shared Storage) คือท่าสำหรับ **"แชร์ข้อมูลระหว่าง Pod (เช่น รูป user upload)"**

แต่สิ่งที่คุณกำลังมองหาคือ **"Application Deployment Lifecycle"**

* **อย่าใช้ Shared Storage เก็บ Code**
* **ให้ใช้ CI/CD Pipeline สร้าง Docker Image** แล้วเลือกเวอร์ชันของ Image ไปหย่อนลงในแต่ละ Env (Dev/SIT/UAT) ตามลำดับการอนุมัติ
* **Ingress:** ใช้แยกกันเพื่อเข้าถึงแต่ละ Env
* **Storage:** แยกกัน เพื่อกันข้อมูลตีกัน

**Next Step:** คุณอยากเห็นตัวอย่าง **Pipeline Script (เช่น GitLab CI หรือ GitHub Actions)** ที่โชว์ภาพการ Build Image -> Deploy Dev -> Approve -> Deploy SIT ไหมครับ? จะได้เห็นภาพการส่งงานชัดเจนขึ้น

---

# ส่วนขยาย: ตัวอย่าง YAML แบบ Production-Grade และคำอธิบายเชิงลึก

ส่วนนี้จะขยายความจากหัวข้อที่ 3 โดยแสดงตัวอย่างไฟล์ YAML ที่พร้อมใช้งานจริง (Ready to Apply) ซึ่งมีการเพิ่มองค์ประกอบสำคัญสำหรับ Production เช่น **Probes**, **Resource Limits**, และการใช้ **ConfigMap** แยก Environment

## 1. ConfigMap: หัวใจของการแยก Environment

เราสร้าง Image เดียว แต่ให้มันทำตัวต่างกันในแต่ละ Env ด้วยการ Inject Config เข้าไป

**ไฟล์: `configmap-dev.yaml**`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: dev
data:
  APP_ENV: "development"
  DB_HOST: "postgres-dev.internal"
  LOG_LEVEL: "DEBUG" # Dev ต้องการ Log ละเอียด

```

**ไฟล์: `configmap-sit.yaml**`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: sit
data:
  APP_ENV: "sit"
  DB_HOST: "postgres-sit.internal"
  LOG_LEVEL: "INFO" # SIT ลดความละเอียด Log ลง

```

---

## 2. Deployment: ความแตกต่างระหว่าง Dev และ SIT

### สำหรับ DEV (เน้นเร็ว, ประหยัด)

* **Image:** ใช้ tag `:latest` หรือ branch name
* **Replicas:** 1 ตัวก็พอ
* **Resources:** น้อยๆ

```yaml
# dev-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: dev
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: main-container
        # DEV: ดึง image ล่าสุดเสมอ เพื่อให้เห็น code ที่แก้ทันที
        image: myregistry.azurecr.io/myapp:dev-latest 
        imagePullPolicy: Always
        envFrom:
        - configMapRef:
            name: app-config # ดึงค่าจาก ConfigMap ของ Namespace dev
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"

```

### สำหรับ SIT/UAT/PROD (เน้นเสถียร, ห้ามล่ม)

* **Image:** ระบุ Version ชัดเจน (Immutable Tag)
* **Replicas:** มากกว่า 1 เพื่อทำ Rolling Update
* **Probes:** ต้องมีเพื่อป้องกัน Traffic เข้าไปตอนแอปยังไม่พร้อม
* **Resources:** กำหนด Limit ชัดเจน

```yaml
# sit-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: sit
spec:
  replicas: 2 # รัน 2 ตัวเผื่อตัวนึงตาย อีกตัวรับงานแทนได้
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0 # ห้ามมีตัวตายเลยระหว่างอัปเดต (สร้างตัวใหม่ให้เสร็จก่อนค่อยลบตัวเก่า)
      maxSurge: 1
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: main-container
        # SIT: ใช้ Version ที่ Lock ไว้ (ห้ามใช้ latest)
        image: myregistry.azurecr.io/myapp:v1.0.5-rc1 
        imagePullPolicy: IfNotPresent
        envFrom:
        - configMapRef:
            name: app-config # ดึงค่าจาก ConfigMap ของ Namespace sit
        
        # --- Health Probes (สำคัญมากสำหรับ Production) ---
        # 1. Liveness: เช็คว่าแอปตายรึยัง? ถ้าตาย K8s จะ Restart ให้
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 20
        
        # 2. Readiness: พร้อมรับลูกค้าหรือยัง? ถ้ายัง K8s จะไม่ส่ง Traffic เข้ามา
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10

        # --- Resource Limits (กันแอปกินเครื่องจน Node พัง) ---
        resources:
          requests:
            cpu: "250m"   # จองไว้ก่อน 0.25 core
            memory: "256Mi"
          limits:
            cpu: "500m"   # ห้ามใช้เกิน 0.5 core
            memory: "512Mi" # ห้ามใช้เกิน 512Mi (ถ้าเกินโดน Kill)

```

---

## 3. Storage และ Ingress ที่สมบูรณ์

### PersistentVolumeClaim (PVC)

แยกไฟล์กันอย่างชัดเจนตาม Namespace

```yaml
# pvc-sit.yaml (และทำไฟล์คล้ายๆ กันให้ Dev/UAT)
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
  namespace: sit
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  # storageClassName: standard (หรือ managed-nfs-storage)

```

### Ingress Route

แยก Domain เพื่อเข้าถึงแต่ละ Environment

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: sit
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  rules:
  - host: sit.myapp.com # Domain สำหรับ SIT
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-app-service
            port:
              number: 80

```

## สรุปความเปลี่ยนแปลง

จากข้อมูลชุดนี้ คุณจะเห็นภาพชัดเจนว่าเราเปลี่ยนจากการ "แชร์ Folder" มาเป็น "การจัดการ Version ของ Image และ Config" แทน ซึ่งเป็นวิธีที่บริษัท Tech ชั้นนำทั่วโลกใช้ในการจัดการ Kubernetes Cluster ครับ

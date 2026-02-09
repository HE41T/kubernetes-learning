ได้ครับ ผมได้ทำการ **"จัดระเบียบ (Refactoring)"** ข้อมูลทั้งหมดใหม่ ตรวจสอบความถูกต้องของ Technical Details (เช่น ชื่อ Service, Label Selector, Port Matching) ให้ตรงกันทุกไฟล์ เพื่อให้คุณสามารถ Copy ไปใช้งานหรือทำเอกสารได้ทันทีโดยไม่สับสนครับ

นี่คือเวอร์ชันสมบูรณ์ครับ

---

# การออกแบบ Pipeline และ Environment สำหรับ Kubernetes (Dev -> SIT -> UAT -> Prod)

> **บทนำ:** เอกสารนี้อธิบายถึงจุดเปลี่ยนสำคัญระหว่าง "การทดสอบทางเทคนิค (POC)" กับ "การทำงานจริง (Production Grade SDLC)" โดยเปลี่ยนจากการใช้ Shared Storage มาเป็นกระบวนการ **Artifact Promotion** ที่เป็นมาตรฐานสากล

## 1. Concept: ทำไม Shared Storage ถึง "ไม่เหมาะ" กับ SDLC?

หากเราใช้ Persistent Volume (NFS) ก้อนเดียวเก็บ Source Code หรือ Application Binary ร่วมกันทุก Environment:

* **ปัญหา (The Problem):** เมื่อ Developer แก้ไข Code ใน `DEV` แล้ว Save -> ระบบใน `SIT` และ `UAT` จะเปลี่ยนแปลงตามทันที
* **ผลกระทบ (The Impact):** Environment ไม่มีความเสถียร (Unstable) Tester ไม่สามารถทำงานได้เพราะเวอร์ชันเปลี่ยนกลางอากาศ และหากมีบั๊ก ก็จะพังลามไปทุก Environment

### วิธีที่ถูกต้อง: Artifact Promotion Flow

ใน Kubernetes เราจะไม่ส่งงานด้วยการ Copy ไฟล์ แต่เราจะส่งงานด้วย **"Docker Image"** และ **"Version Tag"**

สิ่งที่ต้อง **แยกกัน (Isolation)** ในแต่ละ Namespace:

1. **PVC (Storage):** แยกข้อมูลใครข้อมูลมัน (Data Isolation)
2. **ConfigMap/Secret:** แยกการตั้งค่า (Configuration Isolation)
3. **Application Version:** แยกเวอร์ชันของแอปพลิเคชัน (Version Control)

---

## 2. Workflow: ขั้นตอนการส่งมอบงาน (The Stages)

| Stage | เป้าหมาย | การจัดการ Image & Deploy | Storage & Data |
|------|----------|--------------------------|----------------|
| **1. DEV** | บ่อทราย (Sandbox) | Auto Deploy ทุกครั้งที่ Commit<br>Tag: `myapp:dev-latest`<br>Status: เปลี่ยนแปลงบ่อย | PVC แยกส่วนตัว<br>ข้อมูลขยะ / ข้อมูลทดสอบ |
| **2. SIT** | จุดตรวจสอบ (QA) | Promote Image ที่ Dev เทสผ่านแล้ว<br>Tag: `myapp:v1.0.0-rc1` (Locked Version)<br>Status: Freeze Code จนกว่าจะเทสจบ | PVC แยกส่วนตัว<br>ข้อมูลสำหรับ Test Scenario |
| **3. UAT** | เสมือนจริง (Pre-Prod) | Promote ใช้ Image เดียวกับ SIT<br>Tag: `myapp:v1.0.0-rc1`<br>Status: ห้ามแก้ Code | PVC แยกส่วนตัว<br>ข้อมูลเสมือนจริง (Masked Prod Data) |
| **4. PROD** | ใช้งานจริง | Release ใช้ Image เดิมจาก UAT<br>Tag: `myapp:v1.0.0-stable`<br>Status: Production Grade | PVC แยกส่วนตัว<br>ข้อมูลจริง (Real User Data) |

---

## 3. Implementation: ตัวอย่าง YAML (Production Grade)

ในส่วนนี้จะแสดง Code ที่ปรับจูนให้ตรงกันทั้งระบบ (Service Name, Label, Port) เพื่อความพร้อมในการใช้งาน

### 3.1 ConfigMap (แยก Configuration)

**File:** `01-config-dev.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: dev
data:
  APP_ENV: "development"
  DB_HOST: "db-dev.internal"
  LOG_LEVEL: "DEBUG"

```

**File:** `01-config-sit.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: sit
data:
  APP_ENV: "sit"
  DB_HOST: "db-sit.internal" # SIT ต่อ Database คนละตัวกับ Dev
  LOG_LEVEL: "INFO"

```

---

### 3.2 PersistentVolumeClaim (แยก Data)

**File:** `02-pvc.yaml` (ใช้ไฟล์รูปแบบเดียวกัน แต่ Apply แยกแต่ละ Namespace)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
  namespace: dev # เปลี่ยนเป็น sit หรือ uat ตาม Environment
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi # ปรับขนาดตามความเหมาะสม

```

---

### 3.3 Deployment (Logic หลักของแอปพลิเคชัน)

เปรียบเทียบความแตกต่างระหว่าง **DEV** (เน้นเร็ว) และ **SIT** (เน้นเสถียร)

**File:** `03-deployment-dev.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: dev
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web-app # Label นี้ต้องตรงกับ Service
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: main-container
        image: myregistry.io/myapp:dev-latest # ใช้ Latest เสมอ
        imagePullPolicy: Always
        ports:
        - containerPort: 8080 # Port ของแอปพลิเคชัน
        envFrom:
        - configMapRef:
            name: app-config

```

**File:** `03-deployment-sit.yaml` (Production Grade)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: sit
spec:
  replicas: 2 # รัน 2 ตัวเพื่อทำ High Availability
  strategy:
    type: RollingUpdate # อัปเดตแบบไม่ให้ระบบล่ม
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
        image: myregistry.io/myapp:v1.0.0-rc1 # Locked Version
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: app-config
        
        # Health Probes (สำคัญมาก)
        livenessProbe: # เช็คว่าแอปตายไหม
          httpGet: { path: /healthz, port: 8080 }
          initialDelaySeconds: 15
        readinessProbe: # เช็คว่าพร้อมรับ Traffic ไหม
          httpGet: { path: /ready, port: 8080 }

        # Resource Limits (ป้องกัน Node ล่ม)
        resources:
          requests: { cpu: "250m", memory: "256Mi" }
          limits: { cpu: "500m", memory: "512Mi" }

```

---

### 3.4 Service (Internal Glue)

ตัวเชื่อมระหว่าง Ingress และ Deployment

**File:** `04-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service # ชื่อนี้ต้องนำไปใส่ใน Ingress
  namespace: dev      # เปลี่ยน namespace ตามไฟล์ที่ deploy (sit, uat)
spec:
  type: ClusterIP
  selector:
    app: web-app      # ต้องตรงกับ Label ใน Deployment
  ports:
    - name: http
      port: 80        # Port ที่ Service เปิดรอรับจาก Ingress
      targetPort: 8080 # Port ที่ยิงเข้า Container จริงๆ
      protocol: TCP

```

---

### 3.5 Ingress (External Door)

ใช้ Host-based Routing เพื่อแยก Domain

**File:** `05-ingress-dev.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: dev
spec:
  ingressClassName: nginx
  rules:
  - host: dev.myapp.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service # ต้องตรงกับชื่อ Service
            port:
              number: 80        # ต้องตรงกับ port ของ Service

```

**File:** `05-ingress-sit.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: sit
spec:
  ingressClassName: nginx
  rules:
  - host: sit.myapp.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 80

```

---

## 4. Checklist ความถูกต้องของการเชื่อมต่อ

เพื่อให้ระบบทำงานได้ ตรวจสอบ 3 จุดนี้ให้ตรงกัน:

1. **Ingress -> Service:**
* Ingress `backend.service.name` ต้องตรงกับ Service `metadata.name` (**myapp-service**)


2. **Service -> Pod:**
* Service `selector.app` ต้องตรงกับ Deployment `template.labels.app` (**web-app**)


3. **Port Mapping:**
* Ingress (80) -> Service Port (80) -> Service TargetPort (8080) -> Container Port (8080)



---

## 5. Production Readiness Checklist

ก่อนนำ Image จาก UAT ขึ้นสู่ Production ต้องผ่านเกณฑ์นี้:

* [ ] **Immutability:** Image Hash บน Prod ต้องตรงกับ UAT 100% (ห้าม Re-build ใหม่)
* [ ] **Zero Downtime:** ตั้งค่า `RollingUpdate` และมี `ReadinessProbe` ที่ถูกต้อง
* [ ] **Config Separation:** ไม่มี Password หรือ IP ฝังใน Code (ใช้ Secret/ConfigMap)
* [ ] **Resource Control:** มีการกำหนด CPU/Memory Limits ชัดเจน
* [ ] **Graceful Shutdown:** แอปพลิเคชันต้องจัดการ SIGTERM ได้ดี (เคลียร์ Connection ก่อนดับ)

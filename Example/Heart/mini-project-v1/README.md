# Kubernetes Full-stack Web Application Project

## 1. วัตถุประสงค์ของโปรเจกต์ (Project Objective)

โปรเจกต์นี้มีวัตถุประสงค์เพื่อสร้างระบบเว็บแอปพลิเคชันแบบ **Full-stack** ที่รันอยู่บน **Kubernetes (Single-node Cluster)** โดยระบบต้องมีคุณสมบัติดังนี้:

* รองรับการขยายตัวอัตโนมัติ (Auto-scaling)
* มีการจำกัดการใช้ทรัพยากร (CPU / Memory Resource Limits)
* มีระบบจัดเก็บข้อมูลแบบถาวร (Persistent Storage)
* ข้อมูลในฐานข้อมูลต้องไม่สูญหาย แม้จะมีการลบหรือรีสตาร์ท Pod

---

## 2. เทคโนโลยีที่ใช้ (Technology Stack)

| Layer            | Technology                                                      |
| ---------------- | --------------------------------------------------------------- |
| Frontend         | HTML / JavaScript รันบน Nginx Container                         |
| Backend          | Node.js (Express Framework) เชื่อมต่อฐานข้อมูลด้วย `pg` library |
| Database         | PostgreSQL (Container Image)                                    |
| Platform         | Kubernetes (Single-node Cluster)                                |
| Containerization | Docker                                                          |

---

## 3. สิ่งที่ได้ลงมือทำไป (Implementation Details)

### A. การจัดการ Image (Containerization)

* สร้าง **Dockerfile** แยกสำหรับ

  * Backend (Node.js)
  * Frontend (Nginx)
* ทำการ Build Container Image และเก็บไว้ในเครื่อง **Master Node**
* ตั้งค่า `imagePullPolicy: Never` เพื่อให้ Kubernetes ใช้ Image ที่มีอยู่ในเครื่องโดยไม่ต้องดึงจาก External Registry

---

### B. ระบบฐานข้อมูลถาวร (Persistent Data)

* สร้าง **Persistent Volume (PV)** และ **Persistent Volume Claim (PVC)**
* ใช้รูปแบบการเก็บข้อมูลแบบ `hostPath`
* ผูกโฟลเดอร์บนเครื่อง Master:

  ```
  /mnt/data/postgres
  ```

  เข้ากับ Pod ของ PostgreSQL
* ทำให้ข้อมูลในฐานข้อมูลยังคงอยู่ แม้ Pod ของ Database จะถูกลบหรือสร้างใหม่

---

### C. การตั้งค่า Kubernetes (Orchestration)

#### Deployment

* สร้าง Deployment สำหรับ

  * Frontend
  * Backend
  * PostgreSQL

#### Service

* **Frontend Service**

  * Type: `NodePort`
  * Port: `30002`

* **Backend Service**

  * Type: `NodePort`
  * Port: `30001`

* **PostgreSQL Service**

  * Type: `ClusterIP`
  * ใช้งานได้เฉพาะภายใน Cluster เพื่อเพิ่มความปลอดภัย

#### Resource Limits

* กำหนด `requests` และ `limits` สำหรับ Backend Pod
* ควบคุมการใช้ CPU และ Memory เพื่อป้องกันการใช้ทรัพยากรเกินจำเป็น

---

### D. ระบบขยายตัวอัตโนมัติ (Auto Scaling)

* ติดตั้งและตั้งค่า **Horizontal Pod Autoscaler (HPA)** สำหรับ Backend
* เงื่อนไขการ Scale:

  * หาก CPU Usage มากกว่า **50%**
* กำหนดจำนวน Pod:

  * Minimum: 1 Pod
  * Maximum: 5 Pods

---

## 4. การแก้ไขปัญหาที่พบ (Troubleshooting)

### ปัญหา: Network Timeout (ETIMEDOUT)

* เกิดขึ้นหลังจากทำ Snapshot เครื่อง Master
* Backend ไม่สามารถเชื่อมต่อ Database ได้

### วิธีแก้ไข

* ลบ Pod ทั้งหมดใน Cluster เพื่อให้ Kubernetes จัดสรร Network ใหม่

  ```bash
  kubectl delete pod --all
  ```
* ตรวจสอบสถานะ Service และ Endpoints ให้ตรงกับ Pod ที่รันอยู่

---

## 5. ผลลัพธ์ของโปรเจกต์ (Key Results)

* สามารถเพิ่มข้อมูลผ่านหน้าเว็บ และข้อมูลถูกบันทึกลง PostgreSQL จริง
* เมื่อลบ Pod ของ Database ระบบจะสร้าง Pod ใหม่ขึ้นมาแทน
* ข้อมูลเดิมในฐานข้อมูลยังคงอยู่ครบถ้วนจาก Persistent Storage
* Backend มีการจำกัดทรัพยากรที่ชัดเจน
* ระบบสามารถ Scale Pod ของ Backend ได้อัตโนมัติเมื่อมีโหลดสูง

---

## 6. ข้อแนะนำสำหรับระดับ Production (Next Steps)

หากนำระบบนี้ไปใช้งานจริงในระดับองค์กร ควรพิจารณาเพิ่มองค์ประกอบดังต่อไปนี้:

### Ingress Controller

* ใช้แทน NodePort
* รองรับการจัดการ Domain และ HTTPS (SSL/TLS)

### ConfigMap & Secrets

* แยกค่าการตั้งค่าและรหัสผ่านออกจากไฟล์ YAML
* เพิ่มความปลอดภัยและง่ายต่อการจัดการ

### Managed Database

* หากรันบน Cloud ควรใช้บริการ Managed DB เช่น

  * AWS RDS
  * Google Cloud SQL
* ลดภาระการดูแล และเพิ่มความเสถียรของระบบ

### Monitoring & Observability

* ติดตั้งเครื่องมือเช่น

  * Prometheus
  * Grafana
* ใช้สำหรับตรวจสอบการใช้ทรัพยากร และดู Dashboard แบบ Real-time

---

> เอกสารฉบับนี้ใช้สำหรับสรุปแนวคิดและการลงมือทำจริงของโปรเจกต์ Kubernetes Full-stack Application เพื่อใช้เป็น Portfolio หรือประกอบการเรียนรู้ระดับ Production

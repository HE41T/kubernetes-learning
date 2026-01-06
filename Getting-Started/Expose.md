# Kubernetes `kubectl expose` – การอธิบายเชิงการทำงานจริง (เชิงลึก)

เอกสารนี้อธิบายการใช้งานคำสั่ง `kubectl expose` โดยเน้น **การทำงานจริง (Practical)**, **ความเข้าใจเชิงลึก (Deep Understanding)** และ **คำอธิบายภาษาไทย** เหมาะสำหรับการเรียนรู้ การสอบ และการใช้งาน Kubernetes ในระบบจริง

---

## แนวคิดพื้นฐานของ `kubectl expose`

`kubectl expose` คือคำสั่งสำหรับ **สร้าง Kubernetes Service** จาก resource ที่มีอยู่แล้ว โดยไม่ต้องเขียน YAML เอง

Resource ที่สามารถ expose ได้:

* Pod
* ReplicationController (RC)
* ReplicaSet (RS)
* Deployment
* Service (สร้าง Service ซ้อน Service)

> เป้าหมายหลัก: ทำให้ Pod เข้าถึงได้ผ่าน **Service (Network Abstraction)**

---

## Kubernetes ทำอะไรเบื้องหลังเมื่อใช้ `kubectl expose`

1. `kubectl` อ่าน resource ต้นทาง (Pod / RC / RS / Deployment)
2. ดึงค่า `metadata.labels` ของ resource นั้น
3. สร้าง Service object ใหม่
4. ใส่ `selector` ให้ match กับ labels ของ Pod
5. kube-proxy ตั้งค่า iptables หรือ IPVS
6. Traffic ถูก load balance ไปยัง Pod ที่ตรง selector

---

## 1. Create a Service for replicated nginx (ReplicationController)

### แปล

สร้าง Service สำหรับ nginx ที่รันแบบ replicated

* Service เปิด port 80
* เชื่อมต่อไปยัง container port 8000

```bash
kubectl expose rc nginx --port=80 --target-port=8000
```

### การทำงานจริง

* อ่าน ReplicationController ชื่อ `nginx`
* ดึง labels จาก RC
* Service จะ select Pod ทุกตัวที่ RC สร้าง

```yaml
spec:
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 8000
```

### ใช้เมื่อ

* ระบบ legacy ที่ยังใช้ RC
* ต้องการ load balance nginx หลาย Pod

---

## 2. Create Service from ReplicationController YAML file

### แปล

สร้าง Service จาก ReplicationController ที่ระบุในไฟล์ `nginx-controller.yaml`

```bash
kubectl expose -f nginx-controller.yaml --port=80 --target-port=8000
```

### การทำงานจริง

* kubectl อ่านไฟล์ YAML
* หา `kind` และ `metadata.name`
* ดึง labels จาก resource ใน cluster
* สร้าง Service ตาม labels นั้น

### ใช้เมื่อ

* มี YAML อยู่แล้ว
* ต้องการอ้างอิง resource แบบ declarative

---

## 3. Create Service for a single Pod

### แปล

สร้าง Service ชื่อ `frontend` ให้ Pod ชื่อ `valid-pod`

* เปิด port 444

```bash
kubectl expose pod valid-pod --port=444 --name=frontend
```

### การทำงานจริง

* Service ชี้ไปที่ Pod เพียงตัวเดียว
* ไม่มี replication
* ถ้า Pod ตาย Service จะยังอยู่ แต่ไม่มี Endpoint

```yaml
selector:
  <labels ของ valid-pod>
```

### ใช้เมื่อ

* Debug
* Test Pod ชั่วคราว
* Single-instance application

---

## 4. Create a second Service from an existing Service

### แปล

สร้าง Service ตัวที่สองจาก Service เดิม

* เปิด port 443
* เชื่อมต่อ container port 8443
* ตั้งชื่อ `nginx-https`

```bash
kubectl expose service nginx \
--port=443 \
--target-port=8443 \
--name=nginx-https
```

### การทำงานจริง

* kubectl คัดลอก selector จาก Service `nginx`
* Service ใหม่จะชี้ไปที่ Pod กลุ่มเดียวกัน
* ใช้คนละ port

### ใช้เมื่อ

* แยก HTTP / HTTPS
* Multi-port access

---

## 5. Create UDP Service for streaming application

### แปล

สร้าง Service สำหรับแอป streaming

* ใช้ UDP
* port 4100
* ชื่อ `video-stream`

```bash
kubectl expose rc streamer \
--port=4100 \
--protocol=UDP \
--name=video-stream
```

### การทำงานจริง

* Service type: ClusterIP (default)
* Protocol: UDP
* kube-proxy ตั้งค่า UDP load balancing

```yaml
ports:
- port: 4100
  protocol: UDP
```

### ใช้เมื่อ

* Video streaming
* Voice / Game server

---

## 6. Create Service for ReplicaSet

### แปล

สร้าง Service สำหรับ nginx ที่ใช้ ReplicaSet

```bash
kubectl expose rs nginx --port=80 --target-port=8000
```

### การทำงานจริง

* ReplicaSet เป็น controller ที่ดูแล Pod
* Service select Pod จาก labels ของ RS
* รองรับ scaling

### ใช้เมื่อ

* ใช้ RS โดยตรง (ไม่ผ่าน Deployment)

---

## 7. Create Service for Deployment

### แปล

สร้าง Service สำหรับ nginx Deployment

* เปิด port 80
* เชื่อมต่อ container port 8000

```bash
kubectl expose deployment nginx --port=80 --target-port=8000
```

### การทำงานจริง

* เป็นรูปแบบที่ใช้มากที่สุดใน Production
* Service select Pod ของ Deployment
* รองรับ scaling และ rolling update

```yaml
selector:
  app: nginx
```

### ใช้เมื่อ

* Web application
* Backend service
* Production workload

---

## 8. Expose a resource as a new Kubernetes Service

### แปล

นำ resource ใด ๆ มาเปิดเป็น Service ใหม่

```bash
kubectl expose <resource>
```

### Resource ที่รองรับ

* Pod
* ReplicationController
* ReplicaSet
* Deployment
* Service

---

## ตารางสรุปเปรียบเทียบ Resource ที่ถูก Expose

| Resource              | เหมาะกับ Production | หมายเหตุ              |
| --------------------- | ------------------- | --------------------- |
| Pod                   | ❌                   | Pod ตายแล้วจบ         |
| ReplicationController | ❌                   | Legacy                |
| ReplicaSet            | ⚠️                  | มักใช้ผ่าน Deployment |
| Deployment            | ✅                   | มาตรฐาน Production    |
| Service               | —                   | Network abstraction   |

---

## Key Insight (สำคัญมาก)

* `kubectl expose` **ไม่สร้าง Pod**
* คำสั่งนี้สร้าง **Service** เท่านั้น
* Service ทำงานผ่าน **Label Selector**
* Pod IP เปลี่ยนได้ แต่ **Service IP คงที่**

---

> เอกสารนี้สามารถใช้เป็นไฟล์สรุปสอบ Kubernetes, Lab Guide หรือ Reference สำหรับ Production ได้ทันที

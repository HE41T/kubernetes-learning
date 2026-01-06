# Kubernetes `kubectl run` – การอธิบายเชิงการทำงานจริง (เชิงลึก)

เอกสารนี้อธิบายการใช้งานคำสั่ง `kubectl run` โดยเน้น **การทำงานจริง (Practical)**, **แนวคิดเชิงลึก (Deep Understanding)** และ **คำอธิบายภาษาไทย** เหมาะสำหรับการเรียนรู้ การสอบ และการใช้งานในห้อง Lab หรือ Debug ระบบ Kubernetes

> หมายเหตุ: ปัจจุบัน `kubectl run` ถูกออกแบบมาเพื่อ **สร้าง Pod เป็นหลัก** (ไม่เหมาะสำหรับ Production Workload)

---

## แนวคิดพื้นฐานของ `kubectl run`

`kubectl run` เป็นคำสั่งแบบ **Imperative** ใช้สร้าง Pod อย่างรวดเร็วโดยไม่ต้องเขียน YAML

### กระบวนการทำงานจริง

1. `kubectl` สร้าง Pod manifest ชั่วคราวในหน่วยความจำ
2. ส่ง manifest ไปยัง Kubernetes API Server
3. API Server บันทึกข้อมูลลงใน etcd
4. Scheduler เลือก Node ที่เหมาะสม
5. kubelet สั่ง container runtime (containerd / docker) ให้รัน container

---

## 1. Start a nginx pod

### แปล

เริ่มต้น Pod ที่รัน nginx image

```bash
kubectl run nginx --image=nginx
```

### การทำงานจริง

* สร้าง Pod ชื่อ `nginx`
* ใช้ image `nginx:latest`
* ไม่มี Service และไม่ได้ expose port ออกนอก cluster

### ตัวอย่างโครงสร้าง Pod

```yaml
kind: Pod
spec:
  containers:
  - name: nginx
    image: nginx
```

### ใช้เมื่อ

* ทดสอบ cluster
* ทดสอบ image อย่างรวดเร็ว

---

## 2. Start hazelcast pod and expose port 5701

### แปล

เริ่ม Pod hazelcast และกำหนด port 5701 ให้ container

```bash
kubectl run hazelcast --image=hazelcast/hazelcast --port=5701
```

### การทำงานจริง

* `--port` จะถูกแปลงเป็น `containerPort`
* **ไม่สร้าง Service ให้อัตโนมัติ**

```yaml
ports:
- containerPort: 5701
```

### ใช้เมื่อ

* เตรียม Pod สำหรับให้ Service มา select

---

## 3. Start hazelcast pod with environment variables

### แปล

เริ่ม Pod และตั้งค่า environment variables ภายใน container

```bash
kubectl run hazelcast \
--image=hazelcast/hazelcast \
--env="DNS_DOMAIN=cluster" \
--env="POD_NAMESPACE=default"
```

### การทำงานจริง

* Kubernetes inject ค่า env ตอน container start
* application ภายในอ่านค่าได้ทันที

```yaml
env:
- name: DNS_DOMAIN
  value: cluster
- name: POD_NAMESPACE
  value: default
```

### ใช้เมื่อ

* แยก config ออกจาก code
* ทดสอบ behavior ของ application

---

## 4. Start hazelcast pod with labels

### แปล

เริ่ม Pod และกำหนด labels

```bash
kubectl run hazelcast \
--image=hazelcast/hazelcast \
--labels="app=hazelcast,env=prod"
```

### การทำงานจริง

* labels ถูกเก็บใน `metadata.labels`
* ใช้สำหรับ Service, Monitoring และการจัดกลุ่ม resource

```yaml
metadata:
  labels:
    app: hazelcast
    env: prod
```

---

## 5. Dry run (ไม่สร้าง resource จริง)

### แปล

จำลองคำสั่งโดยไม่สร้าง Pod จริง

```bash
kubectl run nginx --image=nginx --dry-run=client
```

### การทำงานจริง

* kubectl สร้าง manifest
* ไม่ส่งไป API Server

> แนะนำใช้คู่กับ `-o yaml`

```bash
kubectl run nginx --image=nginx --dry-run=client -o yaml
```

### ใช้เมื่อ

* เตรียม YAML
* ตรวจสอบ syntax

---

## 6. Override Pod spec ด้วย JSON

### แปล

สร้าง nginx Pod และแก้ spec บางส่วนด้วย JSON

```bash
kubectl run nginx --image=nginx \
--overrides='{ "apiVersion": "v1", "spec": { ... } }'
```

### การทำงานจริง

* ใช้ JSON override Pod spec
* เหมาะกับ automation ขั้นสูง
* error ได้ง่ายถ้าโครงสร้างผิด

---

## 7. Start busybox pod แบบ interactive และไม่ restart

### แปล

รัน busybox แบบ interactive และไม่ restart เมื่อ exit

```bash
kubectl run -i -t busybox \
--image=busybox \
--restart=Never
```

### การทำงานจริง

* `-i -t` เปิด stdin + tty
* `--restart=Never` = สร้าง Pod (ไม่ใช่ controller)

### ใช้เมื่อ

* Debug DNS
* Debug Network

---

## 8. Use default command but custom arguments

### แปล

ใช้ command เดิมของ image แต่ส่ง arguments ใหม่

```bash
kubectl run nginx --image=nginx -- <arg1> <arg2>
```

### การทำงานจริง

* arguments จะไปแทนค่า `CMD` ใน Dockerfile

```dockerfile
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
```

---

## 9. Use different command and custom arguments

### แปล

ใช้ command ใหม่แทนของเดิมใน image

```bash
kubectl run nginx --image=nginx --command -- <cmd> <arg1>
```

### การทำงานจริง

* `--command` override ENTRYPOINT
* ใช้รัน shell หรือคำสั่ง debug

ตัวอย่าง:

```bash
kubectl run nginx --image=nginx --command -- sh
```

---

## 10. Create and run a particular image in a pod

### แปล

สร้าง Pod เพื่อรัน image ใด ๆ

```bash
kubectl run <pod-name> --image=<image>
```

### การทำงานจริง

* เป็น shortcut สำหรับ Pod creation
* เหมาะกับ test / lab / debug
* ไม่เหมาะกับ production

---

## สรุป

`kubectl run` เหมาะสำหรับ:

* ⚡ Quick test
* 🧪 Experiment
* 🛠 Debug

ไม่เหมาะสำหรับ:

* Production workload
* Long-running service (ควรใช้ Deployment แทน)

---

> เอกสารนี้สามารถนำไปใช้เป็นไฟล์สรุปสอบ Kubernetes หรือ Lab Guide ได้ทันที

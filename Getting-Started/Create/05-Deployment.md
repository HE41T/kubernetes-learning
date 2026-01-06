# Deployment in Kubernetes

**Deployment** คือ resource ใน Kubernetes สำหรับจัดการการรัน Pod แบบ declarative

* สามารถควบคุมจำนวน replicas
* รองรับ rolling updates และ rollback
* ใช้สำหรับ stateless application เป็นหลัก

ยังหาที่ใส่ไม่ได้ ฝากไว้ก่อน

<img width="683" height="323" alt="image" src="https://github.com/user-attachments/assets/ca4ef50d-e785-4519-bbcb-57120a67d71b" />

---

## 1. สร้าง Deployment พื้นฐาน

```bash
kubectl create deployment my-dep --image=busybox
```

**อธิบาย**

* `my-dep` = ชื่อ Deployment
* `--image` = Container image

**เชิงการทำงานจริง**

* สร้าง Pod 1 ตัวโดยอัตโนมัติ
* Useful สำหรับงานทดลอง / testing

---

## 2. Deployment พร้อม command

```bash
kubectl create deployment my-dep --image=busybox -- date
```

**อธิบาย**

* รัน command เฉพาะใน container
* Useful สำหรับ run script / job แบบ ad-hoc

---

## 3. Deployment พร้อม replicas

```bash
kubectl create deployment my-dep --image=nginx --replicas=3
```

**อธิบาย**

* สร้าง Pod 3 ตัว
* ใช้สำหรับ load balancing และ high availability

---

## 4. Deployment พร้อม expose port

```bash
kubectl create deployment my-dep --image=busybox --port=5701
```

**อธิบาย**

* Pod จะ expose port 5701
* Useful สำหรับ service ที่ต้องติดต่อจาก network ภายนอก

---

## 5. ตรวจสอบ Deployment

```bash
kubectl get deployments
kubectl describe deployment my-dep
kubectl rollout status deployment my-dep
```

**เชิงการทำงานจริง**

* ตรวจสอบจำนวน replicas, image, strategy, event logs
* ใช้สำหรับ debug และ monitor

---

## 6. Best Practices

* ใช้ descriptive name สำหรับ Deployment
* กำหนด resource limits และ requests สำหรับ Pod
* ใช้ rolling update strategy เพื่อลด downtime
* ใช้ labels / selectors ให้สอดคล้องกับ Service
* Version control image tag แทน `latest` สำหรับ production

---

## 7. Extra Details

* Deployment สามารถ update image หรือ configuration โดยไม่ลบ Pod เดิม
* รองรับ rollback หาก update มีปัญหา
* สามารถ mount ConfigMap / Secret / Volume เพื่อจัดการ configuration

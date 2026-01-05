# ClusterIP Service in Kubernetes

**ClusterIP Service** คือ service type พื้นฐานของ Kubernetes สำหรับ expose pods ภายใน cluster

* จะสร้าง IP ภายใน cluster ให้ Pod อื่น ๆ เข้าถึง
* ไม่สามารถเข้าจากภายนอก cluster ได้โดยตรง

---

## 1. สร้าง ClusterIP Service พื้นฐาน

```bash
kubectl create service clusterip my-cs --tcp=5678:8080
```

**อธิบาย**

* `my-cs` = ชื่อ service
* `--tcp=5678:8080` = mapping port ของ service 5678 ไปยัง port ของ pod 8080

**เชิงการทำงานจริง**

* Useful สำหรับ service ภายใน cluster เช่น backend API, database
* Pod อื่นสามารถเข้าถึง service ผ่าน `my-cs:5678`

---

## 2. ClusterIP แบบ Headless

```bash
kubectl create service clusterip my-cs --clusterip="None"
```

**อธิบาย**

* `--clusterip=None` = ทำให้ service เป็น headless
* Pod สามารถ discover ผ่าน DNS โดยตรง
* Useful สำหรับ StatefulSet หรือ service ที่ต้องการ pod-to-pod communication โดยไม่ต้องผ่าน load balancer

---

## 3. ตรวจสอบ ClusterIP Service

```bash
kubectl get svc
kubectl describe svc my-cs
```

**เชิงการทำงานจริง**

* ตรวจสอบ IP ของ service, target port, selector, และ endpoints
* Useful สำหรับ debug ปัญหา Pod ไม่สามารถเข้าถึง service

---

## 4. Best Practices

### สิ่งที่ควรทำ (Do)

* ใช้ ClusterIP สำหรับ service ภายใน cluster เท่านั้น
* ตั้งชื่อ service descriptive เพื่อเข้าใจง่าย
* ตรวจสอบ selector ให้ตรงกับ label ของ Pod
* ใช้ headless service สำหรับ StatefulSet หรือ scenario ที่ต้องการ pod-to-pod DNS resolution
* ตรวจสอบ endpoints หลังสร้าง service ว่า pod ถูก link ถูกต้อง

### สิ่งที่ไม่ควรทำ (Don't)

* ใช้ ClusterIP ถ้าต้องการ expose service ภายนอก cluster (ควรใช้ NodePort หรือ LoadBalancer)
* ตั้ง port mapping ผิดหรือไม่ตรงกับ container port
* ละเลยตรวจสอบ endpoints ทำให้ traffic ไม่สามารถไปถึง Pod ได้
* ใช้ headless service โดยไม่เข้าใจ implications เช่น จะไม่มี load balancing อัตโนมัติ

---

## 5. Extra Details

* ClusterIP เป็น default service type ของ Kubernetes
* ใช้ร่วมกับ DNS ของ cluster เพื่อให้ Pod อื่น ๆ เข้าถึง service ผ่านชื่อ service
* Headless service ไม่มี load balancer แต่สามารถใช้สำหรับ StatefulSet, custom service discovery, หรือ direct pod access
* สามารถใช้ร่วมกับ NetworkPolicy เพื่อจำกัด traffic ภายใน cluster

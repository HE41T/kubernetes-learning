# LoadBalancer Service in Kubernetes

**LoadBalancer Service** คือ service type ใน Kubernetes สำหรับ expose Pod ไปยังภายนอก cluster

* สร้าง LoadBalancer โดย cloud provider (เช่น AWS ELB, GCP LB, Azure LB)
* สามารถเข้าถึง service จากภายนอกผ่าน public IP

---

## 1. สร้าง LoadBalancer Service พื้นฐาน

```bash
kubectl create service loadbalancer my-lbs --tcp=5678:8080
```

**อธิบาย**

* `my-lbs` = ชื่อ service
* `--tcp=5678:8080` = mapping port ของ service 5678 ไปยัง port ของ pod 8080

**เชิงการทำงานจริง**

* Useful สำหรับ service ที่ต้องให้ client ภายนอกเข้าถึง เช่น web server, API gateway
* Cloud provider จะสร้าง load balancer และ assign public IP ให้อัตโนมัติ

---

## 2. ตรวจสอบ LoadBalancer Service

```bash
kubectl get svc
kubectl describe svc my-lbs
```

**เชิงการทำงานจริง**

* ตรวจสอบ external IP, port mapping, selector, และ endpoints
* Useful สำหรับ debug ปัญหา service ไม่สามารถเข้าถึงจากภายนอก

---

## 3. Best Practices

### สิ่งที่ควรทำ (Do)

* ใช้ LoadBalancer service สำหรับ expose Pod ภายนอก cluster เท่านั้น
* ตั้งชื่อ service descriptive เพื่อความเข้าใจง่าย
* ตรวจสอบ selector ให้ตรงกับ label ของ Pod
* ใช้ health check ของ cloud provider เพื่อตรวจสอบ pod readiness
* Monitor traffic และ scaling ของ load balancer

### สิ่งที่ไม่ควรทำ (Don't)

* ใช้ LoadBalancer service สำหรับ internal-only communication (ใช้ ClusterIP แทน)
* ตั้ง port mapping ผิดหรือไม่ตรงกับ container port
* ละเลย security เช่น เปิด public IP โดยไม่ใช้ firewall หรือ NetworkPolicy
* ใช้ LoadBalancer บน cluster ที่ไม่ได้รองรับ cloud provider จะไม่ทำงาน

---

## 4. Extra Details

* LoadBalancer service จะสร้าง ClusterIP service และ NodePort ภายในด้วย
* Cloud provider จะ provision external load balancer และ public IP
* สามารถใช้ร่วมกับ Ingress เพื่อจัดการ HTTPS, path-based routing, หรือ TLS termination
* ใช้ร่วมกับ NetworkPolicy และ RBAC เพื่อควบคุม traffic และ access

# NodePort Service in Kubernetes

**NodePort Service** คือ service type ใน Kubernetes สำหรับ expose Pod ไปยังทุก Node ใน cluster ผ่าน port ที่กำหนด

* เป็น service type ระดับกลางระหว่าง ClusterIP และ LoadBalancer
* สามารถเข้าถึง Pod จากภายนอกผ่าน `<NodeIP>:<NodePort>`

---

## 1. สร้าง NodePort Service พื้นฐาน

```bash
kubectl create service nodeport my-ns --tcp=5678:8080
```

**อธิบาย**

* `my-ns` = ชื่อ service
* `--tcp=5678:8080` = mapping port ของ Node 5678 ไปยัง Pod port 8080

**เชิงการทำงานจริง**

* Useful สำหรับ expose service แบบ external โดยไม่ต้องใช้ cloud provider load balancer
* Pod สามารถเข้าถึงผ่าน `<NodeIP>:5678` จากภายนอก cluster

---

## 2. ตรวจสอบ NodePort Service

```bash
kubectl get svc
kubectl describe svc my-ns
```

**เชิงการทำงานจริง**

* ตรวจสอบ NodePort, target port, selector, และ endpoints
* Useful สำหรับ debug ปัญหา Pod ไม่สามารถเข้าถึง service จากภายนอก

---

## 3. Best Practices

### สิ่งที่ควรทำ (Do)

* ใช้ NodePort service สำหรับ expose service ภายนอก cluster เมื่อไม่มี load balancer
* กำหนด port ชัดเจนและอยู่ใน range 30000-32767
* ตรวจสอบ selector ให้ตรงกับ label ของ Pod
* ใช้ firewall หรือ security group เพื่อจำกัดการเข้าถึง NodePort จาก IP ที่เชื่อถือได้
* ใช้ NodePort ร่วมกับ Ingress หรือ LoadBalancer สำหรับ production เพื่อความสะดวก

### สิ่งที่ไม่ควรทำ (Don't)

* ใช้ NodePort service สำหรับ internal-only communication (ใช้ ClusterIP แทน)
* เปิด port NodePort ทุก port โดยไม่จำเป็น
* ตั้ง port นอก range 30000-32767
* ละเลย security เช่น ไม่ใช้ firewall ทำให้ NodePort เปิดทุก Node public IP
* ใช้ NodePort ใน cluster ขนาดใหญ่โดยไม่ควบคุม traffic อาจเกิด port collision

---

## 4. Extra Details

* NodePort service จะสร้าง ClusterIP service ภายใน cluster ด้วย
* สามารถใช้ร่วมกับ Ingress หรือ LoadBalancer เพื่อจัดการ routing และ TLS
* ใช้ร่วมกับ NetworkPolicy และ RBAC เพื่อควบคุม traffic และ access
* NodePort เป็นพื้นฐานสำหรับ LoadBalancer service บน cloud provider

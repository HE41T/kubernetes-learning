# Kubectl Commands Cheat Sheet (สำหรับงาน Cloud)

เอกสารนี้สรุป **คำสั่ง `kubectl` ที่สำคัญและใช้บ่อยในงาน Kubernetes / Cloud**
เน้น **คำสั่ง + ตัวอย่างการใช้งานจริง** เพื่อให้อ่านแล้วเห็นภาพทันที

---

## 1. ตรวจสอบ Cluster และ Context

```bash
kubectl cluster-info
```

แสดงข้อมูล Kubernetes Cluster เช่น API Server และ Core Services

```bash
kubectl config get-contexts
```

ดู context ทั้งหมดที่มี (เช่น dev / prod)

```bash
kubectl config use-context <context-name>
```

สลับไปใช้งาน Cluster / Environment ที่ต้องการ

---

## 2. Node Management

```bash
kubectl get nodes
```

ดู Node ทั้งหมดใน Cluster และสถานะ (Ready / NotReady)

```bash
kubectl get nodes -o wide
```

ดูข้อมูลเพิ่มเติม เช่น IP, OS, Kernel

```bash
kubectl describe node <node-name>
```

ดูรายละเอียด Node เช่น Resource, Pods ที่รันอยู่, Conditions

---

## 3. Namespace

```bash
kubectl get ns
```

ดู Namespace ทั้งหมดใน Cluster

```bash
kubectl create ns <namespace-name>
```

สร้าง Namespace ใหม่

```bash
kubectl get pods -n <namespace>
```

ดู Pod ภายใน Namespace ที่กำหนด

---

## 4. Pod Management

```bash
kubectl get pods
```

ดู Pod ใน Namespace ปัจจุบัน

```bash
kubectl get pods -A
```

ดู Pod ทุก Namespace (ใช้บ่อยมากในงานจริง)

```bash
kubectl describe pod <pod-name>
```

ดูรายละเอียด Pod เช่น Events, Container Status, Error

```bash
kubectl logs <pod-name>
```

ดู Log ของ Container (default container)

```bash
kubectl logs <pod-name> -c <container-name>
```

ดู Log ของ Container ที่ระบุ

```bash
kubectl exec -it <pod-name> -- /bin/bash
```

เข้าไปใน Container เพื่อ debug

---

## 5. Deployment & ReplicaSet

```bash
kubectl get deployments
```

ดู Deployment ทั้งหมด

```bash
kubectl describe deployment <deployment-name>
```

ดูรายละเอียด Deployment และการ rollout

```bash
kubectl scale deployment <deployment-name> --replicas=3
```

เพิ่ม/ลดจำนวน Pod (Scale)

```bash
kubectl rollout status deployment/<deployment-name>
```

ตรวจสอบสถานะการ deploy

```bash
kubectl rollout undo deployment/<deployment-name>
```

Rollback กลับไปเวอร์ชันก่อนหน้า

---

## 6. Service & Networking

```bash
kubectl get svc
```

ดู Service ทั้งหมด (ClusterIP / NodePort / LoadBalancer)

```bash
kubectl describe svc <service-name>
```

ดูรายละเอียด Service และ Endpoint ที่เชื่อมกับ Pod

```bash
kubectl port-forward pod/<pod-name> 8080:80
```

Forward Port จากเครื่อง Local ไปยัง Pod

```bash
kubectl port-forward svc/<service-name> 8080:80
```

Forward Port ผ่าน Service (นิยมใช้ในการทดสอบ)

---

## 7. ConfigMap & Secret

```bash
kubectl get configmap
```

ดู ConfigMap ทั้งหมด

```bash
kubectl describe configmap <configmap-name>
```

ดูค่า Configuration ภายใน

```bash
kubectl get secret
```

ดู Secret ทั้งหมด

```bash
kubectl describe secret <secret-name>
```

ดู metadata ของ Secret (ไม่แสดงค่าจริง)

---

## 8. Apply / Delete Resource (YAML)

```bash
kubectl apply -f app.yaml
```

สร้างหรืออัปเดต Resource จากไฟล์ YAML

```bash
kubectl apply -f ./manifests/
```

Apply YAML ทุกไฟล์ในโฟลเดอร์

```bash
kubectl delete -f app.yaml
```

ลบ Resource ที่สร้างจากไฟล์

---

## 9. Monitoring & Resource Usage

```bash
kubectl top nodes
```

ดูการใช้ CPU / Memory ของ Node

```bash
kubectl top pods
```

ดูการใช้ CPU / Memory ของ Pod

> หมายเหตุ: ต้องติดตั้ง metrics-server ก่อน

---

## 10. Debug & Troubleshooting (ใช้บ่อยมาก)

```bash
kubectl get events --sort-by=.metadata.creationTimestamp
```

ดู Event ทั้งหมด เรียงตามเวลา

```bash
kubectl get pods --show-labels
```

ดู Pod พร้อม labels (ใช้แก้ปัญหา Service selector)

```bash
kubectl explain pod.spec
```

ดูโครงสร้าง YAML และความหมายของ field ต่าง ๆ

---

## 11. คำสั่งลัดที่ DevOps ใช้จริง

```bash
kubectl get all
```

ดู Resource หลักทั้งหมดใน Namespace ปัจจุบัน

```bash
kubectl get all -A
```

ดู Resource ทุก Namespace (นิยมใช้ตอน debug)

```bash
kubectl delete pod <pod-name>
```

ลบ Pod (ถ้าอยู่ใน Deployment จะถูกสร้างใหม่อัตโนมัติ)

---

## สรุป

* `kubectl get / describe / logs / exec` → ใช้ debug
* `apply / delete` → ใช้ deploy
* `port-forward` → ใช้ทดสอบแบบไม่ expose จริง
* `top / events` → ใช้ตรวจสุขภาพ Cluster

เอกสารนี้เหมาะสำหรับ:

* ใช้เป็น Cheat Sheet
* อ่านสอบ / ทำงาน Cloud
* ใช้หน้างานจริง (Production / Dev / Test)

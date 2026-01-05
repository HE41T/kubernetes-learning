# Namespace in Kubernetes

**Namespace** คือวิธีในการแบ่ง logical cluster ภายใน Kubernetes

* ใช้แยก environment (dev, staging, prod)
* ใช้แยก team หรือ project
* ใช้ร่วมกับ RBAC และ ResourceQuota เพื่อควบคุมสิทธิ์และ resource

---

## 1. สร้าง Namespace

```bash
kubectl create namespace my-namespace
```

**อธิบาย**

* `my-namespace` = ชื่อ namespace

**เชิงการทำงานจริง**

* แยก resource ของแต่ละทีมหรือ environment
* Resource ใน namespace หนึ่งจะไม่ชนกับอีก namespace

---

## 2. การตรวจสอบ Namespace

```bash
kubectl get namespaces
kubectl describe namespace my-namespace
```

**เชิงการทำงานจริง**

* ใช้ตรวจสอบ status, labels, annotations ของ namespace
* Useful สำหรับ debug ปัญหา resource หรือ permission

---

## 3. ใช้ Namespace กับคำสั่งอื่น ๆ

```bash
kubectl get pods --namespace=my-namespace
kubectl create configmap my-config --from-literal=key=value --namespace=my-namespace
```

**เชิงการทำงานจริง**

* Resource จะถูกสร้างภายใน namespace ที่ระบุ
* Pod / Service / ConfigMap / Secret สามารถระบุ namespace ได้

---

## 4. Best Practices

* ใช้ namespace แยกตาม environment (dev, staging, prod)
* ใช้ namespace แยกตาม team หรือ project
* ตั้งชื่อ descriptive และ consistent
* ใช้ ResourceQuota + LimitRange ใน namespace เพื่อควบคุม resource
* ใช้ RBAC จำกัดสิทธิ์ตาม namespace

---

## 5. Extra Details

* default namespace ถูกสร้างมาอัตโนมัติ ถ้าไม่ได้ระบุ
* kube-system namespace ใช้สำหรับ Kubernetes core components
* kube-public namespace สำหรับ resource ที่ public ใน cluster
* สามารถใช้ label และ annotation กับ namespace เพื่อจัดการ resource ขนาดใหญ่

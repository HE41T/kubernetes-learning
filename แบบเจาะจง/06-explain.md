# Kubernetes `kubectl explain` – การอธิบายเชิงลึก

คำสั่ง `kubectl explain` ใช้สำหรับ **ดู documentation ของ resource หรือ field ใน resource**

* เรียนรู้โครงสร้าง resource
* ดู type และคำอธิบายของแต่ละ field

> ⚠️ คำสั่งนี้ **ไม่เชื่อมกับ cluster** เพียงดู schema ของ resource เท่านั้น

---

## 1. Get documentation of a resource

```bash
kubectl explain pods
```

* ดู documentation ของ resource `pods`
* แสดง field หลัก เช่น `metadata`, `spec`, `status`
* ช่วยให้เข้าใจ structure ของ Pod และ field ที่จำเป็นต้องใส่

### ใช้เมื่อ

* ต้องการสร้าง YAML/JSON manifest ด้วยตัวเอง
* ตรวจสอบ field ที่ required / optional

---

## 2. Get documentation of a specific field

```bash
kubectl explain pods.spec.containers
```

* ดู documentation ของ field `spec.containers` ใน Pod
* แสดงรายละเอียด type, description, required/optional
* ช่วยเข้าใจว่าต้องใส่อะไรใน container object เช่น `name`, `image`, `ports`

### ใช้เมื่อ

* เขียน Pod manifest เอง
* Debug หรือ validate field type
* ทำ automation / pipeline validation

---

## 3. List supported resources

```bash
kubectl explain
```

* แสดง resource ทั้งหมดที่ Kubernetes รองรับ
* สามารถดูรายละเอียด field ของ resource ต่อได้ เช่น:

```bash
kubectl explain deployment.spec.template.spec.containers
```

### ใช้เมื่อ

* อยากรู้ว่า resource ไหน support field อะไร
* ทำ auto-generate manifest, Helm chart หรือ Kustomize

---

## Key Insight

* `kubectl explain` = เรียนรู้ schema ของ Kubernetes resource
* ใช้ร่วมกับ:

  * `kubectl get -o yaml/json` → ดู resource จริง
  * `kubectl apply -f` → สร้าง resource
* เหมาะสำหรับ:

  * ผู้เริ่มต้น Kubernetes
  * Dev / DevOps ที่เขียน manifest เอง
  * Debug manifest validation

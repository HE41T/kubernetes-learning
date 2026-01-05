# ConfigMap in Kubernetes

**ConfigMap** คือ resource ใน Kubernetes สำหรับเก็บข้อมูล configuration ที่ไม่เป็นความลับ (non-sensitive data) เช่นไฟล์ config, key-value pairs, environment variables

---

## 1. สร้าง ConfigMap จากโฟลเดอร์

```bash
kubectl create configmap my-config --from-file=path/to/bar
```

**อธิบาย**

* สร้าง ConfigMap ชื่อ `my-config` จากไฟล์ทั้งหมดในโฟลเดอร์ `bar`
* Key ของ ConfigMap จะใช้ชื่อไฟล์โดยอัตโนมัติ

**เชิงการทำงานจริง**

* ใช้เก็บ config สำหรับ Pod / Deployment
* สามารถ mount เป็นไฟล์ใน Pod หรือเป็น environment variable

---

## 2. สร้าง ConfigMap โดยระบุชื่อ key เอง

```bash
kubectl create configmap my-config --from-file=key1=/path/to/bar/file1.txt --from-file=key2=/path/to/bar/file2.txt
```

**อธิบาย**

* ระบุชื่อ key ของ ConfigMap แทนชื่อไฟล์บนดิสก์
* Useful เมื่อชื่อไฟล์บนดิสก์ไม่ตรงกับ key ที่ต้องการ

---

## 3. สร้าง ConfigMap จาก literal key-value

```bash
kubectl create configmap my-config --from-literal=key1=config1 --from-literal=key2=config2
```

**อธิบาย**

* เก็บค่า config แบบ key=value
* เหมาะสำหรับค่าที่สั้นและไม่ซับซ้อน

---

## 4. สร้าง ConfigMap จากไฟล์ env

```bash
kubectl create configmap my-config --from-env-file=path/to/foo.env --from-env-file=path/to/bar.env
```

**อธิบาย**

* ใช้ไฟล์ environment variables (`key=value`) มาสร้าง ConfigMap
* Useful สำหรับ Pod ที่ต้องการ env variable จำนวนมาก

---

## 5. ใช้ ConfigMap ใน Pod / Deployment

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
  - name: app
    image: nginx
    envFrom:
    - configMapRef:
        name: my-config
```

**เชิงการทำงานจริง**

* Pod จะโหลดค่าจาก ConfigMap เป็น environment variables
* สามารถ mount ConfigMap เป็นไฟล์ใน container ได้

---

## 6. ตรวจสอบ ConfigMap

```bash
kubectl get configmap my-config -o yaml
kubectl describe configmap my-config
```

---

## 7. Best Practices

* ConfigMap สำหรับข้อมูล **ไม่ลับ** เท่านั้น
* สำหรับข้อมูลลับให้ใช้ Secret แทน
* แยก ConfigMap ตาม application / environment
* ใช้ descriptive key และชื่อ ConfigMap
* ตรวจสอบการอัปเดต ConfigMap ก่อน mount กับ Pod เพื่อป้องกันผลกระทบ

---

## 8. Extra Details

* ConfigMap สามารถถูก update โดยไม่ต้อง restart Pod (ถ้าใช้ volume mount)
* ใช้ labels และ annotations เพื่อจัดการ ConfigMap ขนาดใหญ่
* ใช้ versioning / naming convention สำหรับ config หลาย environment

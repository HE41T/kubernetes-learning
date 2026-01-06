# Kubernetes `kubectl apply` – การอธิบายเชิงการทำงานจริง (เชิงลึก)

เอกสารนี้อธิบายการใช้งานคำสั่ง `kubectl apply` แบบ **Declarative Management** โดยเน้นการทำงานจริงภายใน Kubernetes, ความเข้าใจเชิงลึก และคำอธิบายภาษาไทย เหมาะสำหรับการสอบ การทำงานจริง และ Production Environment

---

## แนวคิดหลักของ `kubectl apply`

`kubectl apply` ใช้สำหรับจัดการ Kubernetes Resource แบบ **Declarative**

> คุณระบุว่า “ระบบควรมีสภาพเป็นแบบไหน” (Desired State)
> Kubernetes จะพยายามทำให้สภาพจริง (Actual State) ตรงกับสิ่งที่ประกาศไว้

แตกต่างจาก `kubectl create` หรือ `kubectl replace` ที่เป็นแนว **Imperative**

---

## Kubernetes ทำอะไรเบื้องหลังเมื่อสั่ง `kubectl apply`

1. `kubectl` ส่ง manifest ไปยัง Kubernetes API Server
2. API Server เปรียบเทียบ manifest กับ resource ปัจจุบัน
3. ใช้ annotation `kubectl.kubernetes.io/last-applied-configuration`
4. คำนวณความแตกต่าง (diff)
5. Update เฉพาะ field ที่เปลี่ยน
6. Controller ทำการ reconcile ให้ตรงกับ desired state

---

## 1. Apply configuration จากไฟล์ pod.json

### แปล

นำ configuration ในไฟล์ `pod.json` ไปใช้กับ Pod

```bash
kubectl apply -f ./pod.json
```

### การทำงานจริง

* ถ้า Pod ยังไม่มี → Kubernetes สร้าง Pod ใหม่
* ถ้า Pod มีอยู่แล้ว → Update เฉพาะ field ที่เปลี่ยน

### ใช้เมื่อ

* Infrastructure as Code
* GitOps workflow

---

## 2. Apply resource จาก Kustomize directory

### แปล

Apply resource จาก directory ที่มีไฟล์ `kustomization.yaml`

```bash
kubectl apply -k dir/
```

### การทำงานจริง

* kubectl build manifest จาก kustomize
* รวม base + overlay
* Apply manifest ชุดสุดท้าย

### ใช้เมื่อ

* แยก environment (dev / staging / prod)

---

## 3. Apply configuration จาก stdin

### แปล

Apply JSON ที่ส่งเข้ามาทาง standard input

```bash
cat pod.json | kubectl apply -f -
```

### การทำงานจริง

* `-f -` หมายถึงอ่านจาก stdin
* ใช้ใน pipeline หรือ automation

---

## 4. Apply หลายไฟล์ด้วย wildcard

### แปล

Apply resource จากทุกไฟล์ที่ลงท้ายด้วย `.json`

```bash
kubectl apply -f '*.json'
```

### การทำงานจริง

* Shell ขยาย wildcard
* kubectl apply ทีละ resource
* ไม่เป็น atomic

---

## 5. Apply พร้อม prune (Alpha Feature)

### แปล

Apply resource ที่มี label `app=nginx` และลบ resource อื่นที่มี label เดียวกันแต่ไม่อยู่ในไฟล์

```bash
kubectl apply --prune -f manifest.yaml -l app=nginx
```

### การทำงานจริง

1. Apply resource ในไฟล์
2. Kubernetes ค้น resource ที่ label ตรง
3. ลบ resource ที่ไม่อยู่ใน manifest

⚠️ **อันตราย หากใช้ label ผิด**

---

## 6. Apply พร้อม prune เฉพาะ ConfigMap

### แปล

Apply manifest และลบ ConfigMap ที่ไม่ได้อยู่ในไฟล์

```bash
kubectl apply --prune -f manifest.yaml --all \
  --prune-allowlist=core/v1/ConfigMap
```

### การทำงานจริง

* จำกัด resource ที่จะ prune
* ปลอดภัยกว่า prune ทั้งหมด

---

## 7. Apply ต้องมี resource name

### แปล

การ apply ต้องระบุชื่อ resource ชัดเจน

```bash
kubectl apply -f file.yaml
kubectl apply -f -
```

### การทำงานจริง

* ต้องมี `kind` และ `metadata.name`
* ไม่สามารถ apply resource ที่ไม่มีชื่อได้

---

## เปรียบเทียบคำสั่งสำคัญ

| Command         | ลักษณะการทำงาน                |
| --------------- | ----------------------------- |
| kubectl create  | สร้างครั้งเดียว               |
| kubectl replace | แทนที่ทั้ง object             |
| kubectl apply   | diff + update เฉพาะที่เปลี่ยน |
| kubectl delete  | ลบ resource                   |

---

## Key Insight (สำคัญมาก)

* `kubectl apply` คือหัวใจของ GitOps
* ปลอดภัยสำหรับ Production มากกว่า `replace`
* `--prune` ทรงพลัง แต่ต้องใช้ด้วยความระวังสูง

---

> เอกสารนี้สามารถใช้เป็นไฟล์สรุปสอบ Kubernetes, Lab Guide และ Reference สำหรับ Production ได้ทันที

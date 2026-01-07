# Kubernetes `kubectl logs` – การอธิบายเชิงลึก

คำสั่ง `kubectl logs` ใช้สำหรับ **ดึง logs ของ container ใน Pod** สามารถใช้ทั้ง snapshot และ streaming logs

> ⚠️ สำคัญ: logs มาจาก **stdout/stderr ของ container** และเก็บโดย kubelet / container runtime

---

## 1. Snapshot logs จาก Pod ที่มี container เดียว

```bash
kubectl logs nginx
```

* ดึง logs แบบ snapshot ของ Pod `nginx` ที่มี container เดียว
* kubectl → API Server → kubelet → container runtime → stdout/stderr
* ใช้เมื่อ Pod มี container เดียว และต้องตรวจสอบ log ล่าสุด

---

## 2. Snapshot logs จาก Pod ที่มีหลาย container

```bash
kubectl logs nginx --all-containers=true
```

* ดึง logs ของทุก container ใน Pod `nginx`
* ใช้เมื่อ Pod แบบ multi-container (sidecar, init-container)

---

## 3. Logs จากหลาย Pod ด้วย Label selector

```bash
kubectl logs -l app=nginx --all-containers=true
```

* ดึง logs ของทุก container ทุก Pod ที่มี label `app=nginx`
* ใช้เมื่อต้องดู logs cluster-wide ของ application

---

## 4. Logs ของ container ก่อนหน้า (terminated container)

```bash
kubectl logs -p -c ruby web-1
```

* `-p` (previous) → ดึง logs ของ container ที่ terminate ไปแล้ว
* ใช้ debug crash / exit ของ container

---

## 5. Streaming logs จาก container

```bash
kubectl logs -f -c ruby web-1
```

* `-f` = follow / streaming log
* ดู runtime behavior ของ container แบบ live

---

## 6. Streaming logs จากหลาย Pod / container

```bash
kubectl logs -f -l app=nginx --all-containers=true
```

* Stream logs ของทุก container ในทุก Pod ที่ match label `app=nginx`
* Useful สำหรับ Deployment / ReplicaSet หลาย Pod

---

## 7. จำกัดจำนวน lines / ช่วงเวลา

```bash
kubectl logs --tail=20 nginx
kubectl logs --since=1h nginx
```

* `--tail=20` → แสดง 20 lines ล่าสุด
* `--since=1h` → logs 1 ชั่วโมงล่าสุด
* ใช้ลด output เยอะ / focus ข้อมูลล่าสุด

---

## 8. Skip TLS verify

```bash
kubectl logs --insecure-skip-tls-verify-backend nginx
```

* ใช้ดึง logs จาก kubelet แม้ certificate backend หมดอายุ
* ใช้ใน Development / Debug cluster internal

---

## 9. Logs จาก Job / Deployment / Named container

```bash
kubectl logs job/hello
kubectl logs deployment/nginx -c nginx-1
```

* `job/hello` → logs ของ container job
* `-c nginx-1` → ระบุ container สำหรับ Pod หลาย container
* Kubernetes resolve Pod จาก resource (Job / Deployment) แล้วดึง logs

---

## Key Insight

* `kubectl logs` = **เครื่องมือ debug application สำคัญที่สุด**
* ใช้ร่วมกับ:

  * `-f` → live monitoring
  * `--tail` / `--since` → focus ข้อมูลสำคัญ
  * `-p` → ดู logs container ก่อนหน้า
  * label selector → cluster-wide view
* Pod มี container เดียว → ไม่ต้องระบุ `-c`
* Pod มีหลาย container → ต้องระบุ `-c` หรือ `--all-containers=true`

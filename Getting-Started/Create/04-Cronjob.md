# CronJob in Kubernetes

**CronJob** คือ resource ใน Kubernetes สำหรับสร้าง Job แบบเป็นรอบเวลา (scheduled Job) เหมือน cron ของ Linux

---

## 1. สร้าง CronJob พื้นฐาน

```bash
kubectl create cronjob my-job --image=busybox --schedule="*/1 * * * *"
```

**อธิบาย**

* `my-job` = ชื่อ CronJob
* `--image` = container image ที่จะรัน
* `--schedule` = กำหนดเวลาแบบ cron (*/1 * * * * = ทุก 1 นาที)

**เชิงการทำงานจริง**

* ใช้สำหรับงาน recurring เช่น backup, cleanup, monitoring
* สามารถกำหนด resources limits, env, volume mount ได้เหมือน Job

---

## 2. สร้าง CronJob พร้อม command

```bash
kubectl create cronjob my-job --image=busybox --schedule="*/1 * * * *" -- date
```

**อธิบาย**

* `--` ตามด้วย command ที่ container จะรัน
* Useful สำหรับรัน script หรือคำสั่งเฉพาะ

---

## 3. กำหนดชื่อ CronJob แบบชัดเจน

```bash
kubectl create cronjob daily-backup --image=busybox --schedule="0 2 * * *"
```

**อธิบาย**

* ตัวอย่าง schedule: รันทุกวันเวลา 2:00 AM
* การตั้งชื่อ descriptive ช่วยให้จัดการ CronJob หลายอันง่ายขึ้น

---

## 4. ตรวจสอบ CronJob

```bash
kubectl get cronjob
kubectl describe cronjob my-job
```

**เชิงการทำงานจริง**

* ตรวจสอบเวลาที่ job ถัดไปจะรัน (`NEXT SCHEDULE`) และ job ที่สร้างไปแล้ว
* Useful สำหรับ debug และ monitor

---

## 5. Best Practices

* ตั้ง resource limits และ requests เพื่อป้องกัน Pod ใช้ resource เกิน
* ใช้ schedule ให้เหมาะสม ไม่ให้เกิด collision ระหว่าง job
* ใช้ `successfulJobsHistoryLimit` และ `failedJobsHistoryLimit` เพื่อลด garbage
* ชื่อ CronJob ควร descriptive (เช่น backup-daily, cleanup-temp)
* สำหรับ production ควร mount ConfigMap / Secret เพื่อเก็บ script หรือ config แทนการ hardcode

---

## 6. Extra Details

* CronJob สร้าง Job object ตาม schedule ที่กำหนด
* สามารถรันแบบ concurrencyPolicy: `Allow`, `Forbid`, `Replace`
* สามารถใช้ environment variable จาก ConfigMap หรือ Secret ได้เหมือน Pod / Deployment

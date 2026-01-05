# Generic Secret in Kubernetes

**Generic Secret** คือ secret ประเภททั่วไปใน Kubernetes ที่สามารถเก็บข้อมูลสำคัญ เช่น password, key, config file

* ใช้สำหรับเก็บ credential, configuration, token ฯลฯ
* สามารถนำไปใช้กับ Pod, Deployment, ServiceAccount

---

## 1. สร้าง Generic Secret จากไฟล์ในโฟลเดอร์

```bash
kubectl create secret generic my-secret --from-file=path/to/bar
```

**อธิบาย**

* `my-secret` = ชื่อ secret
* `--from-file` = ดึงข้อมูลจากไฟล์ภายในโฟลเดอร์เป็น keys ของ secret

**เชิงการทำงานจริง**

* Useful สำหรับเก็บหลายไฟล์ configuration หรือ keys ใน secret เดียว

---

## 2. สร้าง Generic Secret พร้อมกำหนด key

```bash
kubectl create secret generic my-secret \
  --from-file=ssh-privatekey=path/to/id_rsa \
  --from-file=ssh-publickey=path/to/id_rsa.pub
```

**อธิบาย**

* กำหนด key ของแต่ละไฟล์เอง
* Useful สำหรับไฟล์สำคัญที่ต้องระบุชื่อ key ชัดเจน

---

## 3. สร้าง Generic Secret จาก Literal

```bash
kubectl create secret generic my-secret --from-literal=key1=supersecret --from-literal=key2=topsecret
```

**อธิบาย**

* ใช้สำหรับเก็บค่า key=value ตรง ๆ
* Useful สำหรับ password, token, หรือ config สั้น ๆ

---

## 4. สร้าง Generic Secret แบบผสม

```bash
kubectl create secret generic my-secret \
  --from-file=ssh-privatekey=path/to/id_rsa \
  --from-literal=passphrase=topsecret
```

**อธิบาย**

* ใช้ผสมระหว่างไฟล์และ literal
* Useful สำหรับ scenario ที่ต้องการทั้งไฟล์และค่า config เพิ่มเติม

---

## 5. สร้าง Generic Secret จาก env files

```bash
kubectl create secret generic my-secret --from-env-file=path/to/foo.env --from-env-file=path/to/bar.env
```

**อธิบาย**

* ใช้ไฟล์ `.env` หลายไฟล์ในการสร้าง secret
* Useful สำหรับ environment variables ของ application

---

## 6. ตรวจสอบ Generic Secret

```bash
kubectl get secrets
kubectl describe secret my-secret
```

**เชิงการทำงานจริง**

* ตรวจสอบ key และ type ของ secret
* Useful สำหรับ debug ปัญหา Pod mount secret ไม่ได้

---

## 7. Best Practices

### สิ่งที่ควรทำ (Do)

* ใช้ Generic Secret สำหรับ credential, config, token ที่ต้องเก็บ securely
* ใช้ descriptive names และ key เพื่อความเข้าใจง่าย
* ตรวจสอบ secret หลังสร้างด้วย `kubectl describe`
* ผูกกับ Pod หรือ ServiceAccount ผ่าน volume หรือ environment variables
* ใช้ version control สำหรับ secret ในรูปแบบ encrypted

### สิ่งที่ไม่ควรทำ (Don't)

* ใส่ password, token, key ตรง ๆ ใน Pod spec หรือ ConfigMap
* แชร์ secret ข้าม namespace โดยไม่ควบคุม access
* ใช้ secret แบบ plain text ใน production โดยไม่เข้ารหัส
* ลืมอัปเดต secret เมื่อ credential หมดอายุ

---

## 8. Extra Details

* Generic Secret เป็นประเภท `Opaque` ใน Kubernetes
* สามารถ mount เป็น volume หรือใช้เป็น environment variable
* สามารถรวมหลายไฟล์, literals, และ env file ใน secret เดียว
* ใช้ร่วมกับ RBAC และ namespace เพื่อควบคุมการเข้าถึง

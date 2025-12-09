# Kubernetes Secrets Guide (อัปเดตข้อมูลล่าสุด)

หัวข้อนี้อธิบายเรื่อง **Secrets** ใน Kubernetes ซึ่งเป็นฟีเจอร์สำคัญด้านความปลอดภัย

---

## 1️⃣ ทำไมต้องใช้ Secret?
- หลีกเลี่ยงการเก็บรหัสผ่าน, API Key, Token ในไฟล์ YAML แบบ Plain Text
- Kubernetes มี **Secret** เป็นตู้เซฟสำหรับเก็บข้อมูลเหล่านี้

---

## 2️⃣ วิธีสร้าง Secret

### วิธีที่ 1: สร้างจากไฟล์ Text (Command Line)
- เหมาะสำหรับเก็บรหัสผ่านสั้น ๆ
```bash
kubectl create secret generic tomcat-passwd --from-file=./username.txt --from-file=./password.txt
```

### วิธีที่ 2: สร้างจากไฟล์ YAML (Base64 Encoded)
- เหมาะสำหรับ GitOps / Automation
- ข้อมูลต้อง **Base64 Encode** ก่อน
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: tomcat-pass
type: Opaque
data:
  username: YWRtaW4=  # ตัวอย่าง Base64 ของ 'admin'
  password: cGFzc3dvcmQ= # ตัวอย่าง Base64 ของ 'password'
```

---

## 3️⃣ วิธีนำ Secret ไปใช้งาน

### A. ใช้เป็น Environment Variable
- ใช้กับค่ารหัสสั้น ๆ เช่น Username/Password
```yaml
env:
  - name: SECRET_USERNAME
    valueFrom:
      secretKeyRef:
        name: tomcat-pass  # ชื่อ Secret
        key: username      # Key ใน Secret
  - name: SECRET_PASSWORD
    valueFrom:
      secretKeyRef:
        name: tomcat-pass
        key: password
```
- โปรแกรมภายใน Container จะอ่านค่าผ่าน `System.getenv("SECRET_USERNAME")` ได้

### B. ใช้เป็นไฟล์ (Volume Mount)
- ใช้กับ Certificate, Key, Config File
```yaml
spec:
  volumes:
    - name: secretstest
      secret:
        secretName: tomcat-pass  # เอา Secret มาทำเป็น Volume
  containers:
    - name: awebserver
      image: nginx
      volumeMounts:
        - mountPath: "/tmp/mysec"  # Path ใน Container
          name: secretstest
```
- ผลลัพธ์: `/tmp/mysec` ใน Container จะมีไฟล์ `username` และ `password`

---

## 4️⃣ ข้อสังเกตสำคัญ
- Secret ใน Kubernetes **Base64 Encode ไม่ใช่ Encryption**  
- Admin Cluster สามารถอ่าน Secret ได้โดยตรง  
- สำหรับ Production ควรใช้ **Vault หรือ KMS** ร่วมด้วยเพื่อความปลอดภัยสูงสุด  

> ✅ สรุป: Secret = ตู้เซฟเก็บรหัสผ่าน, เลือกใช้งานเป็น Env Variable หรือ Volume, ใช้ Base64 ก่อนใส่ YAML
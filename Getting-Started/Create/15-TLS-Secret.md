# TLS Secret in Kubernetes

**TLS Secret** คือ secret ประเภทพิเศษใน Kubernetes สำหรับเก็บ key pair ของ TLS/SSL certificate

* ใช้สำหรับ HTTPS หรือ TLS communication ระหว่าง client และ server
* สามารถใช้กับ Ingress, Service หรือ Pod ที่ต้องการ secure communication

---

## 1. สร้าง TLS Secret

```bash
kubectl create secret tls tls-secret --cert=path/to/tls.cert --key=path/to/tls.key
```

**อธิบาย**

* `tls-secret` = ชื่อ secret
* `--cert` = ไฟล์ certificate (.crt หรือ .cert)
* `--key` = ไฟล์ private key (.key)

**เชิงการทำงานจริง**

* TLS secret ใช้กับ Ingress เพื่อเปิดใช้งาน HTTPS
* Pod สามารถ mount secret นี้เพื่อใช้ใน server application เช่น Nginx, Apache, หรือ custom app

---

## 2. ตรวจสอบ TLS Secret

```bash
kubectl get secrets
kubectl describe secret tls-secret
```

**เชิงการทำงานจริง**

* ตรวจสอบว่า secret ถูกสร้างและมี key `tls.crt` และ `tls.key`
* Useful สำหรับ debug ปัญหา TLS ไม่ทำงานใน Ingress หรือ Pod

---

## 3. ใช้ TLS Secret กับ Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
spec:
  tls:
  - hosts:
    - example.com
    secretName: tls-secret
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-service
            port:
              number: 80
```

**เชิงการทำงานจริง**

* Ingress จะใช้ TLS secret นี้เพื่อ terminate HTTPS traffic
* Useful สำหรับเปิดใช้งาน HTTPS ให้กับ web applications

---

## 4. Best Practices

### สิ่งที่ควรทำ (Do)

* ใช้ TLS Secret สำหรับทุก Ingress หรือ Pod ที่ต้องการ secure communication
* ใช้ certificate จาก CA ที่เชื่อถือได้ หรือ Let's Encrypt สำหรับ production
* ตั้งชื่อ secret descriptive เช่น `tls-webapp-prod`
* ตรวจสอบและอัปเดต certificate ก่อนหมดอายุ
* ผูก secret กับ Ingress หรือ ServiceAccount ให้ชัดเจน

### สิ่งที่ไม่ควรทำ (Don't)

* ใส่ certificate หรือ private key ตรง ๆ ใน Pod spec หรือ ConfigMap
* ใช้ self-signed certificate ใน production โดยไม่ตรวจสอบความปลอดภัย
* ละเลยการอัปเดต certificate เมื่อหมดอายุ
* แชร์ TLS Secret ข้าม namespace โดยไม่ควบคุม access

---

## 5. Extra Details

* TLS Secret มี key `tls.crt` และ `tls.key` โดย Kubernetes จะจัดการ key/value ให้
* สามารถใช้ร่วมกับ Ingress Controller ต่าง ๆ เช่น Nginx, Traefik, Istio
* ใช้ร่วมกับ RBAC และ namespace เพื่อควบคุมการเข้าถึง secret
* การ rotate certificate สามารถทำได้โดยสร้าง secret ใหม่และอัปเดต Ingress

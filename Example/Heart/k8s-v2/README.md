### ต่อยอดมาอีกที
- ref: https://github.com/DekCode/Kubernetes-todo.git

### สิ่งที่เพิ่มมา
- mongo-pv.yml

### สิ่งที่แก้ไข
- ingress.yml

### ก่อนเริ่มใช้งาน
ติดตั้ง NGINX Ingress Controller
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.0.0/deploy/static/provider/cloud/deploy.yaml
```
ตรวจสอบ
```
kubectl get pods -n ingress-nginx
```

## วิธีเข้าถึงจากภายนอก
ต้องเข้าไปแก้ไขไฟล์ hosts

<img width="403" height="452" alt="image" src="https://github.com/user-attachments/assets/33d49ac8-1bd3-45d6-a868-f68b8735d0b2" />

```
notepad C:\Windows\System32\drivers\etc\hosts
```
จากนั้นเพิ่มบรรทัดนี้เข้าไป
```
192.168.*.***  todo.com
```
## วิธีดู IP ของ Worker Node
```
kubectl get nodes -o wide
```
## วิธีดู Port ของ Ingress
```
kubectl get svc -n ingress-nginx
```
### Use Case
```
todo.com:31102
```

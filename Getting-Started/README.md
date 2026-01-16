# สร้าง Deployment nginx พร้อมดึง YAML ออกมา
เริ่มจาก Deployment ง่ายที่สุด
```
kubectl create deployment nginx \
  --image=nginx:latest \
  --dry-run=client -o yaml > nginx-deploy.yaml
```
จากนั้นค่อย apply จริง
```
kubectl apply -f nginx-deploy.yaml
```
เช็กสถานะ
```
kubectl get pods
```
# สร้าง Service เพื่อเปิดออกภายนอก (NodePort)
Pod อย่างเดียว คนข้างนอกเข้าไม่ได้
ต้องมี Service เป็น “ด่านตรวจคนเข้าเมือง”

ใช้ kubectl expose แล้วขอ YAML เช่นกัน
```
kubectl expose deployment nginx \
  --type=NodePort \
  --port=80 \
  --target-port=80 \
  --dry-run=client -o yaml > nginx-svc.yaml
```
จากนั้น apply
```
kubectl apply -f nginx-svc.yaml
```
เช็ก Service
```
kubectl get svc nginx
```
จะเห็นประมาณนี้
```
nginx   NodePort   10.x.x.x   <none>   80:3xxxx/TCP
```
# เข้าเว็บจากภายนอก
เอา IP ของ Node
```
kubectl get nodes -o wide
```
เปิดเว็บ
```
http://192.168.85.132:30080
```

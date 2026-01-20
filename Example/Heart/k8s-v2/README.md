### ต่อยอดมาอีกที
- ref: https://github.com/DekCode/Kubernetes-todo.git

### สิ่งที่เพิ่มมา
- mongo-pv.yml

### สิ่งที่แก้ไข
- ingress.yml

### ก่อนเริ่มใช้งาน
ติดตั้ง NGINX Ingress Controller
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```
ตรวจสอบ
```
kubectl get pods -n ingress-nginx
```

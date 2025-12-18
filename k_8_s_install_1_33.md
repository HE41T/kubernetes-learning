# Kubernetes 1.33 Installation Guide (Using kubeadm)

คู่มือนี้เป็นเวอร์ชันอัปเดตล่าสุดสำหรับ **Kubernetes v1.33.x** บน Ubuntu **20.04 / 22.04 LTS** โดยใช้ **kubeadm** และ **containerd** (Runtime มาตรฐานปัจจุบัน)

ขั้นตอนทั้งหมดประกอบด้วย:
1. การเตรียมเครื่อง (Pre-requisites)
2. ติดตั้ง Container Runtime (containerd)
3. ติดตั้ง Kubernetes (kubelet, kubeadm, kubectl)
4. ตั้งค่า Master Node
5. เชื่อม Worker Nodes
6. ติดตั้ง CNI (Calico)
7. ตั้งค่า DNS แบบถาวร

---

## 🔥 ขั้นตอนที่ 1: การเตรียมเครื่อง (ทำทุกเครื่อง)
Kubernetes ต้องการ kernel/network settings ที่ถูกต้อง ถ้าตกหล่นบางจุดอาจทำให้ cluster ไม่พร้อมใช้งาน

### 1.1 ปิด Swap (จำเป็น)
```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```

### 1.2 ตั้ง Hostname ให้ไม่ชนกัน
```bash
# Master
sudo hostnamectl set-hostname k8s-master

# Workers
sudo hostnamectl set-hostname k8s-worker1
sudo hostnamectl set-hostname k8s-worker2
```

### 1.3 เปิด Kernel Modules + Network Sysctl
```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

---

## 🔥 ขั้นตอนที่ 2: ติดตั้ง Container Runtime — containerd (ทุกเครื่อง)
Kubernetes v1.33 ใช้ containerd เป็น runtime หลัก

### 2.1 ติดตั้ง containerd
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y containerd.io
```

### 2.2 เปิด SystemdCgroup (จุดสำคัญ)
```bash
sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml
sudo systemctl restart containerd
```

---

## 🔥 ขั้นตอนที่ 3: ติดตั้ง Kubernetes v1.33 (ทุกเครื่อง)
Repo ใหม่ของ Kubernetes อยู่ที่ **pkgs.k8s.io** และรองรับ v1.33 เต็มรูปแบบ

### 3.1 เพิ่ม Repo
```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.33/deb/Release.key | \
  sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
https://pkgs.k8s.io/core:/stable:/v1.33/deb/ /" | \
  sudo tee /etc/apt/sources.list.d/kubernetes.list > /dev/null
```

### 3.2 ติดตั้ง kubelet / kubeadm / kubectl
```bash
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

### 3.3 เช็ค Status kubelet
```
sudo systemctl status kubelet

#ถ้าไม่รัน
sudo systemctl start kubelet
```

---

## 🔥 ขั้นตอนที่ 4: ตั้งค่า Master Node

### 4.1 kubeadm init (ต้องกำหนด Pod CIDR ให้ตรงกับ Calico)
```bash
sudo kubeadm init --pod-network-cidr=192.168.0.0/16
```
เมื่อเสร็จระบบจะให้คำสั่ง JOIN เอาไว้ใช้ในขั้นตอนถัดไป

### 4.2 ตั้งค่า kubectl ให้ใช้งานได้
```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### 4.3 ติดตั้ง Calico CNI (รองรับ Kubernetes 1.33)
```bash
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.0/manifests/calico.yaml
```

รอให้ node จาก NotReady → Ready

---

## 🔥 ขั้นตอนที่ 5: Join Worker Nodes
คัดลอกคำสั่งที่ได้จาก master มาใช้ เช่น:

```bash
sudo kubeadm join <MASTER_IP>:6443 --token <TOKEN> --discovery-token-ca-cert-hash sha256:<HASH>
```

หลังจาก join เสร็จให้กลับมาที่ Master
```bash
kubectl get nodes
```
ทั้ง Master และ Workers ควรอยู่สถานะ **Ready**

---

## 🔥 ขั้นตอนที่ 6 ตั้งค่า DNS แบบถาวร
แก้ไขไฟล์ /etc/systemd/resolved.conf
```
sudo vi /etc/systemd/resolved.conf
```
จากนั้นให้หาคำและแก้ไขให้เป็นดังนี้
```
[Resolve]
DNS=8.8.8.8 8.8.4.4
FallbackDNS=1.1.1.1
DNSStubListener=yes
```
รีสตาร์ท service
```
sudo systemctl restart systemd-resolved
```

---
## 🎉 Cluster Kubernetes 1.33 พร้อมใช้งาน!

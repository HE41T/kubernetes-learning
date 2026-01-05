# PriorityClass in Kubernetes

**PriorityClass** คือ resource ใน Kubernetes สำหรับกำหนดลำดับความสำคัญของ Pod

* Pod ที่มี priority สูงจะถูก schedule ก่อน
* Pod ที่มี priority สูงสามารถ preempt (ย้ายออก) Pod ที่ priority ต่ำกว่าได้ในกรณี resource shortage

---

## 1. สร้าง PriorityClass พื้นฐาน

```bash
kubectl create priorityclass high-priority --value=1000 --description="high priority"
```

**อธิบาย**

* `high-priority` = ชื่อ PriorityClass
* `--value` = จำนวน priority (ยิ่งสูงยิ่งสำคัญ)
* `--description` = คำอธิบายสำหรับ human readability

**เชิงการทำงานจริง**

* ใช้กับ Pod ที่ critical เช่น database, API core service
* Scheduler จะพยายามวาง Pod ที่มี priority สูงก่อน Pod อื่น

---

## 2. PriorityClass เป็น global default

```bash
kubectl create priorityclass default-priority --value=1000 --global-default=true --description="default priority"
```

**อธิบาย**

* `--global-default=true` = Pod ที่ไม่ได้ระบุ PriorityClass จะใช้ค่า default นี้
* Useful สำหรับ setting default priority ให้กับทุก Pod

---

## 3. PriorityClass แบบไม่ preempt

```bash
kubectl create priorityclass high-priority --value=1000 --description="high priority" --preemption-policy="Never"
```

**อธิบาย**

* `--preemption-policy=Never` = Pod ที่มี priority สูงจะไม่สามารถ preempt Pod ที่ต่ำกว่าได้
* Useful เมื่อไม่ต้องการ Pod ที่สำคัญไล่ Pod อื่นออก

---

## 4. ตรวจสอบ PriorityClass

```bash
kubectl get priorityclass
kubectl describe priorityclass high-priority
```

**เชิงการทำงานจริง**

* ตรวจสอบค่า priority, preemption policy, และ global default
* Useful สำหรับ debug scheduling issues

---

## 5. Best Practices

### สิ่งที่ควรทำ (Do)

* สร้าง PriorityClass สำหรับ Pod สำคัญที่ต้องการ high availability
* ใช้ descriptive names และ value เหมาะสมกับความสำคัญของ Pod
* ใช้ global-default สำหรับ Pod ที่ไม่ได้ระบุ PriorityClass เพื่อ consistency
* ตรวจสอบ interaction กับ ResourceQuota และ cluster resource limit

### สิ่งที่ไม่ควรทำ (Don't)

* ตั้งค่า value สูงเกินจำเป็น เพราะอาจ preempt Pod อื่นโดยไม่จำเป็น
* ใช้ preemption policy แบบ default สำหรับ Pod สำคัญโดยไม่วิเคราะห์ผลกระทบ
* ไม่ตั้ง global-default ใน cluster ที่มี Pod หลากหลาย priority อาจทำให้ Pod ถูก schedule ผิดลำดับ
* ใช้ PriorityClass กับ Pod ที่ไม่สำคัญ เพราะจะเพิ่ม complexity และ risk

---

## 6. Extra Details

* Scheduler ใช้ PriorityClass เพื่อจัดลำดับการวาง Pod ใน node
* Preemption ช่วยให้ resource critical ได้ก่อน แต่ควรใช้ระมัดระวัง
* PriorityClass ไม่ได้จำกัด resource แต่เป็นตัวบอก scheduler เท่านั้น
* สามารถใช้ร่วมกับ PodDisruptionBudget และ ResourceQuota เพื่อเพิ่มความมั่นคงและ high availability

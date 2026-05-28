# Battery MES Firestore DB 설계서

## Collections

## workOrders
```json
{
  "id": "WO-20260528-001",
  "processType": "electrode",
  "status": "running",
  "targetQty": 1000,
  "currentQty": 845,
  "createdAt": "timestamp"
}
```

## materials
```json
{
  "materialCode": "MAT-001",
  "name": "양극 활물질",
  "stockQty": 4200,
  "unit": "kg"
}
```

## productionLots
```json
{
  "lotNo": "LOT-000124",
  "processStep": "assembly",
  "status": "warning",
  "defectRate": 0.8
}
```

## defects
```json
{
  "lotNo": "LOT-000124",
  "processStep": "formation",
  "defectType": "voltage_abnormal",
  "severity": "high"
}
```

## equipmentStatus
```json
{
  "equipmentId": "EQ-CH-02",
  "processType": "formation",
  "status": "running",
  "utilization": 89.4
}
```

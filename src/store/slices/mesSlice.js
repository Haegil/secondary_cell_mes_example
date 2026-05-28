import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dbService, getDbMode, setDbMode, isConnected } from '../../firebase/db';

// Async Thunks to interact with Database Layer
export const fetchAllData = createAsyncThunk('mes/fetchAllData', async () => {
  const [workOrders, materials, equipment, lots, logs, stats, materialReceipts] = await Promise.all([
    dbService.getWorkOrders(),
    dbService.getMaterials(),
    dbService.getEquipment(),
    dbService.getLots(),
    dbService.getLogs(),
    dbService.getDashboardStats(),
    dbService.getMaterialReceipts()
  ]);

  return {
    workOrders,
    materials,
    equipment,
    lots,
    logs,
    stats,
    materialReceipts,
    dbMode: getDbMode(),
    firebaseConnected: isConnected
  };
});

export const addWorkOrder = createAsyncThunk('mes/addWorkOrder', async (order, { dispatch }) => {
  const id = await dbService.addWorkOrder(order);
  dispatch(addLog({
    message: `신규 작업지시 등록 완료: ${id} (${order.processType})`,
    processStep: order.processType,
    type: 'info'
  }));
  return { ...order, id, createdAt: new Date().toISOString() };
});

export const updateWorkOrder = createAsyncThunk('mes/updateWorkOrder', async ({ id, updates }) => {
  await dbService.updateWorkOrder(id, updates);
  return { id, updates };
});

export const addLog = createAsyncThunk('mes/addLog', async (log) => {
  await dbService.addLog(log);
  return log;
});

export const deleteLogThunk = createAsyncThunk('mes/deleteLogThunk', async (id, { dispatch }) => {
  await dbService.deleteLog(id);
  dispatch(fetchAllData());
  return id;
});

export const addMaterialReceiptThunk = createAsyncThunk(
  'mes/addMaterialReceiptThunk',
  async (receipt, { dispatch }) => {
    const id = await dbService.addMaterialReceipt(receipt);
    dispatch(addLog({
      message: `[자재 입고 등록] ${receipt.materialName} (${receipt.materialCode})가 ${receipt.targetQty.toLocaleString()} 입고 작업 등록되었습니다.`,
      processStep: 'material',
      type: 'info'
    }));
    dispatch(fetchAllData());
    return { ...receipt, id, createdAt: new Date().toISOString() };
  }
);

// LEVEL 1: Update Equipment status directly without page reload
export const updateEquipmentStatus = createAsyncThunk(
  'mes/updateEquipmentStatus',
  async ({ equipmentId, status, utilization }, { dispatch }) => {
    await dbService.updateEquipment(equipmentId, { status, utilization });
    await dbService.addLog({
      message: `[설비 상태 변동] 설비 ${equipmentId}의 가동 상태가 ${status} 상태로 전환되었습니다.`,
      processStep: 'equipment',
      type: status === 'error' ? 'error' : status === 'warning' ? 'warning' : 'info'
    });
    dispatch(fetchAllData());
  }
);

// LEVEL 1: Reset system database completely
export const resetSystemDatabase = createAsyncThunk(
  'mes/resetSystemDatabase',
  async (_, { dispatch }) => {
    await dbService.clearAndSeedDatabase();
    dispatch(fetchAllData());
  }
);

// LEVEL 2: Resolve defect on a lot, restore equipment status, and resolve associated logs
export const resolveDefectThunk = createAsyncThunk(
  'mes/resolveDefectThunk',
  async ({ lotNo, equipmentId }, { dispatch, getState }) => {
    const dbPromises = [];

    // 1. Update Lot status to 'normal'
    dbPromises.push(dbService.updateLot(lotNo, { status: 'normal' }));

    // 2. Restore equipment status to 'running'
    if (equipmentId) {
      dbPromises.push(dbService.updateEquipment(equipmentId, { status: 'running' }));
    }

    // 3. Mark all logs mentioning this lotNo as resolved
    const state = getState().mes;
    const relatedLogs = state.logs.filter(l => l.message && l.message.includes(lotNo));
    for (const log of relatedLogs) {
      dbPromises.push(dbService.updateLog(log.id, { resolved: true }));
    }

    // 4. Record action resolution log
    const resolutionLog = {
      message: `[현장 즉각 조치] LOT ${lotNo}에 대한 품질 이슈 해결 및 가동 정상화 완료 (설비: ${equipmentId || 'N/A'})`,
      processStep: 'quality',
      type: 'info',
      resolved: true
    };
    dbPromises.push(dbService.addLog(resolutionLog));

    await Promise.all(dbPromises);
    dispatch(fetchAllData());
  }
);

// LEVEL 1: Refactor simulation step to asynchronous thunk for real-time Firestore sync
export const runSimulationStepThunk = createAsyncThunk(
  'mes/runSimulationStepThunk',
  async (_, { getState, dispatch }) => {
    const state = getState().mes;
    if (!state.simulationActive) return null;

    const runningOrders = state.workOrders.filter(wo => wo.status === 'running');
    const runningReceipts = (state.materialReceipts || []).filter(r => r.status === 'running');
    if (runningOrders.length === 0 && runningReceipts.length === 0) {
      dispatch(setSimulationActive(false));
      return null;
    }

    const timestamp = new Date().toISOString();
    const dbPromises = [];

    // Clone state items to safely perform mutations
    const workOrders = JSON.parse(JSON.stringify(state.workOrders));
    const materials = JSON.parse(JSON.stringify(state.materials));
    const lots = JSON.parse(JSON.stringify(state.lots));
    const logs = JSON.parse(JSON.stringify(state.logs));
    const equipment = JSON.parse(JSON.stringify(state.equipment));
    const materialReceipts = JSON.parse(JSON.stringify(state.materialReceipts || []));

    // Process material receipts
    runningReceipts.forEach(receipt => {
      const rIdx = materialReceipts.findIndex(r => r.id === receipt.id);
      if (rIdx === -1) return;

      const qtyToIncrement = Math.floor(Math.random() * 150) + 100; // Increment 100~250
      const current = materialReceipts[rIdx].currentQty;
      const target = materialReceipts[rIdx].targetQty;
      const added = Math.min(target - current, qtyToIncrement);

      materialReceipts[rIdx].currentQty += added;

      // Update actual stock
      const matIdx = materials.findIndex(m => m.materialCode === receipt.materialCode);
      if (matIdx !== -1) {
        materials[matIdx].stockQty += added;
        dbPromises.push(dbService.updateMaterial(receipt.materialCode, { stockQty: materials[matIdx].stockQty }));
      }

      dbPromises.push(dbService.updateMaterialReceipt(receipt.id, { currentQty: materialReceipts[rIdx].currentQty }));

      if (materialReceipts[rIdx].currentQty >= target) {
        materialReceipts[rIdx].status = 'completed';
        dbPromises.push(dbService.updateMaterialReceipt(receipt.id, { status: 'completed' }));

        const successMsg = `[자재 입고 완료] ${receipt.materialName} (${receipt.materialCode})가 ${target.toLocaleString()} ${materials[matIdx]?.unit || ''} 입고 완료되었습니다.`;
        const logObj = {
          id: Math.random().toString(36).substr(2, 9),
          message: successMsg,
          timestamp,
          processStep: 'material',
          type: 'info'
        };
        logs.unshift(logObj);
        dbPromises.push(dbService.addLog(logObj));
      }
    });

    const materialConsumption = {
      electrode: [
        { code: 'MAT-001', qty: 2 }, // 양극 활물질
        { code: 'MAT-002', qty: 2 }, // 음극 활물질
        { code: 'MAT-003', qty: 0.5 }, // 도전재
        { code: 'MAT-004', qty: 0.3 }  // 바인더
      ],
      assembly: [
        { code: 'MAT-005', qty: 1.5 }, // 분리막
        { code: 'MAT-006', qty: 0.8 }  // 전해액
      ],
      formation: [],
      module: []
    };

    const errorLabels = {
      electrode: '전극 코팅 두께 편차 이상 감지',
      assembly: '조립 탭 정렬 오차 정밀 검사 이상',
      formation: '화성 셀 전압 수치 비정상 검출',
      module: '모듈 BMS 연결 상태 수신 통신 불량'
    };

    const equipments = {
      electrode: 'EQ-CT-01',
      assembly: 'EQ-AS-01',
      formation: 'EQ-FM-01',
      module: 'EQ-MD-01'
    };

    runningOrders.forEach(order => {
      const orderIdx = workOrders.findIndex(o => o.id === order.id);
      if (orderIdx === -1) return;

      const consumptionList = materialConsumption[order.processType] || [];
      let hasMaterials = true;
      
      consumptionList.forEach(c => {
        const mat = materials.find(m => m.materialCode === c.code);
        if (!mat || mat.stockQty < c.qty * 10) {
          hasMaterials = false;
        }
      });

      if (!hasMaterials) {
        workOrders[orderIdx].status = 'paused';
        dbPromises.push(dbService.updateWorkOrder(order.id, { status: 'paused' }));
        
        const warningMsg = `[자재 부족] ${order.processType} 공정용 원자재 재고가 부족하여 작업(${order.id})이 일시 정지되었습니다.`;
        const logObj = {
          id: Math.random().toString(36).substr(2, 9),
          message: warningMsg,
          timestamp,
          processStep: order.processType,
          type: 'warning'
        };
        logs.unshift(logObj);
        dbPromises.push(dbService.addLog(logObj));
        return;
      }

      // Deduct materials
      consumptionList.forEach(c => {
        const matIdx = materials.findIndex(m => m.materialCode === c.code);
        if (matIdx !== -1) {
          materials[matIdx].stockQty = Math.max(0, materials[matIdx].stockQty - (c.qty * 15));
          dbPromises.push(dbService.updateMaterial(c.code, { stockQty: materials[matIdx].stockQty }));
        }
      });

      // Add production quantities
      const qtyProduced = Math.floor(Math.random() * 20) + 15;
      const oldQty = workOrders[orderIdx].currentQty;
      const newQty = Math.min(order.targetQty, oldQty + qtyProduced);
      workOrders[orderIdx].currentQty = newQty;
      dbPromises.push(dbService.updateWorkOrder(order.id, { currentQty: newQty }));

      // Find or Create active Lot
      let activeLot = lots.find(l => l.processStep === order.processType && l.status === 'normal');
      
      if (!activeLot) {
        const activeLotNo = `LOT-${String(lots.length + 1).padStart(6, '0')}`;
        activeLot = {
          lotNo: activeLotNo,
          processStep: order.processType,
          status: 'normal',
          productionQty: 0,
          goodQty: 0,
          defectQty: 0,
          defectRate: 0,
          equipmentId: equipments[order.processType] || 'EQ-GEN',
          startTime: timestamp,
          endTime: ''
        };
        lots.unshift(activeLot);
        dbPromises.push(dbService.addLot(activeLot));
      }

      const lotIdx = lots.findIndex(l => l.lotNo === activeLot.lotNo);
      if (lotIdx !== -1) {
        const currentLot = lots[lotIdx];
        currentLot.productionQty += qtyProduced;
        
        const rand = Math.random();
        let isDefect = false;
        let isWarning = false;
        
        if (rand < 0.012) {
          isDefect = true;
        } else if (rand < 0.035) {
          isWarning = true;
        }

        let lotDefectQty = 0;
        if (isDefect) {
          lotDefectQty = Math.floor(Math.random() * 5) + 3;
          currentLot.status = 'error';
          
          const alertMsg = `[품질 이상] ${errorLabels[order.processType]} (LOT: ${currentLot.lotNo}, 설비: ${currentLot.equipmentId})`;
          const logObj = {
            id: Math.random().toString(36).substr(2, 9),
            message: alertMsg,
            timestamp,
            processStep: order.processType,
            type: 'error',
            lotNo: currentLot.lotNo
          };
          logs.unshift(logObj);
          dbPromises.push(dbService.addLog(logObj));

          const eqIdx = equipment.findIndex(e => e.equipmentId === currentLot.equipmentId);
          if (eqIdx !== -1) {
            equipment[eqIdx].status = 'error';
            dbPromises.push(dbService.updateEquipment(currentLot.equipmentId, { status: 'error' }));
          }
        } else if (isWarning) {
          lotDefectQty = Math.floor(Math.random() * 2) + 1;
          currentLot.status = 'warning';
          
          const alertMsg = `[가동 경고] ${order.processType} 공정 미세 마모/수치 경계 도달 경고 (LOT: ${currentLot.lotNo})`;
          const logObj = {
            id: Math.random().toString(36).substr(2, 9),
            message: alertMsg,
            timestamp,
            processStep: order.processType,
            type: 'warning',
            lotNo: currentLot.lotNo
          };
          logs.unshift(logObj);
          dbPromises.push(dbService.addLog(logObj));
        } else {
          if (Math.random() < 0.002) {
            lotDefectQty = 1;
          }
        }

        currentLot.defectQty += lotDefectQty;
        currentLot.goodQty = Math.max(0, currentLot.productionQty - currentLot.defectQty);
        currentLot.defectRate = parseFloat(((currentLot.defectQty / currentLot.productionQty) * 100).toFixed(2));
        currentLot.endTime = timestamp;
        dbPromises.push(dbService.updateLot(currentLot.lotNo, currentLot));
      }

      if (newQty >= order.targetQty) {
        workOrders[orderIdx].status = 'completed';
        dbPromises.push(dbService.updateWorkOrder(order.id, { status: 'completed' }));
        
        const successMsg = `[작업 완료] 작업지시 ${order.id} (${order.processType}) 생산이 목표량(${order.targetQty} ea)을 달성하여 정상 완료되었습니다.`;
        const logObj = {
          id: Math.random().toString(36).substr(2, 9),
          message: successMsg,
          timestamp,
          processStep: order.processType,
          type: 'info'
        };
        logs.unshift(logObj);
        dbPromises.push(dbService.addLog(logObj));
      }
    });

    const totalPlanned = workOrders.reduce((sum, o) => sum + o.targetQty, 0);
    const totalActual = workOrders.reduce((sum, o) => sum + o.currentQty, 0);
    const achieveRate = totalPlanned > 0 ? parseFloat(((totalActual / totalPlanned) * 100).toFixed(2)) : 0;
    
    const totalLotsProduced = lots.reduce((sum, l) => sum + l.productionQty, 0);
    const totalLotsGood = lots.reduce((sum, l) => sum + l.goodQty, 0);
    const yieldRate = totalLotsProduced > 0 ? parseFloat(((totalLotsGood / totalLotsProduced) * 100).toFixed(2)) : 100;

    const runningEquips = equipment.filter(e => e.status === 'running').length;
    const utilizationRate = parseFloat(((runningEquips / equipment.length) * 100).toFixed(1));

    const stats = {
      plannedQty: totalPlanned,
      actualQty: totalActual,
      achievementRate: achieveRate,
      overallUtilization: utilizationRate,
      overallYield: yieldRate
    };
    dbPromises.push(dbService.updateDashboardStats(stats));

    equipment.forEach((eq, idx) => {
      if (eq.status === 'running') {
        const delta = (Math.random() - 0.5) * 2;
        equipment[idx].utilization = Math.min(100, Math.max(50, parseFloat((eq.utilization + delta).toFixed(1))));
        dbPromises.push(dbService.updateEquipment(eq.equipmentId, { utilization: equipment[idx].utilization }));
      }
    });

    await Promise.all(dbPromises);

    return {
      workOrders,
      materials,
      lots,
      logs: logs.slice(0, 50),
      stats,
      equipment,
      materialReceipts
    };
  }
);

const initialState = {
  lots: [],
  workOrders: [],
  materials: [],
  equipment: [],
  logs: [],
  materialReceipts: [],
  stats: {
    plannedQty: 0,
    actualQty: 0,
    achievementRate: 0,
    overallUtilization: 0,
    overallYield: 0
  },
  simulationActive: false,
  selectedLot: null,
  dbMode: 'mock',
  firebaseConnected: false,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

const mesSlice = createSlice({
  name: 'mes',
  initialState,
  reducers: {
    setSimulationActive(state, action) {
      state.simulationActive = action.payload;
    },
    setSelectedLot(state, action) {
      state.selectedLot = action.payload;
    },
    changeDbMode(state, action) {
      state.dbMode = action.payload;
      setDbMode(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.workOrders = action.payload.workOrders;
        state.materials = action.payload.materials;
        state.equipment = action.payload.equipment;
        state.lots = action.payload.lots;
        state.logs = action.payload.logs;
        state.stats = action.payload.stats;
        state.materialReceipts = action.payload.materialReceipts || [];
        state.dbMode = action.payload.dbMode;
        state.firebaseConnected = action.payload.firebaseConnected;
      })
      .addCase(fetchAllData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addWorkOrder.fulfilled, (state, action) => {
        state.workOrders.unshift(action.payload);
      })
      .addCase(updateWorkOrder.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const index = state.workOrders.findIndex(o => o.id === id);
        if (index !== -1) {
          state.workOrders[index] = { ...state.workOrders[index], ...updates };
        }
      })
      .addCase(addLog.fulfilled, (state, action) => {
        state.logs.unshift(action.payload);
        if (state.logs.length > 50) state.logs.pop();
      })
      .addCase(runSimulationStepThunk.fulfilled, (state, action) => {
        if (!action.payload) return;
        state.workOrders = action.payload.workOrders;
        state.materials = action.payload.materials;
        state.lots = action.payload.lots;
        state.logs = action.payload.logs;
        state.stats = action.payload.stats;
        state.equipment = action.payload.equipment;
        state.materialReceipts = action.payload.materialReceipts || [];
      })
      .addCase(deleteLogThunk.fulfilled, (state, action) => {
        state.logs = state.logs.filter(l => l.id !== action.payload);
      })
      .addCase(addMaterialReceiptThunk.fulfilled, (state, action) => {
        if (!state.materialReceipts) state.materialReceipts = [];
        state.materialReceipts.unshift(action.payload);
      });
  }
});

export const { 
  setSimulationActive, 
  setSelectedLot, 
  changeDbMode
} = mesSlice.actions;

export default mesSlice.reducer;

import { db, isConnected } from './config';
export { isConnected };
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';

// Helper to check the current database mode
export const getDbMode = () => {
  // In production builds, always use localStorage (mock) mode.
  // Each visitor gets a fully isolated, independent demo experience
  // without interfering with other visitors or requiring Firestore access.
  if (import.meta.env.PROD) return 'mock';
  const mode = localStorage.getItem('mes_db_mode');
  if (mode) return mode;
  return isConnected ? 'firebase' : 'mock';
};

export const setDbMode = (mode) => {
  localStorage.setItem('mes_db_mode', mode);
};

// Seed Data Generators
const initialMaterials = [
  { materialCode: 'MAT-001', name: '양극 활물질', stockQty: 4200, unit: 'kg' },
  { materialCode: 'MAT-002', name: '음극 활물질', stockQty: 3800, unit: 'kg' },
  { materialCode: 'MAT-003', name: '도전재', stockQty: 1500, unit: 'kg' },
  { materialCode: 'MAT-004', name: '바인더', stockQty: 850, unit: 'kg' },
  { materialCode: 'MAT-005', name: '분리막', stockQty: 12000, unit: 'm' },
  { materialCode: 'MAT-006', name: '전해액', stockQty: 3500, unit: 'L' }
];

const initialEquipment = [
  { equipmentId: 'EQ-MX-01', name: '믹싱 1호기', processType: 'electrode', status: 'running', utilization: 92.3 },
  { equipmentId: 'EQ-CT-01', name: '코팅/건조 1호기', processType: 'electrode', status: 'running', utilization: 94.1 },
  { equipmentId: 'EQ-AS-01', name: '스태킹 1호기', processType: 'assembly', status: 'running', utilization: 91.1 },
  { equipmentId: 'EQ-AS-02', name: '전해액 주입기 2호기', processType: 'assembly', status: 'running', utilization: 88.5 },
  { equipmentId: 'EQ-FM-01', name: '에이징 챔버 1호기', processType: 'formation', status: 'running', utilization: 89.4 },
  { equipmentId: 'EQ-FM-02', name: '디개싱 2호기', processType: 'formation', status: 'running', utilization: 85.0 },
  { equipmentId: 'EQ-MD-01', name: '모듈 조립기 1호기', processType: 'module', status: 'running', utilization: 90.2 },
  { equipmentId: 'EQ-MD-02', name: 'BMS 테스트기 2호기', processType: 'module', status: 'running', utilization: 87.6 }
];

const initialWorkOrders = [
  { id: 'WO-20260528-001', processType: 'electrode', status: 'completed', targetQty: 15000, currentQty: 15000, createdAt: new Date(Date.now() - 36000000).toISOString() },
  { id: 'WO-20260528-002', processType: 'assembly', status: 'running', targetQty: 10000, currentQty: 8210, createdAt: new Date(Date.now() - 25000000).toISOString() },
  { id: 'WO-20260528-003', processType: 'formation', status: 'running', targetQty: 8000, currentQty: 7895, createdAt: new Date(Date.now() - 18000000).toISOString() },
  { id: 'WO-20260528-004', processType: 'module', status: 'running', targetQty: 5000, currentQty: 2350, createdAt: new Date(Date.now() - 12000000).toISOString() }
];

const initialLogs = [
  { id: 'log-1', message: '화성 공정 에이징 챔버(EQ-FM-01) 정상 작동 개시', timestamp: new Date(Date.now() - 1800000).toISOString(), processStep: 'formation', type: 'info' },
  { id: 'log-2', message: '조립 공정 전해액 주입 완료 (LOT-000035)', timestamp: new Date(Date.now() - 1200000).toISOString(), processStep: 'assembly', type: 'info', lotNo: 'LOT-000035' },
  { id: 'log-3', message: '전극 공정 코팅 두께 편차 경고 발생 (LOT-000015)', timestamp: new Date(Date.now() - 600000).toISOString(), processStep: 'electrode', type: 'warning', lotNo: 'LOT-000015' },
  { id: 'log-4', message: '화성 공정 3라인 셀 전압 이상 감지 (LOT-000045)', timestamp: new Date(Date.now() - 120000).toISOString(), processStep: 'formation', type: 'error', lotNo: 'LOT-000045' }
];

const initialDashboardStats = {
  plannedQty: 38000,
  actualQty: 33455,
  achievementRate: 88.04,
  overallUtilization: 90.8,
  overallYield: 97.6
};

// Generate 80 lots with 20 lots per process
const generateInitialLots = () => {
  const lots = [];
  const processes = ['electrode', 'assembly', 'formation', 'module'];
  
  const equipments = {
    electrode: 'EQ-CT-01',
    assembly: 'EQ-AS-01',
    formation: 'EQ-FM-01',
    module: 'EQ-MD-01'
  };

  const baseTimes = [36000000, 25000000, 18000000, 12000000];

  for (let i = 1; i <= 80; i++) {
    const lotNo = `LOT-${String(i).padStart(6, '0')}`;
    const pIdx = Math.floor((i - 1) / 20); // 20 lots per process
    const process = processes[pIdx];
    
    // 1% error rate logic
    let status = 'normal';
    const rand = Math.random();
    if (rand < 0.02) {
      status = 'error';
    } else if (rand < 0.05) {
      status = 'warning';
    }

    const productionQty = Math.floor(Math.random() * 50) + 200; // 200~250
    let defectQty = 0;
    if (status === 'error') {
      defectQty = Math.floor(Math.random() * 15) + 10; // 10~25 defects
    } else if (status === 'warning') {
      defectQty = Math.floor(Math.random() * 4) + 1; // 1~5 defects
    } else {
      defectQty = Math.floor(Math.random() * 2); // 0 or 1 defect
    }
    const goodQty = productionQty - defectQty;
    const defectRate = parseFloat(((defectQty / productionQty) * 100).toFixed(2));

    const offset = (80 - i) * 600000; // 10 min offset
    const startTime = new Date(Date.now() - baseTimes[pIdx] - offset).toISOString();
    const endTime = new Date(Date.now() - offset).toISOString();

    lots.push({
      lotNo,
      processStep: process,
      status,
      productionQty,
      goodQty,
      defectQty,
      defectRate,
      equipmentId: equipments[process],
      startTime,
      endTime
    });
  }
  return lots;
};

// Local storage Mock DB setup
const getMockData = (key, defaultVal) => {
  const data = localStorage.getItem(`mes_mock_${key}`);
  if (data) return JSON.parse(data);
  localStorage.setItem(`mes_mock_${key}`, JSON.stringify(defaultVal));
  return defaultVal;
};

const setMockData = (key, val) => {
  localStorage.setItem(`mes_mock_${key}`, JSON.stringify(val));
};

// Initialize Mock DB
export const initLocalDatabase = (force = false) => {
  if (!localStorage.getItem('mes_seeded') || force) {
    setMockData('materials', initialMaterials);
    setMockData('equipment', initialEquipment);
    setMockData('workOrders', initialWorkOrders);
    setMockData('logs', initialLogs);
    setMockData('dashboardStats', initialDashboardStats);
    setMockData('lots', generateInitialLots());
    setMockData('materialReceipts', []);
    localStorage.setItem('mes_seeded', 'true');
    console.log('Local Database Seeded.');
  }
};

// DB API functions (wrapping Firebase or LocalStorage depending on getDbMode())
export const dbService = {
  // WORK ORDERS
  getWorkOrders: async () => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const q = query(collection(db, 'workOrders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const orders = [];
        querySnapshot.forEach((doc) => {
          orders.push({ ...doc.data(), id: doc.id });
        });
        return orders;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    return getMockData('workOrders', initialWorkOrders);
  },

  addWorkOrder: async (order) => {
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
    if (getDbMode() === 'firebase' && db) {
      try {
        // Count today's work orders to determine next sequence number
        const snapshot = await getDocs(collection(db, 'workOrders'));
        const todayCount = snapshot.docs.filter(d => d.id.startsWith(`WO-${dateStr}`)).length;
        const customId = `WO-${dateStr}-${String(todayCount + 1).padStart(3, '0')}`;
        await setDoc(doc(db, 'workOrders', customId), {
          ...order,
          id: customId,
          createdAt: new Date().toISOString()
        });
        return customId;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const orders = getMockData('workOrders', initialWorkOrders);
    const todayOrders = orders.filter(o => o.id && o.id.startsWith(`WO-${dateStr}`));
    const newId = `WO-${dateStr}-${String(todayOrders.length + 1).padStart(3, '0')}`;
    const newOrder = { 
      ...order, 
      id: newId,
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    setMockData('workOrders', orders);
    return newOrder.id;
  },

  updateWorkOrder: async (id, updates) => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const orderRef = doc(db, 'workOrders', id);
        await updateDoc(orderRef, updates);
        return true;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const orders = getMockData('workOrders', initialWorkOrders);
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      setMockData('workOrders', orders);
      return true;
    }
    return false;
  },

  // MATERIALS
  getMaterials: async () => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'materials'));
        const mats = [];
        querySnapshot.forEach((doc) => {
          mats.push(doc.data());
        });
        return mats.length > 0 ? mats : getMockData('materials', initialMaterials);
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    return getMockData('materials', initialMaterials);
  },

  updateMaterial: async (materialCode, updates) => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const matRef = doc(db, 'materials', materialCode);
        await setDoc(matRef, updates, { merge: true });
        return true;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const mats = getMockData('materials', initialMaterials);
    const index = mats.findIndex(m => m.materialCode === materialCode);
    if (index !== -1) {
      mats[index] = { ...mats[index], ...updates };
      setMockData('materials', mats);
      return true;
    }
    return false;
  },

  // EQUIPMENT STATUS
  getEquipment: async () => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'equipmentStatus'));
        const equips = [];
        querySnapshot.forEach((doc) => {
          equips.push(doc.data());
        });
        return equips.length > 0 ? equips : getMockData('equipment', initialEquipment);
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    return getMockData('equipment', initialEquipment);
  },

  updateEquipment: async (equipmentId, updates) => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const equipRef = doc(db, 'equipmentStatus', equipmentId);
        await setDoc(equipRef, updates, { merge: true });
        return true;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const equips = getMockData('equipment', initialEquipment);
    const index = equips.findIndex(e => e.equipmentId === equipmentId);
    if (index !== -1) {
      equips[index] = { ...equips[index], ...updates };
      setMockData('equipment', equips);
      return true;
    }
    return false;
  },

  // PRODUCTION LOTS
  getLots: async () => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'productionLots'));
        const lots = [];
        querySnapshot.forEach((doc) => {
          lots.push(doc.data());
        });
        return lots.length > 0 ? lots : getMockData('lots', generateInitialLots());
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    return getMockData('lots', generateInitialLots());
  },

  addLot: async (lot) => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const lotRef = doc(db, 'productionLots', lot.lotNo);
        await setDoc(lotRef, lot);
        return true;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const lots = getMockData('lots', []);
    lots.unshift(lot);
    setMockData('lots', lots);
    return true;
  },

  updateLot: async (lotNo, updates) => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const lotRef = doc(db, 'productionLots', lotNo);
        await updateDoc(lotRef, updates);
        return true;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const lots = getMockData('lots', []);
    const index = lots.findIndex(l => l.lotNo === lotNo);
    if (index !== -1) {
      lots[index] = { ...lots[index], ...updates };
      setMockData('lots', lots);
      return true;
    }
    return false;
  },

  // DEFECTS
  getDefects: async () => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'defects'));
        const defects = [];
        querySnapshot.forEach((doc) => {
          defects.push(doc.data());
        });
        return defects;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const lots = getMockData('lots', []);
    const defects = [];
    lots.forEach(lot => {
      if (lot.status !== 'normal') {
        const defectTypes = {
          electrode: 'coating_thickness_error',
          assembly: 'tab_alignment_error',
          formation: 'voltage_abnormal',
          module: 'bms_connection_fail'
        };
        defects.push({
          lotNo: lot.lotNo,
          processStep: lot.processStep,
          defectType: defectTypes[lot.processStep] || 'unknown_error',
          severity: lot.status === 'error' ? 'high' : 'medium',
          timestamp: lot.endTime || lot.startTime
        });
      }
    });
    return defects;
  },

  // LOGS (ALERTS)
  getLogs: async () => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const q = query(collection(db, 'processLogs'), orderBy('timestamp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const logs = [];
        querySnapshot.forEach((doc) => {
          logs.push({ ...doc.data(), id: doc.id });
        });
        return logs;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    return getMockData('logs', initialLogs);
  },

  addLog: async (log) => {
    const newLog = { ...log, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), resolved: false };
    if (getDbMode() === 'firebase' && db) {
      try {
        await addDoc(collection(db, 'processLogs'), newLog);
        return true;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const logs = getMockData('logs', initialLogs);
    logs.unshift(newLog);
    if (logs.length > 50) logs.pop();
    setMockData('logs', logs);
    return true;
  },

  updateLog: async (id, updates) => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const logRef = doc(db, 'processLogs', id);
        await updateDoc(logRef, updates);
        return true;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const logs = getMockData('logs', initialLogs);
    const index = logs.findIndex(l => l.id === id);
    if (index !== -1) {
      logs[index] = { ...logs[index], ...updates };
      setMockData('logs', logs);
      return true;
    }
    return false;
  },

  deleteLog: async (id) => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const logRef = doc(db, 'processLogs', id);
        await deleteDoc(logRef);
        return true;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const logs = getMockData('logs', initialLogs);
    const filtered = logs.filter(l => l.id !== id);
    setMockData('logs', filtered);
    return true;
  },

  // MATERIAL RECEIPTS
  getMaterialReceipts: async () => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'materialReceipts'));
        const receipts = [];
        querySnapshot.forEach((doc) => {
          receipts.push({ ...doc.data(), id: doc.id });
        });
        return receipts;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    return getMockData('materialReceipts', []);
  },

  addMaterialReceipt: async (receipt) => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const docRef = await addDoc(collection(db, 'materialReceipts'), {
          ...receipt,
          createdAt: new Date().toISOString()
        });
        return docRef.id;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const receipts = getMockData('materialReceipts', []);
    const newReceipt = {
      ...receipt,
      id: `MR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(receipts.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    receipts.unshift(newReceipt);
    setMockData('materialReceipts', receipts);
    return newReceipt.id;
  },

  updateMaterialReceipt: async (id, updates) => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const receiptRef = doc(db, 'materialReceipts', id);
        await updateDoc(receiptRef, updates);
        return true;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const receipts = getMockData('materialReceipts', []);
    const index = receipts.findIndex(r => r.id === id);
    if (index !== -1) {
      receipts[index] = { ...receipts[index], ...updates };
      setMockData('materialReceipts', receipts);
      return true;
    }
    return false;
  },

  // DASHBOARD STATS
  getDashboardStats: async () => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'dashboardStats'));
        let stats = null;
        querySnapshot.forEach((doc) => {
          stats = doc.data();
        });
        return stats || getMockData('dashboardStats', initialDashboardStats);
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    return getMockData('dashboardStats', initialDashboardStats);
  },

  updateDashboardStats: async (updates) => {
    if (getDbMode() === 'firebase' && db) {
      try {
        const statsRef = doc(db, 'dashboardStats', 'current');
        await setDoc(statsRef, updates, { merge: true });
        return true;
      } catch (err) {
        console.error('Firebase error, falling back to mock:', err);
      }
    }
    const stats = getMockData('dashboardStats', initialDashboardStats);
    const newStats = { ...stats, ...updates };
    setMockData('dashboardStats', newStats);
    return true;
  },

  // SYNC MOCK TO FIRESTORE (Seeding Firebase DB)
  seedFirebaseDatabase: async () => {
    if (!db) return false;
    try {
      console.log('Seeding Cloud Firestore DB...');
      
      // Seed Materials
      for (const mat of initialMaterials) {
        await setDoc(doc(db, 'materials', mat.materialCode), mat);
      }
      // Seed Equipment
      for (const eq of initialEquipment) {
        await setDoc(doc(db, 'equipmentStatus', eq.equipmentId), eq);
      }
      // Seed Work Orders
      for (const wo of initialWorkOrders) {
        await setDoc(doc(db, 'workOrders', wo.id), wo);
      }
      // Seed Logs
      for (const log of initialLogs) {
        await addDoc(collection(db, 'processLogs'), log);
      }
      // Seed Stats
      await setDoc(doc(db, 'dashboardStats', 'current'), initialDashboardStats);
      
      // Seed All 80 Lots in parallel
      const lots = generateInitialLots();
      await Promise.all(lots.map(lot => setDoc(doc(db, 'productionLots', lot.lotNo), lot)));
      
      console.log('Cloud Firestore DB Seeded Successfully!');
      return true;
    } catch (err) {
      console.error('Failed to seed Firebase DB:', err);
      return false;
    }
  },

  clearAndSeedDatabase: async () => {
    const mode = getDbMode();
    if (mode === 'firebase' && db) {
      try {
        console.log('Clearing and seeding Firebase Firestore...');
        const collectionsToClear = ['workOrders', 'productionLots', 'processLogs', 'defects', 'materialReceipts'];
        for (const colName of collectionsToClear) {
          const snapshot = await getDocs(collection(db, colName));
          const deletePromises = [];
          snapshot.forEach(docSnap => {
            deletePromises.push(deleteDoc(doc(db, colName, docSnap.id)));
          });
          await Promise.all(deletePromises);
        }

        for (const mat of initialMaterials) {
          await setDoc(doc(db, 'materials', mat.materialCode), mat);
        }
        for (const eq of initialEquipment) {
          await setDoc(doc(db, 'equipmentStatus', eq.equipmentId), eq);
        }
        for (const wo of initialWorkOrders) {
          await setDoc(doc(db, 'workOrders', wo.id), wo);
        }
        for (const log of initialLogs) {
          await addDoc(collection(db, 'processLogs'), log);
        }
        await setDoc(doc(db, 'dashboardStats', 'current'), initialDashboardStats);
        
        // Seed all 80 lots in parallel
        const lots = generateInitialLots();
        await Promise.all(lots.map(lot => setDoc(doc(db, 'productionLots', lot.lotNo), lot)));
        
        console.log('Firebase Seeding complete!');
        return true;
      } catch (err) {
        console.error('Firebase clear & seed error:', err);
        return false;
      }
    } else {
      console.log('Resetting local mock database...');
      localStorage.removeItem('mes_seeded');
      const keysToRemove = ['materials', 'equipment', 'workOrders', 'logs', 'dashboardStats', 'lots', 'materialReceipts'];
      keysToRemove.forEach(k => localStorage.removeItem(`mes_mock_${k}`));
      initLocalDatabase(true);
      return true;
    }
  }
};

// Run local DB init immediately when this module is imported
initLocalDatabase();

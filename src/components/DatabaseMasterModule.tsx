import React, { useState } from 'react';
import { 
  VehicleRecord, 
  SupplierRecord, 
  BuyerRecord, 
  EmployeeRecord, 
  CommodityRecord,
  BankRecord,
  BrokerRecord,
  LocationRecord
} from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import ConfirmModal from './ConfirmModal';
import { 
  PlusSquare, 
  Search, 
  Trash2, 
  Edit3, 
  Truck, 
  Users, 
  Briefcase, 
  Layers, 
  Building2, 
  Check, 
  X,
  Scale,
  Database,
  Landmark,
  UserCheck,
  MapPin
} from 'lucide-react';

interface DatabaseMasterModuleProps {
  vehicles: VehicleRecord[];
  setVehicles: React.Dispatch<React.SetStateAction<VehicleRecord[]>>;
  suppliers: SupplierRecord[];
  setSuppliers: React.Dispatch<React.SetStateAction<SupplierRecord[]>>;
  buyers: BuyerRecord[];
  setBuyers: React.Dispatch<React.SetStateAction<BuyerRecord[]>>;
  employees: EmployeeRecord[];
  setEmployees: React.Dispatch<React.SetStateAction<EmployeeRecord[]>>;
  commodities: CommodityRecord[];
  setCommodities: React.Dispatch<React.SetStateAction<CommodityRecord[]>>;
  banks: BankRecord[];
  setBanks: React.Dispatch<React.SetStateAction<BankRecord[]>>;
  brokers: BrokerRecord[];
  setBrokers: React.Dispatch<React.SetStateAction<BrokerRecord[]>>;
  locations: LocationRecord[];
  setLocations: React.Dispatch<React.SetStateAction<LocationRecord[]>>;
}

export default function DatabaseMasterModule({
  vehicles,
  setVehicles,
  suppliers,
  setSuppliers,
  buyers,
  setBuyers,
  employees,
  setEmployees,
  commodities,
  setCommodities,
  banks,
  setBanks,
  brokers,
  setBrokers,
  locations,
  setLocations
}: DatabaseMasterModuleProps) {
  const { t, language } = useLanguage();
  // Tabs for the database master
  type DbTab = 'VEHICLES' | 'SUPPLIERS' | 'BUYERS' | 'EMPLOYEES' | 'COMMODITIES' | 'BANKS' | 'BROKERS' | 'LOCATIONS';
  const [activeSubTab, setActiveSubTab] = useState<DbTab>('VEHICLES');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'ADD' | 'DELETE' | 'EDIT' | 'PAY';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'ADD',
    onConfirm: () => {}
  });

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // --- FORM STATES ---
  // Vehicle
  const [vehiclePoliceNo, setVehiclePoliceNo] = useState('');
  const [vehicleDriver, setVehicleDriver] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleTare, setVehicleTare] = useState<number>(0);

  // Supplier
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierCommodity, setSupplierCommodity] = useState<'BERAS' | 'JAGUNG' | 'GABAH' | 'LAINNYA'>('JAGUNG');

  // Buyer
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');

  // Employee/Broker
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState<'KARYAWAN' | 'BURUH' | 'MAKELAR'>('MAKELAR');
  const [empPhone, setEmpPhone] = useState('');
  const [empCommissionRate, setEmpCommissionRate] = useState<number>(0);

  // Commodity
  const [commodityName, setCommodityName] = useState('');
  const [commodityType, setCommodityType] = useState<'BERAS' | 'JAGUNG' | 'GABAH' | 'LAINNYA'>('JAGUNG');
  const [commodityMoisture, setCommodityMoisture] = useState<number>(14.0);
  const [commodityBagDeduction, setCommodityBagDeduction] = useState<number>(1.0);

  // Bank
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankInitialBalance, setBankInitialBalance] = useState<number>(0);

  // Broker
  const [brokerName, setBrokerName] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
  const [brokerAddress, setBrokerAddress] = useState('');
  const [brokerCommRate, setBrokerCommRate] = useState<number>(0);

  // Location
  const [locName, setLocName] = useState('');
  const [locType, setLocType] = useState<'SILO' | 'FLOOR' | 'DRYER' | 'POLISHING'>('SILO');
  const [locCapacity, setLocCapacity] = useState<number>(0);

  // Handler helpers
  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    (window as any).__showToast?.(msg, type);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    resetForms();
  };

  const resetForms = () => {
    setVehiclePoliceNo('');
    setVehicleDriver('');
    setVehicleType('');
    setVehicleTare(0);

    setSupplierName('');
    setSupplierPhone('');
    setSupplierAddress('');
    setSupplierCommodity('JAGUNG');

    setBuyerName('');
    setBuyerPhone('');
    setBuyerAddress('');

    setEmpName('');
    setEmpRole('MAKELAR');
    setEmpPhone('');
    setEmpCommissionRate(0);

    setCommodityName('');
    setCommodityType('JAGUNG');
    setCommodityMoisture(14.0);
    setCommodityBagDeduction(1.0);

    setBankAccountName('');
    setBankAccountNo('');
    setBankName('');
    setBankInitialBalance(0);

    setBrokerName('');
    setBrokerPhone('');
    setBrokerAddress('');
    setBrokerCommRate(0);

    setLocName('');
    setLocType('SILO');
    setLocCapacity(0);
  };

  // --- VEHICLE ACTIONS ---
  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePoliceNo.trim() || !vehicleDriver.trim()) {
      triggerToast('Nomor Polisi dan Nama Sopir wajib diisi!', 'error');
      return;
    }

    const cleanPoliceNo = vehiclePoliceNo.trim().toUpperCase();

    const executeSave = () => {
      if (editingId) {
        setVehicles(prev => prev.map(v => v.id === editingId ? {
          ...v,
          policeNo: cleanPoliceNo,
          driverName: vehicleDriver.trim(),
          vehicleType: vehicleType.trim(),
          tareWeight: Number(vehicleTare)
        } : v));
        triggerToast(`Data Truk ${cleanPoliceNo} berhasil diperbarui!`, 'success');
      } else {
        // Check duplicate
        if (vehicles.some(v => v.policeNo.toUpperCase() === cleanPoliceNo)) {
          triggerToast(`Truk dengan nomor polisi ${cleanPoliceNo} sudah ada!`, 'warning');
          return;
        }
        const newVeh: VehicleRecord = {
          id: `veh-${Date.now()}`,
          policeNo: cleanPoliceNo,
          driverName: vehicleDriver.trim(),
          vehicleType: vehicleType.trim() || 'Truk Standard',
          tareWeight: Number(vehicleTare) || 0
        };
        setVehicles(prev => [newVeh, ...prev]);
        triggerToast(`Data Truk baru ${cleanPoliceNo} berhasil didaftarkan!`, 'success');
      }
      handleCancel();
    };

    setConfirmModal({
      isOpen: true,
      title: editingId ? 'Konfirmasi Ubah Truk' : 'Konfirmasi Pendaftaran Truk',
      message: editingId 
        ? `Apakah Anda yakin ingin menyimpan perubahan data untuk truk ${cleanPoliceNo}?`
        : `Apakah Anda yakin ingin mendaftarkan data truk baru ${cleanPoliceNo}?`,
      type: editingId ? 'EDIT' : 'ADD',
      onConfirm: () => {
        executeSave();
        closeConfirm();
      }
    });
  };

  const handleEditVehicle = (v: VehicleRecord) => {
    setEditingId(v.id);
    setVehiclePoliceNo(v.policeNo);
    setVehicleDriver(v.driverName);
    setVehicleType(v.vehicleType);
    setVehicleTare(v.tareWeight);
    setIsAddingNew(false);
  };

  const handleDeleteVehicle = (id: string, policeNo: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Hapus Truk',
      message: `Apakah Anda yakin ingin menghapus data truk ${policeNo} secara permanen dari database master?`,
      type: 'DELETE',
      onConfirm: () => {
        setVehicles(prev => prev.filter(v => v.id !== id));
        triggerToast(`Truk ${policeNo} telah dihapus.`, 'success');
        closeConfirm();
      }
    });
  };

  // --- SUPPLIER ACTIONS ---
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      triggerToast('Nama Supplier wajib diisi!', 'error');
      return;
    }

    const executeSave = () => {
      if (editingId) {
        setSuppliers(prev => prev.map(s => s.id === editingId ? {
          ...s,
          name: supplierName.trim(),
          phone: supplierPhone.trim(),
          address: supplierAddress.trim(),
          mainCommodity: supplierCommodity
        } : s));
        triggerToast(`Data Supplier ${supplierName} diperbarui!`, 'success');
      } else {
        if (suppliers.some(s => s.name.toLowerCase() === supplierName.trim().toLowerCase())) {
          triggerToast(`Supplier ${supplierName} sudah ada!`, 'warning');
          return;
        }
        const newSup: SupplierRecord = {
          id: `sup-${Date.now()}`,
          name: supplierName.trim(),
          phone: supplierPhone.trim(),
          address: supplierAddress.trim(),
          mainCommodity: supplierCommodity
        };
        setSuppliers(prev => [newSup, ...prev]);
        triggerToast(`Supplier ${supplierName} berhasil didaftarkan!`, 'success');
      }
      handleCancel();
    };

    setConfirmModal({
      isOpen: true,
      title: editingId ? 'Konfirmasi Ubah Supplier' : 'Konfirmasi Pendaftaran Supplier',
      message: editingId 
        ? `Apakah Anda yakin ingin menyimpan perubahan data untuk supplier ${supplierName}?`
        : `Apakah Anda yakin ingin mendaftarkan data supplier baru ${supplierName}?`,
      type: editingId ? 'EDIT' : 'ADD',
      onConfirm: () => {
        executeSave();
        closeConfirm();
      }
    });
  };

  const handleEditSupplier = (s: SupplierRecord) => {
    setEditingId(s.id);
    setSupplierName(s.name);
    setSupplierPhone(s.phone);
    setSupplierAddress(s.address);
    setSupplierCommodity(s.mainCommodity);
    setIsAddingNew(false);
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Hapus Supplier',
      message: `Apakah Anda yakin ingin menghapus supplier ${name} secara permanen dari database master?`,
      type: 'DELETE',
      onConfirm: () => {
        setSuppliers(prev => prev.filter(s => s.id !== id));
        triggerToast(`Supplier ${name} telah dihapus.`, 'success');
        closeConfirm();
      }
    });
  };

  // --- BUYER ACTIONS ---
  const handleSaveBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      triggerToast('Nama Pembeli wajib diisi!', 'error');
      return;
    }

    const executeSave = () => {
      if (editingId) {
        setBuyers(prev => prev.map(b => b.id === editingId ? {
          ...b,
          name: buyerName.trim(),
          phone: buyerPhone.trim(),
          address: buyerAddress.trim()
        } : b));
        triggerToast(`Data Pembeli ${buyerName} diperbarui!`, 'success');
      } else {
        const newBuyer: BuyerRecord = {
          id: `buy-${Date.now()}`,
          name: buyerName.trim(),
          phone: buyerPhone.trim(),
          address: buyerAddress.trim()
        };
        setBuyers(prev => [newBuyer, ...prev]);
        triggerToast(`Pembeli ${buyerName} berhasil didaftarkan!`, 'success');
      }
      handleCancel();
    };

    setConfirmModal({
      isOpen: true,
      title: editingId ? 'Konfirmasi Ubah Pembeli' : 'Konfirmasi Pendaftaran Pembeli',
      message: editingId 
        ? `Apakah Anda yakin ingin menyimpan perubahan data untuk pembeli ${buyerName}?`
        : `Apakah Anda yakin ingin mendaftarkan data pembeli baru ${buyerName}?`,
      type: editingId ? 'EDIT' : 'ADD',
      onConfirm: () => {
        executeSave();
        closeConfirm();
      }
    });
  };

  const handleEditBuyer = (b: BuyerRecord) => {
    setEditingId(b.id);
    setBuyerName(b.name);
    setBuyerPhone(b.phone);
    setBuyerAddress(b.address);
    setIsAddingNew(false);
  };

  const handleDeleteBuyer = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Hapus Pembeli',
      message: `Apakah Anda yakin ingin menghapus pembeli ${name} secara permanen dari database master?`,
      type: 'DELETE',
      onConfirm: () => {
        setBuyers(prev => prev.filter(b => b.id !== id));
        triggerToast(`Pembeli ${name} telah dihapus.`, 'success');
        closeConfirm();
      }
    });
  };

  // --- EMPLOYEE / BROKER ACTIONS ---
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) {
      triggerToast('Nama wajib diisi!', 'error');
      return;
    }

    const executeSave = () => {
      if (editingId) {
        setEmployees(prev => prev.map(emp => emp.id === editingId ? {
          ...emp,
          name: empName.trim(),
          role: empRole,
          phone: empPhone.trim(),
          ratePerKg: empRole === 'MAKELAR' ? Number(empCommissionRate) : undefined
        } : emp));
        triggerToast(`Pegawai/Makelar ${empName} berhasil diperbarui!`, 'success');
      } else {
        const newEmp: EmployeeRecord = {
          id: `emp-${Date.now()}`,
          name: empName.trim(),
          role: empRole,
          phone: empPhone.trim(),
          ratePerKg: empRole === 'MAKELAR' ? Number(empCommissionRate) : undefined
        };
        setEmployees(prev => [newEmp, ...prev]);
        triggerToast(`Data ${empRole === 'MAKELAR' ? 'Makelar' : 'Pegawai'} ${empName} berhasil disimpan!`, 'success');
      }
      handleCancel();
    };

    setConfirmModal({
      isOpen: true,
      title: editingId ? 'Konfirmasi Ubah Pegawai/Makelar' : 'Konfirmasi Pendaftaran Pegawai/Makelar',
      message: editingId 
        ? `Apakah Anda yakin ingin menyimpan perubahan data untuk pegawai/makelar ${empName}?`
        : `Apakah Anda yakin ingin mendaftarkan data pegawai/makelar baru ${empName}?`,
      type: editingId ? 'EDIT' : 'ADD',
      onConfirm: () => {
        executeSave();
        closeConfirm();
      }
    });
  };

  const handleEditEmployee = (emp: EmployeeRecord) => {
    setEditingId(emp.id);
    setEmpName(emp.name);
    setEmpRole(emp.role);
    setEmpPhone(emp.phone || '');
    setEmpCommissionRate(emp.ratePerKg || 0);
    setIsAddingNew(false);
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Hapus Pegawai/Makelar',
      message: `Apakah Anda yakin ingin menghapus ${name} dari daftar pegawai/makelar secara permanen?`,
      type: 'DELETE',
      onConfirm: () => {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        triggerToast(`${name} telah dihapus.`, 'success');
        closeConfirm();
      }
    });
  };

  // --- COMMODITY ACTIONS ---
  const handleSaveCommodity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commodityName.trim()) {
      triggerToast('Nama Komoditas wajib diisi!', 'error');
      return;
    }

    const executeSave = () => {
      if (editingId) {
        setCommodities(prev => prev.map(c => c.id === editingId ? {
          ...c,
          name: commodityName.trim().toUpperCase(),
          type: commodityType,
          moistureStandard: Number(commodityMoisture),
          bagDeductionPercent: Number(commodityBagDeduction)
        } : c));
        triggerToast(`Komoditas ${commodityName} diperbarui!`, 'success');
      } else {
        const newCom: CommodityRecord = {
          id: `com-${Date.now()}`,
          name: commodityName.trim().toUpperCase(),
          type: commodityType,
          moistureStandard: Number(commodityMoisture) || 14.0,
          bagDeductionPercent: Number(commodityBagDeduction) || 1.0
        };
        setCommodities(prev => [newCom, ...prev]);
        triggerToast(`Komoditas ${commodityName} disimpan!`, 'success');
      }
      handleCancel();
    };

    setConfirmModal({
      isOpen: true,
      title: editingId ? 'Konfirmasi Ubah Komoditas' : 'Konfirmasi Pendaftaran Komoditas',
      message: editingId 
        ? `Apakah Anda yakin ingin menyimpan perubahan data untuk komoditas ${commodityName.toUpperCase()}?`
        : `Apakah Anda yakin ingin mendaftarkan data komoditas baru ${commodityName.toUpperCase()}?`,
      type: editingId ? 'EDIT' : 'ADD',
      onConfirm: () => {
        executeSave();
        closeConfirm();
      }
    });
  };

  const handleEditCommodity = (c: CommodityRecord) => {
    setEditingId(c.id);
    setCommodityName(c.name);
    setCommodityType(c.type);
    setCommodityMoisture(c.moistureStandard);
    setCommodityBagDeduction(c.bagDeductionPercent);
    setIsAddingNew(false);
  };

  const handleDeleteCommodity = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Hapus Komoditas',
      message: `Apakah Anda yakin ingin menghapus komoditas ${name} secara permanen dari database master?`,
      type: 'DELETE',
      onConfirm: () => {
        setCommodities(prev => prev.filter(c => c.id !== id));
        triggerToast(`Komoditas ${name} telah dihapus.`, 'success');
        closeConfirm();
      }
    });
  };

  // --- BANK ACTIONS ---
  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccountName.trim() || !bankName.trim()) {
      triggerToast('Nama Akun dan Bank wajib diisi!', 'error');
      return;
    }
    const executeSave = () => {
      if (editingId) {
        setBanks(prev => prev.map(b => b.id === editingId ? {
          ...b,
          accountName: bankAccountName.trim(),
          accountNo: bankAccountNo.trim(),
          bankName: bankName.trim(),
          initialBalance: Number(bankInitialBalance)
        } : b));
        triggerToast(`Data Bank ${bankAccountName} diperbarui!`, 'success');
      } else {
        const newBank: BankRecord = {
          id: `bank-${Date.now()}`,
          accountName: bankAccountName.trim(),
          accountNo: bankAccountNo.trim(),
          bankName: bankName.trim(),
          initialBalance: Number(bankInitialBalance)
        };
        setBanks(prev => [newBank, ...prev]);
        triggerToast(`Akun Bank ${bankAccountName} berhasil didaftarkan!`, 'success');
      }
      handleCancel();
    };
    setConfirmModal({
      isOpen: true,
      title: editingId ? 'Konfirmasi Ubah Rekening' : 'Konfirmasi Pendaftaran Rekening',
      message: editingId 
        ? `Apakah Anda yakin ingin menyimpan perubahan data untuk rekening ${bankAccountName}?`
        : `Apakah Anda yakin ingin mendaftarkan rekening baru ${bankAccountName}?`,
      type: editingId ? 'EDIT' : 'ADD',
      onConfirm: () => { executeSave(); closeConfirm(); }
    });
  };

  const handleEditBank = (b: BankRecord) => {
    setEditingId(b.id);
    setBankAccountName(b.accountName);
    setBankAccountNo(b.accountNo || '');
    setBankName(b.bankName);
    setBankInitialBalance(b.initialBalance);
    setIsAddingNew(false);
  };

  const handleDeleteBank = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Hapus Rekening',
      message: `Hapus rekening ${name}? Catatan finansial yang sudah ada mungkin akan terpengaruh.`,
      type: 'DELETE',
      onConfirm: () => {
        setBanks(prev => prev.filter(b => b.id !== id));
        triggerToast(`Rekening ${name} dihapus.`, 'success');
        closeConfirm();
      }
    });
  };

  // --- BROKER ACTIONS ---
  const handleSaveBroker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerName.trim()) {
      triggerToast('Nama Makelar wajib diisi!', 'error');
      return;
    }
    const executeSave = () => {
      if (editingId) {
        setBrokers(prev => prev.map(b => b.id === editingId ? {
          ...b,
          name: brokerName.trim(),
          phone: brokerPhone.trim(),
          address: brokerAddress.trim(),
          commissionRate: Number(brokerCommRate)
        } : b));
        triggerToast(`Data Broker ${brokerName} diperbarui!`, 'success');
      } else {
        const newBroker: BrokerRecord = {
          id: `bro-${Date.now()}`,
          name: brokerName.trim(),
          phone: brokerPhone.trim(),
          address: brokerAddress.trim(),
          commissionRate: Number(brokerCommRate)
        };
        setBrokers(prev => [newBroker, ...prev]);
        triggerToast(`Makelar ${brokerName} berhasil didaftarkan!`, 'success');
      }
      handleCancel();
    };
    setConfirmModal({
      isOpen: true,
      title: editingId ? 'Konfirmasi Ubah Makelar' : 'Konfirmasi Pendaftaran Makelar',
      message: editingId 
        ? `Apakah Anda yakin ingin menyimpan perubahan data makelar ${brokerName}?`
        : `Apakah Anda yakin ingin mendaftarkan makelar baru ${brokerName}?`,
      type: editingId ? 'EDIT' : 'ADD',
      onConfirm: () => { executeSave(); closeConfirm(); }
    });
  };

  const handleEditBroker = (b: BrokerRecord) => {
    setEditingId(b.id);
    setBrokerName(b.name);
    setBrokerPhone(b.phone || '');
    setBrokerAddress(b.address || '');
    setBrokerCommRate(b.commissionRate);
    setIsAddingNew(false);
  };

  const handleDeleteBroker = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Hapus Makelar',
      message: `Hapus makelar ${name} dari sistem?`,
      type: 'DELETE',
      onConfirm: () => {
        setBrokers(prev => prev.filter(b => b.id !== id));
        triggerToast(`Makelar ${name} dihapus.`, 'success');
        closeConfirm();
      }
    });
  };

  // --- LOCATION ACTIONS ---
  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim()) {
      triggerToast('Nama Lokasi wajib diisi!', 'error');
      return;
    }
    const executeSave = () => {
      if (editingId) {
        setLocations(prev => prev.map(l => l.id === editingId ? {
          ...l,
          name: locName.trim(),
          type: locType,
          capacityKg: Number(locCapacity)
        } : l));
        triggerToast(`Lokasi ${locName} diperbarui!`, 'success');
      } else {
        const newLoc: LocationRecord = {
          id: `loc-${Date.now()}`,
          name: locName.trim(),
          type: locType,
          capacityKg: Number(locCapacity)
        };
        setLocations(prev => [newLoc, ...prev]);
        triggerToast(`Lokasi ${locName} ditambahkan ke database!`, 'success');
      }
      handleCancel();
    };
    setConfirmModal({
      isOpen: true,
      title: editingId ? 'Konfirmasi Ubah Lokasi' : 'Konfirmasi Pendaftaran Lokasi',
      message: editingId ? `Simpan perubahan lokasi ${locName}?` : `Daftarkan lokasi baru ${locName}?`,
      type: editingId ? 'EDIT' : 'ADD',
      onConfirm: () => { executeSave(); closeConfirm(); }
    });
  };

  const handleEditLocation = (l: LocationRecord) => {
    setEditingId(l.id);
    setLocName(l.name);
    setLocType(l.type);
    setLocCapacity(l.capacityKg || 0);
    setIsAddingNew(false);
  };

  const handleDeleteLocation = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Hapus Lokasi',
      message: `Hapus lokasi penyimpanan ${name}?`,
      type: 'DELETE',
      onConfirm: () => {
        setLocations(prev => prev.filter(l => l.id !== id));
        triggerToast(`Lokasi ${name} dihapus.`, 'success');
        closeConfirm();
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden font-sans">
      
      {/* Banner Header */}
      <div className="bg-[#1e1b4b] text-white px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-rose-400 animate-pulse" />
            {t.databaseTitle}
          </h2>
          <p className="text-[11px] text-indigo-200 mt-1 uppercase font-mono tracking-wider font-semibold">
            Pusat Pengelolaan Data Master Otomatis (Anti-Manual Input)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {!isAddingNew && !editingId && (
            <button
              onClick={() => {
                setIsAddingNew(true);
                setEditingId(null);
                resetForms();
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <PlusSquare className="w-4 h-4" />
              TAMBAH DATA BARU
            </button>
          )}
        </div>
      </div>

      {/* Internal Subtabs Row */}
      <div className="bg-slate-50 border-b border-neutral-200 flex flex-wrap gap-1 p-2">
        <button
          onClick={() => { setActiveSubTab('VEHICLES'); setSearchQuery(''); handleCancel(); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'VEHICLES'
              ? 'bg-indigo-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          🚛 Truk &amp; Nomor Polisi ({vehicles.length})
        </button>

        <button
          onClick={() => { setActiveSubTab('SUPPLIERS'); setSearchQuery(''); handleCancel(); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'SUPPLIERS'
              ? 'bg-indigo-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          🌾 Supplier Tani ({suppliers.length})
        </button>

        <button
          onClick={() => { setActiveSubTab('BUYERS'); setSearchQuery(''); handleCancel(); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'BUYERS'
              ? 'bg-indigo-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          🏢 Buyer / Pembeli ({buyers.length})
        </button>

        <button
          onClick={() => { setActiveSubTab('EMPLOYEES'); setSearchQuery(''); handleCancel(); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'EMPLOYEES'
              ? 'bg-indigo-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          🤝 Makelar &amp; Pegawai ({employees.length})
        </button>

        <button
          onClick={() => { setActiveSubTab('COMMODITIES'); setSearchQuery(''); handleCancel(); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'COMMODITIES'
              ? 'bg-indigo-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          📦 Daftar Barang / Komoditas ({commodities.length})
        </button>

        <button
          onClick={() => { setActiveSubTab('BANKS'); setSearchQuery(''); handleCancel(); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'BANKS'
              ? 'bg-rose-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          🏦 Saluran Rekening / Bank ({banks.length})
        </button>

        <button
          onClick={() => { setActiveSubTab('BROKERS'); setSearchQuery(''); handleCancel(); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'BROKERS'
              ? 'bg-rose-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          🤝 Makelar / Broker ({brokers.length})
        </button>

        <button
          onClick={() => { setActiveSubTab('LOCATIONS'); setSearchQuery(''); handleCancel(); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'LOCATIONS'
              ? 'bg-rose-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          📍 Lokasi / Sektor Gudang ({locations.length})
        </button>
      </div>

      {/* Main Panel Content split into Form & List */}
      <div className="p-6">
        
        {/* Dynamic Input Forms (Visible when adding or editing) */}
        {(isAddingNew || editingId) && (
          <div className="mb-6 p-5 bg-[#faf9f6]/90 border border-indigo-100 rounded-xl relative">
            <button 
              onClick={handleCancel}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 bg-neutral-100 p-1 rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-extrabold text-indigo-950 mb-4 uppercase tracking-tight flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
              {editingId ? 'Edit Data Master' : 'Daftarkan Data Master Baru'} 
            </h3>

            {/* Form: VEHICLES */}
            {activeSubTab === 'VEHICLES' && (
              <form onSubmit={handleSaveVehicle} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">No. Polisi (Kendaraan)</label>
                  <input
                    type="text"
                    required
                    value={vehiclePoliceNo}
                    onChange={(e) => setVehiclePoliceNo(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-bold uppercase placeholder:normal-case focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: DP 1234 XX"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Nama Sopir (Default)</label>
                  <input
                    type="text"
                    required
                    value={vehicleDriver}
                    onChange={(e) => setVehicleDriver(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Nama sopir pembawa"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Kategori Unit Truk</label>
                  <input
                    type="text"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: Colt Diesel 6R"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Berat Tara Kosong (Kg)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={vehicleTare || ''}
                      onChange={(e) => setVehicleTare(Number(e.target.value))}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none text-neutral-800"
                      placeholder="Contoh: 3500"
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer">
                      <Check className="w-3.5 h-3.5" /> SIMPAN
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Form: SUPPLIERS */}
            {activeSubTab === 'SUPPLIERS' && (
              <form onSubmit={handleSaveSupplier} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Nama Supplier / Tani</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-bold focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: Haji Sudirman"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">No. HP / Kontak Utama</label>
                  <input
                    type="text"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="0812-xxxx-xxx"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Alamat / Kecamatan</label>
                  <input
                    type="text"
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Tempat asal / tinggal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Komoditas Utama</label>
                  <div className="flex gap-2">
                    <select
                      value={supplierCommodity}
                      onChange={(e) => setSupplierCommodity(e.target.value as any)}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-2 py-2 text-xs font-semibold focus:border-indigo-500 outline-none text-neutral-800"
                    >
                      <option value="JAGUNG">JAGUNG</option>
                      <option value="BERAS">BERAS</option>
                      <option value="GABAH">GABAH</option>
                      <option value="LAINNYA">LAINNYA</option>
                    </select>
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 shrink-0 cursor-pointer">
                      <Check className="w-3.5 h-3.5" /> SIMPAN
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Form: BUYERS */}
            {activeSubTab === 'BUYERS' && (
              <form onSubmit={handleSaveBuyer} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Nama Perusahaan / Buyer</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-bold focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: PT Sinar Indah"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">No. Telepon Pabrik/PIC</label>
                  <input
                    type="text"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="0811-xxxx-xxxx"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Alamat Pengiriman Utama</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none text-neutral-800"
                      placeholder="Makassar / Pelabuhan / KIMA"
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 shrink-0 cursor-pointer">
                      <Check className="w-3.5 h-3.5" /> SIMPAN
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Form: EMPLOYEES */}
            {activeSubTab === 'EMPLOYEES' && (
              <form onSubmit={handleSaveEmployee} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-bold focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: Ridwan Makelar"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Peran / Jabatan Mitra</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as any)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-2 py-2 text-xs font-semibold focus:border-indigo-500 outline-none text-neutral-800 cursor-pointer"
                  >
                    <option value="MAKELAR">MAKELAR (BROKER)</option>
                    <option value="BURUH">BURUH PANGGUL / MUAT</option>
                    <option value="KARYAWAN">KARYAWAN / STAFF OPERATOR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Nomor HP</label>
                  <input
                    type="text"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="08xx-xxxx-xxxx"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">
                    {empRole === 'MAKELAR' ? 'Tarif Komisi Default (Rp / Kg)' : 'Tarif Standar (Tidak Dipakai)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      disabled={empRole !== 'MAKELAR'}
                      value={empRole === 'MAKELAR' ? empCommissionRate || '' : 0}
                      onChange={(e) => setEmpCommissionRate(Number(e.target.value))}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono disabled:opacity-50 text-neutral-850 outline-none focus:border-indigo-500"
                      placeholder="Contoh: 50"
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 shrink-0 cursor-pointer">
                      <Check className="w-3.5 h-3.5" /> SIMPAN
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Form: COMMODITIES */}
            {activeSubTab === 'COMMODITIES' && (
              <form onSubmit={handleSaveCommodity} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Nama Komoditas</label>
                  <input
                    type="text"
                    required
                    value={commodityName}
                    onChange={(e) => setCommodityName(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-bold uppercase focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: JAGUNG BASAH A"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Kategori Basis</label>
                  <select
                    value={commodityType}
                    onChange={(e) => setCommodityType(e.target.value as any)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-2 py-2 text-xs font-semibold focus:border-indigo-500 outline-none text-neutral-800"
                  >
                    <option value="JAGUNG">JAGUNG</option>
                    <option value="BERAS">BERAS</option>
                    <option value="GABAH">GABAH</option>
                    <option value="LAINNYA">LAINNYA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Target Standar KA (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={commodityMoisture || ''}
                    onChange={(e) => setCommodityMoisture(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: 14.0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Potongan Karung Default (%)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={commodityBagDeduction || ''}
                      onChange={(e) => setCommodityBagDeduction(Number(e.target.value))}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none text-neutral-800"
                      placeholder="Contoh: 1.00"
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 shrink-0 cursor-pointer">
                      <Check className="w-3.5 h-3.5" /> SIMPAN
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Form: BANKS */}
            {activeSubTab === 'BANKS' && (
              <form onSubmit={handleSaveBank} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Nama Akun / Alias</label>
                  <input
                    type="text"
                    required
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-bold focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: Mandiri Bilibili 162"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Nama Bank</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: Mandiri / BRI / Tunai"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">No. Rekening</label>
                  <input
                    type="text"
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: 162-xx-xxx"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Saldo Awal (Rp)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={bankInitialBalance || ''}
                      onChange={(e) => setBankInitialBalance(Number(e.target.value))}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none text-neutral-800"
                      placeholder="Contoh: 1000000"
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 shrink-0 cursor-pointer">
                      <Check className="w-3.5 h-3.5" /> SIMPAN
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Form: BROKERS */}
            {activeSubTab === 'BROKERS' && (
              <form onSubmit={handleSaveBroker} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Nama Makelar</label>
                  <input
                    type="text"
                    required
                    value={brokerName}
                    onChange={(e) => setBrokerName(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-bold focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: Pak Ridwan"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Nomor HP</label>
                  <input
                    type="text"
                    value={brokerPhone}
                    onChange={(e) => setBrokerPhone(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="08xx-xxxx"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Tarif Komisi (Rp / Kg)</label>
                  <input
                    type="number"
                    value={brokerCommRate || ''}
                    onChange={(e) => setBrokerCommRate(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: 50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Alamat / Domisili</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={brokerAddress}
                      onChange={(e) => setBrokerAddress(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none text-neutral-800"
                      placeholder="Contoh: Pinrang"
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 shrink-0 cursor-pointer">
                      <Check className="w-3.5 h-3.5" /> SIMPAN
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Form: LOCATIONS */}
            {activeSubTab === 'LOCATIONS' && (
              <form onSubmit={handleSaveLocation} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Nama Lokasi Gudang/Sektor</label>
                  <input
                    type="text"
                    required
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-bold focus:border-indigo-500 outline-none text-neutral-800"
                    placeholder="Contoh: Sektor Timur (Silo 1)"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Tipe Fasilitas</label>
                  <select
                    value={locType}
                    onChange={(e) => setLocType(e.target.value as any)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-2 py-2 text-xs font-semibold focus:border-indigo-500 outline-none text-neutral-800"
                  >
                    <option value="SILO">SILO (Penyimpanan Vertikal)</option>
                    <option value="FLOOR">Lantai Gudang (Flat House)</option>
                    <option value="DRYER">Lantai Jemur / Dryer</option>
                    <option value="POLISHING">Area Produksi / Poles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">Kapasitas Maksimal (Kg)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={locCapacity || ''}
                      onChange={(e) => setLocCapacity(Number(e.target.value))}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none text-neutral-800"
                      placeholder="Contoh: 500000"
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 shrink-0 cursor-pointer">
                      <Check className="w-3.5 h-3.5" /> SIMPAN
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        )}

        {/* Search controls */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50 p-3 rounded-xl border border-neutral-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Cari dari data master ${activeSubTab === 'VEHICLES' ? 'No. Polisi' : activeSubTab === 'SUPPLIERS' ? 'Supplier' : activeSubTab === 'BUYERS' ? 'Pembeli' : activeSubTab === 'EMPLOYEES' ? 'Nama' : 'Komoditas'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg outline-none focus:border-indigo-500 text-neutral-700"
            />
          </div>
          <div className="text-[11px] text-neutral-500 font-medium font-mono">
            {activeSubTab === 'VEHICLES' && `Total: ${vehicles.length} Truk terdaftar`}
            {activeSubTab === 'SUPPLIERS' && `Total: ${suppliers.length} Supplier terdaftar`}
            {activeSubTab === 'BUYERS' && `Total: ${buyers.length} Buyer / Industri`}
            {activeSubTab === 'EMPLOYEES' && `Total: ${employees.length} Pegawai & Makelar`}
            {activeSubTab === 'COMMODITIES' && `Total: ${commodities.length} Jenis Produk`}
            {activeSubTab === 'BANKS' && `Total: ${banks.length} Saluran Kas`}
            {activeSubTab === 'BROKERS' && `Total: ${brokers.length} Makelar Aktif`}
            {activeSubTab === 'LOCATIONS' && `Total: ${locations.length} Lokasi Operasional`}
          </div>
        </div>

        {/* --- DATAGRID DISPLAY --- */}

        {/* GRID: VEHICLES */}
        {activeSubTab === 'VEHICLES' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-800 text-white uppercase font-mono tracking-wider text-[10px] border-b border-neutral-700">
                  <th className="p-3 font-semibold">No. Polisi</th>
                  <th className="p-3 font-semibold">Nama Sopir</th>
                  <th className="p-3 font-semibold">Tipe Truk</th>
                  <th className="p-3 font-semibold text-right">Berat Tara Kosong (Kg)</th>
                  <th className="p-3 font-semibold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {vehicles
                  .filter(v => v.policeNo.toLowerCase().includes(searchQuery.toLowerCase()) || v.driverName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 font-sans text-neutral-800">
                      <td className="p-3 font-extrabold text-indigo-900 tracking-tight font-mono">{v.policeNo}</td>
                      <td className="p-3 font-bold">{v.driverName}</td>
                      <td className="p-3 text-neutral-600">{v.vehicleType}</td>
                      <td className="p-3 font-mono font-bold text-right text-emerald-700">{(v.tareWeight || 0).toLocaleString('id-ID')} Kg</td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleEditVehicle(v)}
                          className="bg-sky-50 text-sky-700 hover:bg-sky-100 p-1.5 rounded transition cursor-pointer"
                          title="Sunting"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteVehicle(v.id, v.policeNo)}
                          className="bg-red-50 text-red-650 hover:bg-red-100 p-1.5 rounded transition cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* GRID: SUPPLIERS */}
        {activeSubTab === 'SUPPLIERS' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-800 text-white uppercase font-mono tracking-wider text-[10px] border-b border-neutral-700">
                  <th className="p-3 font-semibold">Nama Supplier</th>
                  <th className="p-3 font-semibold">No. HP</th>
                  <th className="p-3 font-semibold">Alamat Asal</th>
                  <th className="p-3 font-semibold">Komoditas Utama</th>
                  <th className="p-3 font-semibold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {suppliers
                  .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.address.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 text-neutral-800">
                      <td className="p-3 font-extrabold text-neutral-900">{s.name}</td>
                      <td className="p-3 font-mono font-medium">{s.phone || '-'}</td>
                      <td className="p-3 text-neutral-600">{s.address || '-'}</td>
                      <td className="p-3">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold px-2 py-0.5 rounded text-[10px]">
                          {s.mainCommodity}
                        </span>
                      </td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleEditSupplier(s)}
                          className="bg-sky-50 text-sky-700 hover:bg-sky-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSupplier(s.id, s.name)}
                          className="bg-red-50 text-red-650 hover:bg-red-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* GRID: BUYERS */}
        {activeSubTab === 'BUYERS' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-800 text-white uppercase font-mono tracking-wider text-[10px] border-b border-neutral-700">
                  <th className="p-3 font-semibold">Nama Perusahaan / Buyer</th>
                  <th className="p-3 font-semibold">No. Telepon</th>
                  <th className="p-3 font-semibold">Alamat Pengiriman Utama</th>
                  <th className="p-3 font-semibold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {buyers
                  .filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.address.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 text-neutral-800">
                      <td className="p-3 font-extrabold text-[#111]">{b.name}</td>
                      <td className="p-3 font-mono">{b.phone || '-'}</td>
                      <td className="p-3 text-neutral-600 font-bold">{b.address || '-'}</td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleEditBuyer(b)}
                          className="bg-sky-50 text-sky-700 hover:bg-sky-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBuyer(b.id, b.name)}
                          className="bg-red-50 text-red-650 hover:bg-red-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* GRID: EMPLOYEES */}
        {activeSubTab === 'EMPLOYEES' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-800 text-white uppercase font-mono tracking-wider text-[10px] border-b border-neutral-700">
                  <th className="p-3 font-semibold">Nama Lengkap</th>
                  <th className="p-3 font-semibold">Jabatan/Mitra Kerja</th>
                  <th className="p-3 font-semibold">No. HP</th>
                  <th className="p-3 font-semibold text-right">Tarif Komisi (Makelar)</th>
                  <th className="p-3 font-semibold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {employees
                  .filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.role.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50 text-neutral-800">
                      <td className="p-3 font-extrabold text-neutral-905">{emp.name}</td>
                      <td className="p-3">
                        <span className={`font-extrabold px-2 py-0.5 rounded text-[9px] ${
                          emp.role === 'MAKELAR' 
                            ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                            : emp.role === 'BURUH' 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                            : 'bg-indigo-50 text-indigo-850 border border-indigo-200'
                        }`}>
                          {emp.role === 'MAKELAR' ? '📌 MAKELAR' : emp.role === 'BURUH' ? '📦 BURUH STRIPPER/LOADER' : '💼 KARYAWAN TETAP'}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{emp.phone || '-'}</td>
                      <td className="p-3 font-mono font-bold text-right text-emerald-850">
                        {emp.role === 'MAKELAR' ? `Rp ${(emp.ratePerKg || 0).toLocaleString('id-ID')} / Kg` : '-'}
                      </td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleEditEmployee(emp)}
                          className="bg-sky-50 text-sky-700 hover:bg-sky-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                          className="bg-red-50 text-red-650 hover:bg-red-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* GRID: COMMODITIES */}
        {activeSubTab === 'COMMODITIES' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-800 text-white uppercase font-mono tracking-wider text-[10px] border-b border-neutral-700">
                  <th className="p-3 font-semibold">Nama Barang/Komoditas</th>
                  <th className="p-3 font-semibold">Jenis Basis</th>
                  <th className="p-3 font-semibold text-center">Standar Kadar Air KA (%)</th>
                  <th className="p-3 font-semibold text-center">Deduction Karung (%)</th>
                  <th className="p-3 font-semibold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {commodities
                  .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 text-neutral-800">
                      <td className="p-3 font-extrabold text-neutral-900 tracking-tight">{c.name}</td>
                      <td className="p-3 font-semibold text-gray-500 font-mono text-[10px] uppercase">{c.type}</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-700">{c.moistureStandard}%</td>
                      <td className="p-3 text-center font-mono font-bold text-indigo-700">{c.bagDeductionPercent}%</td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleEditCommodity(c)}
                          className="bg-sky-50 text-sky-700 hover:bg-sky-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCommodity(c.id, c.name)}
                          className="bg-red-50 text-red-650 hover:bg-red-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* GRID: BANKS */}
        {activeSubTab === 'BANKS' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-800 text-white uppercase font-mono tracking-wider text-[10px] border-b border-neutral-700">
                  <th className="p-3 font-semibold">Nama Akun</th>
                  <th className="p-3 font-semibold">Bank</th>
                  <th className="p-3 font-semibold">No. Rekening</th>
                  <th className="p-3 font-semibold text-right">Saldo Awal</th>
                  <th className="p-3 font-semibold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {banks
                  .filter(b => b.accountName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 text-neutral-800">
                      <td className="p-3 font-extrabold text-neutral-900">{b.accountName}</td>
                      <td className="p-3 font-semibold">{b.bankName}</td>
                      <td className="p-3 font-mono">{b.accountNo || '-'}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-800">Rp {b.initialBalance?.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleEditBank(b)}
                          className="bg-sky-50 text-sky-700 hover:bg-sky-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBank(b.id, b.accountName)}
                          className="bg-red-50 text-red-650 hover:bg-red-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* GRID: BROKERS */}
        {activeSubTab === 'BROKERS' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-800 text-white uppercase font-mono tracking-wider text-[10px] border-b border-neutral-700">
                  <th className="p-3 font-semibold">Nama Makelar</th>
                  <th className="p-3 font-semibold">No. HP</th>
                  <th className="p-3 font-semibold">Wilayah / Domisili</th>
                  <th className="p-3 font-semibold text-right">Tarif Komisi (Rp/Kg)</th>
                  <th className="p-3 font-semibold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {brokers
                  .filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 text-neutral-800">
                      <td className="p-3 font-extrabold text-neutral-900">{b.name}</td>
                      <td className="p-3 font-mono">{b.phone || '-'}</td>
                      <td className="p-3 text-neutral-600">{b.address || '-'}</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-700">Rp {b.commissionRate} / Kg</td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleEditBroker(b)}
                          className="bg-sky-50 text-sky-700 hover:bg-sky-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBroker(b.id, b.name)}
                          className="bg-red-50 text-red-650 hover:bg-red-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* GRID: LOCATIONS */}
        {activeSubTab === 'LOCATIONS' && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-800 text-white uppercase font-mono tracking-wider text-[10px] border-b border-neutral-700">
                  <th className="p-3 font-semibold">Lokasi / Fasilitas</th>
                  <th className="p-3 font-semibold text-center">Tipe Unit</th>
                  <th className="p-3 font-semibold text-right">Kapasitas (Kg)</th>
                  <th className="p-3 font-semibold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {locations
                  .filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 text-neutral-800">
                      <td className="p-3 font-extrabold text-indigo-900">{l.name}</td>
                      <td className="p-3 text-center font-bold text-[10px] text-neutral-500 uppercase">{l.type}</td>
                      <td className="p-3 text-right font-mono font-bold text-neutral-700">
                        {l.capacityKg ? `${l.capacityKg.toLocaleString('id-ID')} Kg` : '-'}
                      </td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleEditLocation(l)}
                          className="bg-sky-50 text-sky-700 hover:bg-sky-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLocation(l.id, l.name)}
                          className="bg-red-50 text-red-650 hover:bg-red-100 p-1.5 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
      
      {/* Alert Note */}
      <div className="mx-6 mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200/60 leading-normal flex items-start gap-2.5">
        <Scale className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-extrabold text-emerald-950 uppercase font-mono tracking-wide">Fungsi Persistensi database Aktif</h4>
          <p className="text-[11px] text-emerald-800 font-bold mt-1 leading-relaxed">
            Semua perubahan yang Anda lakukan di halaman ini akan secara otomatis tersimpan ke dalam database browser lokal dan disinkronkan ke seluruh modul pengisian lain secara real-time. Anda tidak perlu lagi melakukan penulisan manual atau berulang-ulang ketika mendaftarkan truk, suplier, buyer, atau makelar di form timbangan dan mutasi kas!
          </p>
        </div>
      </div>

      {/* CONFIRM MODAL OVERLAY */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

    </div>
  );
}

import React, { useState } from 'react';
import { 
  VehicleRecord, 
  SupplierRecord, 
  BuyerRecord, 
  EmployeeRecord, 
  CommodityRecord 
} from '../types';
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
  Database
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
  setCommodities
}: DatabaseMasterModuleProps) {
  // Tabs for the database master
  type DbTab = 'VEHICLES' | 'SUPPLIERS' | 'BUYERS' | 'EMPLOYEES' | 'COMMODITIES';
  const [activeSubTab, setActiveSubTab] = useState<DbTab>('VEHICLES');
  const [searchQuery, setSearchQuery] = useState('');

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
  };

  // --- VEHICLE ACTIONS ---
  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePoliceNo.trim() || !vehicleDriver.trim()) {
      triggerToast('Nomor Polisi dan Nama Sopir wajib diisi!', 'error');
      return;
    }

    const cleanPoliceNo = vehiclePoliceNo.trim().toUpperCase();

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

  const handleEditVehicle = (v: VehicleRecord) => {
    setEditingId(v.id);
    setVehiclePoliceNo(v.policeNo);
    setVehicleDriver(v.driverName);
    setVehicleType(v.vehicleType);
    setVehicleTare(v.tareWeight);
    setIsAddingNew(false);
  };

  const handleDeleteVehicle = (id: string, policeNo: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus truk ${policeNo} dari database?`)) {
      setVehicles(prev => prev.filter(v => v.id !== id));
      triggerToast(`Truk ${policeNo} telah dihapus.`, 'success');
    }
  };

  // --- SUPPLIER ACTIONS ---
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      triggerToast('Nama Supplier wajib diisi!', 'error');
      return;
    }

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

  const handleEditSupplier = (s: SupplierRecord) => {
    setEditingId(s.id);
    setSupplierName(s.name);
    setSupplierPhone(s.phone);
    setSupplierAddress(s.address);
    setSupplierCommodity(s.mainCommodity);
    setIsAddingNew(false);
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    if (confirm(`Hapus Supplier ${name} dari database?`)) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      triggerToast(`Supplier ${name} telah dihapus.`, 'success');
    }
  };

  // --- BUYER ACTIONS ---
  const handleSaveBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      triggerToast('Nama Pembeli wajib diisi!', 'error');
      return;
    }

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

  const handleEditBuyer = (b: BuyerRecord) => {
    setEditingId(b.id);
    setBuyerName(b.name);
    setBuyerPhone(b.phone);
    setBuyerAddress(b.address);
    setIsAddingNew(false);
  };

  const handleDeleteBuyer = (id: string, name: string) => {
    if (confirm(`Hapus Pembeli / Buyer ${name} dari database?`)) {
      setBuyers(prev => prev.filter(b => b.id !== id));
      triggerToast(`Pembeli ${name} telah dihapus.`, 'success');
    }
  };

  // --- EMPLOYEE / BROKER ACTIONS ---
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) {
      triggerToast('Nama wajib diisi!', 'error');
      return;
    }

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

  const handleEditEmployee = (emp: EmployeeRecord) => {
    setEditingId(emp.id);
    setEmpName(emp.name);
    setEmpRole(emp.role);
    setEmpPhone(emp.phone || '');
    setEmpCommissionRate(emp.ratePerKg || 0);
    setIsAddingNew(false);
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`Hapus ${name} dari daftar pegawai/stakeholder?`)) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      triggerToast(`${name} telah dihapus.`, 'success');
    }
  };

  // --- COMMODITY ACTIONS ---
  const handleSaveCommodity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commodityName.trim()) {
      triggerToast('Nama Komoditas wajib diisi!', 'error');
      return;
    }

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

  const handleEditCommodity = (c: CommodityRecord) => {
    setEditingId(c.id);
    setCommodityName(c.name);
    setCommodityType(c.type);
    setCommodityMoisture(c.moistureStandard);
    setCommodityBagDeduction(c.bagDeductionPercent);
    setIsAddingNew(false);
  };

  const handleDeleteCommodity = (id: string, name: string) => {
    if (confirm(`Hapus jenis komoditas ${name} dari database?`)) {
      setCommodities(prev => prev.filter(c => c.id !== id));
      triggerToast(`Komoditas ${name} telah dihapus.`, 'success');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden font-sans">
      
      {/* Banner Header */}
      <div className="bg-[#1e1b4b] text-white px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-rose-400 animate-pulse" />
            DATABASE MASTER SYSTEM &bull; US BILIBILI 162
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

    </div>
  );
}

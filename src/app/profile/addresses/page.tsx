"use client";

import { useState } from "react";
import styles from "../profile.module.css";

const initialAddresses = [
  { id: 1, type: "Home", name: "Abu Talha", address: "123 Green Road, Dhanmondi", city: "Dhaka", phone: "+880 1711223344", isDefault: true },
  { id: 2, type: "Office", name: "Abu Talha", address: "Aurea BD HQ, Gulshan 2", city: "Dhaka", phone: "+880 1911223344", isDefault: false },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Home",
    address: "",
    city: "Dhaka",
    phone: ""
  });

  const handleOpenModal = (addr: any = null) => {
    if (addr) {
      setEditingAddress(addr);
      setFormData({
        name: addr.name,
        type: addr.type,
        address: addr.address,
        city: addr.city,
        phone: addr.phone
      });
    } else {
      setEditingAddress(null);
      setFormData({ name: "", type: "Home", address: "", city: "Dhaka", phone: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      setAddresses(prev => prev.map(a => a.id === editingAddress.id ? { ...a, ...formData } : a));
      alert("Address updated successfully!");
    } else {
      const newAddr = {
        id: Date.now(),
        ...formData,
        isDefault: addresses.length === 0
      };
      setAddresses([...addresses, newAddr]);
      alert("Address added successfully!");
    }
    setIsModalOpen(false);
  };

  const handleSetDefault = (id: number) => {
    setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: addr.id === id })));
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this address?")) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.dashboardHeader}>
        <h1>Manage Addresses</h1>
        <p>Save and manage your delivery locations for faster checkout.</p>
        <button 
          className="btn-nm btn-nm-primary" 
          style={{ marginTop: "var(--sp-4)" }}
          onClick={() => handleOpenModal()}
        >
          + Add New Address
        </button>
      </div>

      <div className={styles.addressGrid}>
        {addresses.map((addr) => (
          <div key={addr.id} className={`${styles.card} ${addr.isDefault ? styles.defaultCard : ""}`}>
            <div className={styles.addressHeader}>
              <span className={styles.typeBadge}>{addr.type}</span>
              {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
            </div>
            <div className={styles.addressBody}>
              <h4>{addr.name}</h4>
              <p>{addr.address}</p>
              <p>{addr.city}</p>
              <p>{addr.phone}</p>
            </div>
            <div className={styles.addressActions}>
              <button className={styles.addrBtn} onClick={() => handleOpenModal(addr)}>Edit</button>
              <button 
                className={`${styles.addrBtn} ${styles.addrBtnDanger}`}
                onClick={() => handleDelete(addr.id)}
              >
                Delete
              </button>
              {!addr.isDefault && (
                <button 
                  className={`${styles.addrBtn} ${styles.addrBtnPrimary}`}
                  onClick={() => handleSetDefault(addr.id)}
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* NICE ADDRESS FORM MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingAddress ? "Edit Address" : "Add New Address"}</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="Recipient's Name" 
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Address Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Full Address</label>
                  <input 
                    type="text" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    placeholder="Street address, house no, etc." 
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input 
                    type="text" 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})} 
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    placeholder="+880 1XXX XXXXXX" 
                    required 
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className="btn-nm" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-nm btn-nm-primary">
                  {editingAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

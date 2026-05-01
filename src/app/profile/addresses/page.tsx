"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Trash2, Edit3, Check, X, Loader2, Home, Briefcase, Navigation } from "lucide-react";
import { toast } from "react-toastify";
import styles from "../profile.module.css";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "Home",
    address: "",
    city: "Dhaka",
    phone: ""
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [loading]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/profile/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = editingAddress ? "PATCH" : "POST";
      const body = editingAddress ? { ...formData, id: editingAddress._id } : formData;

      const res = await fetch("/api/profile/addresses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        toast.success(editingAddress ? "Address updated!" : "Address added!");
        setIsModalOpen(false);
      } else {
        toast.error("Something went wrong");
      }
    } catch (err) {
      toast.error("Error saving address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this address?")) return;
    try {
      const res = await fetch(`/api/profile/addresses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        toast.success("Address removed");
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Home": return <Home size={18} />;
      case "Office": return <Briefcase size={18} />;
      default: return <Navigation size={18} />;
    }
  };

  if (loading) {
    return (
      <div className={styles.addressesWrapper}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonSub} />
        <div className={styles.skeletonStats}>
          {[1, 2].map(i => (
            <div key={i} className={styles.skeletonStatCard} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.addressesWrapper}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.welcomeTitle}>Your <span className={styles.highlight}>Addresses</span></h1>
        <p className={styles.welcomeSubtitle}>Manage your shipping locations for a faster checkout experience.</p>
        <button 
          className={styles.addBtn} 
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} /> Add New Address
        </button>
      </div>

      <div className={styles.addressGrid}>
        <AnimatePresence mode="popLayout">
          {addresses.map((addr) => (
            <motion.div 
              key={addr._id} 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${styles.addressCard} ${addr.isDefault ? styles.defaultCard : ""}`}
            >
              <div className={styles.addressHeader}>
                <div className={styles.typeBadge}>
                  {getTypeIcon(addr.type)}
                  {addr.type}
                </div>
                {addr.isDefault && <div className={styles.defaultLabel}><Check size={12} /> Default</div>}
              </div>
              
              <div className={styles.addressInfo}>
                <h4 className={styles.recipientName}>{addr.name}</h4>
                <p className={styles.streetAddress}>{addr.address}</p>
                <p className={styles.cityText}>{addr.city}</p>
                <p className={styles.phoneText}>{addr.phone}</p>
              </div>

              <div className={styles.addressActions}>
                <button className={styles.actionIconBtn} onClick={() => handleOpenModal(addr)} title="Edit">
                  <Edit3 size={18} />
                </button>
                <button className={styles.actionIconBtnDanger} onClick={() => handleDelete(addr._id)} title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {addresses.length === 0 && (
          <div className={styles.emptyAddressState}>
            <MapPin size={48} opacity={0.2} />
            <p>No addresses found. Add one to get started!</p>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={styles.modal}
            >
              <div className={styles.modalHeader}>
                <h3>{editingAddress ? "Edit Address" : "New Address"}</h3>
                <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className={styles.modalForm}>
                <div className={styles.formGrid}>
                  <div className={styles.inputField}>
                    <label>Recipient Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    />
                  </div>
                  <div className={styles.inputField}>
                    <label>Address Type</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className={styles.inputFieldFull}>
                    <label>Street Address</label>
                    <input 
                      required
                      type="text" 
                      value={formData.address} 
                      onChange={e => setFormData({ ...formData, address: e.target.value })} 
                    />
                  </div>
                  <div className={styles.inputField}>
                    <label>City</label>
                    <input 
                      required
                      type="text" 
                      value={formData.city} 
                      onChange={e => setFormData({ ...formData, city: e.target.value })} 
                    />
                  </div>
                  <div className={styles.inputField}>
                    <label>Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                    />
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                    {isSaving ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

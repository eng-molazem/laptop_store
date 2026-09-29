import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../api/admin';

const PERMISSIONS = ['manageProducts', 'manageOrders', 'managePaymentRequests', 'manageCoupons', 'manageSettings', 'manageAdmins'];

const emptyForm = {
  name: '',
  email: '',
  password: '',
  permissions: Object.fromEntries(PERMISSIONS.map((p) => [p, false])),
};

export default function AdminAdmins() {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const load = () => getAdmins().then(setAdmins);
  useEffect(() => { load(); }, []);

  const togglePermission = (key) => setForm((f) => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAdmin(form);
    setForm(emptyForm);
    load();
  };

  const handleTogglePermission = async (admin, key) => {
    await updateAdmin(admin._id, { permissions: { ...admin.permissions, [key]: !admin.permissions[key] } });
    load();
  };

  const handleToggleActive = async (admin) => {
    await updateAdmin(admin._id, { isActive: !admin.isActive });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm'))) return;
    await deleteAdmin(id);
    load();
  };

  return (
    <div>
      <h1 className="section-title">{t('admin.admins')}</h1>

      <form className="card" style={{ padding: 20, margin: '20px 0' }} onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: 14 }}>إضافة موظف جديد</h3>
        <div className="grid grid-3">
          <div className="form-group">
            <label className="label">الاسم</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">البريد الإلكتروني</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">كلمة المرور</label>
            <input className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="label">الصلاحيات</label>
          <div className="admin-permissions-grid">
            {PERMISSIONS.map((p) => (
              <label key={p} className="admin-permission-item">
                <input type="checkbox" checked={form.permissions[p]} onChange={() => togglePermission(p)} />
                {t(`admin.${p === 'manageProducts' ? 'products' : p === 'manageOrders' ? 'orders' : p === 'managePaymentRequests' ? 'paymentRequests' : p === 'manageCoupons' ? 'coupons' : p === 'manageSettings' ? 'settings' : 'admins'}`)}
              </label>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" type="submit">{t('common.add')}</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>الصلاحيات</th><th>الحالة</th><th></th></tr></thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a._id}>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td>{a.role === 'owner' ? 'مالك' : 'موظف'}</td>
                <td>
                  {a.role === 'owner' ? (
                    'كامل الصلاحيات'
                  ) : (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {PERMISSIONS.map((p) => (
                        <button
                          key={p}
                          className={`chip ${a.permissions?.[p] ? 'active' : ''}`}
                          style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                          onClick={() => handleTogglePermission(a, p)}
                        >
                          {p.replace('manage', '')}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  {a.role !== 'owner' && (
                    <button className={`status-pill ${a.isActive ? 'approved' : 'rejected'}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => handleToggleActive(a)}>
                      {a.isActive ? 'فعال' : 'موقوف'}
                    </button>
                  )}
                </td>
                <td>
                  {a.role !== 'owner' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}>{t('common.delete')}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

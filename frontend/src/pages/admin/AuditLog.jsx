import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuditLog } from '../../api/admin';

export default function AdminAuditLog() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  useEffect(() => {
    getAuditLog().then((r) => setItems(r.items));
  }, []);

  return (
    <div>
      <h1 className="section-title">{t('admin.auditLog')}</h1>
      <div className="table-wrap" style={{ marginTop: 20 }}>
        <table>
          <thead><tr><th>الموظف</th><th>الإجراء</th><th>التفاصيل</th><th>التاريخ</th></tr></thead>
          <tbody>
            {items.map((log) => (
              <tr key={log._id}>
                <td>{log.adminName}</td>
                <td>{log.action}</td>
                <td>{log.details}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

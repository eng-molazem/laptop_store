import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminReviews, hideReview, unhideReview, deleteReviewAdmin } from '../../api/admin';
import StarRating from '../../components/StarRating';

export default function AdminReviews() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [onlyReported, setOnlyReported] = useState(false);

  const load = () => getAdminReviews(onlyReported || undefined).then(setReviews);
  useEffect(() => { load(); }, [onlyReported]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm'))) return;
    await deleteReviewAdmin(id);
    load();
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="section-title">{t('admin.reviews')}</h1>
        <label className="filter-checkbox">
          <input type="checkbox" checked={onlyReported} onChange={(e) => setOnlyReported(e.target.checked)} /> المُبلَّغ عنها فقط
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>المنتج</th><th>الاسم</th><th>التقييم</th><th>التعليق</th><th>بلاغات</th><th>الحالة</th><th></th></tr></thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id}>
                <td>{r.product?.name_ar}</td>
                <td>{r.buyerName}</td>
                <td><StarRating value={r.rating} size={13} /></td>
                <td style={{ maxWidth: 260 }}>{r.comment}</td>
                <td>{r.reportCount}</td>
                <td><span className={`status-pill ${r.status === 'visible' ? 'approved' : 'rejected'}`}>{r.status}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  {r.status === 'visible' ? (
                    <button className="btn btn-ghost btn-sm" onClick={() => hideReview(r._id).then(load)}>إخفاء</button>
                  ) : (
                    <button className="btn btn-ghost btn-sm" onClick={() => unhideReview(r._id).then(load)}>إظهار</button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminProducts, createProduct, updateProduct, deleteProduct, getAdminCategories } from '../../api/admin';
import { fileUrl } from '../../api/client';
import { getPlaceholderImage } from '../../utils/placeholderImage';
import ProductFormModal from '../../components/admin/ProductFormModal';

export default function AdminProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([getAdminProducts(), getAdminCategories()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (formData, id) => {
    if (id) await updateProduct(id, formData);
    else await createProduct(formData);
    setShowModal(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm'))) return;
    await deleteProduct(id);
    load();
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="section-title">{t('admin.products')}</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
        >
          + {t('common.add')}
        </button>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>الاسم</th>
                <th>الفئة</th>
                <th>السعر</th>
                <th>المخزون</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <img
                      src={fileUrl(p.images?.[0]) || getPlaceholderImage(p.category?.slug)}
                      alt=""
                      style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }}
                    />
                  </td>
                  <td>{p.name_ar}</td>
                  <td>{p.category?.name_ar}</td>
                  <td>{p.price.toLocaleString()}</td>
                  <td>{p.stock}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setEditing(p);
                        setShowModal(true);
                      }}
                    >
                      {t('common.edit')}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProductFormModal
          product={editing}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

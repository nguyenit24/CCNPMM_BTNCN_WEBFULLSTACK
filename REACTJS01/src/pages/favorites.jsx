import { useEffect, useState, useContext } from 'react';
import { Button, Empty, Spin, Result, notification } from 'antd';
import { HeartFilled, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/catalog/product-card';
import { getMyFavoritesApi } from '../util/api';
import { AuthContext } from '../components/context/auth.context';

const FavoritesPage = () => {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    const fetchFavorites = async () => {
        setLoading(true);
        const res = await getMyFavoritesApi();
        if (res && res.success !== false) {
            setItems(res.items || []);
        } else {
            notification.error({
                message: 'Tải sản phẩm yêu thích',
                description: res?.message || 'Không thể tải danh sách sản phẩm yêu thích',
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!auth?.isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchFavorites();
    }, [auth?.isAuthenticated]);

    if (loading) {
        return (
            <div className="store-layout store-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="store-layout">
                <Result
                    status="info"
                    icon={<HeartFilled style={{ color: '#ef4444' }} />}
                    title="Danh sách yêu thích trống"
                    subTitle="Hãy thêm các sản phẩm yêu thích của bạn để lưu lại và theo dõi tại đây."
                    extra={(
                        <Button
                            type="primary"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/products')}
                            style={{ borderRadius: 999, fontWeight: 700 }}
                        >
                            Khám phá sản phẩm
                        </Button>
                    )}
                />
            </div>
        );
    }

    return (
        <div className="store-layout favorites-page">
            <div className="store-page-head" style={{ marginBottom: '24px' }}>
                <div>
                    <div className="store-page-head__eyebrow" style={{ color: '#ef4444' }}>
                        <HeartFilled /> Sản phẩm lưu trữ
                    </div>
                    <h1 className="store-page-head__title">Sản phẩm yêu thích của tôi</h1>
                </div>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/products')}
                    style={{ borderRadius: 999 }}
                >
                    Tiếp tục mua sắm
                </Button>
            </div>

            <div className="store-grid--4">
                {items.map((product) => (
                    <ProductCard key={product.slug} product={product} />
                ))}
            </div>
        </div>
    );
};

export default FavoritesPage;

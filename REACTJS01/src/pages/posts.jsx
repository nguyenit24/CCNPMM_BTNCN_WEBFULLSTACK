import { useEffect, useState } from 'react';
import { Empty, Select, Spin, Tag } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
import { getPostsApi } from '../util/api';
import PostCard from '../components/catalog/post-card';

const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
];

const PostsPage = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [sortValue, setSortValue] = useState('newest');

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const res = await getPostsApi({ sort: sortValue, limit: 24 });
            if (res?.message && res.message !== 'Đã xảy ra lỗi máy chủ') {
                // silent error
            }
            const nextItems = Array.isArray(res?.items) ? res.items : [];
            const nextTotal = typeof res?.total === 'number' ? res.total : nextItems.length;
            setItems(nextItems);
            setTotal(nextTotal);
            setLoading(false);
        };
        fetchPosts();
    }, [sortValue]);

    return (
        <div className="post-container">
            <div className="store-layout">
                {/* Page Header */}
                <div className="store-page-head">
                    <div>
                        <p className="store-page-head__eyebrow">
                            <ReadOutlined /> Nội dung &amp; Hướng dẫn
                        </p>
                        <h1 className="store-page-head__title">Tin tức công nghệ</h1>
                        <p className="store-page-head__subtitle">
                            Những bài viết chọn lọc giúp bạn tìm được sản phẩm và setup phù hợp nhất.
                        </p>
                    </div>
                    <div className="store-page-head__summary">
                        <Tag color="blue">Tổng: {total} bài viết</Tag>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="product-toolbar">
                    <div className="product-toolbar__summary">
                        Hiển thị {items.length} / {total} bài viết
                    </div>
                    <Select
                        className="product-toolbar__sort"
                        value={sortValue}
                        options={sortOptions}
                        onChange={setSortValue}
                    />
                </div>

                {/* Posts Grid */}
                {loading ? (
                    <div className="store-loading">
                        <Spin size="large" />
                    </div>
                ) : items.length > 0 ? (
                    <div className="store-grid--3">
                        {items.map((post) => (
                            <PostCard key={post.slug} post={post} />
                        ))}
                    </div>
                ) : (
                    <Empty description="Chưa có bài viết nào" />
                )}
            </div>
        </div>
    );
};

export default PostsPage;


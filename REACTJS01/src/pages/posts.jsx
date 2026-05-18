import { useEffect, useState } from 'react';
import { Empty, Select, Spin, Tag, notification } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getPostsApi } from '../util/api';

const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
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
                notification.error({
                    message: 'Load posts',
                    description: res.message,
                });
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
        <div className="store-layout">
            <div className="store-page-head">
                <div>
                    <p className="store-page-head__eyebrow">Content & guidance</p>
                    <h1 className="store-page-head__title">Tech news</h1>
                    <p className="store-page-head__subtitle">A curated feed of the latest posts to help you choose the right products and setup.</p>
                </div>
                <div className="store-page-head__summary">
                    <Tag color="blue">Total posts: {total}</Tag>
                </div>
            </div>

            <div className="product-toolbar">
                <div className="product-toolbar__summary">Showing {items.length} / {total} posts</div>
                <Select className="product-toolbar__sort" value={sortValue} options={sortOptions} onChange={setSortValue} />
            </div>

            {loading ? (
                <div className="store-loading">
                    <Spin size="large" />
                </div>
            ) : items.length > 0 ? (
                <div className="post-list">
                    {items.map((post) => (
                        <Link key={post.slug} to={`/posts/${post.slug}`} className="post-list-item">
                            <div className="post-list-item__media">
                                <img src={post.cover} alt={post.title} />
                            </div>
                            <div className="post-list-item__body">
                                <div className="post-list-item__head">
                                    <Tag color="blue">{post.categoryName}</Tag>
                                    <span className="post-list-item__date">
                                        {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <h2 className="post-list-item__title">{post.title}</h2>
                                <p className="post-list-item__excerpt">{post.excerpt}</p>
                                <div className="post-list-item__meta">
                                    <span><ClockCircleOutlined /> {post.readTime}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <Empty description="No posts yet" />
            )}
        </div>
    );
};

export default PostsPage;

import { useEffect, useState } from 'react';
import { Empty, Result, Spin, Tag, notification } from 'antd';
import { Link, useParams } from 'react-router-dom';
import PostCard from '../components/catalog/post-card';
import { getPostDetailApi } from '../util/api';

const PostDetailPage = () => {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);

            const res = await getPostDetailApi(slug);

            if (res?.message && res.message !== 'Đã xảy ra lỗi máy chủ' && res.message !== 'Không tìm thấy bài viết') {
                notification.error({
                    message: 'Load post details',
                    description: res.message,
                });
            }

            setData(res);
            setLoading(false);
        };

        fetchDetail();
    }, [slug]);

    if (loading) {
        return (
            <div className="store-layout store-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!data?.post) {
        return <Result status="404" title="Post not found" />;
    }

    const { post, relatedPosts } = data;
    const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean) : [];

    return (
        <div className="store-layout post-detail">
            <div className="store-breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/posts">Posts</Link>
                <span>/</span>
                <span>{post.title}</span>
            </div>

            {/* Bọc bài viết trong container căn giữa, gọn gàng giúp đọc dễ dàng */}
            <div className="post-detail-container">
                <div className="post-detail-main-content">
                    <article className="post-detail__article">
                        <img className="post-detail__cover" src={post.cover} alt={post.title} />
                        <div className="post-detail__content">
                            <Tag color="blue">{post.categoryName}</Tag>
                            <h1 className="post-detail__title">{post.title}</h1>
                            <p className="post-detail__meta">
                                {new Date(post.publishedAt).toLocaleDateString('vi-VN')} · {post.readTime}
                            </p>
                            <p className="post-detail__excerpt">{post.excerpt}</p>
                            {tags.length > 0 ? (
                                <div className="post-detail__tags">
                                    {tags.map((tag) => (
                                        <Tag key={tag}>{tag}</Tag>
                                    ))}
                                </div>
                            ) : null}
                            <div className="post-detail__body">{post.content}</div>
                        </div>
                    </article>

                    <section className="post-detail__related-block content-card" style={{ marginTop: 28 }}>
                        <h2 className="content-card__title">Bài viết liên quan</h2>
                        {relatedPosts?.length > 0 ? (
                            <div className="store-grid--3">
                                {relatedPosts.map((item) => (
                                    <PostCard key={item.slug} post={item} compact />
                                ))}
                            </div>
                        ) : (
                            <Empty description="Không có bài viết liên quan" />
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PostDetailPage;
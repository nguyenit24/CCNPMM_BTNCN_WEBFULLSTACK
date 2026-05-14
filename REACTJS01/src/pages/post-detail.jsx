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
                    message: 'Lấy chi tiết bài viết',
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
        return <Result status="404" title="Không tìm thấy bài viết" />;
    }

    const { post, relatedPosts } = data;

    return (
        <div className="store-layout post-detail">
            <div className="store-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <span>/</span>
                <span>Bài viết</span>
            </div>

            <div className="post-detail__main">
                <article className="post-detail__article">
                    <img className="post-detail__cover" src={post.cover} alt={post.title} />
                    <div className="post-detail__content">
                        <Tag color="blue">{post.categoryName}</Tag>
                        <h1 className="post-detail__title">{post.title}</h1>
                        <p className="post-detail__meta">
                            {new Date(post.publishedAt).toLocaleDateString('vi-VN')} · {post.readTime}
                        </p>
                        <p className="post-detail__excerpt">{post.excerpt}</p>
                        <div className="post-detail__body">{post.content}</div>
                    </div>
                </article>

                <aside className="post-detail__aside">
                    <h2 className="content-card__title">Bài viết liên quan</h2>
                    {relatedPosts?.length > 0 ? (
                        <div className="post-detail__related">
                            {relatedPosts.map((item) => (
                                <PostCard key={item.slug} post={item} compact />
                            ))}
                        </div>
                    ) : (
                        <Empty description="Chưa có bài viết liên quan" />
                    )}
                </aside>
            </div>
        </div>
    );
};

export default PostDetailPage;
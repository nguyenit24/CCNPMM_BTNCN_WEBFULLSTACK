import { Tag } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const PostCard = ({ post, compact = false }) => {
    if (!post) {
        return null;
    }

    return (
        <Link to={`/posts/${post.slug}`} className={`catalog-post-card ${compact ? 'catalog-post-card--compact' : ''}`}>
            <div className="catalog-post-card__media">
                <img className="catalog-post-card__image" src={post.cover} alt={post.title} />
            </div>
            <div className="catalog-post-card__body">
                <Tag color="blue">{post.categoryName}</Tag>
                <h3 className="catalog-post-card__title">{post.title}</h3>
                <p className="catalog-post-card__excerpt">{post.excerpt}</p>
                <div className="catalog-post-card__meta">
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US')}</span>
                    <span><ClockCircleOutlined /> {post.readTime}</span>
                </div>
            </div>
        </Link>
    );
};

export default PostCard;
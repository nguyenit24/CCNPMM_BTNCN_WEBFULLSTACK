import { Link } from 'react-router-dom';
import {
    GithubOutlined,
    TwitterOutlined,
    InstagramOutlined,
    YoutubeOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="store-footer">
            <div className="store-footer__inner">
                {/* Brand & Description */}
                <div className="store-footer__brand">
                    <div className="store-footer__logo">
                        <div className="store-footer__logo-mark">T</div>
                        <div className="store-footer__logo-text">
                            <span className="store-footer__logo-title">TechStudio</span>
                            <span className="store-footer__logo-sub">High-end Tech Store</span>
                        </div>
                    </div>
                    <p className="store-footer__desc">
                        Nơi mua sắm công nghệ cao cấp — từ laptop, điện thoại đến phụ kiện gaming.
                        Chất lượng được chọn lọc kỹ càng, giao hàng tận nơi.
                    </p>
                    <div className="store-footer__socials">
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="store-footer__social-link" aria-label="GitHub">
                            <GithubOutlined />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="store-footer__social-link" aria-label="Twitter">
                            <TwitterOutlined />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="store-footer__social-link" aria-label="Instagram">
                            <InstagramOutlined />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noreferrer" className="store-footer__social-link" aria-label="YouTube">
                            <YoutubeOutlined />
                        </a>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="store-footer__col">
                    <h3 className="store-footer__col-title">Khám phá</h3>
                    <ul className="store-footer__links">
                        <li><Link to="/">Trang chủ</Link></li>
                        <li><Link to="/products">Sản phẩm</Link></li>
                        <li><Link to="/products?onSale=true">Khuyến mãi</Link></li>
                        <li><Link to="/posts">Tin tức & Blog</Link></li>
                        <li><Link to="/products?sort=newest">Hàng mới về</Link></li>
                    </ul>
                </div>

                {/* Account Links */}
                <div className="store-footer__col">
                    <h3 className="store-footer__col-title">Tài khoản</h3>
                    <ul className="store-footer__links">
                        <li><Link to="/login">Đăng nhập</Link></li>
                        <li><Link to="/register">Đăng ký</Link></li>
                        <li><Link to="/profile">Hồ sơ cá nhân</Link></li>
                        <li><Link to="/cart">Giỏ hàng</Link></li>
                        <li><Link to="/orders">Đơn hàng của tôi</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="store-footer__col">
                    <h3 className="store-footer__col-title">Liên hệ</h3>
                    <ul className="store-footer__contacts">
                        <li>
                            <MailOutlined />
                            <a href="mailto:support@techstudio.vn">support@techstudio.vn</a>
                        </li>
                        <li>
                            <PhoneOutlined />
                            <a href="tel:19001234">1900 1234</a>
                        </li>
                        <li>
                            <EnvironmentOutlined />
                            <span>123 Nguyễn Huệ, Q1, TP. HCM</span>
                        </li>
                    </ul>
                    <div className="store-footer__badge">
                        <ThunderboltOutlined />
                        <span>Giao hàng toàn quốc</span>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="store-footer__bottom">
                <div className="store-footer__bottom-inner">
                    <p className="store-footer__copy">
                        © {currentYear} TechStudio. Mọi quyền được bảo lưu.
                    </p>
                    <div className="store-footer__bottom-links">
                        <a href="#">Chính sách bảo mật</a>
                        <a href="#">Điều khoản sử dụng</a>
                        <a href="#">Hỗ trợ</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

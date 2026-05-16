const AuthLayout = ({ title, children, footer }) => {
    return (
        <div className="auth-screen">
            <div className="auth-screen__blob auth-screen__blob--one" />
            <div className="auth-screen__blob auth-screen__blob--two" />
            <div className="auth-screen__blob auth-screen__blob--three" />

            <div className="auth-shell auth-shell--split">
                <section className="auth-visual">
                    <div className="auth-visual__badge">TechStudio</div>
                    <h1 className="auth-visual__title">{title}</h1>
                </section>

                <section className="auth-card auth-card--auth">
                    {children}
                    {footer ? <div className="auth-card__footer-shell">{footer}</div> : null}
                </section>
            </div>
        </div>
    );
};

export default AuthLayout;

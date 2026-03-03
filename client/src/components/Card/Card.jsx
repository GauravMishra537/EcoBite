import styles from './Card.module.css';

const Card = ({
    children,
    variant = 'default',
    className = '',
    onClick,
    ...props
}) => {
    const classes = [
        styles.card,
        variant !== 'default' && styles[`card--${variant}`],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} onClick={onClick} {...props}>
            {children}
        </div>
    );
};

const CardImage = ({ src, alt, className = '' }) => (
    <img src={src} alt={alt} className={`${styles.card__image} ${className}`} />
);

const CardBody = ({ children, className = '' }) => (
    <div className={`${styles.card__body} ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
    <h3 className={`${styles.card__title} ${className}`}>{children}</h3>
);

const CardText = ({ children, className = '' }) => (
    <p className={`${styles.card__text} ${className}`}>{children}</p>
);

const CardFooter = ({ children, className = '' }) => (
    <div className={`${styles.card__footer} ${className}`}>{children}</div>
);

Card.Image = CardImage;
Card.Body = CardBody;
Card.Title = CardTitle;
Card.Text = CardText;
Card.Footer = CardFooter;

export default Card;

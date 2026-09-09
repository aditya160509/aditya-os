import styles from '@/styles/ContactCode.module.css';

const contactItems = [
  {
    social: 'website',
    link: 'aditya-os-eight.vercel.app',
    href: 'https://aditya-os-eight.vercel.app',
  },
  {
    social: 'email',
    link: 'aditya160509@gmail.com',
    href: 'mailto:aditya160509@gmail.com',
  },
  {
    social: 'github',
    link: 'aditya160509',
    href: 'https://github.com/aditya160509',
  },
  {
    social: 'linkedin',
    link: 'aditya-balaji-50375237a',
    href: 'https://www.linkedin.com/in/aditya-balaji-50375237a/',
  },
  {
    social: 'research',
    link: 'github.com/aditya160509/phenosync',
    href: 'https://github.com/aditya160509/phenosync',
  },
];

const ContactCode = () => {
  return (
    <div className={styles.code}>
      <p className={styles.line}>
        <span className={styles.className}>.socials</span> &#123;
      </p>
      {contactItems.map((item, index) => (
        <p className={styles.line} key={index}>
          &nbsp;&nbsp;&nbsp;{item.social}:{' '}
          <a href={item.href} target="_blank" rel="noopener">
            {item.link}
          </a>
          ;
        </p>
      ))}
      <p className={styles.line}>&#125;</p>
    </div>
  );
};

export default ContactCode;

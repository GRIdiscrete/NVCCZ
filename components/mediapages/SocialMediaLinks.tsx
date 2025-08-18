import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaTwitter, 
  FaFacebook, 
  FaInstagram, 
  FaPinterest, 
  FaWhatsapp, 
  FaLinkedin 
} from 'react-icons/fa';

interface SocialLink {
  id: string;
  name: string;
  icon: React.ElementType;
  url: string;
  color: string;
  hoverColor: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: FaTwitter,
    url: 'https://twitter.com/updatedcompany',
    color: '#1DA1F2',
    hoverColor: '#0d8bd9'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: FaFacebook,
    url: 'https://facebook.com/updatedcompany',
    color: '#4267B2',
    hoverColor: '#365899'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    url: 'https://instagram.com/updatedcompany',
    color: '#E4405F',
    hoverColor: '#d91a40'
  },
  // {
  //   id: 'pinterest',
  //   name: 'Pinterest',
  //   icon: FaPinterest,
  //   url: 'https://pinterest.com/nvccz',
  //   color: '#BD081C',
  //   hoverColor: '#a0071a'
  // },
  // {
  //   id: 'whatsapp',
  //   name: 'WhatsApp',
  //   icon: FaWhatsapp,
  //   url: 'https://wa.me/1234567890',
  //   color: '#25D366',
  //   hoverColor: '#20b358'
  // },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: FaLinkedin,
    url: 'https://linkedin.com/company/updatedcompany',
    color: '#0077B5',
    hoverColor: '#005e94'
  }
];

const SocialMediaLinks: React.FC = () => {
  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col border border-input bg-card/90 shadow-xl backdrop-blur"
        style={{
          borderTopLeftRadius: '12px',
          borderBottomLeftRadius: '12px',
          paddingLeft: '8px',
          paddingRight: '8px',
          paddingTop: '8px',
          paddingBottom: '8px'
        }}
      >
        {SOCIAL_LINKS.map((social, index) => (
          <motion.button
            key={social.id}
            onClick={() => handleSocialClick(social.url)}
            className="group relative rounded-lg border border-input p-2 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{
              backgroundColor: 'rgba(255,255,255,0.65)',
              // expose brand color to CSS
              // @ts-ignore - custom property for Tailwind arbitrary value
              ['--social' as any]: social.color
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ backgroundColor: social.color + '1A', scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={`Follow us on ${social.name}`}
            aria-label={social.name}
          >
            <div className="grid h-6 w-6 place-items-center">
              <social.icon
                className="transition-colors duration-300 text-[color:var(--social)] group-hover:text-white"
                size={20}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
              />
            </div>
            {/* Hover tooltip - positioned to the left for right sidebar */}
            <div
              className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 transform whitespace-nowrap rounded-lg bg-foreground/90 px-2 py-1 text-xs text-background opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              {social.name}
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default SocialMediaLinks;
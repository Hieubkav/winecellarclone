export interface ContactCard {
  id: string;
  type: 'hotline' | 'email' | 'address' | 'hours' | 'custom';
  icon: string;
  title: string;
  content: string;
  href?: string;
  active: boolean;
}

export interface ContactHeroConfig {
  title: string;
  subtitle: string;
  showDecorative: boolean;
}

export interface ContactMapConfig {
  embedUrl: string;
  active: boolean;
}

export interface ContactSocialConfig {
  title: string;
  subtitle: string;
  footerText: string;
  active: boolean;
}

export interface ContactConfig {
  hero: ContactHeroConfig;
  cards: ContactCard[];
  map: ContactMapConfig;
  social: ContactSocialConfig;
}

export const DEFAULT_CONTACT_CONFIG: ContactConfig = {
  hero: {
    title: 'Liên hệ với chúng tôi',
    subtitle: '{siteName} luôn sẵn sàng hỗ trợ bạn với các câu hỏi về rượu vang, dịch vụ và đơn hàng. Hãy liên hệ với chúng tôi qua bất kỳ kênh nào dưới đây.',
    showDecorative: true,
  },
  cards: [
    {
      id: 'card-hotline',
      type: 'hotline',
      icon: 'Phone',
      title: 'Hotline',
      content: '',
      active: true,
    },
    {
      id: 'card-address',
      type: 'address',
      icon: 'MapPin',
      title: 'Địa chỉ',
      content: '',
      active: true,
    },
    {
      id: 'card-hours',
      type: 'hours',
      icon: 'Clock',
      title: 'Giờ mở cửa',
      content: '',
      active: true,
    },
    {
      id: 'card-email',
      type: 'email',
      icon: 'Mail',
      title: 'Email',
      content: '',
      active: true,
    },
  ],
  map: {
    embedUrl: '',
    active: true,
  },
  social: {
    title: 'Kết nối với chúng tôi',
    subtitle: 'Theo dõi chúng tôi trên mạng xã hội để cập nhật thông tin mới nhất',
    footerText: 'Chúng tôi luôn sẵn sàng lắng nghe',
    active: true,
  },
};

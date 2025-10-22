'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState('vi')

  const cartRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
      setActiveDropdown(null)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const addToCart = (id: string, name: string, price: number) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === id)
      if (existing) {
        return prev.map(item => 
          item.id === id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { id, name, price, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id)
      return
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity }
          : item
      )
    )
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const menuItems = [
    { 
      id: 'home',
      label: 'Trang chủ', 
      href: '/',
      icon: '/wp-content/uploads/2025/06/icon-home-new.svg'
    },
    { 
      id: 'sale',
      label: 'Giá Tốt', 
      href: '/chuong-trinh-khuyen-mai/',
      icon: '/wp-content/uploads/2025/06/flash-sale-1.svg',
      labelClass: 'label-hot'
    },
    { 
      id: 'gift',
      label: 'QUÀ TẶNG', 
      href: '/qua-tang-doanh-nghiep/',
      icon: '/wp-content/uploads/2022/03/icon_gift.png',
      hasDropdown: true,
      children: [
        { href: '/qua-tang-doanh-nghiep/', label: 'Quà Tặng Doanh Nghiệp' },
        { href: '/qua-tang-tet/', label: 'Quà Tặng Tết' },
        { href: '/hop-ruou-vang-tet/', label: 'Quà Tặng Rượu Vang' },
        { href: '/qua-tang-ruou-whisky/', label: 'Quà Tặng Rượu Mạnh' },
        { href: '/qua-tang-trung-thu', label: 'Quà Tặng Trung Thu' }
      ]
    },
    { 
      id: 'wine',
      label: 'RƯỢU VANG', 
      href: '/ruou-vang/',
      hasDropdown: true,
      hasMegaMenu: true
    },
    { 
      id: 'spirits',
      label: 'Rượu Mạnh', 
      href: '/ruou-manh-cao-cap/',
      hasDropdown: true,
      hasMegaMenu: true
    },
    { 
      id: 'glassware',
      label: 'Ly Pha Lê', 
      href: '/pha-le-riedel/',
      hasDropdown: true,
      hasMegaMenu: true
    },
    { 
      id: 'water',
      label: 'Nước Khoáng', 
      href: '/nuoc-khoang/'
    },
    { 
      id: 'other',
      label: 'Sản phẩm khác', 
      href: '/san-pham-khac/',
      hasDropdown: true,
      children: [
        { href: '/bia-nhap-khau/', label: 'Bia Nhập Khẩu' },
        { href: '/tra/', label: 'Trà' },
        { href: '/banh-nhap-khau/', label: 'Bánh Nhập Khẩu' },
        { href: '/jamon-iberico/', label: 'Thịt Heo Muối Iberico' },
        { href: '/phu-kien-cao-cap/', label: 'Phụ Kiện' }
      ]
    },
    { 
      id: 'producers',
      label: 'Nhà sản xuất', 
      href: '/nha-san-xuat/'
    },
    { 
      id: 'knowledge',
      label: 'Kiến thức', 
      href: '/tim-hieu-kien-thuc-ruou-vang/'
    },
    { 
      id: 'contact',
      label: 'Liên hệ', 
      href: '/lien-he/'
    }
  ]

  const wineCategories = [
    {
      title: 'Theo loại rượu',
      icon: 'mn-icon-type',
      items: [
        { href: '/ruou-vang-do/', label: 'Rượu vang đỏ', class: 'label-hot' },
        { href: '/ruou-vang-trang/', label: 'Rượu vang trắng' },
        { href: '/ruou-vang-sui/', label: 'Rượu vang sủi' },
        { href: '/ruou-champagne/', label: 'Champagne (Sâm Panh)' },
        { href: '/ruou-vang-hong/', label: 'Rượu vang hồng' },
        { href: '/ruou-vang-ngot/', label: 'Rượu vang ngọt' },
        { href: '/ruou-vang-cuong-hoa/', label: 'Rượu vang cường hóa' },
        { href: '/ruou-vang-khong-con/', label: 'Rượu vang không cồn' },
        { href: '/ruou-vang-organic/', label: 'Rượu vang Organic' }
      ]
    },
    {
      title: 'Theo quốc gia',
      icon: 'mn-icon-country',
      items: [
        { href: '/ruou-vang-phap/', label: 'Rượu vang Pháp' },
        { href: '/ruou-vang-y/', label: 'Rượu vang Ý' },
        { href: '/vang-tay-ban-nha/', label: 'Rượu vang Tây Ban Nha' },
        { href: '/ruou-vang-chile/', label: 'Rượu vang Chile' },
        { href: '/ruou-vang-my/', label: 'Rượu vang Mỹ' },
        { href: '/ruou-vang-uc/', label: 'Rượu vang Úc' },
        { href: '/ruou-vang-newzealand/', label: 'Rượu vang New Zealand' },
        { href: '/ruou-vang-argentina/', label: 'Rượu vang Argentina' },
        { href: '/ruou-vang-bo-dao-nha/', label: 'Rượu vang Bồ Đào Nha' },
        { href: '/ruou-vang-duc/', label: 'Rượu vang Đức' },
        { href: '/ruou-vang-nam-phi/', label: 'Rượu vang Nam Phi' }
      ]
    },
    {
      title: 'Theo giống nho',
      icon: 'mn-icon-grape',
      items: [
        { href: '/cabernet-sauvignon/', label: 'Cabernet Sauvignon' },
        { href: '/merlot/', label: 'Merlot' },
        { href: '/syrah-shiraz/', label: 'Syrah (Shiraz)' },
        { href: '/pinot-noir/', label: 'Pinot Noir' },
        { href: '/malbec/', label: 'Malbec' },
        { href: '/montepulciano-d-abruzzo/', label: 'Montepulciano D\'Abruzzo' },
        { href: '/negroamaro/', label: 'Negroamaro' },
        { href: '/primitivo/', label: 'Primitivo' },
        { href: '/chardonnay/', label: 'Chardonnay' },
        { href: '/sauvignon-blanc/', label: 'Sauvignon Blanc' },
        { href: '/riesling/', label: 'Riesling' }
      ]
    },
    {
      title: 'Theo vùng nổi tiếng',
      icon: 'mn-icon-regions',
      items: [
        { href: '/ruou-vang-bordeaux/', label: 'Rượu vang Bordeaux (Pháp)' },
        { href: '/ruou-vang-burgundy/', label: 'Rượu vang Bourgogne (Pháp)' },
        { href: '/ruou-vang-tuscany/', label: 'Rượu vang Tuscany (Ý)' },
        { href: '/ruou-vang-puglia/', label: 'Rượu vang Puglia (Ý)' },
        { href: '/ruou-vang-piedmont/', label: 'Rượu vang Piedmont (Ý)' },
        { href: '/ruou-vang-california/', label: 'Rượu vang California (Mỹ)' },
        { href: '/ruou-champagne/', label: 'Champagne (Pháp)' }
      ]
    }
  ]

  const renderMegaMenu = (menuId: string) => {
    if (menuId === 'wine') {
      return (
        <div className="sub-menu nav-dropdown mega-menu">
          <div className="mega-menu-content">
            <div className="row row-large row-divided">
              {wineCategories.map((category, idx) => (
                <div key={idx} className="col medium-3 small-6 large-3">
                  <div className="ux-menu stack stack-col justify-start">
                    <div className={`ux-menu-title flex ${category.icon}`}>
                      {category.title}
                    </div>
                    {category.items.map((item, itemIdx) => (
                      <div key={itemIdx} className={`ux-menu-link flex menu-item ${item.class || ''}`}>
                        <Link href={item.href} className="ux-menu-link__link flex">
                          <span className="ux-menu-link__text">{item.label}</span>
                        </Link>
                      </div>
                    ))}
                    {category.title === 'Theo giống nho' && (
                      <div className="ux-menu-link flex menu-item color-main font-bold">
                        <Link href="/giong-nho/" className="ux-menu-link__link flex">
                          <i className="ux-menu-link__icon text-center icon-angle-right"></i>
                          <span className="ux-menu-link__text">Tìm giống nho</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (menuId === 'spirits') {
      return (
        <div className="sub-menu nav-dropdown mega-menu">
          <div className="mega-menu-content">
            <div className="row row-large row-divided">
              <div className="col medium-3 small-6 large-3">
                <div className="ux-menu stack stack-col justify-start">
                  <div className="ux-menu-title flex">Loại Rượu</div>
                  {['Rượu Whisky', 'Rượu Cognac', 'Rượu Rum', 'Rượu Gin', 'Rượu Vermouth', 'Rượu Whisky Single Malt'].map((item, idx) => (
                    <div key={idx} className="ux-menu-link flex menu-item">
                      <Link href="#" className="ux-menu-link__link flex">
                        <span className="ux-menu-link__text">{item}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col medium-3 small-6 large-3">
                <div className="ux-menu stack stack-col justify-start">
                  <div className="ux-menu-title flex">Thương Hiệu</div>
                  {['GlenAllachie', 'Tamdhu', 'Glengoyne', 'Kilchoman', 'Meikle Tòir', 'Glen Moray', 'Thomas Hine & Co', 'Cognac Lhéraud', 'Rosebank'].map((brand, idx) => (
                    <div key={idx} className="ux-menu-link flex menu-item">
                      <Link href="#" className="ux-menu-link__link flex">
                        <span className="ux-menu-link__text">{brand}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col medium-3 small-6 large-3">
                <div className="ux-menu stack stack-col justify-start">
                  <div className="ux-menu-title flex">Thương hiệu</div>
                  {['Hunter Laing', 'That Boutique-Y Whisky Company', 'Kill Devil', 'Cadenhead\'s', 'The Ileach', 'The Original Islay Rum', 'Silver Seal', 'MacNair\'s'].map((brand, idx) => (
                    <div key={idx} className="ux-menu-link flex menu-item">
                      <Link href="#" className="ux-menu-link__link flex">
                        <span className="ux-menu-link__text">{brand}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col medium-3 small-6 large-3">
                <div className="ux-menu stack stack-col justify-start">
                  <div className="ux-menu-title flex">Quà tặng</div>
                  <div className="ux-menu-link flex menu-item">
                    <Link href="#" className="ux-menu-link__link flex">
                      <span className="ux-menu-link__text">Quà tặng rượu mạnh</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (menuId === 'glassware') {
      return (
        <div className="sub-menu nav-dropdown mega-menu">
          <div className="mega-menu-content">
            <div className="row row-large row-divided">
              <div className="col medium-3 small-12 large-3">
                <div className="ux-menu stack stack-col justify-start">
                  <div className="ux-menu-title flex">Ly Pha Lê Riedel</div>
                  {['Ly Vang Đỏ', 'Ly Vang Trắng', 'Ly Champagne', 'Ly Rượu Mạnh', 'Ly Cocktail', 'Cốc Nước', 'Ly Chân Màu', 'Ly Machine-made', 'Ly Thủ Công Cao Cấp'].map((item, idx) => (
                    <div key={idx} className="ux-menu-link flex menu-item">
                      <Link href="#" className="ux-menu-link__link flex">
                        <span className="ux-menu-link__text">{item}</span>
                      </Link>
                    </div>
                  ))}
                  <div className="ux-menu-link flex menu-item color-main font-bold">
                    <Link href="#" className="ux-menu-link__link flex">
                      <i className="ux-menu-link__icon text-center icon-angle-right"></i>
                      <span className="ux-menu-link__text">Tất cả ly pha lê RIEDEL</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col medium-3 small-6 large-3">
                <div className="ux-menu stack stack-col justify-start">
                  <div className="ux-menu-title flex">Ly Whisky</div>
                  {['Ly Whisky Riedel', 'Ly Whisky Glencairn', 'Bình Whisky'].map((item, idx) => (
                    <div key={idx} className="ux-menu-link flex menu-item">
                      <Link href="#" className="ux-menu-link__link flex">
                        <span className="ux-menu-link__text">{item}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col medium-3 small-12 large-3">
                <div className="ux-menu stack stack-col justify-start">
                  <div className="ux-menu-title flex">DECANTER RIEDEL</div>
                  {['Decanter Handmade', 'Decanter Handmade RQ', 'Decanter Machine Made'].map((item, idx) => (
                    <div key={idx} className="ux-menu-link flex menu-item">
                      <Link href="#" className="ux-menu-link__link flex">
                        <span className="ux-menu-link__text">{item}</span>
                      </Link>
                    </div>
                  ))}
                  <div className="ux-menu-link flex menu-item color-main font-bold">
                    <Link href="#" className="ux-menu-link__link flex">
                      <i className="ux-menu-link__icon text-center icon-angle-right"></i>
                      <span className="ux-menu-link__text">Tất cả Decanter RIEDEL</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <>
      <header id="header" className="header has-sticky sticky-jump">
        <div className="header-wrapper">
          {/* Top Bar */}
          <div id="top-bar" className="header-top hide-for-sticky flex-has-center">
            <div className="flex-row container">
              <div className="flex-col hide-for-medium flex-left">
                <ul className="nav nav-left medium-nav-center nav-small nav-divided"></ul>
              </div>
              <div className="flex-col hide-for-medium flex-center">
                <ul className="nav nav-center nav-small nav-divided">
                  <li className="html custom html_topbar_left">
                    <p>For foreign customers, please Get in touch with us on <a href="https://open.kakao.com/o/sPyrGCvh"><strong>Kakaotalk</strong></a></p>
                  </li>
                </ul>
              </div>
              <div className="flex-col hide-for-medium flex-right">
                <ul className="nav top-bar-nav nav-right nav-small nav-divided">
                  <li className="menu-item">
                    <button 
                      onClick={() => setCurrentLanguage('en')}
                      className="nav-top-link"
                    >
                      <span className="wpml-ls-native">English</span>
                    </button>
                  </li>
                  <li className="menu-item">
                    <button 
                      onClick={() => setCurrentLanguage('vi')}
                      className="nav-top-link"
                    >
                      <span className="wpml-ls-native">Tiếng Việt</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Header */}
          <div id="masthead" className="header-main hide-for-sticky nav-dark">
            <div className="header-inner flex-row container logo-left medium-logo-center">
              {/* Logo */}
              <div id="logo" className="flex-col logo">
                <Link href="/" title="WINECELLAR.vn - We are masters of wine" className="logo-link">
                  <Image 
                    src="/wp-content/uploads/2021/07/Winecellar-Logo-120721-1.png" 
                    width={300} 
                    height={179} 
                    className="header_logo header-logo" 
                    alt="WINECELLAR.vn"
                  />
                </Link>
              </div>

              {/* Search - Mobile */}
              <div className="flex-col show-for-medium flex-left">
                <ul className="mobile-nav nav nav-left">
                  <li className="header-search header-search-lightbox has-icon">
                    <button 
                      onClick={() => setIsSearchOpen(true)}
                      className="is-small"
                      aria-label="Tìm kiếm"
                    >
                      <i className="icon-search"></i>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Search & Tips - Desktop */}
              <div className="flex-col hide-for-medium flex-left flex-grow">
                <ul className="header-nav header-nav-main nav nav-left nav-size-large nav-spacing-medium nav-uppercase">
                  <li className="header-search-form search-form html relative has-icon">
                    <div className="header-search-form-wrapper">
                      <div className="searchform-wrapper ux-search-box relative form-flat is-normal">
                        <form role="search" method="get">
                          <div className="flex-row relative">
                            <div className="flex-col flex-grow">
                              <input 
                                type="search" 
                                className="search-field mb-0" 
                                placeholder="Nhập tên rượu vang, rượu mạnh, phụ kiện,... cần tìm" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <div className="flex-col">
                              <button type="submit" className="ux-search-submit submit-button secondary button icon mb-0">
                                <i className="icon-search"></i>
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </li>
                  <li className="html custom html_top_right_text">
                    <div className="search-tips">
                      <a href="/ruou-vang-phap/">vang pháp</a>
                      <a href="/ruou-vang-y/">vang ý</a>
                      <a href="/ruou-manh-cao-cap/">rượu mạnh</a>
                      <a href="/bia-nhap-khau/">bia</a>
                      <a href="/pha-le-riedel/">ly rượu vang</a>
                      <a href="/banh-nhap-khau/">bánh quy</a>
                      <a href="/tra/">trà anh quốc</a>
                      <a href="/nuoc-khoang/">nước khoáng</a>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Cart */}
              <div className="flex-col hide-for-medium flex-right">
                <ul className="header-nav header-nav-main nav nav-right nav-size-large nav-spacing-medium nav-uppercase">
                  <li className="cart-item has-icon" ref={cartRef}>
                    <button 
                      onClick={() => setIsCartOpen(!isCartOpen)}
                      className="header-cart-link is-small"
                      title="Giỏ hàng"
                    >
                      <span className="header-cart-title">Giỏ hàng</span>
                      <i className="icon-shopping-basket">
                        <span data-icon-label={totalItems}>{totalItems}</span>
                      </i>
                    </button>

                    {/* Cart Dropdown */}
                    {isCartOpen && (
                      <div className="sub-menu nav-dropdown cart-dropdown">
                        <div className="cart-dropdown-content">
                          {cartItems.length === 0 ? (
                            <div className="empty-cart text-center p-4">
                              <p>Giỏ hàng của bạn đang trống</p>
                            </div>
                          ) : (
                            <>
                              <ul className="cart-items">
                                {cartItems.map((item) => (
                                  <li key={item.id} className="cart-item">
                                    <div className="cart-item-info">
                                      <h4 className="cart-item-title">{item.name}</h4>
                                      <div className="cart-item-quantity">
                                        <button 
                                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                          className="quantity-btn minus"
                                        >
                                          -
                                        </button>
                                        <span className="quantity">{item.quantity}</span>
                                        <button 
                                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                          className="quantity-btn plus"
                                        >
                                          +
                                        </button>
                                      </div>
                                      <div className="cart-item-price">
                                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                      </div>
                                      <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="remove-item"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                              <div className="cart-summary">
                                <div className="cart-total">
                                  <strong>Tổng cộng:</strong> {totalPrice.toLocaleString('vi-VN')}₫
                                </div>
                                <Link href="/cart/" className="button secondary">
                                  Xem giỏ hàng
                                </Link>
                                <Link href="/checkout/" className="button primary">
                                  Thanh toán
                                </Link>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                </ul>
              </div>

              {/* Cart - Mobile */}
              <div className="flex-col show-for-medium flex-right">
                <ul className="mobile-nav nav nav-right">
                  <li className="cart-item has-icon">
                    <button 
                      onClick={() => setIsCartOpen(!isCartOpen)}
                      className="header-cart-link is-small"
                      title="Giỏ hàng"
                    >
                      <i className="icon-shopping-basket">
                        <span data-icon-label={totalItems}>{totalItems}</span>
                      </i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="top-divider full-width"></div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div id="wide-nav" className="header-bottom wide-nav nav-dark flex-has-center">
          <div className="flex-row container">
            <div className="flex-col hide-for-medium flex-center">
              <ul className="nav header-nav header-bottom-nav nav-center nav-size-medium nav-spacing-xlarge nav-uppercase">
                {menuItems.map((item) => (
                  <li 
                    key={item.id}
                    className={`menu-item ${item.id === '1' ? 'active menu-item-design-default has-icon-left' : item.labelClass ? item.labelClass : ''} ${item.hasDropdown ? 'menu-item-has-children menu-item-design-default has-dropdown' : 'menu-item-design-default'} ${item.hasMegaMenu ? 'menu-item-design-full-width menu-item-has-block has-dropdown' : ''}`}
                    onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link href={item.href} className="nav-top-link">
                      {item.icon && (
                        <Image 
                          className="ux-menu-icon" 
                          width={item.id === 'sale' ? 30 : 18} 
                          height={item.id === 'sale' ? 30 : 18} 
                          src={item.icon} 
                          alt="" 
                        />
                      )}
                      {item.label}
                      {item.hasDropdown && <i className="icon-angle-down"></i>}
                    </Link>

                    {/* Regular Dropdown */}
                    {item.hasDropdown && !item.hasMegaMenu && item.children && activeDropdown === item.id && (
                      <ul className="sub-menu nav-dropdown nav-dropdown-simple">
                        {item.children.map((child, idx) => (
                          <li key={idx} className="menu-item">
                            <Link href={child.href}>{child.label}</Link>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Mega Menu */}
                    {item.hasMegaMenu && renderMegaMenu(item.id)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-col show-for-medium flex-grow">
              <ul className="nav header-bottom-nav nav-center mobile-nav nav-size-medium nav-spacing-xlarge nav-uppercase">
                <li className="nav-icon has-icon">
                  <div className="header-button">
                    <button 
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="icon primary button round is-small"
                      aria-label="Menu"
                    >
                      <i className="icon-menu"></i>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Header Background */}
        <div className="header-bg-container fill">
          <div className="header-bg-image fill"></div>
          <div className="header-bg-color fill"></div>
        </div>
      </header>

      {/* Search Lightbox */}
      {isSearchOpen && (
        <div id="search-lightbox" className="mfp-wrap mfp-auto-cursor mfp-ready" onClick={() => setIsSearchOpen(false)}>
          <div className="mfp-container mfp-s-ready mfp-inline-holder">
            <div className="mfp-content" onClick={(e) => e.stopPropagation()}>
              <div id="search-lightbox" className="dark text-center">
                <div className="searchform-wrapper ux-search-box relative form-flat is-large">
                  <form role="search" method="get">
                    <div className="flex-row relative">
                      <div className="flex-col flex-grow">
                        <label className="screen-reader-text">Tìm kiếm:</label>
                        <input 
                          type="search"
                          className="search-field mb-0"
                          placeholder="Nhập tên rượu vang, rượu mạnh, phụ kiện,... cần tìm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                        />
                        <input type="hidden" name="post_type" value="product" />
                        <input type="hidden" name="lang" value="vi" />
                      </div>
                      <div className="flex-col">
                        <button type="submit" className="ux-search-submit submit-button secondary button icon mb-0">
                          <i className="icon-search"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div id="main-menu" className="mobile-sidebar no-scrollbar">
            <div className="sidebar-menu no-scrollbar">
            <ul className="nav nav-sidebar nav-vertical nav-uppercase nav-slide">
              <li className="header-search-form search-form html relative has-icon">
                <div className="header-search-form-wrapper">
                  <div className="searchform-wrapper ux-search-box relative form-flat is-normal">
                    <form role="search" method="get">
                      <div className="flex-row relative">
                        <div className="flex-col flex-grow">
                          <input 
                            type="search"
                            className="search-field mb-0"
                            placeholder="Nhập tên rượu vang, rượu mạnh, phụ kiện,... cần tìm"
                          />
                          <input type="hidden" name="post_type" value="product" />
                          <input type="hidden" name="lang" value="vi" />
                        </div>
                        <div className="flex-col">
                          <button type="submit" className="ux-search-submit submit-button secondary button icon mb-0">
                            <i className="icon-search"></i>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </li>
              {menuItems.map((item) => (
                <li key={item.id} className="has-icon-left">
                  <Link href={item.href}>
                    {item.icon && (
                      <Image 
                        className="ux-sidebar-menu-icon" 
                        width={30} 
                        height={30} 
                        src={item.icon} 
                        alt="" 
                      />
                    )}
                    {item.label}
                  </Link>
                  {item.hasDropdown && item.children && (
                    <ul className="sub-menu nav-sidebar-ul children">
                      {item.children.map((child, idx) => (
                        <li key={idx}>
                          <Link href={child.href}>{child.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
          </div>
        </>
      )}

      {/* Social Icons - PC */}
      <div className="nav-social PC hide-for-medium">
        <ul>
          <li>
            <Link href="/">
              <Image src="/wp-content/themes/winecellarvn/assets/icons/icon-home.png" width={24} height={24} alt="Về trang chủ"/>
              <br/>Trang chủ
            </Link>
          </li>
          <li>
            <Link href="tel:0946698008">
              <Image src="/wp-content/themes/winecellarvn/assets/icons/icon_call.png" width={24} height={24} alt="Liên hệ Hotline"/>
              <br/>Hotline
            </Link>
          </li>
          <li>
            <Link href="https://zalo.me/306009538036482403" target="_blank">
              <Image src="/wp-content/themes/winecellarvn/assets/icons/icon_zalo.png" width={24} height={24} alt="Nhắn tin Zalo"/>
              <br/>Zalo
            </Link>
          </li>
          <li>
            <Link href="https://m.me/winecellar.vn" target="_blank">
              <Image src="/wp-content/themes/winecellarvn/assets/icons/icon_messenger.png" width={24} height={24} alt="Nhắn tin Messenger"/>
              <br/>Messenger
            </Link>
          </li>
        </ul>
      </div>

      {/* Bottom Contact - Mobile */}
      <div className="bottom-contact-mobile show-for-medium">
        <ul>
          <li>
            <Link href="tel:0946698008">
              <Image src="/wp-content/themes/winecellarvn/assets/icons/icon_call.png" width={20} height={20} alt="Liên hệ Hotline"/>
              <br/>
              <span>Gọi điện</span>
            </Link>
          </li>
          <li>
            <Link href="https://zalo.me/306009538036482403">
              <Image src="/wp-content/themes/winecellarvn/assets/icons/icon_zalo.png" width={20} height={20} alt="Nhắn tin Zalo"/>
              <br/>
              <span>Chat Zalo</span>
            </Link>
          </li>
          <li>
            <Link href="https://m.me/winecellar.vn" target="_blank">
              <Image src="/wp-content/themes/winecellarvn/assets/icons/icon_messenger.png" width={20} height={20} alt="Nhắn tin Messenger"/>
              <br/>
              <span>Messenger</span>
            </Link>
          </li>
          <li>
            <Link href="/chuong-trinh-khuyen-mai/">
              <Image src="/wp-content/themes/winecellarvn/assets/icons/icon_gift.png" width={20} height={20} alt="Chương trình khuyến mãi"/>
              <br/>
              <span>Khuyến mãi</span>
            </Link>
          </li>
        </ul>
      </div>

      <style jsx>{`
        .header {
          background: #990d23;
        }

        .header-top {
          background-color: #ededed;
          min-height: 30px;
        }

        .header-main {
          height: 100px;
        }

        .header-bottom {
          background-color: #ffffff;
          min-height: 10px;
        }

        .container {
          max-width: 1310px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .flex-row {
          display: flex;
          align-items: center;
        }

        .flex-col {
          flex: 1;
        }

        .hide-for-medium {
          display: block;
        }

        .show-for-medium {
          display: none;
        }

        @media (max-width: 849px) {
          .hide-for-medium {
            display: none;
          }
          .show-for-medium {
            display: block;
          }
        }

        .nav {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav li {
          position: relative;
        }

        .nav a {
          text-decoration: none;
          color: #524f4f;
          padding: 10px 15px;
          display: block;
          font-weight: 500;
        }

        .nav a:hover {
          color: #990d23;
        }

        .header-bottom-nav .nav a {
          color: #4a4a4a;
          font-weight: 500;
        }

        .header-cart-link {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #990d23;
          font-weight: 500;
        }

        .header-search-form input {
          border: 1px solid #b4975a;
          border-radius: 4px;
          padding: 10px;
          width: 300px;
        }

        .cart-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          min-width: 300px;
          z-index: 1000;
        }

        .cart-items {
          max-height: 300px;
          overflow-y: auto;
        }

        .cart-item {
          padding: 15px;
          border-bottom: 1px solid #eee;
        }

        .cart-summary {
          padding: 15px;
          border-top: 1px solid #eee;
        }

        .quantity-btn {
          background: #990d23;
          color: white;
          border: none;
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .remove-item {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
        }

        .mfp-wrap {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9998;
          background: rgba(0,0,0,0.8);
        }

        .mfp-container {
          position: relative;
          max-width: 600px;
          margin: 50px auto;
          background: white;
          border-radius: 5px;
        }

        .mfp-content {
          position: relative;
        }

        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: -300px;
          width: 300px;
          height: 100%;
          background: #990d23;
          z-index: 9999;
          transition: left 0.3s ease;
        }

        .mobile-sidebar.show {
          left: 0;
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 9999;
        }

        .mega-menu {
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          z-index: 1000;
        }

        .mega-menu-content {
          padding: 24px;
        }

        .ux-menu {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ux-menu-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .ux-menu-link a {
          color: #333;
          padding: 5px 0;
          font-size: 13px;
        }

        .ux-menu-link a:hover {
          color: #990d23;
        }

        .label-new.menu-item > a:after {
          content: "New";
          background: #990d23;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          margin-left: 5px;
        }

        .label-hot.menu-item > a:after {
          content: "Hot";
          background: #990d23;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          margin-left: 5px;
        }

        .search-tips {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .search-tips a {
          color: #666;
          text-decoration: none;
          font-size: 13px;
        }

        .search-tips a:hover {
          color: #990d23;
        }

        @media (max-width: 549px) {
          .header-main {
            height: 70px;
          }
          
          .container {
            padding: 0 15px;
          }
        }

        .nav-social {
          position: fixed;
          right: 20px;
          bottom: 50%;
          transform: translateY(-50%);
          z-index: 999;
          background: #990d23;
          border-radius: 30px;
          padding: 10px 5px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .nav-social li {
          margin-bottom: 10px;
          text-align: center;
        }

        .nav-social a {
          color: white;
          text-decoration: none;
          display: block;
          font-size: 11px;
          line-height: 12px;
        }

        .bottom-contact-mobile {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #eee;
          z-index: 999;
        }

        .bottom-contact-mobile ul {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 8px 0;
          margin: 0;
        }

        .bottom-contact-mobile li a {
          color: #333;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 10px;
        }

        .bottom-contact-mobile li span {
          margin-top: 2px;
          font-weight: 500;
        }

        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: -300px;
          width: 300px;
          height: 100vh;
          background: #990d23;
          z-index: 10000;
          transition: left 0.3s ease;
          overflow-y: auto;
        }

        .mobile-sidebar.show {
          left: 0;
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 9999;
        }

        .nav-sidebar {
          padding: 20px 0;
        }

        .nav-sidebar li {
          padding: 10px 20px;
        }

        .nav-sidebar li a {
          color: white;
          font-weight: 500;
        }

        .nav-sidebar .children {
          margin-left: 30px;
          margin-top: 10px;
        }

        .nav-sidebar .children li {
          padding: 8px 0;
          font-size: 14px;
        }

        .nav-sidebar .searchform-wrapper {
          background: white;
          border-radius: 4px;
          padding: 10px 15px;
          margin: 0 20px 15px 20px;
        }

        .nav-sidebar .searchform-wrapper input {
          background: transparent;
          border: none;
          width: 100%;
        }

        .nav-sidebar .searchform-wrapper button {
          background: #990d23;
          border: none;
          color: white;
          padding: 5px 10px;
          border-radius: 3px;
        }
      `}</style>
    </>
  )
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, Download, Plus, Trash2, GripVertical, Eye, EyeOff, Phone, MapPin, Clock, Mail, HelpCircle } from 'lucide-react';
import { Button, Card, Input, Label, Skeleton } from '../components/ui';
import { fetchAdminSettings, updateSettings } from '@/lib/api/admin';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { ContactConfig, ContactCard, ContactHeroConfig, ContactMapConfig, ContactSocialConfig } from '@/lib/types/contact';
import { DEFAULT_CONTACT_CONFIG } from '@/lib/types/contact';

function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const ICON_OPTIONS = [
  { value: 'Phone', label: 'Điện thoại', Icon: Phone },
  { value: 'MapPin', label: 'Địa chỉ', Icon: MapPin },
  { value: 'Clock', label: 'Đồng hồ', Icon: Clock },
  { value: 'Mail', label: 'Email', Icon: Mail },
  { value: 'HelpCircle', label: 'Thông tin', Icon: HelpCircle },
];

const CARD_TYPE_OPTIONS = [
  { value: 'hotline', label: 'Hotline' },
  { value: 'email', label: 'Email' },
  { value: 'address', label: 'Địa chỉ' },
  { value: 'hours', label: 'Giờ làm việc' },
  { value: 'custom', label: 'Tùy chỉnh' },
];

interface SortableCardProps {
  card: ContactCard;
  onUpdate: (card: ContactCard) => void;
  onDelete: () => void;
}

function SortableCard({ card, onUpdate, onDelete }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const SelectedIcon = ICON_OPTIONS.find(i => i.value === card.icon)?.Icon || HelpCircle;

  return (
    <Card ref={setNodeRef} style={style} className={cn('p-4', !card.active && 'opacity-50')}>
      <div className="flex items-center gap-2 mb-4">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
          <GripVertical size={18} className="text-slate-400" />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#ECAA4D] flex items-center justify-center text-[#1C1C1C]">
            <SelectedIcon size={20} />
          </div>
          <Input
            value={card.title ?? ''}
            onChange={(e) => onUpdate({ ...card, title: e.target.value })}
            className="flex-1 font-semibold"
            placeholder="Tiêu đề thẻ"
          />
        </div>
        <button
          onClick={() => onUpdate({ ...card, active: !card.active })}
          className={cn('p-2 rounded-md transition-colors', card.active ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100')}
          title={card.active ? 'Đang hiển thị' : 'Đang ẩn'}
        >
          {card.active ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Xóa thẻ">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Loại thẻ</Label>
            <select
              value={card.type}
              onChange={(e) => onUpdate({ ...card, type: e.target.value as ContactCard['type'] })}
              className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
            >
              {CARD_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Icon</Label>
            <select
              value={card.icon}
              onChange={(e) => onUpdate({ ...card, icon: e.target.value })}
              className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
            >
              {ICON_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Nội dung</Label>
          <Input
            value={card.content ?? ''}
            onChange={(e) => onUpdate({ ...card, content: e.target.value })}
            placeholder={card.type === 'hotline' ? '0909 123 456' : card.type === 'email' ? 'email@example.com' : 'Nội dung hiển thị'}
          />
        </div>

        {(card.type === 'hotline' || card.type === 'email' || card.type === 'custom') && (
          <div className="space-y-1">
            <Label className="text-xs">Link (tùy chọn)</Label>
            <Input
              value={card.href ?? ''}
              onChange={(e) => onUpdate({ ...card, href: e.target.value })}
              placeholder={card.type === 'hotline' ? 'tel:+84909123456' : card.type === 'email' ? 'mailto:email@example.com' : 'https://...'}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

export default function ContactConfigPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [config, setConfig] = useState<ContactConfig>(DEFAULT_CONTACT_CONFIG);
  const [siteName, setSiteName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminSettings();
      const data = res.data;
      setSiteName(data.site_name || 'Wine Cellar');
      if (data.contact_config) {
        setConfig(data.contact_config as ContactConfig);
      }
    } catch (error) {
      console.error('Failed to load contact config:', error);
      toast.error('Không thể tải cấu hình liên hệ');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const loadFromSettings = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetchAdminSettings();
      const data = res.data;

      const newCards = [...config.cards];

      // Update từ settings
      const hotlineCard = newCards.find(c => c.type === 'hotline');
      if (hotlineCard && data.hotline) {
        hotlineCard.content = data.hotline;
        hotlineCard.href = `tel:+84${data.hotline.replace(/\D/g, '').slice(-9)}`;
      }

      const addressCard = newCards.find(c => c.type === 'address');
      if (addressCard && data.address) {
        addressCard.content = data.address;
      }

      const hoursCard = newCards.find(c => c.type === 'hours');
      if (hoursCard && data.hours) {
        hoursCard.content = data.hours;
      }

      const emailCard = newCards.find(c => c.type === 'email');
      if (emailCard && data.email) {
        emailCard.content = data.email;
        emailCard.href = `mailto:${data.email}`;
      }

      const newMap = { ...config.map };
      if (data.google_map_embed) {
        newMap.embedUrl = data.google_map_embed;
      }

      setConfig({ ...config, cards: newCards, map: newMap });
      toast.success('Đã tải dữ liệu từ cấu hình hệ thống');
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = config.cards.findIndex(c => c.id === active.id);
    const newIndex = config.cards.findIndex(c => c.id === over.id);
    setConfig({ ...config, cards: arrayMove(config.cards, oldIndex, newIndex) });
  };

  const addCard = () => {
    const newCard: ContactCard = {
      id: generateId(),
      type: 'custom',
      icon: 'HelpCircle',
      title: 'Thẻ mới',
      content: '',
      active: true,
    };
    setConfig({ ...config, cards: [...config.cards, newCard] });
  };

  const updateCard = (cardId: string, updates: ContactCard) => {
    setConfig({
      ...config,
      cards: config.cards.map(c => (c.id === cardId ? updates : c)),
    });
  };

  const deleteCard = (cardId: string) => {
    setConfig({ ...config, cards: config.cards.filter(c => c.id !== cardId) });
  };

  const updateHero = (updates: Partial<ContactHeroConfig>) => {
    setConfig({ ...config, hero: { ...config.hero, ...updates } });
  };

  const updateMap = (updates: Partial<ContactMapConfig>) => {
    setConfig({ ...config, map: { ...config.map, ...updates } });
  };

  const updateSocial = (updates: Partial<ContactSocialConfig>) => {
    setConfig({ ...config, social: { ...config.social, ...updates } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateSettings({ contact_config: config });
      toast.success('Lưu cấu hình liên hệ thành công');
    } catch (error) {
      console.error('Failed to save contact config:', error);
      toast.error('Không thể lưu cấu hình');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cấu hình trang Liên hệ</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tùy chỉnh nội dung và bố cục trang liên hệ</p>
        </div>
        <Button variant="outline" onClick={loadFromSettings} disabled={isLoadingData} className="gap-2">
          {isLoadingData ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Tải từ Settings
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Hero Section */}
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hero-title">Tiêu đề</Label>
              <Input
                id="hero-title"
                value={config.hero.title ?? ''}
                onChange={(e) => updateHero({ title: e.target.value })}
                placeholder="Liên hệ với chúng tôi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-subtitle">Mô tả</Label>
              <textarea
                id="hero-subtitle"
                value={config.hero.subtitle ?? ''}
                onChange={(e) => updateHero({ subtitle: e.target.value })}
                placeholder="Mô tả ngắn gọn..."
                className="w-full min-h-[80px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              />
              <p className="text-xs text-slate-500">Dùng {'{siteName}'} làm placeholder cho tên website</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.hero.showDecorative}
                onChange={(e) => updateHero({ showDecorative: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Hiển thị đường trang trí</span>
            </label>
          </div>
        </Card>

        {/* Contact Cards */}
        <Card className="p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Thẻ liên hệ</h2>
            <Button type="button" variant="outline" size="sm" onClick={addCard} className="gap-2">
              <Plus size={16} />
              Thêm thẻ
            </Button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={config.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.cards.map(card => (
                  <SortableCard
                    key={card.id}
                    card={card}
                    onUpdate={(updated) => updateCard(card.id, updated)}
                    onDelete={() => deleteCard(card.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {config.cards.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Chưa có thẻ liên hệ nào. Nhấn &quot;Thêm thẻ&quot; hoặc &quot;Tải từ Settings&quot; để bắt đầu.
            </div>
          )}
        </Card>

        {/* Map Section */}
        <Card className="p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Bản đồ Google Maps</h2>
            <button
              type="button"
              onClick={() => updateMap({ active: !config.map.active })}
              className={cn('p-2 rounded-md transition-colors', config.map.active ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100')}
              title={config.map.active ? 'Đang hiển thị' : 'Đang ẩn'}
            >
              {config.map.active ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <div className={cn('space-y-2', !config.map.active && 'opacity-50')}>
            <Label htmlFor="map-url">Embed URL hoặc iframe code</Label>
            <textarea
              id="map-url"
              value={config.map.embedUrl ?? ''}
              onChange={(e) => updateMap({ embedUrl: e.target.value })}
              placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
              className="w-full min-h-[100px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono"
            />
            <p className="text-xs text-slate-500">Paste URL trực tiếp hoặc toàn bộ mã iframe từ Google Maps</p>
          </div>
        </Card>

        {/* Social Section */}
        <Card className="p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Phần mạng xã hội</h2>
            <button
              type="button"
              onClick={() => updateSocial({ active: !config.social.active })}
              className={cn('p-2 rounded-md transition-colors', config.social.active ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100')}
              title={config.social.active ? 'Đang hiển thị' : 'Đang ẩn'}
            >
              {config.social.active ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <div className={cn('space-y-4', !config.social.active && 'opacity-50')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="social-title">Tiêu đề</Label>
                <Input
                  id="social-title"
                  value={config.social.title ?? ''}
                  onChange={(e) => updateSocial({ title: e.target.value })}
                  placeholder="Kết nối với chúng tôi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="social-footer">Dòng cuối</Label>
                <Input
                  id="social-footer"
                  value={config.social.footerText ?? ''}
                  onChange={(e) => updateSocial({ footerText: e.target.value })}
                  placeholder="Chúng tôi luôn sẵn sàng lắng nghe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="social-subtitle">Mô tả</Label>
              <Input
                id="social-subtitle"
                value={config.social.subtitle ?? ''}
                onChange={(e) => updateSocial({ subtitle: e.target.value })}
                placeholder="Theo dõi chúng tôi trên mạng xã hội để cập nhật thông tin mới nhất"
              />
            </div>
            <p className="text-xs text-slate-500 text-center py-2">
              Các link mạng xã hội được quản lý tại trang &quot;Mạng xã hội&quot;
            </p>
          </div>
        </Card>

        {/* Preview */}
        <Card className="mb-6 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Xem trước</h2>
          </div>
          <ContactPreview config={config} siteName={siteName} />
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={16} />
                Lưu cấu hình
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ContactPreview({ config, siteName }: { config: ContactConfig; siteName: string }) {
  const parsedSubtitle = (config.hero.subtitle ?? '').replace('{siteName}', siteName);
  const activeCards = config.cards.filter(c => c.active);

  return (
    <div className="bg-white">
      {/* Hero Preview */}
      <div className="bg-[#ECAA4D] py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-2">{config.hero.title || 'Liên hệ với chúng tôi'}</h1>
        <p className="text-sm text-[#1C1C1C]/80 max-w-lg mx-auto">{parsedSubtitle}</p>
        {config.hero.showDecorative && <div className="mx-auto mt-4 h-1 w-16 bg-[#9B2C3B]" />}
      </div>

      {/* Cards Preview */}
      {activeCards.length > 0 && (
        <div className="p-4">
          <div className={cn(
            'grid gap-3',
            activeCards.length === 1 && 'grid-cols-1',
            activeCards.length === 2 && 'grid-cols-2',
            activeCards.length === 3 && 'grid-cols-3',
            activeCards.length >= 4 && 'grid-cols-2 lg:grid-cols-4'
          )}>
            {activeCards.map(card => {
              const CardIcon = ICON_OPTIONS.find(i => i.value === card.icon)?.Icon || HelpCircle;
              return (
                <div key={card.id} className="flex flex-col items-center p-4 rounded-lg border-2 border-[#ECAA4D]/30 text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#ECAA4D] text-[#1C1C1C]">
                    <CardIcon size={18} />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9B2C3B] mb-1">{card.title}</h3>
                  <p className="text-sm text-[#1C1C1C]">{card.content || 'Chưa có nội dung'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Map Preview */}
      {config.map.active && config.map.embedUrl && (
        <div className="p-4 border-t border-slate-100">
          <div className="h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-sm">
            <MapPin size={24} className="mr-2" />
            Bản đồ Google Maps sẽ hiển thị ở đây
          </div>
        </div>
      )}

      {/* Social Preview */}
      {config.social.active && (
        <div className="bg-gray-50 py-6 px-4 text-center border-t border-slate-100">
          <h2 className="text-lg font-bold text-[#1C1C1C] mb-1">{config.social.title || 'Kết nối với chúng tôi'}</h2>
          <p className="text-sm text-[#1C1C1C]/70 mb-4">{config.social.subtitle}</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 w-10 rounded-full border-2 border-[#ECAA4D] bg-white" />
            ))}
          </div>
          {config.social.footerText && (
            <p className="mt-4 text-xs uppercase tracking-wider text-[#1C1C1C]/50">{config.social.footerText}</p>
          )}
        </div>
      )}
    </div>
  );
}

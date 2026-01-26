'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  title?: string
  subtitle?: string
  items: FAQItem[]
  className?: string
}

export default function FAQSection({
  title = 'Câu hỏi thường gặp',
  subtitle,
  items,
  className,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className={cn('py-12', className)}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-gray-600">{subtitle}</p>
          )}
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
                aria-expanded={openIndex === index}
              >
                <span className="font-medium text-gray-900">{item.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-gray-500 transition-transform duration-200',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'grid transition-all duration-200 ease-in-out',
                  openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-gray-100 px-6 py-4 text-gray-600">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Default FAQ items for wine store
export const DEFAULT_WINE_FAQ: FAQItem[] = [
  {
    question: 'Rượu vang tại Thiên Kim Wine có phải hàng chính hãng không?',
    answer: 'Tất cả sản phẩm rượu vang tại Thiên Kim Wine đều được nhập khẩu trực tiếp từ các nhà sản xuất và nhà phân phối chính hãng. Chúng tôi cam kết 100% hàng chính hãng với đầy đủ giấy tờ chứng nhận nguồn gốc xuất xứ.',
  },
  {
    question: 'Làm thế nào để bảo quản rượu vang đúng cách?',
    answer: 'Rượu vang nên được bảo quản ở nơi mát mẻ (12-18°C), tránh ánh sáng trực tiếp, đặt nằm ngang để nút cork luôn tiếp xúc với rượu. Tránh rung lắc và giữ độ ẩm khoảng 70% để nút không bị khô.',
  },
  {
    question: 'Thiên Kim Wine có giao hàng toàn quốc không?',
    answer: 'Có, chúng tôi giao hàng toàn quốc với đội ngũ vận chuyển chuyên nghiệp. Đơn hàng được đóng gói cẩn thận với hộp chống sốc để đảm bảo rượu đến tay bạn an toàn. Thời gian giao hàng từ 1-5 ngày tùy khu vực.',
  },
  {
    question: 'Chính sách đổi trả sản phẩm như thế nào?',
    answer: 'Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm bị lỗi do nhà sản xuất hoặc hư hỏng trong quá trình vận chuyển. Sản phẩm đổi trả phải còn nguyên seal và chưa sử dụng.',
  },
  {
    question: 'Làm sao để chọn rượu vang phù hợp với món ăn?',
    answer: 'Rượu vang đỏ thường hợp với thịt đỏ, pasta sốt đỏ. Rượu vang trắng phù hợp với hải sản, gà, salad. Rượu vang rosé là lựa chọn linh hoạt cho nhiều món. Đội ngũ tư vấn của chúng tôi sẵn sàng hỗ trợ bạn chọn rượu phù hợp.',
  },
]

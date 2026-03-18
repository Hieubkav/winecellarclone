"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

type FaqItem = {
  question: string
  answer: string
}

type FaqSectionProps = {
  title?: string
  eyebrow?: string
  items: FaqItem[]
}

export default function FaqSection({ title, eyebrow, items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number>(0)

  if (items.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-8 md:py-10" aria-label={title || "Câu hỏi thường gặp"}>
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-2">
        <div className="mx-auto max-w-3xl">
          <header className="mb-4 text-center md:mb-6">
            <div className="flex items-center gap-3 text-[#9B2C3B]">
              <span className="h-px flex-1 bg-[#d8c7b4]" aria-hidden="true" />
              <p className="shrink-0 text-sm font-bold uppercase tracking-[0.18em] text-[#9B2C3B]">
                {eyebrow || title || "Những câu hỏi thường gặp"}
              </p>
              <span className="h-px flex-1 bg-[#d8c7b4]" aria-hidden="true" />
            </div>
          </header>

          <div className="space-y-2 md:space-y-3">
            {items.map((item, index) => {
              const isOpen = openIndex === index

              return (
                <article
                  key={`${item.question}-${index}`}
                  className="overflow-hidden rounded-sm border border-[#efe7dd] bg-[#faf8f4]"
                >
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-4 text-left md:px-5"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                  >
                    <ChevronDown
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0 text-[#7b7b7b] transition-transform",
                        isOpen && "rotate-180 text-[#9B2C3B]"
                      )}
                    />
                    <span
                      className={cn(
                        "text-lg leading-8 text-[#2c2c2c]",
                        isOpen ? "font-semibold text-[#9B2C3B]" : "font-medium"
                      )}
                    >
                      {item.question}
                    </span>
                  </button>

                  {isOpen ? (
                    <div id={`faq-panel-${index}`} className="px-4 pb-5 pl-12 text-base leading-8 text-[#444] md:px-5 md:pb-6 md:pl-14">
                      <div className="whitespace-pre-line border-t border-[#e3d8ca] pt-4">
                        {item.answer}
                      </div>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

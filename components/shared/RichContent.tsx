"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type RichContentTheme = {
  headingColor: string;
  strongColor: string;
  linkColor: string;
  blockquoteBorderColor: string;
  blockquoteTextColor: string;
  blockquoteBackground: string;
  imageBorderRadius: string;
  imageShadow?: string;
  h1Color?: string;
  h2Color?: string;
  h3Color?: string;
};

interface RichContentProps {
  html: string;
  rootClassName: string;
  className?: string;
  theme: RichContentTheme;
}

function buildRichContentStyles(rootClassName: string, theme: RichContentTheme) {
  const selector = `.${rootClassName}`;
  const h1Color = theme.h1Color || theme.headingColor;
  const h2Color = theme.h2Color || theme.headingColor;
  const h3Color = theme.h3Color || theme.headingColor;
  const imageShadow = theme.imageShadow || "none";

  return `
    ${selector} h1,
    ${selector} .editor-heading-h1 {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.25;
      letter-spacing: -0.01em;
      overflow-wrap: anywhere;
      word-break: break-word;
      margin: 0 0 16px 0;
      color: ${h1Color};
    }

    @media (max-width: 767px) {
      ${selector} h1,
      ${selector} .editor-heading-h1 {
        font-size: 24px;
        line-height: 1.35;
        margin-bottom: 14px;
      }
    }

    ${selector} h2,
    ${selector} .editor-heading-h2 {
      font-size: 22px;
      font-weight: 600;
      margin: 20px 0 12px 0;
      color: ${h2Color};
    }

    ${selector} h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 16px 0 10px 0;
      color: ${h3Color};
    }

    ${selector} p,
    ${selector} .editor-paragraph {
      margin: 0 0 12px 0;
      line-height: 1.7;
    }

    ${selector} strong {
      color: ${theme.strongColor};
      font-weight: 600;
    }

    ${selector} em {
      font-style: italic;
    }

    ${selector} u {
      text-decoration: underline;
    }

    ${selector} a {
      color: ${theme.linkColor};
      text-decoration: none;
    }

    ${selector} a:hover {
      text-decoration: underline;
    }

    ${selector} blockquote {
      border-left: 4px solid ${theme.blockquoteBorderColor};
      padding: 8px 16px;
      color: ${theme.blockquoteTextColor};
      font-style: italic;
      margin: 12px 0;
      background: ${theme.blockquoteBackground};
    }

    ${selector} ul,
    ${selector} .editor-list-ul {
      list-style-type: disc;
      padding-left: 24px;
      margin: 12px 0;
    }

    ${selector} ol,
    ${selector} .editor-list-ol {
      list-style-type: decimal;
      padding-left: 24px;
      margin: 12px 0;
    }

    ${selector} li,
    ${selector} .editor-listitem {
      margin: 6px 0;
    }

    ${selector} img {
      border-radius: ${theme.imageBorderRadius};
      box-shadow: ${imageShadow};
    }
  `;
}

const RichContent = forwardRef<HTMLDivElement, RichContentProps>(function RichContent(
  { html, rootClassName, className, theme },
  ref,
) {
  const styles = buildRichContentStyles(rootClassName, theme);

  return (
    <>
      <div
        ref={ref}
        className={cn(rootClassName, className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style jsx global>{styles}</style>
    </>
  );
});

export default RichContent;

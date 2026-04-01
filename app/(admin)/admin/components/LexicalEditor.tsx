 'use client';
 
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer.js';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin.js';
import { ContentEditable } from '@lexical/react/LexicalContentEditable.js';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin.js';
import { ListPlugin } from '@lexical/react/LexicalListPlugin.js';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary.js';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
 import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text';
 import { ListNode, ListItemNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $isLinkNode, AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND, registerLink } from '@lexical/link';
import { namedSignals } from '@lexical/extension';
 import { 
   $getSelection, 
   $isRangeSelection, 
   FORMAT_TEXT_COMMAND, 
   FORMAT_ELEMENT_COMMAND, 
   $createParagraphNode,
   SELECTION_CHANGE_COMMAND,
   COMMAND_PRIORITY_CRITICAL,
   $getRoot,
   LexicalNode,
   $isElementNode,
   $isDecoratorNode,
   $isTextNode,
  TextNode,
  $applyNodeReplacement,
  type DOMConversionMap,
  type DOMConversion,
  type DOMConversionOutput,
  type SerializedTextNode,
 } from 'lexical';
import { $patchStyleText } from '@lexical/selection';
import { $getNearestNodeOfType } from '@lexical/utils';
 import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
 import { $setBlocksType } from '@lexical/selection';
 import { cn } from '@/lib/utils';
 import ImagesPlugin, { ImageNode, INSERT_IMAGE_COMMAND } from './nodes/ImageNode';
import { toast } from 'sonner';
 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
})();

const normalizeImageUrl = (url: string): string => {
  if (!url || !API_ORIGIN) return url;

  try {
    const parsed = new URL(url, API_ORIGIN);
    if (parsed.origin === API_ORIGIN) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return url;
  }

  return url;
};

 
 const theme = {
   paragraph: 'editor-paragraph',
   heading: {
     h1: 'editor-heading-h1',
     h2: 'editor-heading-h2',
   },
   list: {
     ul: 'editor-list-ul',
     ol: 'editor-list-ol',
     listitem: 'editor-listitem',
   },
   quote: 'editor-quote',
   link: 'editor-link',
   text: {
     bold: 'editor-text-bold',
     italic: 'editor-text-italic',
     underline: 'editor-text-underline',
   },
 };

// Custom TextNode with inline style support for HTML export
export class ExtendedTextNode extends TextNode {
  static getType(): string {
    return 'extended-text';
  }

  static clone(node: ExtendedTextNode): ExtendedTextNode {
    return new ExtendedTextNode(node.__text, node.__key);
  }

  static importDOM(): DOMConversionMap | null {
    const importers = TextNode.importDOM();
    return {
      ...importers,
      span: () => ({
        conversion: patchStyleConversion(importers?.span),
        priority: 1,
      }),
      strong: () => ({
        conversion: patchStyleConversion(importers?.strong),
        priority: 1,
      }),
      em: () => ({
        conversion: patchStyleConversion(importers?.em),
        priority: 1,
      }),
      u: () => ({
        conversion: patchStyleConversion(importers?.u),
        priority: 1,
      }),
    };
  }

  static importJSON(serializedNode: SerializedTextNode): ExtendedTextNode {
    return $createExtendedTextNode().updateFromJSON(serializedNode);
  }
}

function patchStyleConversion(
  originalDOMConverter?: (node: HTMLElement) => DOMConversion | null
): (node: HTMLElement) => DOMConversionOutput | null {
  return (node) => {
    const original = originalDOMConverter?.(node);
    if (!original) {
      return null;
    }
    const originalOutput = original.conversion(node);

    if (!originalOutput) {
      return originalOutput;
    }

    const backgroundColor = node.style.backgroundColor;
    const color = node.style.color;
    const fontFamily = node.style.fontFamily;
    const fontSize = node.style.fontSize;

    return {
      ...originalOutput,
      forChild: (lexicalNode, parent) => {
        const originalForChild = originalOutput?.forChild ?? ((x) => x);
        const result = originalForChild(lexicalNode, parent);
        if ($isTextNode(result)) {
          const style = [
            backgroundColor ? `background-color: ${backgroundColor}` : null,
            color ? `color: ${color}` : null,
            fontFamily ? `font-family: ${fontFamily}` : null,
            fontSize ? `font-size: ${fontSize}` : null,
          ]
            .filter((value) => value != null)
            .join('; ');
          if (style.length) {
            return result.setStyle(style);
          }
        }
        return result;
      },
    };
  };
}

export function $createExtendedTextNode(text: string = ''): ExtendedTextNode {
  return $applyNodeReplacement(new ExtendedTextNode(text));
}

export function $isExtendedTextNode(
  node: LexicalNode | null | undefined
): node is ExtendedTextNode {
  return node instanceof ExtendedTextNode;
}
 
 interface ToolbarPluginProps {
   onImageUpload?: (file: File) => Promise<string | null>;
 }

const FONT_FAMILY_OPTIONS = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Verdana', value: 'Verdana' },
];

const FONT_SIZE_OPTIONS = [
  { label: '10px', value: '10px' },
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '30px', value: '30px' },
];
 
 const ToolbarPlugin: React.FC<ToolbarPluginProps> = ({ onImageUpload }) => {
   const [editor] = useLexicalComposerContext();
   const [isUploading, setIsUploading] = useState(false);
   const [activeState, setActiveState] = useState({
     bold: false,
     italic: false,
     underline: false,
     isLink: false,
     blockType: 'paragraph',
    fontSize: '14px',
    fontFamily: 'Inter',
    fontColor: '#000000',
   });
 
   const updateToolbar = useCallback(() => {
     const selection = $getSelection();
     if ($isRangeSelection(selection)) {
       const anchorNode = selection.anchor.getNode();
       const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();

      const fontSize = selection.style.split(';')
        .find(s => s.includes('font-size'))
        ?.split(':')[1]?.trim() || '14px';

      const fontFamily = selection.style.split(';')
        .find(s => s.includes('font-family'))
        ?.split(':')[1]?.trim().replace(/['"]/g, '') || 'Inter';

      const fontColor = selection.style.split(';')
        .find(s => s.includes('color') && !s.includes('background'))
        ?.split(':')[1]?.trim() || '#000000';

      const selectedNode = selection.anchor.getNode();
      const parentNode = selectedNode.getParent();
      const isLink = $isLinkNode(selectedNode)
        || (parentNode !== null && $isLinkNode(parentNode))
        || $getNearestNodeOfType(selectedNode, LinkNode) !== null;
 
       const resolvedBlockType = $isHeadingNode(element) ? element.getTag() : element.getType();

       setActiveState({
         bold: selection.hasFormat('bold'),
         italic: selection.hasFormat('italic'),
         underline: selection.hasFormat('underline'),
         isLink,
         blockType: resolvedBlockType,
        fontSize,
        fontFamily,
        fontColor,
       });
     }
   }, []);
 
   useEffect(() => {
     return editor.registerCommand(
       SELECTION_CHANGE_COMMAND,
       () => {
         updateToolbar();
         return false;
       },
       COMMAND_PRIORITY_CRITICAL,
     );
   }, [editor, updateToolbar]);
 
   useEffect(() => {
     return editor.registerUpdateListener(({ editorState }) => {
       editorState.read(() => {
         updateToolbar();
       });
     });
   }, [editor, updateToolbar]);
 
   const formatBlock = (type: string) => {
     if (type === 'h1') {
       editor.update(() => {
         const selection = $getSelection();
         if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createHeadingNode('h1'));
       });
     } else if (type === 'h2') {
       editor.update(() => {
         const selection = $getSelection();
         if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createHeadingNode('h2'));
       });
     } else if (type === 'quote') {
       editor.update(() => {
         const selection = $getSelection();
         if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createQuoteNode());
       });
     } else if (type === 'paragraph') {
       editor.update(() => {
         const selection = $getSelection();
         if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createParagraphNode());
       });
     } else if (type === 'ul') {
       editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
     } else if (type === 'ol') {
       editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
     }
   };
 
   const handleImageUpload = async () => {
     const input = document.createElement('input');
     input.type = 'file';
     input.accept = 'image/*';
     input.onchange = async (e: Event) => {
       const target = e.target as HTMLInputElement;
       const file = target.files?.[0];
       if (file && onImageUpload) {
         setIsUploading(true);
         try {
           const url = await onImageUpload(file);
           if (url) {
             editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, altText: '' });
           }
         } catch (error) {
           console.error('Image upload error:', error);
           toast.error('Không thể tải ảnh lên');
         } finally {
           setIsUploading(false);
         }
       }
     };
     input.click();
   };

  const handleAddLink = () => {
    let hasValidSelection = false;
    let currentLinkUrl = '';

    editor.getEditorState().read(() => {
      const selection = $getSelection();
      hasValidSelection = $isRangeSelection(selection) && !selection.isCollapsed();

      if ($isRangeSelection(selection)) {
        const selectedNode = selection.anchor.getNode();
        const parentNode = selectedNode.getParent();
        const linkNode = $isLinkNode(selectedNode)
          ? selectedNode
          : ($isLinkNode(parentNode) ? parentNode : $getNearestNodeOfType(selectedNode, LinkNode));

        if (linkNode) {
          currentLinkUrl = linkNode.getURL();
        }
      }
    });

    if (!hasValidSelection) {
      toast.error('Vui lòng bôi đen nội dung cần gắn link');
      return;
    }

    const url = window.prompt('Nhập URL (https://...)', currentLinkUrl);
    if (!url) {
      return;
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast.error('URL không hợp lệ');
      return;
    }

    editor.dispatchCommand(TOGGLE_LINK_COMMAND, trimmedUrl);
  };

  const handleRemoveLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  };

  const applyStyleText = (styles: Record<string, string>) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, styles);
      }
    });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyStyleText({ 'font-size': e.target.value });
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyStyleText({ 'font-family': e.target.value });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyStyleText({ color: e.target.value });
  };
 
   const ToolbarBtn = ({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) => (
     <button
       type="button"
       onClick={onClick}
       title={title}
       className={cn(
         "p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400 flex items-center justify-center min-w-[28px]",
         active ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100" : ""
       )}
     >
       {children}
     </button>
   );
 
   const Divider = () => <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>;
 
   return (
     <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-t-lg">
      {/* Font Family */}
      <select
        value={activeState.fontFamily}
        onChange={handleFontFamilyChange}
        className="h-7 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2"
        title="Font chữ"
      >
        {FONT_FAMILY_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>

      {/* Font Size */}
      <select
        value={activeState.fontSize}
        onChange={handleFontSizeChange}
        className="h-7 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2"
        title="Cỡ chữ"
      >
        {FONT_SIZE_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>

      {/* Font Color */}
      <input
        type="color"
        value={activeState.fontColor}
        onChange={handleColorChange}
        className="h-7 w-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
        title="Màu chữ"
      />

      <Divider />

       <div className="flex items-center gap-0.5">
         <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} active={activeState.bold} title="In đậm (Ctrl+B)">
           <span className="text-[11px] font-bold leading-none">B</span>
         </ToolbarBtn>
         <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} active={activeState.italic} title="In nghiêng (Ctrl+I)">
           <span className="text-[11px] italic leading-none">I</span>
         </ToolbarBtn>
         <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} active={activeState.underline} title="Gạch chân (Ctrl+U)">
           <span className="text-[11px] underline leading-none">U</span>
         </ToolbarBtn>
       </div>
 
       <Divider />
 
       <div className="flex items-center gap-0.5">
         <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} title="Căn trái">
           <span className="text-[10px] font-medium leading-none">T</span>
         </ToolbarBtn>
         <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} title="Căn giữa">
           <span className="text-[10px] font-medium leading-none">G</span>
         </ToolbarBtn>
         <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} title="Căn phải">
           <span className="text-[10px] font-medium leading-none">P</span>
         </ToolbarBtn>
       </div>
 
       <Divider />
 
       <div className="flex items-center gap-0.5">
         <ToolbarBtn onClick={() => formatBlock('paragraph')} active={activeState.blockType === 'paragraph'} title="Văn bản thường">
           <span className="text-[10px] font-medium leading-none">P</span>
         </ToolbarBtn>
         <ToolbarBtn onClick={() => formatBlock('h1')} active={activeState.blockType === 'h1'} title="Tiêu đề 1">
           <span className="text-[10px] font-medium leading-none">H1</span>
         </ToolbarBtn>
         <ToolbarBtn onClick={() => formatBlock('h2')} active={activeState.blockType === 'h2'} title="Tiêu đề 2">
           <span className="text-[10px] font-medium leading-none">H2</span>
         </ToolbarBtn>
         <ToolbarBtn onClick={() => formatBlock('quote')} active={activeState.blockType === 'quote'} title="Trích dẫn">
           <span className="text-[10px] font-medium leading-none">Q</span>
         </ToolbarBtn>
       </div>
 
       <Divider />
 
       <div className="flex items-center gap-0.5">
         <ToolbarBtn onClick={() => formatBlock('ul')} title="Danh sách chấm">
           <span className="text-[10px] font-medium leading-none">UL</span>
         </ToolbarBtn>
         <ToolbarBtn onClick={() => formatBlock('ol')} title="Danh sách số">
           <span className="text-[10px] font-medium leading-none">OL</span>
         </ToolbarBtn>
       </div>
 
       <Divider />

       <div className="flex items-center gap-1">
         <button
           type="button"
           onClick={handleAddLink}
           className={cn(
             "h-7 px-2 rounded-md border text-xs font-medium transition-colors",
             activeState.isLink
               ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-200"
               : "border-slate-300 text-slate-700 hover:bg-slate-200 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
           )}
           title="Gắn link"
         >
           Link
         </button>
         <button
           type="button"
           onClick={handleRemoveLink}
           className="h-7 px-2 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
           title="Gỡ link"
         >
           Unlink
         </button>
       </div>
 
       <Divider />
 
       <div className="flex items-center gap-0.5">
         <ToolbarBtn onClick={handleImageUpload} title="Tải ảnh lên">
          <span className={cn("text-[10px] font-semibold leading-none", isUploading ? "animate-pulse" : "")}>{isUploading ? '...' : 'Ảnh'}</span>
         </ToolbarBtn>
       </div>
     </div>
   );
 };
 
 interface LexicalEditorProps {
   onChange?: (html: string) => void;
   initialContent?: string;
   folder?: string;
   placeholder?: string;
  resetKey?: number | string;
 }

interface CustomLinkPluginProps {
  validateUrl?: (url: string) => boolean;
  attributes?: Record<string, string>;
}

const CustomLinkPlugin: React.FC<CustomLinkPluginProps> = ({ validateUrl, attributes }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([LinkNode])) {
      throw new Error('CustomLinkPlugin: LinkNode not registered on editor');
    }
  }, [editor]);

  useEffect(() => {
    return registerLink(editor, namedSignals({ attributes, validateUrl }));
  }, [editor, attributes, validateUrl]);

  return null;
};
 
 const PasteImagePlugin: React.FC<{ onImageUpload: (file: File) => Promise<string | null> }> = ({ onImageUpload }) => {
   const [editor] = useLexicalComposerContext();
 
   useEffect(() => {
     const handlePaste = async (event: ClipboardEvent) => {
       const items = event.clipboardData?.items;
       if (!items) return;
 
       for (const item of Array.from(items)) {
         if (item.type.startsWith('image/')) {
           event.preventDefault();
           const file = item.getAsFile();
           if (file) {
             try {
               const url = await onImageUpload(file);
               if (url) {
                 editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, altText: '' });
               }
             } catch (error) {
               console.error('Paste image error:', error);
             }
           }
           break;
         }
       }
     };
 
     const rootElement = editor.getRootElement();
     if (rootElement) {
       rootElement.addEventListener('paste', handlePaste as unknown as EventListener);
       return () => {
         rootElement.removeEventListener('paste', handlePaste as unknown as EventListener);
       };
     }
   }, [editor, onImageUpload]);
 
   return null;
 };
 
const InitialContentPlugin: React.FC<{ initialContent?: string; resetKey?: number | string }> = ({ initialContent, resetKey }) => {
  const [editor] = useLexicalComposerContext();
  const isInitializedRef = useRef(false);
  const lastResetKeyRef = useRef<number | string | undefined>(undefined);

  useEffect(() => {
    if (!initialContent) {
      return;
    }

    const shouldReset = resetKey !== undefined
      ? lastResetKeyRef.current !== resetKey
      : !isInitializedRef.current;

    if (!shouldReset) {
      return;
    }

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialContent, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      
      const validNodes: LexicalNode[] = [];
      for (const node of nodes) {
        if ($isElementNode(node) || $isDecoratorNode(node)) {
          validNodes.push(node);
        } else if ($isTextNode(node)) {
          const text = node.getTextContent().trim();
          if (text) {
            const paragraph = $createParagraphNode();
            paragraph.append(node);
            validNodes.push(paragraph);
          }
        }
      }
      
      if (validNodes.length > 0) {
        root.append(...validNodes);
      }
    });

    isInitializedRef.current = true;
    lastResetKeyRef.current = resetKey;
  }, [editor, initialContent, resetKey]);

  return null;
};

const EditorChangePlugin: React.FC<{ onChange?: (html: string) => void }> = ({ onChange }) => {
  const [editor] = useLexicalComposerContext();
  const isFirstUpdateRef = useRef(true);

  useEffect(() => {
    if (!onChange) {
      return;
    }

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        if (isFirstUpdateRef.current) {
          isFirstUpdateRef.current = false;
          return;
        }
        onChange($generateHtmlFromNodes(editor, null));
      });
    });
  }, [editor, onChange]);

  return null;
};
 
 export const LexicalEditor: React.FC<LexicalEditorProps> = ({ 
   onChange, 
   initialContent, 
   folder = 'products',
  placeholder = 'Bắt đầu viết nội dung...',
  resetKey,
 }) => {
   const initialConfig = {
     namespace: 'ProductEditor',
     theme,
     onError: (error: Error) => console.error(error),
     nodes: [
       HeadingNode, 
       QuoteNode, 
       ListNode, 
       ListItemNode, 
       AutoLinkNode, 
       LinkNode,
      ImageNode,
      ExtendedTextNode,
      {
        replace: TextNode,
        with: (node: TextNode) => {
          return new ExtendedTextNode(node.__text);
        },
        withKlass: ExtendedTextNode,
      },
     ],
   };
 
   const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
     if (!file.type.startsWith('image/')) {
       toast.error('Vui lòng chọn file hình ảnh');
       return null;
     }
     
     if (file.size > 5 * 1024 * 1024) {
       toast.error('Kích thước file không được vượt quá 5MB');
       return null;
     }
     
     try {
       const token = typeof window !== 'undefined' ? window.localStorage.getItem('admin_access_token') : null;
       const formData = new FormData();
       formData.append('image', file);
       formData.append('folder', folder);
       formData.append('semantic_type', folder || 'shared');
       
       const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image`, {
         method: 'POST',
         body: formData,
         headers: token ? { Authorization: `Bearer ${token}` } : undefined,
       });
       
       if (!response.ok) {
         let message = 'Không thể tải ảnh lên';
         try {
           const payload = await response.json();
           if (payload?.message) {
             message = String(payload.message);
           }
         } catch {
           // ignore parse error
         }
         throw new Error(message);
       }
       
       const result = await response.json();
       
       if (result.success && result.data) {
         return normalizeImageUrl(result.data.canonical_url || result.data.url);
       }
       
       throw new Error(result.message || 'Không thể tải ảnh lên');
     } catch (error) {
       console.error('Upload error:', error);
       throw error;
     }
   }, [folder]);
 
   return (
     <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 shadow-sm w-full">
       <LexicalComposer initialConfig={initialConfig}>
         <ToolbarPlugin onImageUpload={handleImageUpload} />
         <div className="relative min-h-[300px]">
           <RichTextPlugin
             contentEditable={<ContentEditable className="outline-none min-h-[300px] p-4 prose prose-sm dark:prose-invert max-w-none" />}
             placeholder={<div className="absolute top-4 left-4 text-slate-400 pointer-events-none">{placeholder}</div>}
             ErrorBoundary={LexicalErrorBoundary}
           />
           <HistoryPlugin />
           <ListPlugin />
           <CustomLinkPlugin />
           <ImagesPlugin />
           <PasteImagePlugin onImageUpload={handleImageUpload} />
          <InitialContentPlugin initialContent={initialContent} resetKey={resetKey} />
           <EditorChangePlugin onChange={onChange} />
         </div>
       </LexicalComposer>
       <style jsx global>{`
         .editor-paragraph { margin: 0 0 8px 0; }
         .editor-heading-h1 { font-size: 24px; font-weight: bold; margin: 0 0 12px 0; }
         .editor-heading-h2 { font-size: 18px; font-weight: bold; margin: 0 0 10px 0; }
         .editor-quote { border-left: 4px solid #cbd5e1; margin: 8px 0; padding-left: 16px; color: #64748b; font-style: italic; }
         .editor-list-ul { list-style-type: disc; padding-left: 24px; margin: 8px 0; }
         .editor-list-ol { list-style-type: decimal; padding-left: 24px; margin: 8px 0; }
         .editor-listitem { margin: 4px 0; }
         .editor-link {
           color: #2563eb;
           text-decoration: underline;
           text-decoration-thickness: 2px;
           text-underline-offset: 2px;
           cursor: pointer;
         }
         .editor-link:hover {
           color: #1d4ed8;
         }
         .dark .editor-link {
           color: #60a5fa;
         }
         .dark .editor-link:hover {
           color: #93c5fd;
         }
         .editor-text-bold { font-weight: bold; }
         .editor-text-italic { font-style: italic; }
         .editor-text-underline { text-decoration: underline; }
       `}</style>
     </div>
   );
 };

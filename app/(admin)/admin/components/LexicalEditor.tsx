 'use client';
 
 import React, { useEffect, useState, useCallback } from 'react';
 import { LexicalComposer } from '@lexical/react/LexicalComposer';
 import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
 import { ContentEditable } from '@lexical/react/LexicalContentEditable';
 import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
 import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
 import { ListPlugin } from '@lexical/react/LexicalListPlugin';
 import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
 import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
 import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
 import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
 import { ListNode, ListItemNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
 import { AutoLinkNode, LinkNode } from '@lexical/link';
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
 } from 'lexical';
 import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
 import { $setBlocksType } from '@lexical/selection';
 import { 
   Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
   Type, Heading1, Heading2, Quote, List as ListIcon, ListOrdered, Image as ImageIcon, 
   Loader2 
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import ImagesPlugin, { ImageNode, INSERT_IMAGE_COMMAND } from './nodes/ImageNode';
 
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
   text: {
     bold: 'editor-text-bold',
     italic: 'editor-text-italic',
     underline: 'editor-text-underline',
   },
 };
 
 interface ToolbarPluginProps {
   onImageUpload?: (file: File) => Promise<string | null>;
 }
 
 const ToolbarPlugin: React.FC<ToolbarPluginProps> = ({ onImageUpload }) => {
   const [editor] = useLexicalComposerContext();
   const [isUploading, setIsUploading] = useState(false);
   const [activeState, setActiveState] = useState({
     bold: false,
     italic: false,
     underline: false,
     blockType: 'paragraph',
   });
 
   const updateToolbar = useCallback(() => {
     const selection = $getSelection();
     if ($isRangeSelection(selection)) {
       const anchorNode = selection.anchor.getNode();
       const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
 
       setActiveState({
         bold: selection.hasFormat('bold'),
         italic: selection.hasFormat('italic'),
         underline: selection.hasFormat('underline'),
         blockType: element.getType(),
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
           alert('Không thể tải ảnh lên');
         } finally {
           setIsUploading(false);
         }
       }
     };
     input.click();
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
       <div className="flex items-center gap-0.5">
         <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} active={activeState.bold} title="In đậm (Ctrl+B)">
           <Bold size={16} />
         </ToolbarBtn>
         <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} active={activeState.italic} title="In nghiêng (Ctrl+I)">
           <Italic size={16} />
         </ToolbarBtn>
         <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} active={activeState.underline} title="Gạch chân (Ctrl+U)">
           <Underline size={16} />
         </ToolbarBtn>
       </div>
 
       <Divider />
 
       <div className="flex items-center gap-0.5">
         <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} title="Căn trái">
           <AlignLeft size={16} />
         </ToolbarBtn>
         <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} title="Căn giữa">
           <AlignCenter size={16} />
         </ToolbarBtn>
         <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} title="Căn phải">
           <AlignRight size={16} />
         </ToolbarBtn>
       </div>
 
       <Divider />
 
       <div className="flex items-center gap-0.5">
         <ToolbarBtn onClick={() => formatBlock('paragraph')} active={activeState.blockType === 'paragraph'} title="Văn bản thường">
           <Type size={16} />
         </ToolbarBtn>
         <ToolbarBtn onClick={() => formatBlock('h1')} active={activeState.blockType === 'heading' || activeState.blockType === 'h1'} title="Tiêu đề 1">
           <Heading1 size={16} />
         </ToolbarBtn>
         <ToolbarBtn onClick={() => formatBlock('h2')} active={activeState.blockType === 'h2'} title="Tiêu đề 2">
           <Heading2 size={16} />
         </ToolbarBtn>
         <ToolbarBtn onClick={() => formatBlock('quote')} active={activeState.blockType === 'quote'} title="Trích dẫn">
           <Quote size={16} />
         </ToolbarBtn>
       </div>
 
       <Divider />
 
       <div className="flex items-center gap-0.5">
         <ToolbarBtn onClick={() => formatBlock('ul')} title="Danh sách chấm">
           <ListIcon size={16} />
         </ToolbarBtn>
         <ToolbarBtn onClick={() => formatBlock('ol')} title="Danh sách số">
           <ListOrdered size={16} />
         </ToolbarBtn>
       </div>
 
       <Divider />
 
       <div className="flex items-center gap-0.5">
         <ToolbarBtn onClick={handleImageUpload} title="Tải ảnh lên">
           {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
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
 }
 
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
 
 const InitialContentPlugin: React.FC<{ initialContent?: string }> = ({ initialContent }) => {
   const [editor] = useLexicalComposerContext();
   const [isInitialized, setIsInitialized] = useState(false);
 
   useEffect(() => {
     if (initialContent && !isInitialized) {
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
       setIsInitialized(true);
     }
   }, [editor, initialContent, isInitialized]);
 
   return null;
 };
 
 export const LexicalEditor: React.FC<LexicalEditorProps> = ({ 
   onChange, 
   initialContent, 
   folder = 'products',
   placeholder = 'Bắt đầu viết nội dung...'
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
       ImageNode
     ],
   };
 
   const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
     if (!file.type.startsWith('image/')) {
       alert('Vui lòng chọn file hình ảnh');
       return null;
     }
     
     if (file.size > 5 * 1024 * 1024) {
       alert('Kích thước file không được vượt quá 5MB');
       return null;
     }
     
     try {
       const formData = new FormData();
       formData.append('image', file);
       formData.append('folder', folder);
       
       const response = await fetch(`${API_BASE_URL}/v1/admin/upload/image`, {
         method: 'POST',
         body: formData,
       });
       
       if (!response.ok) {
         throw new Error('Upload failed');
       }
       
       const result = await response.json();
       
       if (result.success && result.data?.url) {
         return normalizeImageUrl(result.data.url);
       }
       
       throw new Error(result.message || 'Upload failed');
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
           <LinkPlugin />
           <ImagesPlugin />
           <PasteImagePlugin onImageUpload={handleImageUpload} />
           <InitialContentPlugin initialContent={initialContent} />
           <OnChangePlugin onChange={(editorState, editor) => {
              editorState.read(() => {
                 const html = $generateHtmlFromNodes(editor, null);
                 if (onChange) onChange(html);
              });
           }}/>
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
         .editor-text-bold { font-weight: bold; }
         .editor-text-italic { font-style: italic; }
         .editor-text-underline { text-decoration: underline; }
       `}</style>
     </div>
   );
 };

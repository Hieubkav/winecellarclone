import {
  $createParagraphNode,
  $createNodeSelection,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  createEditor,
  HISTORY_MERGE_TAG,
  type EditorState,
  type LexicalEditor,
  type NodeKey,
  type EditorThemeClasses,
  type HTMLConfig,
  type LexicalNodeConfig,
} from 'lexical';
import {
  registerList,
  ListNode,
  ListItemNode,
  registerListStrictIndentTransform,
} from '@lexical/list';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { registerRichText } from '@lexical/rich-text';
import { registerDragonSupport } from '@lexical/dragon';
import { $canShowPlaceholderCurry } from '@lexical/text';
import { mergeRegister } from '@lexical/utils';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  type ReactNode,
  type ComponentType,
  type Ref,
  type MutableRefObject,
} from 'react';
import { flushSync, createPortal } from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';

const CAN_USE_DOM =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';

const useLayoutEffectImpl = CAN_USE_DOM ? useLayoutEffect : useEffect;

type LexicalTheme = EditorThemeClasses | null | undefined;
type LexicalComposerContextType = [LexicalEditor, { getTheme: () => LexicalTheme }];

const LexicalComposerContext = /*#__PURE__*/createContext<LexicalComposerContextType | null>(null);

function createLexicalComposerContext(
  parent: LexicalComposerContextType | null,
  theme: LexicalTheme
) {
  let parentContext: { getTheme: () => LexicalTheme } | null = null;
  if (parent != null) {
    parentContext = parent[1];
  }
  function getTheme() {
    if (theme != null) {
      return theme;
    }
    return parentContext != null ? parentContext.getTheme() : null;
  }
  return {
    getTheme,
  };
}

function useLexicalComposerContext() {
  const composerContext = useContext(LexicalComposerContext);
  if (composerContext == null) {
    throw new Error('LexicalComposerContext.useLexicalComposerContext: cannot find a LexicalComposerContext');
  }
  return composerContext;
}

type InitialConfig = {
  namespace: string;
  theme?: LexicalTheme;
  nodes?: ReadonlyArray<LexicalNodeConfig>;
  onError: (error: Error, editor: LexicalEditor) => void;
  editorState?: EditorState | string | ((editor: LexicalEditor) => void) | null;
  html?: HTMLConfig;
  editable?: boolean;
};

const HISTORY_MERGE_OPTIONS = {
  tag: HISTORY_MERGE_TAG,
};

function initializeEditor(
  editor: LexicalEditor,
  initialEditorState: InitialConfig['editorState']
) {
  if (initialEditorState === null) {
    return;
  }
  if (initialEditorState === undefined) {
    editor.update(() => {
      const root = $getRoot();
      if (root.isEmpty()) {
        const paragraph = $createParagraphNode();
        root.append(paragraph);
        const activeElement = CAN_USE_DOM ? document.activeElement : null;
        if (
          $getSelection() !== null ||
          (activeElement !== null && activeElement === editor.getRootElement())
        ) {
          paragraph.select();
        }
      }
    }, HISTORY_MERGE_OPTIONS);
    return;
  }
  switch (typeof initialEditorState) {
    case 'string': {
      const parsedEditorState = editor.parseEditorState(initialEditorState);
      editor.setEditorState(parsedEditorState, HISTORY_MERGE_OPTIONS);
      break;
    }
    case 'object': {
      editor.setEditorState(initialEditorState, HISTORY_MERGE_OPTIONS);
      break;
    }
    case 'function': {
      editor.update(() => {
        const root = $getRoot();
        if (root.isEmpty()) {
          initialEditorState(editor);
        }
      }, HISTORY_MERGE_OPTIONS);
      break;
    }
  }
}

function LexicalComposer({
  initialConfig,
  children,
}: {
  initialConfig: InitialConfig;
  children: ReactNode;
}) {
  const composerContext = useMemo<LexicalComposerContextType>(() => {
    const { namespace, nodes, onError, editorState: initialEditorState, html } = initialConfig;
    const theme = initialConfig.theme ?? undefined;
    const context = createLexicalComposerContext(null, theme ?? null);
    const editor = createEditor({
      editable: initialConfig.editable,
      html,
      namespace,
      nodes,
      onError: (error) => onError(error, editor),
      theme,
    });
    initializeEditor(editor, initialEditorState);
    return [editor, context];
  }, []);

  useLayoutEffectImpl(() => {
    const isEditable = initialConfig.editable;
    const [editor] = composerContext;
    editor.setEditable(isEditable !== undefined ? isEditable : true);
  }, []);

  return (
    <LexicalComposerContext.Provider value={composerContext}>
      {children}
    </LexicalComposerContext.Provider>
  );
}

type LexicalSubscription<T> = {
  initialValueFn: () => T;
  subscribe: (callback: (value: T) => void) => () => void;
};

function useLexicalSubscription<T>(subscription: (editor: LexicalEditor) => LexicalSubscription<T>) {
  const [editor] = useLexicalComposerContext();
  const initializedSubscription = useMemo(() => subscription(editor), [editor, subscription]);
  const [value, setValue] = useState(() => initializedSubscription.initialValueFn());
  const valueRef = useRef(value);
  useLayoutEffectImpl(() => {
    const { initialValueFn, subscribe } = initializedSubscription;
    const currentValue = initialValueFn();
    if (valueRef.current !== currentValue) {
      valueRef.current = currentValue;
      setValue(currentValue);
    }
    return subscribe((newValue) => {
      valueRef.current = newValue;
      setValue(newValue);
    });
  }, [initializedSubscription]);
  return value;
}

function useLexicalEditable(): boolean {
  return useLexicalSubscription<boolean>((editor) => ({
    initialValueFn: () => editor.isEditable(),
    subscribe: (callback) => editor.registerEditableListener(callback),
  }));
}

function useDecorators(
  editor: LexicalEditor,
  ErrorBoundaryComponent: ComponentType<{ children: ReactNode; onError: (error: Error) => void }>
) {
  const [decorators, setDecorators] = useState(() => editor.getDecorators() as Record<string, ReactNode>);
  useLayoutEffectImpl(() => {
    return editor.registerDecoratorListener((nextDecorators) => {
      flushSync(() => {
        setDecorators(nextDecorators as Record<string, ReactNode>);
      });
    });
  }, [editor]);
  useEffect(() => {
    setDecorators(editor.getDecorators() as Record<string, ReactNode>);
  }, [editor]);
  return useMemo(() => {
    const decoratedPortals: ReactNode[] = [];
    const decoratorKeys = Object.keys(decorators);
    for (let i = 0; i < decoratorKeys.length; i++) {
      const nodeKey = decoratorKeys[i];
      const reactDecorator = (
        <ErrorBoundaryComponent
          onError={(error) => {
            (editor as { _onError: (err: Error) => void })._onError(error);
          }}
        >
          {decorators[nodeKey]}
        </ErrorBoundaryComponent>
      );
      const element = editor.getElementByKey(nodeKey);
      if (element !== null) {
        decoratedPortals.push(createPortal(reactDecorator, element, nodeKey));
      }
    }
    return decoratedPortals;
  }, [ErrorBoundaryComponent, decorators, editor]);
}

function useCanShowPlaceholder(editor: LexicalEditor) {
  const [canShowPlaceholder, setCanShowPlaceholder] = useState(() =>
    editor.getEditorState().read($canShowPlaceholderCurry(editor.isComposing()))
  );
  useLayoutEffectImpl(() => {
    const resetCanShowPlaceholder = () => {
      const currentCanShowPlaceholder = editor
        .getEditorState()
        .read($canShowPlaceholderCurry(editor.isComposing()));
      setCanShowPlaceholder(currentCanShowPlaceholder);
    };
    resetCanShowPlaceholder();
    return mergeRegister(
      editor.registerUpdateListener(() => {
        resetCanShowPlaceholder();
      }),
      editor.registerEditableListener(() => {
        resetCanShowPlaceholder();
      })
    );
  }, [editor]);
  return canShowPlaceholder;
}

function useRichTextSetup(editor: LexicalEditor) {
  useLayoutEffectImpl(() => {
    return mergeRegister(registerRichText(editor), registerDragonSupport(editor));
  }, [editor]);
}

function RichTextPlugin({
  contentEditable,
  placeholder = null,
  ErrorBoundary: ErrorBoundaryComponent,
}: {
  contentEditable: ReactNode;
  placeholder?: ReactNode | ((editable: boolean) => ReactNode) | null;
  ErrorBoundary: ComponentType<{ children: ReactNode; onError: (error: Error) => void }>;
}) {
  const [editor] = useLexicalComposerContext();
  useRichTextSetup(editor);
  const decorators = useDecorators(editor, ErrorBoundaryComponent);
  return (
    <>
      {contentEditable}
      <Placeholder content={placeholder} />
      {decorators}
    </>
  );
}

function Placeholder({
  content,
}: {
  content: ReactNode | ((editable: boolean) => ReactNode) | null;
}) {
  const [editor] = useLexicalComposerContext();
  const showPlaceholder = useCanShowPlaceholder(editor);
  const editable = useLexicalEditable();
  if (!showPlaceholder) {
    return null;
  }
  return typeof content === 'function' ? content(editable) : content;
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as MutableRefObject<T>).current = value;
      }
    }
  };
}

const ContentEditableElement = /*#__PURE__*/forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { editor: LexicalEditor; 'data-testid'?: string }
>(
  function ContentEditableElementImpl(
    {
      editor,
      role = 'textbox',
      spellCheck = true,
      'data-testid': testId,
      ...rest
    },
    ref
  ) {
    const [isEditable, setEditable] = useState(editor.isEditable());
    const handleRef = useCallback(
      (rootElement: HTMLDivElement | null) => {
        if (rootElement && rootElement.ownerDocument && rootElement.ownerDocument.defaultView) {
          editor.setRootElement(rootElement);
        } else {
          editor.setRootElement(null);
        }
      },
      [editor]
    );
    const mergedRefs = useMemo(() => mergeRefs(ref, handleRef), [handleRef, ref]);
    useLayoutEffectImpl(() => {
      setEditable(editor.isEditable());
      return editor.registerEditableListener((currentIsEditable) => {
        setEditable(currentIsEditable);
      });
    }, [editor]);
    return (
      <div
        aria-activedescendant={isEditable ? rest['aria-activedescendant'] : undefined}
        aria-autocomplete={isEditable ? rest['aria-autocomplete'] : 'none'}
        aria-controls={isEditable ? rest['aria-controls'] : undefined}
        aria-describedby={rest['aria-describedby']}
        {...(rest['aria-errormessage'] != null
          ? { 'aria-errormessage': rest['aria-errormessage'] }
          : {})}
        aria-expanded={isEditable && role === 'combobox' ? !!rest['aria-expanded'] : undefined}
        {...(rest['aria-invalid'] != null ? { 'aria-invalid': rest['aria-invalid'] } : {})}
        aria-label={rest['aria-label']}
        aria-labelledby={rest['aria-labelledby']}
        aria-multiline={rest['aria-multiline']}
        aria-owns={isEditable ? rest['aria-owns'] : undefined}
        aria-readonly={isEditable ? undefined : true}
        aria-required={rest['aria-required']}
        autoCapitalize={rest['autoCapitalize']}
        className={rest.className}
        contentEditable={isEditable}
        data-testid={testId}
        id={rest.id}
        ref={mergedRefs}
        role={role}
        spellCheck={spellCheck}
        style={rest.style}
        tabIndex={rest.tabIndex}
      />
    );
  }
);

const ContentEditable = /*#__PURE__*/forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { placeholder?: ReactNode }>(
  function ContentEditableImpl({ placeholder, ...rest }, ref) {
    const [editor] = useLexicalComposerContext();
    return (
      <>
        <ContentEditableElement editor={editor} {...rest} ref={ref} />
        {placeholder != null && <ContentEditablePlaceholder editor={editor} content={placeholder} />}
      </>
    );
  }
);

function ContentEditablePlaceholder({
  content,
  editor,
}: {
  content: ReactNode | ((editable: boolean) => ReactNode);
  editor: LexicalEditor;
}) {
  const showPlaceholder = useCanShowPlaceholder(editor);
  const [isEditable, setEditable] = useState(editor.isEditable());
  useLayoutEffectImpl(() => {
    setEditable(editor.isEditable());
    return editor.registerEditableListener((currentIsEditable) => {
      setEditable(currentIsEditable);
    });
  }, [editor]);
  if (!showPlaceholder) {
    return null;
  }
  return typeof content === 'function' ? (content as (editable: boolean) => ReactNode)(isEditable) : content;
}

function HistoryPlugin({
  delay,
  externalHistoryState,
}: {
  delay?: number;
  externalHistoryState?: ReturnType<typeof createEmptyHistoryState>;
}) {
  const [editor] = useLexicalComposerContext();
  const historyDelay = delay ?? 1000;
  const historyState = useMemo(
    () => externalHistoryState || createEmptyHistoryState(),
    [externalHistoryState]
  );
  useEffect(() => {
    return registerHistory(editor, historyState, historyDelay);
  }, [editor, historyDelay, historyState]);
  return null;
}

function ListPlugin({ hasStrictIndent = false }: { hasStrictIndent?: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([ListNode, ListItemNode])) {
      throw new Error('ListPlugin: ListNode and/or ListItemNode not registered on editor');
    }
  }, [editor]);
  useEffect(() => {
    if (!hasStrictIndent) {
      return;
    }
    return registerListStrictIndentTransform(editor);
  }, [editor, hasStrictIndent]);
  useEffect(() => registerList(editor), [editor]);
  return null;
}

function LexicalErrorBoundary({
  children,
  onError,
}: {
  children: ReactNode;
  onError: (error: Error) => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div style={{ border: '1px solid #f00', color: '#f00', padding: '8px' }}>
          An error was thrown.
        </div>
      }
      onError={(error) => {
        onError(error as Error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

function useLexicalNodeSelection(key: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setIsSelected] = useState(() =>
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(key);
      if (node === null) {
        return false;
      }
      return node.isSelected();
    })
  );
  useEffect(() => {
    let isMounted = true;
    const unregister = editor.registerUpdateListener(() => {
      if (isMounted) {
        setIsSelected(
          editor.getEditorState().read(() => {
            const node = $getNodeByKey(key);
            if (node === null) {
              return false;
            }
            return node.isSelected();
          })
        );
      }
    });
    return () => {
      isMounted = false;
      unregister();
    };
  }, [editor, key]);
  const setSelected = useCallback(
    (selected: boolean) => {
      editor.update(() => {
        let selection = $getSelection();
        if (!$isNodeSelection(selection)) {
          selection = $createNodeSelection();
          $setSelection(selection);
        }
        if ($isNodeSelection(selection)) {
          if (selected) {
            selection.add(key);
          } else {
            selection.delete(key);
          }
        }
      });
    },
    [editor, key]
  );
  const clearSelected = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isNodeSelection(selection)) {
        selection.clear();
      }
    });
  }, [editor]);
  return [isSelected, setSelected, clearSelected] as const;
}

export {
  LexicalComposer,
  LexicalComposerContext,
  LexicalErrorBoundary,
  RichTextPlugin,
  ContentEditable,
  HistoryPlugin,
  ListPlugin,
  createLexicalComposerContext,
  useLexicalComposerContext,
  useLexicalEditable,
  useLexicalNodeSelection,
  createEmptyHistoryState,
};

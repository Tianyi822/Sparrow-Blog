"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FiCheck, FiCopy } from "react-icons/fi";

/**
 * 代码块组件属性定义
 * 支持单文件代码块和多标签页代码块两种模式
 */
type CodeBlockProps = {
  /** 代码语言 */
  language: string;
  /** 可选的文件名 */
  filename?: string;
  /** 高亮显示的行号列表 */
  highlightLines?: number[];
} & (
    | {
      /** 代码内容 */
      code: string;
      tabs?: never;
    }
    | {
      code?: never;
      /** 多标签页代码内容 */
      tabs: Array<{
        /** 标签名称 */
        name: string;
        /** 标签对应的代码内容 */
        code: string;
        /** 标签特定的语言，可覆盖全局语言设置 */
        language?: string;
        /** 标签特定的高亮行 */
        highlightLines?: number[];
      }>;
    }
  );

/**
 * 代码块组件
 * 用于显示带有语法高亮、行号、复制功能的代码块
 * 支持单文件和多标签页模式
 * 
 * @param language - 代码语言
 * @param filename - 可选的文件名
 * @param code - 单文件模式下的代码内容
 * @param highlightLines - 需要高亮的行号列表
 * @param tabs - 多标签页模式下的标签内容数组
 */
export const CodeBlock = ({
  language,
  filename,
  code,
  highlightLines = [],
  tabs = [],
}: CodeBlockProps) => {
  // 状态定义
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // 引用定义
  const codeBlockRef = useRef<HTMLDivElement>(null);
  const codeContentRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 检查是否为多标签页模式
  const tabsExist = tabs.length > 0;

  /**
   * 复制代码到剪贴板
   * 将当前显示的代码内容复制到剪贴板并显示复制成功状态
   */
  const copyToClipboard = useCallback(async () => {
    // 清除可能存在的之前的定时器
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }

    const textToCopy = tabsExist ? tabs[activeTab].code : code;
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        copyTimeoutRef.current = setTimeout(() => {
          setCopied(false);
          copyTimeoutRef.current = null;
        }, 2000);
      } catch (error) {
        console.error("复制代码失败:", error);
      }
    }
  }, [tabsExist, tabs, activeTab, code]);

  /**
   * 处理语言标识符，使用小写并处理特殊别名
   * @param lang - 输入的语言标识符
   * @returns 标准化后的语言标识符
   */
  const normalizeLanguage = useCallback((lang: string) => {
    const langAliases: Record<string, string> = {
      'golang': 'go',
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'shell': 'bash',
      'sh': 'bash',
      'c++': 'cpp',
      'c#': 'csharp'
    };

    const lowerLang = lang.toLowerCase();
    return langAliases[lowerLang] || lowerLang;
  }, []);

  /**
   * 处理标签切换
   * @param index - 要切换到的标签索引
   */
  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  /**
   * 使用 useMemo 计算活动代码相关的衍生状态
   * 包括代码字符串、语言、高亮行等信息
   */
  const activeCodeData = useMemo(() => {
    // 确保代码是字符串类型
    const codeString = tabsExist
      ? String(tabs[activeTab]?.code || '')
      : String(code || '');

    const activeLang = tabsExist
      ? tabs[activeTab]?.language || language
      : language;

    const activeHighlights = tabsExist
      ? tabs[activeTab]?.highlightLines || []
      : highlightLines;

    const normalizedLang = normalizeLanguage(activeLang);

    // 分割代码行并移除尾部空行
    const lines = codeString.split('\n');
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }

    return {
      codeString,
      language: normalizedLang,
      displayLanguage: activeLang.toUpperCase(),
      highlightLines: activeHighlights,
      codeLines: lines
    };
  }, [tabsExist, tabs, activeTab, code, language, highlightLines, normalizeLanguage]);

  /**
   * 监听滚动事件，使行号与代码内容垂直滚动同步
   */
  useEffect(() => {
    const lineNumbers = codeBlockRef.current?.querySelector('.line-numbers');
    const codeContent = codeContentRef.current;

    if (!lineNumbers || !codeContent) return;

    const handleScroll = () => {
      lineNumbers.scrollTop = codeContent.scrollTop;
    };

    codeContent.addEventListener('scroll', handleScroll);

    return () => {
      codeContent.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /**
   * 组件卸载时清除定时器
   */
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  /**
   * 计算SyntaxHighlighter的自定义样式
   */
  const syntaxHighlighterStyle = useMemo(() => ({
    margin: 0,
    padding: '1rem 1rem 1rem 0',
    background: "transparent",
    overflow: "auto",
    fontSize: "0.875rem",
    boxSizing: 'border-box' as const,
    width: '100%',
  }), []);

  /**
   * 生成行样式属性函数
   */
  const getLineProps = useCallback((lineNumber: number) => ({
    style: {
      display: "block",
      backgroundColor: activeCodeData.highlightLines.includes(lineNumber)
        ? "rgba(255,255,255,0.1)"
        : "transparent",
    },
  }), [activeCodeData.highlightLines]);

  return (
    <div ref={codeBlockRef} className="code-block-wrapper">
      {/* 代码块头部 */}
      <div className="code-block-header">
        {tabsExist ? (
          <div className="code-tabs">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => handleTabChange(index)}
                className={`code-tab ${activeTab === index ? 'active' : ''}`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="code-language">{filename || activeCodeData.displayLanguage}</div>
        )}
        <button
          onClick={copyToClipboard}
          className="code-copy-btn"
          title="复制代码"
        >
          {copied ? <FiCheck /> : <FiCopy />}
        </button>
      </div>

      {/* 代码块内容 */}
      <div className="code-block-content">
        {/* 行号区域 */}
        <div className="line-numbers">
          {activeCodeData.codeLines.map((_, i) => (
            <div
              key={i}
              className={`line-number ${activeCodeData.highlightLines.includes(i + 1) ? 'highlighted' : ''}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* 代码内容区域 */}
        <div ref={codeContentRef} className="code-content">
          <SyntaxHighlighter
            language={activeCodeData.language}
            style={atomDark}
            customStyle={syntaxHighlighterStyle}
            showLineNumbers={false}
            wrapLines={false}
            lineProps={getLineProps}
          >
            {activeCodeData.codeLines.join('\n')}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}; 
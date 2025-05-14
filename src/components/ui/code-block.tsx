"use client";
import React, { useEffect, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FiCheck, FiCopy } from "react-icons/fi";
 
type CodeBlockProps = {
  language: string;
  filename?: string;
  highlightLines?: number[];
} & (
  | {
      code: string;
      tabs?: never;
    }
  | {
      code?: never;
      tabs: Array<{
        name: string;
        code: string;
        language?: string;
        highlightLines?: number[];
      }>;
    }
);
 
export const CodeBlock = ({
  language,
  filename,
  code,
  highlightLines = [],
  tabs = [],
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const codeBlockRef = useRef<HTMLDivElement>(null);
  const codeContentRef = useRef<HTMLDivElement>(null);
 
  const tabsExist = tabs.length > 0;
 
  const copyToClipboard = async () => {
    const textToCopy = tabsExist ? tabs[activeTab].code : code;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
 
  // 处理语言标识符，使用小写并处理特殊别名
  const normalizeLanguage = (lang: string) => {
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
  };
  
  // 确保代码是字符串类型
  const activeCodeString = tabsExist 
    ? String(tabs[activeTab].code || '') 
    : String(code || '');
  
  const activeLanguage = tabsExist
    ? tabs[activeTab].language || language
    : language;
    
  const activeHighlightLines = tabsExist
    ? tabs[activeTab].highlightLines || []
    : highlightLines;
  
  const normalizedLanguage = normalizeLanguage(activeLanguage);
  
  // 分割代码行并移除尾部空行
  const codeLines = activeCodeString.split('\n');
  while (codeLines.length > 0 && codeLines[codeLines.length - 1].trim() === '') {
    codeLines.pop();
  }
  
  // 监听滚动事件，使行号与代码内容垂直滚动同步
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
  
  return (
    <div ref={codeBlockRef} className="code-block-wrapper">
      {/* 代码块头部 */}
      <div className="code-block-header">
        {tabsExist ? (
          <div className="code-tabs">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`code-tab ${activeTab === index ? 'active' : ''}`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="code-language">{filename || activeLanguage.toUpperCase()}</div>
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
          {codeLines.map((_, i) => (
            <div 
              key={i} 
              className={`line-number ${activeHighlightLines.includes(i + 1) ? 'highlighted' : ''}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        
        {/* 代码内容区域 */}
        <div ref={codeContentRef} className="code-content">
          <SyntaxHighlighter
            language={normalizedLanguage}
            style={atomDark}
            customStyle={{
              margin: 0,
              padding: '1rem 1rem 1rem 0',
              background: "transparent",
              overflowX: "auto",
              fontSize: "0.875rem",
              boxSizing: 'border-box',
              width: '100%',
            }}
            showLineNumbers={false}
            wrapLines={false}
            lineProps={(lineNumber) => ({
              style: {
                display: "block",
                backgroundColor: activeHighlightLines.includes(lineNumber)
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              },
            })}
          >
            {codeLines.join('\n')}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}; 
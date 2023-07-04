import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { DOCS_PATH } from '../constants'

function Docs() {
  const [docsContent, setDocsContent] = useState('');

  useEffect(() => {
    fetch(DOCS_PATH)
      .then(response => {
        if (!response.ok) throw new Error('Error fetching docs')
        return response.text()
      })
      .then(response => setDocsContent(response))
      .catch(err => {
        console.log(err);
        setDocsContent(err.message);
      })

  }, [])

  return <div className='relative flex flex-col items-center mt-[8rem]'>
    <div className="absolute z-[-1] right-[2rem] top-[50%] w-[40%] aspect-square rounded-full blur-[100px] bg-[#5d5668]" />
    <div className="absolute z-[-1] right-[70%] top-[45%] w-[10%] aspect-square rounded-full blur-[80px] bg-[#e7a2bc]" />
    <div className="absolute z-[-1] left-[-5%] bottom-[0] w-[20%] aspect-square rounded-full blur-[120px] bg-[#e7a2bc]" />

    <h1 className="text-[2rem] font-semibold max-w-lg text-center">Documentation</h1>
    <main className="main-docs p-7">
      <ReactMarkdown
        children={docsContent}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                children={String(children).replace(/\n$/, '')}
                style={dracula}
                language={match[1]}
                PreTag="div"
              />
            ) : (
              <code className={`${className ?? ''} bg-blue-300/30 rounded-sm`} {...props}>
                {children}
              </code>
            )
          },
          table({ node, children, ...props }) {
            return <table className="w-full text-sm text-left text-gray-400" {...props}>{children}</table>
          },
          thead({ node, children, ...props }) {
            return <thead className="text-xs text-gray-300 uppercase" {...props}>{children}</thead>
          },
          th({ node, isHeader, children, ...props }) {
            return <th className="pr-6 py-3 text-left" {...props}>{children}</th>
          },
          tr({ node, isHeader, children, ...props }) {
            return <tr className="border-b border-white/10" {...props}>{children}</tr>
          },
          td({ node, isHeader, children, ...props }) {
            return <td className="pr-6 py-4" {...props}>{children}</td>
          },
          a({ node, children, ...props }) {
            return <a className="text-purple-500 hover:underline" {...props}>{children}</a>
          },
          blockquote({ node, children, ...props }) {
            return <blockquote className="border-l-4 bg-white/5 border-purple-500 pl-4 py-2 my-4 rounded-md" {...props}>{children}</blockquote>
          },
          hr({ node, children, ...props }) {
            return <hr className="border-t border-white/10 my-6" {...props} />
          },
        }}
      />
    </main>
  </div>
}

export default Docs

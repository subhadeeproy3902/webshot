import { content } from "@/constant";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <main className="container mx-auto max-w-4xl px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="px-8 py-12">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-3xl font-bold mb-6 mt-12 text-slate-700 border-b-2 border-blue-100 pb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-2xl font-semibold mb-4 mt-8 text-slate-700 flex items-center">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-6 text-slate-600 leading-relaxed text-lg">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-6 space-y-3">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-6 space-y-3">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-slate-600 flex items-start">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-3 mr-4 flex-shrink-0"></span>
                    <span className="leading-relaxed">{children}</span>
                  </li>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1.5 rounded-lg text-sm font-mono text-purple-700 border border-purple-100">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3 flex items-center">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 p-6 overflow-x-auto">
                        <code className="font-mono text-sm leading-relaxed">{children}</code>
                      </pre>
                    </div>
                  );
                },
                table: ({ children }) => (
                  <div className="my-8 overflow-hidden rounded-xl border border-slate-200 shadow-lg bg-white">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        {children}
                      </table>
                    </div>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="bg-white divide-y divide-slate-100">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-gradient-to-r hover:from-blue-25 hover:to-purple-25 transition-all duration-200">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider border-b-2 border-slate-200">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap border-b border-slate-100">
                    {children}
                  </td>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-400 pl-6 py-4 my-6 italic text-slate-600 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a 
                    href={href} 
                    className="text-blue-600 hover:text-purple-600 underline decoration-2 underline-offset-2 transition-colors duration-200 font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {children}
                  </strong>
                ),
              }}
            >
              {content}
            </Markdown>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-10 w-24 h-24 bg-purple-200/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-indigo-200/20 rounded-full blur-xl"></div>
        </div>
      </main>
    </div>
  );
}

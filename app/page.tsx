import { content } from "@/constant";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto max-w-4xl px-6 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-12 py-16">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-4xl font-bold mb-8 text-blue-600 leading-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold mb-6 mt-12 text-gray-900 border-b border-blue-100 pb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold mb-4 mt-8 text-gray-800">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-6 text-gray-700 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-6 space-y-2 list-disc list-inside text-gray-700">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-6 space-y-2 list-decimal list-inside text-gray-700">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700 leading-relaxed">{children}</li>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-blue-50 px-2 py-1 rounded text-sm font-mono text-blue-700 border border-blue-100">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6 border">
                      <code className="font-mono text-sm">{children}</code>
                    </pre>
                  );
                },
                table: ({ children }) => (
                  <div className="my-8 overflow-hidden rounded-lg border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        {children}
                      </table>
                    </div>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-blue-50">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="bg-white">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700 border-b border-gray-200">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {children}
                  </td>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-6 py-3 my-6 bg-blue-50 text-gray-700">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a 
                    href={href} 
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-blue-600">
                    {children}
                  </strong>
                ),
              }}
            >
              {content}
            </Markdown>
          </div>
        </div>
      </main>
    </div>
  );
}

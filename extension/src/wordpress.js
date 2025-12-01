(function(){
  async function buildWordPressBlog(wpPosts,projectName){
    const files={};
    
    // Generate blog index page
    files['app/blog/page.jsx']=`'use client';
import Link from 'next/link';
import './blog.css';

const posts = ${JSON.stringify(wpPosts)};

export default function BlogIndex() {
  return (
    <div className="blog-container">
      <h1>Blog</h1>
      <div className="posts-grid">
        {posts.map(post => (
          <article key={post.id} className="post-card">
            <h2>
              <Link href={\`/blog/\${post.slug}\`}>
                {post.title}
              </Link>
            </h2>
            <p className="date">{new Date(post.date).toLocaleDateString()}</p>
            <div 
              className="excerpt"
              dangerouslySetInnerHTML={{ __html: post.excerpt }}
            />
            <Link href={\`/blog/\${post.slug}\`} className="read-more">
              Read More →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
`;

    // Generate individual post pages
    for(const post of wpPosts){
      const slug=post.slug;
      const postData=JSON.stringify(post);
      const pageContent="'use client';\nimport Link from 'next/link';\nimport '../blog.css';\n\nconst post = "+postData+";\n\nexport default function Post() {\n  return (\n    <div className=\"blog-container\">\n      <Link href=\"/blog\" className=\"back-link\">← Back to Blog</Link>\n      <article className=\"post-full\">\n        <h1>{post.title}</h1>\n        <p className=\"date\">{new Date(post.date).toLocaleDateString()}</p>\n        <div \n          className=\"content\"\n          dangerouslySetInnerHTML={{ __html: post.content }}\n        />\n      </article>\n    </div>\n  );\n}\n";
      files['app/blog/[slug]/page.jsx']=pageContent;
    }
    
    // Generate blog styles
    files['app/blog/blog.css']='.blog-container {\n'+
      '  max-width: 800px;\n'+
      '  margin: 0 auto;\n'+
      '  padding: 40px 20px;\n'+
      '}\n'+
      '.posts-grid {\n'+
      '  display: grid;\n'+
      '  gap: 30px;\n'+
      '  margin-top: 30px;\n'+
      '}\n'+
      '.post-card {\n'+
      '  border: 1px solid #ddd;\n'+
      '  padding: 20px;\n'+
      '  border-radius: 8px;\n'+
      '  transition: box-shadow 0.3s;\n'+
      '}\n'+
      '.post-card:hover {\n'+
      '  box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n'+
      '}\n'+
      '.post-card h2 { margin: 0 0 10px 0; }\n'+
      '.post-card h2 a { color: #0066cc; text-decoration: none; }\n'+
      '.post-card h2 a:hover { text-decoration: underline; }\n'+
      '.date { color: #666; font-size: 14px; margin: 10px 0; }\n'+
      '.excerpt { color: #555; line-height: 1.6; margin: 15px 0; }\n'+
      '.read-more { color: #0066cc; text-decoration: none; font-weight: bold; }\n'+
      '.read-more:hover { text-decoration: underline; }\n'+
      '.post-full { margin-top: 30px; }\n'+
      '.post-full h1 { margin-bottom: 10px; }\n'+
      '.content { line-height: 1.8; color: #333; margin-top: 30px; }\n'+
      '.back-link { color: #0066cc; text-decoration: none; display: inline-block; margin-bottom: 20px; }\n'+
      '.back-link:hover { text-decoration: underline; }\n';
    
    return files;
  }
  
  self.SiteForgeWordPress={buildWordPressBlog};
})();

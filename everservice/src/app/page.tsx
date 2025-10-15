export default function HomePage() {
  return (
    <div>
      <h2>API Endpoints</h2>
      <ul>
        <li><code>GET /api/evermarks?url=...</code> - Extract metadata from URL</li>
        <li><code>POST /api/evermarks</code> - Create new evermark</li>
        <li><code>POST /api/storage</code> - Upload content to storage</li>
        <li><code>GET /api/storage?hash=...</code> - Retrieve stored content</li>
      </ul>
    </div>
  );
}
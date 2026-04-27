// ──────────────────────────────────────────────────
// Layout.jsx — App shell with sidebar + content area
// ──────────────────────────────────────────────────
// This is a wrapper component used in the router.
// Every authenticated page is rendered as a child
// of this layout, which provides:
//   - The sidebar on the left (fixed, 256px)
//   - A scrollable main content area on the right
//
// Usage in App.jsx:
//   <Route element={<Layout><Outlet /></Layout>}>
//     <Route path="dashboard" element={<Dashboard />} />
//   </Route>
// ──────────────────────────────────────────────────

import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    // Outer container — fills the full viewport.
    // bg-gray-50 gives a light gray background to
    // the content area (the sidebar has its own dark bg).
    <div className="flex min-h-screen bg-gray-50">

      {/* The sidebar is position:fixed inside itself,
          so it doesn't scroll with the page. */}
      <Sidebar />

      {/* Main content area.
          ml-64 offsets it by the sidebar's width (256px)
          so content doesn't hide behind the fixed sidebar.
          flex-1 makes it fill the remaining horizontal space.
          p-8 gives comfortable padding around page content. */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

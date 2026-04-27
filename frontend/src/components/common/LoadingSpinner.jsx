// ──────────────────────────────────────────────────
// LoadingSpinner.jsx — Full-page centered spinner
// ──────────────────────────────────────────────────
// Used as the initial loading state for pages that
// fetch data on mount. Takes up the full viewport
// height so the spinner is perfectly centered
// regardless of content above/below.
//
// This is different from the inline spinner in
// ProtectedRoute.jsx — this one is meant for page-
// level loading states after the user is already
// authenticated and inside the Layout.
// ──────────────────────────────────────────────────

const LoadingSpinner = () => {
  return (
    // min-h-screen ensures vertical centering even
    // if the parent doesn't have a set height.
    // flex + both center properties = dead center.
    <div className="min-h-screen flex items-center justify-center">
      {/* The spinner itself:
          - w-8 h-8: 32×32px circle
          - border-4: thick ring
          - border-indigo-600: indigo color (matches brand)
          - border-t-transparent: hides the top segment,
            creating the "gap" that makes it look like
            a spinning arc instead of a full ring
          - rounded-full: makes the square div a circle
          - animate-spin: Tailwind's built-in 360° rotation */}
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default LoadingSpinner;

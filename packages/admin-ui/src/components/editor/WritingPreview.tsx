import { useRef, useEffect, useState } from 'react';

interface WritingPreviewProps {
  listSrc: string;
  postSrc: string;
  activeId: string | null;
}

/** Shared click interceptor — prevents any anchor navigation inside an iframe. */
function makeBlockLinks() {
  return (e: MouseEvent) => {
    if ((e.target as Element).closest('a[href]')) e.preventDefault();
  };
}

/** Attaches a load listener that calls `onLoad` each time the iframe (re)loads. */
function useIframeLoad(
  ref: React.RefObject<HTMLIFrameElement | null>,
  onLoad: () => void,
  deps: React.DependencyList,
) {
  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    const handler = () => onLoad();
    iframe.addEventListener('load', handler);
    handler(); // fire immediately in case already loaded

    return () => iframe.removeEventListener('load', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function WritingPreview({ listSrc, postSrc, activeId }: WritingPreviewProps) {
  const [listCollapsed, setListCollapsed] = useState(false);
  const listRef = useRef<HTMLIFrameElement>(null);
  const listSectionRef = useRef<HTMLDivElement>(null);
  const postRef = useRef<HTMLIFrameElement>(null);

  // Keep a ref for activeId so the load handler always reads the latest value
  // without needing to be re-registered every time the id changes.
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  // List iframe — block links, strip page chrome, size to 2× row height,
  // highlight + scroll to current entry.
  useIframeLoad(
    listRef,
    () => {
      const iframe = listRef.current;
      if (!iframe) return;
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        // Block navigation
        doc.addEventListener('click', makeBlockLinks(), true);

        // Hide page header so only the posts list is visible
        const style = doc.createElement('style');
        style.textContent = `
          header { display: none !important; }
          main { padding-block-start: 16px !important; }
          html, body { overflow: hidden !important; }
          astro-dev-toolbar { display: none !important; }
        `;
        doc.head.appendChild(style);

        // Size the iframe to exactly 2 post-row heights so it acts as a
        // tight window onto the list rather than a full-page embed.
        const row = doc.querySelector('.post-row') as HTMLElement | null;
        if (row && listSectionRef.current) {
          const rowH = row.offsetHeight;
          iframe.style.flex = 'none';
          iframe.style.height = `${rowH * 2}px`;
          listSectionRef.current.style.flex = 'none';
        }

        // Scroll to and highlight the active entry
        const id = activeIdRef.current;
        if (id) {
          const link = doc.querySelector(`a[href*="/${id}"]`) as HTMLElement | null;
          if (link) {
            link.scrollIntoView({ behavior: 'instant', block: 'center' });
          }
        }
      } catch {
        /* cross-origin guard — should not happen in dev */
      }
    },
    // Only re-register when the list URL changes (new page load); activeId is
    // read via ref so stale-closure isn't a concern.
    [listSrc],
  );

  // Post iframe — block links and hide dev toolbar.
  useIframeLoad(postRef, () => {
    const iframe = postRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.addEventListener('click', makeBlockLinks(), true);
      const style = doc.createElement('style');
      style.textContent = 'astro-dev-toolbar { display: none !important; }';
      doc.head.appendChild(style);
    } catch {
      /* cross-origin guard */
    }
  }, [postSrc]);

  return (
    <div className="writing-preview">
      <div
        className={`wp-section${listCollapsed ? ' wp-section--collapsed' : ''}`}
        ref={listSectionRef}
      >
        <button
          className="preview-label wp-label-row"
          onClick={() => setListCollapsed((c) => !c)}
          title={listCollapsed ? 'Expand list' : 'Collapse list'}
        >
          <span>List</span>
          <span className="wp-toggle-icon">{listCollapsed ? '▼' : '▲'}</span>
        </button>
        <iframe
          ref={listRef}
          src={listSrc}
          title="Writing list preview"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
      <div className="wp-section wp-section--post">
        <span className="preview-label">Post</span>
        <iframe
          ref={postRef}
          src={postSrc}
          title="Post preview"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
}

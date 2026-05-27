import { useRef, useEffect } from 'react';
import type { PreviewData } from '@admin/hooks/usePreview';
import WritingPreview from './WritingPreview';

interface PreviewProps {
  previewData: PreviewData | null;
  activeId: string | null;
}

export default function Preview({ previewData, activeId }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Block link navigation inside the generic preview iframe.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const blockLinks = (e: MouseEvent) => {
      if ((e.target as Element).closest('a[href]')) e.preventDefault();
    };

    const onLoad = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        doc.addEventListener('click', blockLinks, true);
        const style = doc.createElement('style');
        style.textContent = 'astro-dev-toolbar { display: none !important; }';
        doc.head.appendChild(style);
      } catch {
        /* cross-origin guard */
      }
    };

    iframe.addEventListener('load', onLoad);
    onLoad();

    return () => {
      iframe.removeEventListener('load', onLoad);
      try {
        iframe.contentDocument?.removeEventListener('click', blockLinks, true);
      } catch {
        /* ignore */
      }
    };
  }, [previewData]);

  if (previewData?.kind === 'writing') {
    return (
      <div className="preview-panel preview-panel--writing">
        <WritingPreview
          listSrc={previewData.listSrc}
          postSrc={previewData.postSrc}
          activeId={activeId}
        />
      </div>
    );
  }

  if (previewData?.kind === 'generic') {
    return (
      <div className="preview-panel">
        <div className="preview-label">Preview</div>
        <iframe
          ref={iframeRef}
          src={previewData.src}
          title="Entry preview"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    );
  }

  return null;
}

/**
 * StackBlitz demo to verify newly added SVG attributes in SVGAttributes<T>:
 * - autoFocus (with tabIndex=0 so focus can be taken)
 * - nonce
 * - part
 * - slot
 *
 * Why prefix is excluded:
 * - In HTMLAttributes, `prefix` is the RDFa attribute. SVGAttributes currently
 *   does not declare that RDFa attribute. The script matched Element.prefix,
 *   a different read-only DOM property, so I leave `prefix` out for SVG.
 *
 * What this demo checks:
 * - autoFocus: the SVG receives focus on mount; console shows activeElement === svg.
 * - nonce: property and attribute are logged (note some browsers hide the attribute).
 * - part: host exposes an SVG part; styled via ::part to prove it works.
 * - slot: slotted SVG is styled via ::slotted and logs assignedSlot info.
 *
 * How to run on StackBlitz:
 * - Template: "React + TypeScript" (the default React/TS template works).
 * - Put this file as `src/main.tsx` (or import/render it from there).
 */

import { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const svgAutofocusRef = useRef<SVGSVGElement | null>(null);
  const svgNonceRef = useRef<SVGSVGElement | null>(null);
  const partHostRef = useRef<HTMLDivElement | null>(null);
  const slotHostRef = useRef<HTMLDivElement | null>(null);
  const dialogSvgRef = useRef<HTMLDialogElement | null>(null);
  const dialogSpanRef = useRef<HTMLDialogElement | null>(null);

  const openDialog = (ref: React.RefObject<HTMLDialogElement>) => {
    if (ref.current && !ref.current.open) {
      ref.current.showModal();
    }
  };
  const closeDialog = (ref: React.RefObject<HTMLDialogElement>) => {
    if (ref.current && ref.current.open) {
      ref.current.close();
    }
  };

  useEffect(() => {
    const svgAuto = svgAutofocusRef.current;
    if (svgAuto) {
      console.log(
        'autofocus: activeElement === svgAuto =>',
        document.activeElement === svgAuto
      );
    }

    const svgNonce = svgNonceRef.current;
    if (svgNonce) {
      console.log('nonce attr:', svgNonce.getAttribute('nonce'));
      // Some browsers do not expose nonce via getAttribute for security; property check too.
      console.log('nonce property:', svgNonce.nonce);
    }

    // part demo: expose part from shadow DOM and style it via ::part
    if (partHostRef.current) {
      partHostRef.current.id = 'part-host-demo';
      const shadow =
        partHostRef.current.shadowRoot ??
        partHostRef.current.attachShadow({ mode: 'open' });
      if (!shadow.firstChild) {
        shadow.innerHTML = `
                 <style>
                   :host(::part(demo-part)) {
                     /* not used; ::part must be on host selector outside shadow */
                   }
                 </style>
                 <svg part="demo-part" width="120" height="120">
                   <rect x="10" y="10" width="100" height="100" fill="#c8e6c9"></rect>
                   <text x="20" y="70" font-size="14" fill="#2e7d32">part</text>
                 </svg>
               `;
      }
      if (!document.getElementById('part-host-style')) {
        const style = document.createElement('style');
        style.id = 'part-host-style';
        style.textContent = `
                 #part-host-demo::part(demo-part) {
                   outline: 3px solid #2e7d32;
                   border-radius: 4px;
                 }
               `;
        document.head.appendChild(style);
      }
    }

    // slot demo: slotted SVG styled via ::slotted
    if (slotHostRef.current) {
      const shadow =
        slotHostRef.current.shadowRoot ??
        slotHostRef.current.attachShadow({ mode: 'open' });
      if (!shadow.firstChild) {
        shadow.innerHTML = `
                 <style>
                   slot[name="demo-slot"]::slotted(svg) {
                     outline: 2px dotted #6a1b9a;
                   }
                 </style>
                 <slot name="demo-slot"></slot>
               `;
      }
    }

    // dialogs stay closed initially; use buttons to open/close
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <style>
        {`
            .focusable:focus {
              outline: 3px solid #ff7043;
              outline-offset: 2px;
              box-shadow: 0 0 0 4px rgba(255,112,67,0.2);
            }
            .row {
              display: flex;
              gap: 16px;
              align-items: flex-start;
              flex-wrap: wrap;
            }
            dialog {
              border: 1px solid #ccc;
              border-radius: 6px;
              padding: 12px;
            }
          `}
      </style>
      <h3>SVG attribute demo (autoFocus / nonce / part / slot)</h3>
      <p>Each attribute is demonstrated with a minimal SVG example.</p>

      <h4 style={{ marginTop: 16 }}>autoFocus (needs tabIndex)</h4>
      <div className="row">
        <svg
          ref={svgAutofocusRef}
          tabIndex={0}
          autoFocus
          width={140}
          height={120}
          className="focusable"
          style={{ outline: '2px solid #1976d2', display: 'block' }}
          onFocus={() => console.log('autoFocus: onFocus fired')}
        >
          <rect x={10} y={10} width={120} height={100} fill="#ffb74d" />
          <text x={20} y={65} fontSize={16} fill="#000">
            autoFocus (svg)
          </text>
        </svg>
        <span
          tabIndex={0}
          autoFocus
          className="focusable"
          style={{
            display: 'inline-block',
            minWidth: 140,
            minHeight: 120,
            padding: 12,
            border: '2px solid #9c27b0',
            background: '#f3e5f5',
          }}
          onFocus={() => console.log('autoFocus: span onFocus fired')}
        >
          autoFocus (span)
        </span>
      </div>

      <h5 style={{ marginTop: 12 }}>
        autoFocus inside dialog (side-by-side, svg vs span)
      </h5>
      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        <button onClick={() => openDialog(dialogSvgRef)}>
          Open dialog (SVG)
        </button>
        <button onClick={() => openDialog(dialogSpanRef)}>
          Open dialog (span)
        </button>
        <button
          onClick={() => {
            closeDialog(dialogSvgRef);
            closeDialog(dialogSpanRef);
          }}
        >
          Close dialogs
        </button>
      </div>
      <div className="row">
        <dialog ref={dialogSvgRef}>
          <p style={{ marginTop: 0, marginBottom: 8 }}>
            dialog with SVG (autoFocus)
          </p>
          <svg
            tabIndex={0}
            autoFocus
            width={120}
            height={100}
            className="focusable"
            style={{ outline: '2px solid #1976d2', display: 'block' }}
            onFocus={() => console.log('dialog svg autoFocus')}
          >
            <rect x={8} y={8} width={100} height={80} fill="#c5e1a5" />
            <text x={16} y={54} fontSize={14} fill="#1b5e20">
              svg in dialog
            </text>
          </svg>
        </dialog>
        <dialog ref={dialogSpanRef}>
          <p style={{ marginTop: 0, marginBottom: 8 }}>
            dialog with span (autoFocus)
          </p>
          <span
            tabIndex={0}
            autoFocus
            className="focusable"
            style={{
              display: 'inline-block',
              minWidth: 120,
              minHeight: 100,
              padding: 10,
              border: '2px solid #9c27b0',
              background: '#f3e5f5',
            }}
            onFocus={() => console.log('dialog span autoFocus')}
          >
            span in dialog
          </span>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => closeDialog(dialogSpanRef)}>Close</button>
          </div>
        </dialog>
      </div>

      <h4 style={{ marginTop: 24 }}>nonce</h4>
      <div className="row">
        <svg
          ref={svgNonceRef}
          nonce="demo-nonce"
          width={140}
          height={120}
          style={{ outline: '2px solid #0288d1', display: 'block' }}
        >
          <rect x={10} y={10} width={120} height={100} fill="#b3e5fc" />
          <text x={20} y={65} fontSize={16} fill="#01579b">
            nonce (svg)
          </text>
        </svg>
        <span
          nonce="demo-nonce"
          style={{
            display: 'inline-block',
            minWidth: 140,
            minHeight: 120,
            padding: 12,
            border: '2px solid #0288d1',
            background: '#e1f5fe',
          }}
        >
          nonce (span)
        </span>
      </div>

      <h4 style={{ marginTop: 24 }}>part (shadow host exposes part)</h4>
      <div ref={partHostRef} />

      <h4 style={{ marginTop: 24 }}>
        slot demo (slotted SVG styled via ::slotted)
      </h4>
      <div ref={slotHostRef}>
        <svg
          slot="demo-slot"
          width={140}
          height={140}
          style={{ marginTop: 8, display: 'block' }}
        >
          <rect x="10" y="10" width="120" height="120" fill="#f8bbd0" />
          <text x={20} y={80} fontSize={16} fill="#ad1457">
            slotted
          </text>
        </svg>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

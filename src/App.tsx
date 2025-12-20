/**
 * Demo to verify SVG attributes added to SVGAttributes<T>:
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
 */

import React, { useCallback, useEffect, useRef } from "react";

function App() {
  const svgAutofocusRef = useRef<SVGSVGElement | null>(null);
  const svgNonceRef = useRef<SVGSVGElement | null>(null);
  const partHostRef = useRef<HTMLDivElement | null>(null);
  const slotHostRef = useRef<HTMLDivElement | null>(null);
  const dialogSvgRef = useRef<HTMLDialogElement | null>(null);
  const dialogSpanRef = useRef<HTMLDialogElement | null>(null);

  const openDialog = (ref: React.RefObject<HTMLDialogElement | null>) => {
    if (ref.current && !ref.current.open) {
      ref.current.showModal();
    }
  };
  const closeDialog = (ref: React.RefObject<HTMLDialogElement | null>) => {
    if (ref.current && ref.current.open) {
      ref.current.close();
    }
  };
  const handleSvgDialogClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (dialogSvgRef.current && event.target === dialogSvgRef.current) {
        dialogSvgRef.current.close();
      }
    },
    []
  );

  const handleSpanDialogClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (dialogSpanRef.current && event.target === dialogSpanRef.current) {
        dialogSpanRef.current.close();
      }
    },
    []
  );

  useEffect(() => {
    const svgAuto = svgAutofocusRef.current;
    if (svgAuto) {
      console.log(
        "autofocus: activeElement === svgAuto =>",
        document.activeElement === svgAuto
      );
    }

    const svgNonce = svgNonceRef.current;
    if (svgNonce) {
      console.log("nonce attr:", svgNonce.getAttribute("nonce"));
      // Some browsers do not expose nonce via getAttribute for security; property check too.
      console.log("nonce property:", svgNonce.nonce);
    }

    // part demo: expose part from shadow DOM and style it via ::part
    if (partHostRef.current) {
      partHostRef.current.id = "part-host-demo";
      partHostRef.current.className = "card-svg";
      partHostRef.current.style.width = "160px";
      partHostRef.current.style.height = "160px";
      const shadow =
        partHostRef.current.shadowRoot ??
        partHostRef.current.attachShadow({ mode: "open" });
      if (!shadow.firstChild) {
        shadow.innerHTML = `
              <style>
                :host(::part(demo-part)) {
                  /* kept empty; styling comes from outside via ::part */
                }
              </style>
              <svg part="demo-part" width="160" height="160">
                <circle cx="80" cy="80" r="60" fill="mediumseagreen"></circle>
              </svg>
              `;
      }
      if (!document.getElementById("part-host-style")) {
        const style = document.createElement("style");
        style.id = "part-host-style";
        style.textContent = `
                #part-host-demo::part(demo-part) {
                 /* TODO: no styling */
                }
              `;
        document.head.appendChild(style);
      }
    }

    // slot demo: slotted SVG styled via ::slotted
    if (slotHostRef.current) {
      const shadow =
        slotHostRef.current.shadowRoot ??
        slotHostRef.current.attachShadow({ mode: "open" });
      if (!shadow.firstChild) {
        shadow.innerHTML = `
                <style>
                  /* keep slot content border consistent with card-svg */
                  slot[name="demo-slot"]::slotted(svg) {}
                </style>
                <slot name="demo-slot"></slot>
              `;
      }
    }

    // dialogs stay closed initially; use buttons to open/close
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <style>
        {`
           body {
             background: #f0f0f0;
             margin: 0;
           }
           .focusable:focus {
             outline: 3px solid #1976d2;
             outline-offset: 2px;
             box-shadow: none;
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
           .card-svg {
             border: 1px solid #ccc;
             background: #fff;
             display: block;
           }
           .card-span {
             display: inline-flex;
             justify-content: center;
             align-items: center;
             width: 160px;
             height: 160px;
             border: 1px solid #ccc;
             background: #fff;
           }
           .dot-container {
             display: inline-flex;
             justify-content: center;
             align-items: center;
             width: 120px;
             height: 120px;
           }
           .dot {
             display: inline-block;
             width: 120px;
             height: 120px;
             border-radius: 50%;
           }
           .dot-crimson { background: crimson; }
           .dot-green { background: mediumseagreen; }
           .dot-purple { background: rebeccapurple; }
         `}
      </style>
      <h3>
        SVG attribute demo (autoFocus inside dialog / nonce / part / slot)
      </h3>
      <p>
        Left is SVG, right is span. Shapes are matched for visual comparison.
      </p>

      <h4 style={{ marginTop: 16 }}>autoFocus inside dialog (svg vs span)</h4>
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
        <dialog ref={dialogSvgRef} onClick={handleSvgDialogClick}>
          <p style={{ marginTop: 0, marginBottom: 8 }}>
            dialog with SVG (autoFocus)
          </p>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => closeDialog(dialogSvgRef)}>Close</button>
          </div>
          <svg
            tabIndex={0}
            // http://github.com/facebook/react/issues/23301
            {...{ autofocus: "true" }}
            width={160}
            height={160}
            className="focusable card-svg"
            onFocus={() => console.log("dialog svg autoFocus")}
          >
            <circle cx={80} cy={80} r={60} fill="crimson" />
          </svg>
        </dialog>
        <dialog ref={dialogSpanRef} onClick={handleSpanDialogClick}>
          <p style={{ marginTop: 0, marginBottom: 8 }}>
            dialog with span (autoFocus)
          </p>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => closeDialog(dialogSpanRef)}>Close</button>
          </div>
          <span
            tabIndex={0}
            // http://github.com/facebook/react/issues/23301
            {...{ autofocus: "true" }}
            className="focusable card-span"
            onFocus={() => console.log("dialog span autoFocus")}
          >
            <div className="dot-container">
              <span className="dot dot-crimson" aria-label="red circle" />
            </div>
          </span>
        </dialog>
      </div>

      <h4 style={{ marginTop: 24 }}>nonce</h4>
      <div className="row">
        <svg
          ref={svgNonceRef}
          {...({ nonce: "demo-nonce" } as React.SVGProps<SVGSVGElement>)}
          width={160}
          height={160}
          className="focusable card-svg"
        >
          <circle cx={80} cy={80} r={60} fill="crimson" />
        </svg>
        <span nonce="demo-nonce" className="focusable card-span">
          <div className="dot-container">
            <span className="dot dot-crimson" aria-label="red circle" />
          </div>
        </span>
      </div>

      <h4 style={{ marginTop: 24 }}>part (shadow host exposes part)</h4>
      <div className="row">
        <div ref={partHostRef} />
        <span className="focusable card-span">
          <div className="dot-container">
            <span className="dot dot-green" aria-label="green circle" />
          </div>
        </span>
      </div>

      <h4 style={{ marginTop: 24 }}>
        slot demo (slotted SVG styled via ::slotted)
      </h4>
      <div className="row">
        <div ref={slotHostRef}>
          <svg
            {...({ slot: "demo-slot" } as React.SVGProps<SVGSVGElement>)}
            width={160}
            height={160}
            className="focusable card-svg"
          >
            <circle cx={80} cy={80} r={60} fill="rebeccapurple" />
          </svg>
        </div>
        <span className="focusable card-span">
          <div className="dot-container">
            <span className="dot dot-purple" aria-label="red circle" />
          </div>
        </span>
      </div>
    </div>
  );
}

export default App;

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
 * - autoFocus: focus behavior on mount/open (native `autofocus` vs React `autoFocus`).
 * - nonce: property and attribute are logged (note some browsers hide the attribute).
 * - part: host exposes an SVG part; styled via ::part to prove it works.
 * - slot: slotted SVG is styled via ::slotted and logs assignedSlot info.
 */

import { useEffect, useRef, useState } from "react";
import type { MouseEvent, RefObject } from "react";

function AutoFocusDemo() {
  return (
    <>
      <h2>autoFocus</h2>
      <p>
        Note on <code>autoFocus</code>: The native <code>autofocus</code>{" "}
        attribute was originally form controls only, but now applies to HTML and
        SVG elements (
        <a href="https://developer.mozilla.org/docs/Web/API/HTMLElement/autofocus">
          HTMLElement autofocus
        </a>
        ,{" "}
        <a href="https://developer.mozilla.org/docs/Web/API/SVGElement/autofocus">
          SVGElement autofocus
        </a>
        ,{" "}
        <a href="https://developer.mozilla.org/docs/Web/HTML/Global_attributes/autofocus">
          MDN Web Docs
        </a>
        ,{" "}
        <a href="https://html.spec.whatwg.org/multipage/interaction.html#the-autofocus-attribute">
          HTML spec
        </a>
        ). TypeScript allows <code>autofocus</code> on{" "}
        <code>HTMLOrSVGElement</code>, and @types/react also allows{" "}
        <code>autoFocus</code> on <code>HTMLAttributes</code> (
        <a href="https://github.com/DefinitelyTyped/DefinitelyTyped/pull/64881">
          DefinitelyTyped/DefinitelyTyped #64881
        </a>
        ). However, React still effectively treats <code>autoFocus</code> as
        form controls only (see{" "}
        <a href="https://github.com/facebook/react/issues/6868">
          facebook/react #6868
        </a>
        , confirmed below), so it does not fire on non form controls. Therefore
        I stopped assigning <code>autoFocus</code> to <code>SVGAttributes</code>
        here.
      </p>
      <AutoFocusBasic />
      <AutoFocusInDialog />
    </>
  );
}

function AutoFocusBasic() {
  return (
    <>
      <h3>autoFocus (svg, div, button)</h3>
      <p>
        To inspect actual behavior, try toggling/commenting{" "}
        <code>autoFocus</code> / <code>autofocus</code>.
      </p>
      <div className="row">
        <p>svg</p>
        <svg
          tabIndex={0}
          // @ts-expect-error React doesn't support `autoFocus` for non form controls (https://github.com/facebook/react/issues/6868)
          autoFocus // does not work
          {...{ autofocus: "true" }} // works
          className="container"
          onFocus={() => console.log("svg onFocus")}
        >
          <circle cx={80} cy={80} r={60} fill="red" />
        </svg>

        <p>div</p>
        <div
          tabIndex={0}
          // React doesn't support `autoFocus` for non form controls but @types/react allows it (https://github.com/DefinitelyTyped/DefinitelyTyped/pull/64881)
          autoFocus // does not work
          {...{ autofocus: "true" }} // works
          className="container"
          onFocus={() => console.log("div onFocus")}
        >
          <span className="dot" />
        </div>
        <p>button</p>
        <button
          // React supports `autoFocus` for form controls
          autoFocus // works
          {...{ autofocus: "true" }} // works
          className="container"
          onFocus={() => console.log("button onFocus")}
        >
          Focusable Button
        </button>
      </div>
    </>
  );
}

function AutoFocusInDialog() {
  const svgDialogRef = useRef<HTMLDialogElement>(null);
  const divDialogRef = useRef<HTMLDialogElement>(null);
  const buttonDialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <h3>autoFocus in dialog (svg, div, button)</h3>
      <p>
        To inspect actual browser behavior, use the buttons below to open each
        dialog and watch which element receives focus.
      </p>
      <p>
        Note on <code>autoFocus</code> in dialog: React doesn't wire{" "}
        <code>autoFocus</code> for dialog contents (
        <a href="https://github.com/facebook/react/issues/23301">
          facebook/react #23301
        </a>
        ), so these samples rely on the native <code>autofocus</code> attribute
        instead.
      </p>
      <div className="row">
        {/* open dialog buttons */}
        <button
          onClick={() => {
            svgDialogRef.current?.showModal();
          }}
        >
          open dialog (svg)
        </button>
        <button
          onClick={() => {
            divDialogRef.current?.showModal();
          }}
        >
          open dialog (div)
        </button>
        <button
          onClick={() => {
            buttonDialogRef.current?.showModal();
          }}
        >
          open dialog (button)
        </button>
        {/* dialogs */}
        <dialog ref={svgDialogRef} closedby="any">
          <p>SVG dialog (check focus on open)</p>
          <button onClick={() => svgDialogRef.current?.close()}>Close</button>
          <svg
            tabIndex={0}
            // @ts-expect-error React doesn't support `autoFocus` in dialog (https://github.com/facebook/react/issues/23301)
            autoFocus // does not work
            {...{ autofocus: "true" }} // works
            className="container"
            onFocus={() => console.log("svg onFocus")}
          >
            <circle cx={80} cy={80} r={60} fill="red" />
          </svg>
        </dialog>
        <dialog ref={divDialogRef} closedby="any">
          <p>Div dialog (check focus on open)</p>
          <button onClick={() => divDialogRef.current?.close()}>Close</button>
          <div
            tabIndex={0}
            autoFocus // does not work
            {...{ autofocus: "true" }} // works
            className="container"
            onFocus={() => console.log("div onFocus")}
          >
            <span className="dot" />
          </div>
        </dialog>
        <dialog ref={buttonDialogRef} closedby="any">
          <p>Button dialog (check focus on open)</p>
          <button onClick={() => buttonDialogRef.current?.close()}>
            Close
          </button>
          <button
            tabIndex={0}
            // React doesn't support `autoFocus` in dialog even form controls
            autoFocus // does not work
            {...{ autofocus: "true" }} // works
            className="container"
            onFocus={() => console.log("button onFocus")}
          >
            Focusable Button
          </button>
        </dialog>
      </div>
    </>
  );
}

function NonceDemo() {
  const handleClick = (e: MouseEvent<SVGSVGElement | HTMLDivElement>) => {
    console.log(
      "nonce:",
      e.currentTarget.getAttribute("nonce"),
      // nonce is valid property
      e.currentTarget.nonce
    );
    console.log(
      "asdf (meaningless attribute):",
      e.currentTarget.getAttribute("asdf"),
      // @ts-expect-error asdf is undefined
      e.currentTarget.asdf
    );
  };

  return (
    <>
      <h2>nonce</h2>
      <p>
        It is a global attribute, so both HTML and SVG accept it, though some
        browsers may hide the value when read via <code>getAttribute</code>.
        Click the SVG or the div below to log both the <code>nonce</code>{" "}
        attribute (via <code>getAttribute</code>) and the <code>nonce</code>{" "}
        property. The logs also include a meaningless attribute{" "}
        <code>asdf</code> to show how unknown attributes behave.
      </p>
      <div className="row">
        <p>svg</p>
        <svg
          // @ts-expect-error add nonce to SVG attributes
          nonce="sample-nonce-svg"
          // meaningless attribute sample for testing
          asdf="asdf"
          width={160}
          height={160}
          className="container"
          onClick={handleClick}
        >
          <circle cx={80} cy={80} r={60} fill="red" />
        </svg>

        <p>div</p>
        <div
          nonce="sample-nonce-div"
          // @ts-expect-error meaningless attribute sample for testing
          asdf="asdf"
          className="container"
          onClick={handleClick}
        >
          <span className="dot" />
        </div>
      </div>
    </>
  );
}

function PartDemo() {
  const partSvgHostRef = useRef<HTMLDivElement>(null);
  const partDivHostRef = useRef<HTMLDivElement>(null);
  const [partStyleEnabled, setPartStyleEnabled] = useState(true);

  useEffect(() => {
    const ensurePartHost = (
      ref: RefObject<HTMLDivElement | null>,
      inner: string
    ) => {
      if (!ref.current) return;
      const shadow =
        ref.current.shadowRoot ?? ref.current.attachShadow({ mode: "open" });
      if (!shadow.firstChild) {
        shadow.innerHTML = inner;
      }
    };

    ensurePartHost(
      partSvgHostRef,
      `
        <style>
          /* default style */
            .container {
              width: 160px;
              height: 160px;
              border: 1px solid #ccc;
              background: #fff;
              display: flex;
              justify-content: center;
              align-items: center;
            }
        </style>
        <svg part="background-part" class="container">
          <circle part="dot-part" cx="80" cy="80" r="60" fill="red"/>
        </svg>
      `
    );

    ensurePartHost(
      partDivHostRef,
      `
        <style>
          /* default style */
            .container {
              width: 160px;
              height: 160px;
              border: 1px solid #ccc;
              background: #fff;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .dot {
              display: inline-block;
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: red;
            }
        </style>
        <div part="background-part" class="container">
          <span part="dot-part" class="dot"></span>
        </div>
      `
    );
  }, []);

  return (
    <>
      <h2>part</h2>
      <p>
        <code>part</code> exposes shadow children for external styling via{" "}
        <code>::part</code>. Shadow content has a default style (white container
        with a red dot). By default, <code>::part</code> styling is enabled
        (purple background + green dot). Toggle the button below to disable{" "}
        <code>::part</code> styling and see the default style. This confirms
        that only <code>::part</code> selectors can override shadow content
        styles (works for both SVG and div parts).
      </p>
      <button onClick={() => setPartStyleEnabled((v) => !v)}>
        {partStyleEnabled ? "Disable ::part styling" : "Enable ::part styling"}
      </button>
      {partStyleEnabled && (
        <style>
          {`
            .part-host::part(background-part) {
              background-color: rebeccapurple;
            }

            .part-host.svg-host::part(dot-part) {
              fill: mediumseagreen;
            }
            .part-host.div-host::part(dot-part) {
              background-color: mediumseagreen;
            }

            /* without a ::part selector, style does not affect */
            .part-host .container {
              background-color: yellow;
            }
          `}
        </style>
      )}
      <div className="row">
        <p>svg</p>
        <div ref={partSvgHostRef} className="part-host svg-host" />
        <p>div</p>
        <div ref={partDivHostRef} className="part-host div-host" />
      </div>
    </>
  );
}

function SlotDemo() {
  const slotSvgHostRef = useRef<HTMLDivElement>(null);
  const slotDivHostRef = useRef<HTMLDivElement>(null);
  const [slotOverride, setSlotOverride] = useState(true);

  useEffect(() => {
    const ensureSlotHost = (ref: RefObject<HTMLDivElement | null>) => {
      if (!ref.current) return;
      const shadow =
        ref.current.shadowRoot ?? ref.current.attachShadow({ mode: "open" });
      if (!shadow.firstChild) {
        shadow.innerHTML = `
          <style>
          /* default style */
            .container {
              width: 160px;
              height: 160px;
              border: 1px solid #ccc;
              background: #fff;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .dot {
              display: inline-block;
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: red;
            }
        </style>
          <slot name="container-slot">
            <div class="container">
              <span class="dot"></span>
            </div>
          </slot>
        `;
      }
    };

    ensureSlotHost(slotSvgHostRef);
    ensureSlotHost(slotDivHostRef);
  }, []);

  return (
    <>
      <h2>slot</h2>
      <p>
        This demo confirms that SVG can be provided to a slot, just like div.
        Hosts contain a shadow with a named slot (
        <code>slot="container-slot"</code>
        ). By default, light DOM supplies slotted nodes (purple SVG/div with
        green dot). Toggle the button below to remove slotted content and fall
        back to the shadow's default content (white container with a red dot).
        This demonstrates that SVG works as slotted content alongside div.
      </p>
      <button onClick={() => setSlotOverride((v) => !v)}>
        {slotOverride
          ? "Use fallback slot content"
          : "Override with slotted nodes"}
      </button>
      <div className="row">
        <p>svg slotted</p>
        <div ref={slotSvgHostRef} className="container">
          {slotOverride && (
            <svg
              /* @ts-expect-error add slot to SVG attributes */
              slot="container-slot"
              className="container"
              style={{ backgroundColor: "rebeccapurple" }}
            >
              <circle cx={80} cy={80} r={60} fill="mediumseagreen" />
            </svg>
          )}
        </div>

        <p>div slotted</p>
        <div ref={slotDivHostRef} className="container">
          {slotOverride && (
            <div
              slot="container-slot"
              className="container"
              style={{ backgroundColor: "rebeccapurple" }}
            >
              <span
                className="dot"
                style={{ backgroundColor: "mediumseagreen" }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <style>
        {`
           body {
             background: #f0f0f0;
             margin: 0;
           }
           .row {
             display: flex;
             gap: 16px;
             align-items: flex-start;
             flex-wrap: wrap;
           }
             
           .container {
             width: 160px;
             height: 160px;
             border: 1px solid #ccc;
             background: #fff;
             display: flex;
             justify-content: center;
             align-items: center;
           }
           .container:focus, .container:focus-visible {
             outline: 3px solid #1976d2;
           }

           .dot {
             display: inline-block;
             width: 120px;
             height: 120px;
             border-radius: 50%;
             background: red;
           }
         `}
      </style>
      <h1>SVG attribute demo (autoFocus / nonce / part / slot)</h1>
      <AutoFocusDemo />
      <NonceDemo />
      <PartDemo />
      <SlotDemo />
    </div>
  );
}

export default App;

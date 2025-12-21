#!/usr/bin/env node
/**
 * types/react/scripts/html-svg-attr-diff.js
 *
 * Inspect React's existing type definitions and find properties that:
 * - exist in HTMLAttributes<T>
 * - do NOT exist in SVGAttributes<T>
 * - and are real instance properties of SVGElement (per TypeScript's lib.dom.d.ts)
 *
 * Note: Matching against lib.dom.d.ts property names is case-insensitive.
 *
 * This helps decide which keys could be safely added to SVGAttributes.
 *
 * Output: JSON (counts + svgElementPropsTarget). Use --detail to include full
 * sorted lists for each intermediate set.
 *
 * Usage (from repo root):
 *   node types/react/scripts/html-svg-attr-diff.js
 *   node types/react/scripts/html-svg-attr-diff.js --detail  # show list breakdowns for counts
 */

'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const reactIndexPath = path.resolve(__dirname, '../index.d.ts');
const libDomPath = require.resolve('typescript/lib/lib.dom.d.ts');

const loadSource = (filePath) => {
    const text = fs.readFileSync(filePath, 'utf8');
    return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true);
};

const setToArray = (set) => {
    const arr = [];
    set.forEach((value) => {
        arr.push(value);
    });
    return arr;
};

const getInterfacePropsFromSource = (sourceFile, interfaceName) => {
    let props = null;

    const visit = (node) => {
        if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
            props = new Set();
            node.members.forEach((member) => {
                if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
                    props.add(member.name.text);
                }
            });
        }
        // Dive into namespaces/modules to find nested interfaces.
        if (ts.isModuleDeclaration(node) && node.body) {
            visit(node.body);
        }
        if (ts.isModuleBlock(node)) {
            node.statements.forEach(visit);
        }
    };

    sourceFile.forEachChild(visit);
    if (!props) {
        throw new Error(`interface ${interfaceName} not found in ${sourceFile.fileName}`);
    }
    return props;
};

const getInterfacePropsWithChecker = (interfaceName) => {
    const program = ts.createProgram({
        rootNames: [libDomPath],
        options: { skipLibCheck: true }
    });
    const checker = program.getTypeChecker();
    const source = program.getSourceFile(libDomPath);

    let decl;
    source.forEachChild((node) => {
        if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
            decl = node;
        }
    });
    if (!decl) {
        throw new Error(`interface ${interfaceName} not found in ${libDomPath}`);
    }

    const symbol = checker.getSymbolAtLocation(decl.name);
    const type = checker.getDeclaredTypeOfSymbol(symbol);

    const props = new Set();
    type.getProperties().forEach((prop) => {
        props.add(prop.getName());
    });
    return props;
};

const toLowerSet = (set) => {
    const lower = new Set();
    set.forEach((value) => {
        lower.add(String(value).toLowerCase());
    });
    return lower;
};

const main = () => {
    const detail = process.argv.includes('--detail');

    const reactSource = loadSource(reactIndexPath);
    const htmlAttrs = getInterfacePropsFromSource(reactSource, 'HTMLAttributes');
    const svgAttrs = getInterfacePropsFromSource(reactSource, 'SVGAttributes');

    const htmlOnlyAttrs = [];
    htmlAttrs.forEach((name) => {
        if (!svgAttrs.has(name)) {
            htmlOnlyAttrs.push(name);
        }
    });

    // SVGElement inherits from Element; elementPropsTarget is kept as an optional sanity check.
    const elementProps = getInterfacePropsWithChecker('Element'); // optional/debug
    const svgElementProps = getInterfacePropsWithChecker('SVGElement');

    const elementPropsLower = toLowerSet(elementProps);
    const svgElementPropsLower = toLowerSet(svgElementProps);

    const elementPropsTarget = htmlOnlyAttrs.filter((name) =>
        elementPropsLower.has(String(name).toLowerCase())
    );
    const svgElementPropsTarget = htmlOnlyAttrs.filter((name) =>
        svgElementPropsLower.has(String(name).toLowerCase())
    );

    const result = {
        reactIndexPath,
        libDomPath,
        counts: {
            htmlAttrs: htmlAttrs.size,
            svgAttrs: svgAttrs.size,
            htmlOnlyAttrs: htmlOnlyAttrs.length,
            elementProps: elementProps.size,
            svgElementProps: svgElementProps.size,
            elementPropsTarget: elementPropsTarget.length,
            svgElementPropsTarget: svgElementPropsTarget.length
        },
        svgElementPropsTarget
    };

    if (detail) {
        result.detail = {
            htmlAttrs: setToArray(htmlAttrs).sort(),
            svgAttrs: setToArray(svgAttrs).sort(),
            htmlOnlyAttrs: htmlOnlyAttrs.slice().sort(),
            elementProps: setToArray(elementProps).sort(),
            svgElementProps: setToArray(svgElementProps).sort(),
            elementPropsTarget: elementPropsTarget.slice().sort(),
            svgElementPropsTarget: svgElementPropsTarget.slice().sort()
        };
    }

    console.log(JSON.stringify(result, null, 2));
};

try {
    main();
} catch (error) {
    console.error(error);
    process.exitCode = 1;
}


// ================= SLIDE =================
function goToPage(pageIndex) {
    document.getElementById("slider").style.transform =
        `translateX(-${pageIndex * 100}vw)`;
}

// ================= CONSTANTS =================
const NODE_W       = 150;
const NODE_H       = 50;
const SPOUSE_OFFSET = 200;   // horizontal gap between person centre and spouse centre
const HGAP          = 40;    // extra gap between sibling subtrees
const VGAP          = 130;   // vertical gap between generations


// ================= HELPERS =================

/** Split a label on \n and render multi-line text inside a <g> */
function wrapText(grp, label) {
    const lines = String(label).split("\n");
    if (lines.length === 1) {
        grp.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "11px")
            .attr("font-weight", "600")
            .attr("fill", "#2c3e50")
            .text(label);
    } else {
        lines.forEach((line, i) => {
            grp.append("text")
                .attr("text-anchor", "middle")
                .attr("y", 0)
                .attr("dy", `${(i - (lines.length - 1) / 2) * 1.3}em`)
                .attr("font-size", "10px")
                .attr("font-weight", "600")
                .attr("fill", "#2c3e50")
                .text(line);
        });
    }
}

/** Draw one person box */
function drawPersonBox(g, x, y, label, opts = {}) {
    const grp = g.append("g")
        .attr("class", "node")
        .attr("transform", `translate(${x},${y})`);

    grp.append("rect")
        .attr("width", NODE_W).attr("height", NODE_H)
        .attr("x", -NODE_W / 2).attr("y", -NODE_H / 2)
        .attr("rx", 10)
        .attr("fill",         opts.fill   || "#ffffff")
        .attr("stroke",       opts.stroke || "#4a90e2")
        .attr("stroke-width", 2);

    wrapText(grp, label);
    return grp;
}

/**
 * Draw a couple row:
 *   [person box] ──❤️── [spouse box]
 * Returns midX (the x-coordinate from which children should descend).
 */
function drawCoupleRow(g, personX, personY, personLabel, spouseLabel, personOpts, spouseOpts) {
    const spouseX = personX + SPOUSE_OFFSET;
    const midX    = personX + SPOUSE_OFFSET / 2;

    drawPersonBox(g, personX, personY, personLabel, personOpts || {});

    // Left connector line
    g.append("line")
        .attr("x1", personX + NODE_W / 2).attr("y1", personY)
        .attr("x2", midX - 13).attr("y2", personY)
        .attr("stroke", "#e74c3c").attr("stroke-width", 2);

    // Heart
    g.append("text")
        .attr("x", midX).attr("y", personY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "18px")
        .text("❤️");

    // Right connector line
    g.append("line")
        .attr("x1", midX + 13).attr("y1", personY)
        .attr("x2", spouseX - NODE_W / 2).attr("y2", personY)
        .attr("stroke", "#e74c3c").attr("stroke-width", 2);

    drawPersonBox(g, spouseX, personY, spouseLabel, spouseOpts || { fill: "#fff3cd", stroke: "#f39c12" });

    return midX;
}


// =================================================================
// PAGE 1  –  Chakki → Kaali ❤️ Raman → children
// =================================================================
(function buildPage1() {
    const svg = d3.select("#tree")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "85vh");

    const g = svg.append("g");

    /*
     * Manual positional layout for this small tree.
     * Chakki is at top. Her children are: Eechamma | Kaali+Raman | Chakki2
     * Kaali ❤️ Raman → 6 children below their midpoint.
     */
    const svgW  = window.innerWidth;
    const rootX = svgW / 2;     // Chakki centred
    const rootY = 60;

    // ── Root: Chakki ──
    drawPersonBox(g, rootX, rootY, "Chakki");

    // Sibling positions
    const siblings = [
        { label: "Eechamma", spouse: null },
        { label: "Kaali",    spouse: "Raman" },
        { label: "Chakki",   spouse: null }
    ];
    const sibGap  = 350;
    const totalW  = (siblings.length - 1) * sibGap;
    const startX  = rootX - totalW / 2;
    const sibY    = rootY + VGAP;

    // Vertical from Chakki → horizontal bar
    const barY = rootY + NODE_H / 2 + (VGAP - NODE_H) / 2;
    g.append("line")
        .attr("x1", rootX).attr("y1", rootY + NODE_H / 2)
        .attr("x2", rootX).attr("y2", barY)
        .attr("stroke", "#90a4ae").attr("stroke-width", 2);
    g.append("line")
        .attr("x1", startX).attr("y1", barY)
        .attr("x2", startX + totalW).attr("y2", barY)
        .attr("stroke", "#90a4ae").attr("stroke-width", 2);

    siblings.forEach((sib, i) => {
        const cx = startX + i * sibGap;
        g.append("line")
            .attr("x1", cx).attr("y1", barY)
            .attr("x2", cx).attr("y2", sibY - NODE_H / 2)
            .attr("stroke", "#90a4ae").attr("stroke-width", 2);

        let descentX = cx;
        if (sib.spouse) {
            descentX = drawCoupleRow(g, cx, sibY, sib.label, sib.spouse);
        } else {
            drawPersonBox(g, cx, sibY, sib.label);
        }

        // Children of Kaali+Raman
        if (sib.spouse) {
            const kaaliChildren = [
                "Kunchiyan", "Kochikavu", "Neelamma",
                "Kunchu Chakki", "Kannan", "Narayanan"
            ];
            const childGap = 170;
            const childTotalW = (kaaliChildren.length - 1) * childGap;
            const childStartX = descentX - childTotalW / 2;
            const childY = sibY + VGAP;

            // Down from couple midpoint → bar
            const cBarY = sibY + NODE_H / 2 + (VGAP - NODE_H) / 2;
            g.append("line")
                .attr("x1", descentX).attr("y1", sibY + NODE_H / 2)
                .attr("x2", descentX).attr("y2", cBarY)
                .attr("stroke", "#90a4ae").attr("stroke-width", 2);
            g.append("line")
                .attr("x1", childStartX).attr("y1", cBarY)
                .attr("x2", childStartX + childTotalW).attr("y2", cBarY)
                .attr("stroke", "#90a4ae").attr("stroke-width", 2);

            kaaliChildren.forEach((name, j) => {
                const ccx = childStartX + j * childGap;
                g.append("line")
                    .attr("x1", ccx).attr("y1", cBarY)
                    .attr("x2", ccx).attr("y2", childY - NODE_H / 2)
                    .attr("stroke", "#90a4ae").attr("stroke-width", 2);
                drawPersonBox(g, ccx, childY, name);
            });
        }
    });

    // Fit everything
    const bbox = g.node().getBBox();
    const pad  = 20;
    const scaleVal = Math.min(
        (svgW - pad * 2) / (bbox.width  || 1),
        (window.innerHeight * 0.8 - pad * 2) / (bbox.height || 1),
        1
    );
    const tx = svgW / 2 - scaleVal * (bbox.x + bbox.width  / 2);
    const ty = pad       - scaleVal * bbox.y;
    g.attr("transform", `translate(${tx},${ty}) scale(${scaleVal})`);
})();


// =================================================================
// PAGE 2  –  Neelamma ❤️ Madhavan tree (collapsible, with spouses)
// =================================================================
setTimeout(() => {

    /*
     * Tree node schema:
     * {
     *   label    : string  (primary person; use \n for address)
     *   spouse   : string? (spouse name/address)
     *   children : node[]?
     *   _collapsed: boolean (runtime)
     * }
     */
    const treeData = {
        label: "Neelamma,\nPandaraparambil",
        spouse: "Madhavan,\nKothemmazhikam",
        children: [
            {
                label: "Kochummini,\nVellangal",
                children: [
                    { label: "Sukumaran,\nVellangal" },
                    { label: "Sathyadas,\nPillaveed" }
                ]
            },
            {
                label: "Kochu Govindan,\nKothemmazhikam",
                children: [
                    { label: "Sukumaran" },
                    { label: "Dharmadas,\nGouri Soudam" },
                    { label: "Leela,\nVellappil\nKizhakathil" },
                    { label: "Sudhakaran,\nKaleelazhikam" },
                    { label: "Vijayan,\nKothemmazhikam" },
                    { label: "Sathi,\nPrakrithi" },
                    { label: "Radha,\nPottiyazhikam" }
                ]
            },
            {
    label: "M.Bhavani,\nThekkepillavedu",
    spouse: "Nanoo,\nThekkepillavedu",
    children: [
        {
            label: "Vasanthi",
            spouse: "Nanoo",
            children: [
                { label: "Anandababu" }
            ]
        },
        {
            label: "Shivanandan",
            spouse: "Thankamma",
            children: [
                { label: "Shaji" },
                { label: "Ajith" },
                { label: "Jaya" }
            ]
        },
        {
            label: "Sarasamma",
            spouse: "Sankunni",
            children: [
                { label: "Prakash" },
                { label: "Sreeja" },
                { label: "Pradeep" },
                { label: "Sreela" }
            ]
        },
        {
            label: "Sivarajan",
            spouse: "Sevini",
            children: [
                { label: "Sunu" },
                { label: "Shibu" }
            ]
        },
        {
            label: "Das",
            spouse: "Sukumari",
            children: [
                { label: "Sreekanth" },
                { label: "Gopakumar" },
                { label: "Sindu" }
            ]
        },
        {
            label: "Santhadevi",
            spouse: "Sasi",
            children: [
                { label: "Mini" },
                { label: "Manu" }
            ]
        },
        {
            label: "Sivaprasad",
            spouse: "Shobhana",
            children: [
                { label: "Arun" },
                { label: "Kiran" },
                { label: "Varun" }
            ]
        }
    ]
},
            {
                label: "K M Kamalakshi,\nKilichazhikam",
                children: [
                    { label: "Sreenivasan" },
                    { label: "Sreedevi", children: [
                        { label: "Bhasi" }, { label: "Sasidharan" }, { label: "Ravi" },
                        { label: "Sugathan" }, { label: "Soman" }, { label: "Manilal" },
                        { label: "Subash" }, { label: "Babu" }
                    ]},
                    { label: "Sreekumar", children: [
                        { label: "Mohan Lal" }, { label: "Lailamani" },
                        { label: "Anitha" }, { label: "Lijin Lal" }
                    ]}
                ]
            },
            {
                label: "M.Janardhanan,\nBhasuvilasam",
                children: [
                    { label: "Bhasi" }, { label: "Sasidharan" }, { label: "Ravi" },
                    { label: "Sugathan" }, { label: "Soman" }, { label: "Manilal" },
                    { label: "Subash" }, { label: "Babu" }
                ]
            },
            {
                label: "M.Divakaran,\nTrivandrum",
                children: [
                    { label: "Mohan Lal" }, { label: "Lailamani" },
                    { label: "Anitha" }, { label: "Lijin Lal" }
                ]
            }
        ]
    };

    // ---- Collapse helpers ----
    function initCollapse(node) {
        if (node.children && node.children.length > 0) {
            node._collapsed = true;
            node.children.forEach(initCollapse);
        }
    }
    function visibleChildren(node) {
        return node._collapsed ? [] : (node.children || []);
    }
    function toggleNode(node) {
        if (node.children && node.children.length > 0)
            node._collapsed = !node._collapsed;
    }
    initCollapse(treeData);

    // ---- SVG & zoom ----
    const svgSel = d3.select("#tree2")
        .attr("width",  "100%")
        .attr("height", "85vh");
    const g = svgSel.append("g");

    const zoomBehaviour = d3.zoom()
        .scaleExtent([0.15, 3])
        .on("zoom", ev => g.attr("transform", ev.transform));
    svgSel.call(zoomBehaviour);

    // ---- Layout ----
    /**
     * Compute the total horizontal width a subtree needs.
     * A couple node is wider by SPOUSE_OFFSET.
     */
    function subtreeWidth(node) {
        const kids = visibleChildren(node);
        const selfW = node.spouse ? SPOUSE_OFFSET + NODE_W : NODE_W;
        if (!kids.length) return selfW;
        const kidsW = kids.reduce((s, k) => s + subtreeWidth(k), 0) + HGAP * (kids.length - 1);
        return Math.max(kidsW, selfW);
    }

    /**
     * Assign layoutX, layoutY, descentX to every visible node.
     * x is the "anchor" point of the primary person box.
     * descentX is where children's vertical connector starts.
     */
    function layoutNode(node, x, y) {
        node.layoutX   = x;
        node.layoutY   = y;
        node.descentX  = node.spouse ? x + SPOUSE_OFFSET / 2 : x;

        const kids = visibleChildren(node);
        if (!kids.length) return;

        const kidsW  = kids.reduce((s, k) => s + subtreeWidth(k), 0) + HGAP * (kids.length - 1);
        let curX     = node.descentX - kidsW / 2;

        kids.forEach(kid => {
            const kw = subtreeWidth(kid);
            // anchor the kid at the centre of its slot
            layoutNode(kid, curX + kw / 2, y + VGAP);
            curX += kw + HGAP;
        });
    }

    // ---- Render ----
    function render() {
        g.selectAll("*").remove();

        layoutNode(treeData, 0, 0);

        drawTreeEdges(treeData);
        drawTreeNodes(treeData);

        autoFit();
    }

    function drawTreeEdges(node) {
        const kids = visibleChildren(node);
        if (!kids.length) return;

        const px   = node.descentX;
        const py   = node.layoutY;
        const barY = py + NODE_H / 2 + (VGAP - NODE_H) / 2;

        // Vertical from person/couple midpoint down to bar
        g.append("line")
            .attr("x1", px).attr("y1", py + NODE_H / 2)
            .attr("x2", px).attr("y2", barY)
            .attr("stroke", "#90a4ae").attr("stroke-width", 2);

        // Horizontal bar across children
        if (kids.length > 1) {
            g.append("line")
                .attr("x1", kids[0].layoutX).attr("y1", barY)
                .attr("x2", kids[kids.length - 1].layoutX).attr("y2", barY)
                .attr("stroke", "#90a4ae").attr("stroke-width", 2);
        }

        kids.forEach(kid => {
            g.append("line")
                .attr("x1", kid.layoutX).attr("y1", barY)
                .attr("x2", kid.layoutX).attr("y2", kid.layoutY - NODE_H / 2)
                .attr("stroke", "#90a4ae").attr("stroke-width", 2);
            drawTreeEdges(kid);
        });
    }

    function drawTreeNodes(node) {
        const x = node.layoutX;
        const y = node.layoutY;
        const hasKids    = node.children && node.children.length > 0;
        const collapsed  = node._collapsed;
        const fillColour = hasKids && collapsed ? "#e3f2fd" : "#ffffff";

        if (node.spouse) {
            // ── Couple row ──
            const spouseX = x + SPOUSE_OFFSET;
            const midX    = x + SPOUSE_OFFSET / 2;

            // Person box (clickable)
            const pg = g.append("g")
                .attr("class", "node")
                .attr("transform", `translate(${x},${y})`)
                .style("cursor", hasKids ? "pointer" : "default")
                .on("click", () => { toggleNode(node); render(); });

            pg.append("rect")
                .attr("width", NODE_W).attr("height", NODE_H)
                .attr("x", -NODE_W/2).attr("y", -NODE_H/2)
                .attr("rx", 10)
                .attr("fill", fillColour)
                .attr("stroke", "#4a90e2").attr("stroke-width", 2);
            wrapText(pg, node.label);

            // Connector + heart
            g.append("line")
                .attr("x1", x + NODE_W/2).attr("y1", y)
                .attr("x2", midX - 13).attr("y2", y)
                .attr("stroke", "#e74c3c").attr("stroke-width", 2);
            g.append("text")
                .attr("x", midX).attr("y", y)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .attr("font-size", "18px").text("❤️");
            g.append("line")
                .attr("x1", midX + 13).attr("y1", y)
                .attr("x2", spouseX - NODE_W/2).attr("y2", y)
                .attr("stroke", "#e74c3c").attr("stroke-width", 2);

            // Spouse box
            const sg = g.append("g")
                .attr("class", "node spouse-node")
                .attr("transform", `translate(${spouseX},${y})`);
            sg.append("rect")
                .attr("width", NODE_W).attr("height", NODE_H)
                .attr("x", -NODE_W/2).attr("y", -NODE_H/2)
                .attr("rx", 10)
                .attr("fill", "#fff3cd")
                .attr("stroke", "#f39c12").attr("stroke-width", 2);
            wrapText(sg, node.spouse);

        } else {
            // ── Single person ──
            const sg = g.append("g")
                .attr("class", "node")
                .attr("transform", `translate(${x},${y})`)
                .style("cursor", hasKids ? "pointer" : "default")
                .on("click", () => { toggleNode(node); render(); });

            sg.append("rect")
                .attr("width", NODE_W).attr("height", NODE_H)
                .attr("x", -NODE_W/2).attr("y", -NODE_H/2)
                .attr("rx", 10)
                .attr("fill", fillColour)
                .attr("stroke", "#4a90e2").attr("stroke-width", 2);
            wrapText(sg, node.label);
        }

        visibleChildren(node).forEach(drawTreeNodes);
    }

    function autoFit() {
    const svgEl  = svgSel.node();
    const W      = svgEl ? (svgEl.clientWidth  || window.innerWidth)  : window.innerWidth;
    const H      = svgEl ? (svgEl.clientHeight || 600) : 600;
    const bbox   = g.node().getBBox();
    if (!bbox.width || !bbox.height) return;

    const pad    = 60; // increase padding so spouse boxes aren't cut off

    // increase width to account for possible spouse offset at edges
    const extraWidth = SPOUSE_OFFSET / 2;  

    const scale  = Math.min(
        (W - pad * 2) / (bbox.width + extraWidth),
        (H - pad * 2) / bbox.height,
        1
    );

    const tx     = W / 2 - scale * (bbox.x + bbox.width / 2);
    const ty     = pad - scale * bbox.y;

    svgSel.call(zoomBehaviour.transform,
        d3.zoomIdentity.translate(tx, ty).scale(scale));
}

    render();

}, 100);

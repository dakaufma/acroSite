class NodeInfo {
  constructor(container, nodes, links, link_vis) {
    this.container = container;
    this.nodes = nodes;
    this.links = links;
    this.highlight_node = null;
    this.focus_node = null;
    this.link_vis = link_vis;
  }

  setNodes(focus_node, highlight_node) {
    var needsReset = (this.focus_node != focus_node || this.highlight_node != highlight_node);

    this.focus_node = d;
    this.highlight_node = highlight_node;
    if (needsReset) {
      this.resetView();
    }
  }

  resetView() {
    this.container.selectAll("*").remove();
    if (!this.focus_node) {
      return;
    }
    d = this.focus_node;

    this.container
      .append("div") // Name
      .append("h1")
      .text(d.id)
      .style("")
    ;
    this.container
      .append("div") // Image
      .append("img")
      .attr("src", d.img)
      .style("width", "100%");
    this.container
      .append("div") // Sequences header
      .append("h1")
      .text("Sequences");
    var other = function(link) {
      return link.source == focus_node ? link.target : link.source;
    };
    links = this.links.filter(this.link_vis);
    var dest_nodes = Array.from(new Set(links.map(function (d) { return other(d).id; })));
    dest_nodes.sort(function(a, b) { return a.localeCompare(b); });
    if (highlight_node) {
      dest_nodes = [highlight_node.id]
    }
    var dest_node = this.container
      .append("div") // Connected node names
      .selectAll("div")
      .data(dest_nodes)
      .enter()
      .append("div");
    dest_node
      .append("h4")
      .text(function(d) { return d; });
    dest_node
      .append("div") // Sequences transitioning to that node
      .selectAll("div")
      .data(function(d) {
        var dup_seq = links
          .filter(function(d2) { return other(d2).id == d; })
          .reduce(function (a, b) { return a.concat(b.sequences); }, [])
          .sort(function (a, b) { return a.sequence_name.localeCompare(b.sequence_name); });
        var seq = []
        for (var i = 0; i < dup_seq.length; i++) {
          if (i == 0 || seq[seq.length - 1].sequence_name != dup_seq[i].sequence_name) {
            seq.push(dup_seq[i]);
          }
        }
        return seq;
      })
      .enter()
      .append("div")
      .attr("class", "box")
      .append("a")
      .text(function(d) { return d.sequence_name; })
      .attr("href", function (d) { return d.video_url; });
  }
}

class NodeInfo {
  constructor(container, graph) {
    this.container = container;
    this.graph = graph;
    this.highlight_node = null;
    this.focus_node = null;
  }

  nodeToId(nodeName) {
    return "node_info_" + nodeName.replace(/\W/g, '_');
  }

  setNodes(focus_node, highlight_node) {
    var needsReset = this.focus_node != focus_node;
    var needsScroll = highlight_node && this.highlight_node != highlight_node;
    var needsHighlightClear = this.highlight_node && this.highlight_node != highlight_node;

    if (needsHighlightClear) {
      var node = document.querySelector('#' + this.nodeToId(this.highlight_node.id));
      if (node) {
        node.style.backgroundColor = null;
      }
    }

    this.focus_node = d;
    this.highlight_node = highlight_node;
    if (needsReset) {
      this.resetView();
    } else if (needsScroll) {
      var node = document.querySelector('#' + this.nodeToId(this.highlight_node.id));
      if (node) {
        node.style.backgroundColor = '#4ad';
        node.scrollIntoView({
          behavior: "smooth"
        });
      }
    }
  }

  resetView() {
    this.container.selectAll("*").remove();
    if (!this.focus_node) {
      return;
    }
    d = this.focus_node;

    // Name
    this.container
      .append("div")
      .append("h1")
      .text(d.id)
      .style("")
    ;

    // Image
    this.container
      .append("div")
      .append("img")
      .attr("src", d.img)
      .style("width", "100%");

    // Sequences header
    this.container
      .append("div")
      .append("h1")
      .text("Sequences");

    // utility code
    var localFocusName = this.graph.focus_name;
    var other = function(link) {
      return link.source.id == localFocusName ? link.target : link.source;
    };
    links = this.graph.links.filter(this.graph.link_vis.bind(this.graph));
    var dest_nodes = Array.from(new Set(links.map(function (d) { return other(d).id; })));
    dest_nodes.sort(function(a, b) { return a.localeCompare(b); });
    if (highlight_node) {
      dest_nodes = [highlight_node.id]
    }

    // Connected node names
    var localNodeToId = this.nodeToId;
    var dest_node = this.container
      .append("div")
      .selectAll("div")
      .data(dest_nodes)
      .enter()
      .append("div")
      .attr("id", function(d) { return localNodeToId(d); });
    dest_node
      .append("h4")
      .text(function(d) { return d; });

    // Sequences transitioning to that node
    dest_node
      .append("div")
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

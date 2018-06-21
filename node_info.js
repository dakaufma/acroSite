class LeftBar {
  constructor(container, state) {
    this.container = container;
    this.state = state;
    this.highlight_name = null;
    this.focus_node = null;
  }

  nodeToId(nodeName) {
    return "node_info_" + nodeName.replace(/\W/g, '_');
  }

  setData(focus_node, highlight_name, sequence_name) {
    var wasNodeView = this.focus_node ? true : false;
    var isNodeView = focus_node ? true : false;

    if (isNodeView) {
      // Determine how much the view needs to be rebuilt vs. modified
      var needsRebuild = !wasNodeView || this.focus_node != focus_node;
      var needsScroll = highlight_name && (needsRebuild || this.highlight_name != highlight_name);
      var needsHighlightClear = this.highlight_name && this.highlight_name != highlight_name;

      // Save data
      this.focus_node = focus_node;
      this.highlight_name = highlight_name;
      this.sequence_name = null;

      if (needsRebuild) {
        this.buildNodeView();
      } else if (needsHighlightClear) {
        var node = document.querySelector('#' + this.nodeToId(this.highlight_name));
        if (node) {
          node.style.backgroundColor = null;
        }
      }

      if (needsScroll) {
        var node = document.querySelector('#' + this.nodeToId(this.highlight_name));
        if (node) {
          node.style.backgroundColor = '#4ad';
          node.scrollIntoView({
            behavior: "smooth"
          });
        }
      }
    } else { // Sequence view
      // Determine how much the view needs to be rebuilt vs. modified
      var needsRebuild = wasNodeView || this.sequence_name != sequence_name;

      // Save data
      this.focus_node = null;
      this.highlight_name = null;
      this.sequence_name = sequence_name;

      if (needsRebuild) {
        this.buildSequenceView();
      }
    }
  }

  buildNodeView() {
    this.container.selectAll("*").remove();
    if (!this.focus_node) {
      return;
    }
    var d = this.focus_node;

    // Name
    this.container
      .append("div")
      .append("h1")
      .text(d.id)
      .style("");

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
    var localFocusName = this.state.focus_name;
    var other = function(link) {
      return link.source.id == localFocusName ? link.target : link.source;
    };
    links = this.state.links.filter(this.state.link_vis.bind(this.state));
    var dest_nodes = Array.from(new Set(links.map(function (d) { return other(d).id; })));
    dest_nodes.sort(function(a, b) { return a.localeCompare(b); });
    if (this.highlight_name) {
      dest_nodes = [this.highlight_name]
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

  buildSequenceView() {
    this.container.selectAll("*").remove();

    var sequence_name = this.sequence_name;
    var matches = this.state.sequences.filter(function (d) {
      return d.Name == sequence_name;
    });
    if (matches.length == 0) {
      return;
    }
    var d = matches[0];

    // Name
    this.container
      .append("div")
      .append("h1")
      .text(d.Name)
      .style("") ;

    // Video
    this.container
      .append("div")
      .append("a")
      .attr("href", d["Video Link"])
      .text("video");

    // Poses header
    this.container
      .append("div")
      .append("h1")
      .text("Poses");

    // Set up data for all nodes
    var state = this.state;
    var nodes = d.node_list.map(function(index) {
      return state.nodes[index];
    });

    var node = this.container
      .append("div")
      .selectAll("div")
      .data(nodes)
      .enter()
      .append("div");

    // Node name
    node
      .append("h4")
      .text(function(d) { return d.id; });

    // Node image
    node
      .append("img")
      .attr("src", function(d) { return d.img; })
      .style("width", "100%");
  }
}

class LeftBar {
  constructor(container, state) {
    this.container = container;
    this.state = state;
    this.last_state = state.copy();

    this.state.notifier.on("stateChanged", function() {
      this.update();
    }.bind(this));
  }

  nodeToId(nodeName) {
    return "node_info_" + nodeName.replace(/\W/g, '_');
  }

  update() {
    var wasNodeView = this.last_state.focus_name ? true : false;
    var isNodeView = this.state.focus_name ? true : false;

    // Determine how much the view needs to be rebuilt vs. modified
    var needsRebuild = isNodeView
      ? !wasNodeView || this.state.focus_name != this.last_state.focus_name
      : wasNodeView || this.state.sequence_name != this.last_state.sequence_name;
    var needsScroll = this.state.highlight_name && (needsRebuild || this.state.highlight_name != this.last_state.highlight_name);
    var needsHighlightClear = this.last_state.highlight_name && this.state.highlight_name != this.last_state.highlight_name;

    // Update
    if (needsRebuild) {
      if (isNodeView) {
        this.buildNodeView();
      } else {
        this.buildSequenceView();
      }
    } else if (needsHighlightClear) {
      var node = document.querySelector('#' + this.nodeToId(this.last_state.highlight_name));
      if (node) {
        node.style.backgroundColor = null;
      }
    }

    if (needsScroll) {
      var node = document.querySelector('#' + this.nodeToId(this.state.highlight_name));
      if (node) {
        node.style.backgroundColor = '#4ad';
        node.scrollIntoView({
          behavior: "smooth"
        });
      }
    }

    // Save the current state
    this.last_state = this.state.copy();
  }

  buildNodeView() {
    this.container.selectAll("*").remove();
    if (!this.state.focus_name) {
      return;
    }
    var d = this.state.nodeFromName(this.state.focus_name);

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
    if (this.state.highlight_name) {
      dest_nodes = [this.state.highlight_name]
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

  appendVideo(container, url) {
    var youtube_regex = /^(https?:\/\/)?(www.)?youtube.com\//i;
    var youtube_regex_short = /^(https?:\/\/)?(www.)?youtu.be\/([^\?]+)/i;

    if (youtube_regex.test(url) || youtube_regex_short.test(url)) {
    // Parse embedded youtube videos
      var params = url.replace(/.*\?/, "").split("&");
      var short_match = youtube_regex_short.exec(url);
      var vid = short_match ? short_match[3] : "";
      var otherParams = ["modestbranding=1", "showinfo=0", "rel=0", "iv_load_policy=3"];
      params.forEach(function (keyvalue) {
        var vidKey = "v=";
        if (keyvalue.startsWith(vidKey)) {
          vid = keyvalue.substring(vidKey.length);
        } else {
          otherParams.push(keyvalue);
        }
      });
      var embededUrl = "https://www.youtube.com/embed/" + vid
        + "/?" + otherParams.join("&");
      container
      // hack with padding-bottom to specify hight as a percentage of width
        .append("div")
        .style("width", "100%")
        .style("height", "0")
        .style("padding-bottom", "56.25%")
        .style("position", "relative")
        .append("div")
        .style("position", "absolute")
        .style("left", "0")
        .style("right", "0")
        .style("top", "0")
        .style("bottom", "0")
      // actual embedded iframe
        .append("iframe")
        .attr("src", embededUrl)
        .style("width", "100%")
        .style("height", "100%")
        .attr("frameborder", "0")
        .attr("allowfullscreen", true);
    } else {
      // Don't know how to embed this type of video -- just link
      container
        .append("a")
        .text(url)
        .attr("href", url);
    }
  }

  buildSequenceView() {
    this.container.selectAll("*").remove();

    var sequence_name = this.state.sequence_name;
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
    this.appendVideo(this.container, d["Video Link"]);

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

    var localNodeToId = function(d) { return this.nodeToId(d.id); }.bind(this);
    var node = this.container
      .append("div")
      .selectAll("div")
      .data(nodes)
      .enter()
      .append("div")
      .attr("id", function(d) { return localNodeToId(d); });

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

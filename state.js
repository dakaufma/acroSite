class State {
  constructor(nodes, links, sequences) {
    this.nodes = nodes;
    this.links = links;
    this.sequences = sequences;
    this.filterFromNode = true;
    this.filterToNode = true;
    this.keys = true;
    this.keyl = true;
    this.keyc = true;
    this.keyp = true;
    this.keyb = true;
    this.keyx = true;
    this.key1 = true;
    this.key2 = true;
    this.key3 = true;
    this.key4 = true;
    this.key5 = true;
    this.key0 = true;

    this.nodeFilterDistance = 1;
    this.nodeFilter = [];
    this.linkFilter = []
    this.sequencesFilter = [];
    this.focus_name = null;
    this.highlight_name = null;
    this.sequence_name = null;
  }

  nodeFromName(name) {
    var matches = this.nodes.filter(function(d) { return d.id == name });
    if (matches.length > 0) {
      return matches[0];
    }
    return null;
  }

  set_node_filter(sourceId) {
    this.focus_name = sourceId;
    this.sequence_name = null;
    var numLinks = this.nodeFilterDistance;

    var d = this.nodeFromName(sourceId);
    this.sequencesFilter = d.sequences;

    var all = new Set([sourceId])
    var next = []

    var state = this;
    var current = [sourceId]
    if (this.filterFromNode) {
      for (var linksFollowed = 0; linksFollowed < numLinks; linksFollowed++) {
        current.forEach(function(currentId) {
          state.links.forEach(function(d) {
            if (d.source.id == currentId && !all.has(d.target.id)) {
              next.push(d.target.id);
              all.add(d.target.id);
            }
          });
        });
        current = next;
        next = [];
      }
    }

    current = [sourceId]
    if (this.filterToNode) {
      for (var linksFollowed = 0; linksFollowed < numLinks; linksFollowed++) {
        current.forEach(function(currentId) {
          state.links.forEach(function(d) {
            if (d.target.id == currentId && !all.has(d.source.id)) {
              next.push(d.source.id);
              all.add(d.source.id);
            }
          });
        });
        current = next;
        next = [];
      }
    }

    this.nodeFilter = Array.from(all);
    this.linkFilter = [];
  }

  set_sequence(name) {
    var matches = this.sequences.filter(function(d) { return d.Name == name });
    var state = this;
    if (matches) {
      var sequence = matches[0];
      this.nodeFilter = sequence.node_list.map(function(index) {
        return state.nodes[index].id;
      });

      this.sequencesFilter = [{
        sequence_name: sequence.Name,
        video_url: sequence["Video Link"],
        sequence_type: sequence.Type,
      }];

      var sequence_links = []
      for (var i = 0; i < sequence.node_list.length - 1; i++) {
        var sourceId = this.nodes[sequence.node_list[i]].id;
        var targetId = this.nodes[sequence.node_list[i + 1]].id;
        this.links.filter(function(d) {
          return d.source.id == sourceId && d.target.id == targetId
        }).forEach(function(link) {
          sequence_links.push(link);
        });
      }
      this.linkFilter = sequence_links;

      this.focus_name = null;
      this.highlight_name = null;
      this.sequence_name = name;
    }
  }

  link_vis(d) {
    if (this.linkFilter.length > 0) {
      return this.linkFilter.indexOf(d) !== -1;
    } else if (this.focus_name) {
      return this.filterFromNode && d.source.id == this.focus_name && this.vis(d.target)
        || this.filterToNode && d.target.id == this.focus_name && this.vis(d.source);
    } else {
      return this.vis(d.source) && this.vis(d.target);
    }
  }

  vis(node) {
    return this.vis_by_position(node.position) &&
      this.vis_by_pose_difficulty(node.difficulty) &&
      this.vis_by_sequence(node.sequences) &&
      this.vis_by_node(node.id);
  }

  vis_by_position(position) {
    switch (position) {
      case "Standing": return this.keys;
      case "L-Base": return this.keyl;
      case "Counter Balance": return this.keyc;
      case "Base Supine": return this.keyp;
      case "Belly Basing": return this.keyb;
      case "No Info Yet": return this.keyx;
      default: return true;
    }
  }

  vis_by_pose_difficulty(difficulty) {
    switch (difficulty) {
      case "Easy": return this.key1;
      case "Intermediate": return this.key2;
      case "Hard": return this.key3;
      case "Really Hard": return this.key4;
      case "Expert": return this.key5;
      case "No Info Yet": return this.keyx;
      default: return true;
    }
  }

  vis_by_sequence(sequences) {
    if (this.sequencesFilter.length === 0 || !sequences) {
      return true;
    } else {
      for (var i = 0; i < sequences.length; i++) {
        if (this.sequencesFilter.map(function(e) { return e.sequence_name; }).indexOf(sequences[i].sequence_name) != -1) {
          return true;
        }
      }
      return false;
    }
  }

  vis_by_node(node) {
    if (this.nodeFilter.length === 0) {
      return true;
    } else {
      return this.nodeFilter.indexOf(node) != -1;
    }
  }
}

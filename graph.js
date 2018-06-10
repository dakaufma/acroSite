class Graph {
  constructor(nodes, links) {
    this.nodes = nodes;
    this.links = links;
    this.filterFromNode = true;
    this.filterToNode = true;

    this.nodeFilterDistance = 1;
    this.nodeFilter = [];
var sequencesFilter = [];
  }

  set_node_filter(sourceId) {
    this.focus_name = sourceId;
    var numLinks = this.nodeFilterDistance;

    var d = this.nodes.filter(function(d) { return d.id == sourceId })[0];
    this.sequencesFilter = d.sequences;

    var all = new Set([sourceId])
    var next = []

    var graph = this;
    var current = [sourceId]
    if (this.filterFromNode) {
      for (var linksFollowed = 0; linksFollowed < numLinks; linksFollowed++) {
        current.forEach(function(currentId) {
          graph.links.forEach(function(d) {
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
          graph.links.forEach(function(d) {
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
  }

  link_vis(d) {
    if (this.focus_name) {
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
      case "Standing": return keys;
      case "L-Base": return keyl;
      case "Counter Balance": return keyc;
      case "Base Supine": return keyp;
      case "Belly Basing": return keyb;
      case "No Info Yet": return keyx;
      default: return true;
    }
  }

  vis_by_pose_difficulty(difficulty) {
    switch (difficulty) {
      case "Easy": return key1;
      case "Intermediate": return key2;
      case "Hard": return key3;
      case "Really Hard": return key4;
      case "Expert": return key5;
      case "No Info Yet": return keyx;
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
